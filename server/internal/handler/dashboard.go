package handler

import (
	"blog-server/internal/pkg"
	"blog-server/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type DashboardHandler struct {
	ArticleRepo  *repository.ArticleRepo
	CategoryRepo *repository.CategoryRepo
	TagRepo      *repository.TagRepo
}

func NewDashboardHandler(db *gorm.DB) *DashboardHandler {
	return &DashboardHandler{
		ArticleRepo:  repository.NewArticleRepo(db),
		CategoryRepo: repository.NewCategoryRepo(db),
		TagRepo:      repository.NewTagRepo(db),
	}
}

func (h *DashboardHandler) Stats(c *gin.Context) {
	published := 1
	draft := 0

	pkg.Success(c, map[string]interface{}{
		"article_total":     h.ArticleRepo.CountByStatus(published) + h.ArticleRepo.CountByStatus(draft),
		"article_published": h.ArticleRepo.CountByStatus(published),
		"article_draft":     h.ArticleRepo.CountByStatus(draft),
		"total_views":       h.ArticleRepo.TotalViewCount(),
		"category_count":    h.CategoryRepo.Count(),
		"tag_count":         h.TagRepo.Count(),
	})
}
