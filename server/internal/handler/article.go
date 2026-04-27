package handler

import (
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"time"

	"blog-server/internal/dto"
	"blog-server/internal/model"
	"blog-server/internal/pkg"
	"blog-server/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ArticleHandler struct {
	ArticleRepo *repository.ArticleRepo
	TagRepo     *repository.TagRepo
}

func NewArticleHandler(db *gorm.DB) *ArticleHandler {
	return &ArticleHandler{
		ArticleRepo: repository.NewArticleRepo(db),
		TagRepo:     repository.NewTagRepo(db),
	}
}

func (h *ArticleHandler) List(c *gin.Context) {
	var query dto.PageQuery
	c.ShouldBindQuery(&query)
	query.Normalize()

	statusStr := c.Query("status")
	var status *int
	if statusStr != "" {
		s, _ := strconv.Atoi(statusStr)
		status = &s
	}

	catStr := c.Query("category_id")
	var catID *uint
	if catStr != "" {
		id, _ := strconv.ParseUint(catStr, 10, 32)
		uid := uint(id)
		catID = &uid
	}

	tag := c.Query("tag")

	articles, total, err := h.ArticleRepo.List(query.Offset(), query.PageSize, status, catID, query.Keyword, tag)
	if err != nil {
		pkg.ErrorInternal(c, "获取文章列表失败")
		return
	}

	type articleView struct {
		model.Article
		AuthorName   string `json:"author_name"`
		CategoryName string `json:"category_name"`
	}

	views := make([]articleView, len(articles))
	for i, a := range articles {
		views[i] = articleView{Article: a}
		views[i].AuthorName = a.Author.Username
		if a.Category != nil {
			views[i].CategoryName = a.Category.Name
		}
	}

	pkg.SuccessPage(c, views, total, query.Page, query.PageSize)
}

func (h *ArticleHandler) Get(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	article, err := h.ArticleRepo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "文章不存在")
		return
	}
	pkg.Success(c, article)
}

func (h *ArticleHandler) Create(c *gin.Context) {
	var req dto.ArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	userID := c.GetUint("user_id")

	slug := req.Slug
	if slug == "" {
		slug = generateSlug(req.Title)
	}

	article := model.Article{
		Title:       req.Title,
		Slug:        slug,
		Summary:     req.Summary,
		Content:     req.Content,
		ContentType: req.ContentType,
		CoverImage:  req.CoverImage,
		CategoryID:  req.CategoryID,
		AuthorID:    userID,
		Status:      0, // draft by default
	}

	if article.ContentType == "" {
		article.ContentType = "markdown"
	}

	if err := h.ArticleRepo.Create(&article); err != nil {
		pkg.ErrorInternal(c, "创建文章失败")
		return
	}

	// Handle tags
	if len(req.TagIDs) > 0 {
		tags, _ := h.TagRepo.FindByIDs(req.TagIDs)
		h.ArticleRepo.ReplaceTags(&article, tags)
	}

	pkg.Success(c, article)
}

func (h *ArticleHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	article, err := h.ArticleRepo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "文章不存在")
		return
	}

	var req dto.ArticleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	article.Title = req.Title
	if req.Slug != "" {
		article.Slug = req.Slug
	}
	article.Summary = req.Summary
	article.Content = req.Content
	if req.ContentType != "" {
		article.ContentType = req.ContentType
	}
	article.CoverImage = req.CoverImage
	article.CategoryID = req.CategoryID

	if err := h.ArticleRepo.Update(article); err != nil {
		pkg.ErrorInternal(c, "更新文章失败")
		return
	}

	// Update tags
	tags, _ := h.TagRepo.FindByIDs(req.TagIDs)
	h.ArticleRepo.ReplaceTags(article, tags)

	pkg.Success(c, article)
}

func (h *ArticleHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := h.ArticleRepo.Delete(uint(id)); err != nil {
		pkg.ErrorInternal(c, "删除文章失败")
		return
	}
	pkg.Success(c, nil)
}

func (h *ArticleHandler) UpdateStatus(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	article, err := h.ArticleRepo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "文章不存在")
		return
	}

	var req dto.ArticleStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	article.Status = req.Status
	if req.Status == 1 && article.PublishedAt == nil {
		now := time.Now()
		article.PublishedAt = &now
	}

	h.ArticleRepo.Update(article)
	pkg.Success(c, article)
}

// Public endpoints

func (h *ArticleHandler) PublicList(c *gin.Context) {
	var query dto.PageQuery
	c.ShouldBindQuery(&query)
	query.Normalize()

	published := 1
	catStr := c.Query("category_id")
	var catID *uint
	if catStr != "" {
		id, _ := strconv.ParseUint(catStr, 10, 32)
		uid := uint(id)
		catID = &uid
	}
	tag := c.Query("tag")

	articles, total, err := h.ArticleRepo.List(query.Offset(), query.PageSize, &published, catID, query.Keyword, tag)
	if err != nil {
		pkg.ErrorInternal(c, "获取文章列表失败")
		return
	}

	type publicView struct {
		ID           uint        `json:"id"`
		Title        string      `json:"title"`
		Slug         string      `json:"slug"`
		Summary      string      `json:"summary"`
		ContentType  string      `json:"content_type"`
		CoverImage   string      `json:"cover_image"`
		AuthorName   string      `json:"author_name"`
		CategoryID   *uint       `json:"category_id"`
		CategoryName string      `json:"category_name"`
		Tags         []model.Tag `json:"tags"`
		ViewCount    int         `json:"view_count"`
		PublishedAt  *time.Time  `json:"published_at"`
	}

	views := make([]publicView, len(articles))
	for i, a := range articles {
		views[i] = publicView{
			ID: a.ID, Title: a.Title, Slug: a.Slug,
			Summary: a.Summary, ContentType: a.ContentType,
			CoverImage: a.CoverImage, AuthorName: a.Author.Username,
			CategoryID: a.CategoryID, Tags: a.Tags,
			ViewCount: a.ViewCount, PublishedAt: a.PublishedAt,
		}
		if a.Category != nil {
			views[i].CategoryName = a.Category.Name
		}
	}

	pkg.SuccessPage(c, views, total, query.Page, query.PageSize)
}

func (h *ArticleHandler) PublicGetBySlug(c *gin.Context) {
	slug := c.Param("slug")
	article, err := h.ArticleRepo.FindBySlug(slug)
	if err != nil || article.Status != 1 {
		pkg.ErrorNotFound(c, "文章不存在")
		return
	}

	h.ArticleRepo.IncrementViewCount(article.ID)
	article.ViewCount++

	result := map[string]interface{}{
		"id":            article.ID,
		"title":         article.Title,
		"slug":          article.Slug,
		"summary":       article.Summary,
		"content":       article.Content,
		"content_type":  article.ContentType,
		"cover_image":   article.CoverImage,
		"author_name":   article.Author.Username,
		"category_id":   article.CategoryID,
		"category_name": "",
		"tags":          article.Tags,
		"view_count":    article.ViewCount,
		"published_at":  article.PublishedAt,
		"created_at":    article.CreatedAt,
	}
	if article.Category != nil {
		result["category_name"] = article.Category.Name
	}

	pkg.Success(c, result)
}

func (h *ArticleHandler) PublicSearch(c *gin.Context) {
	keyword := c.Query("keyword")
	if keyword == "" {
		pkg.ErrorBadRequest(c, "请输入搜索关键词")
		return
	}

	var query dto.PageQuery
	c.ShouldBindQuery(&query)
	query.Normalize()
	query.Keyword = keyword

	published := 1
	articles, total, err := h.ArticleRepo.List(query.Offset(), query.PageSize, &published, nil, query.Keyword, "")
	if err != nil {
		pkg.ErrorInternal(c, "搜索失败")
		return
	}

	pkg.SuccessPage(c, articles, total, query.Page, query.PageSize)
}

func generateSlug(title string) string {
	slug := strings.ToLower(title)
	reg := regexp.MustCompile(`[^a-z0-9\p{Han}-]+`)
	slug = reg.ReplaceAllString(slug, "-")
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = fmt.Sprintf("article-%d", time.Now().Unix())
	}
	return slug
}
