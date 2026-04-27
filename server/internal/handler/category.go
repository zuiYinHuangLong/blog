package handler

import (
	"strconv"

	"blog-server/internal/dto"
	"blog-server/internal/model"
	"blog-server/internal/pkg"
	"blog-server/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CategoryHandler struct {
	Repo *repository.CategoryRepo
}

func NewCategoryHandler(db *gorm.DB) *CategoryHandler {
	return &CategoryHandler{Repo: repository.NewCategoryRepo(db)}
}

func (h *CategoryHandler) List(c *gin.Context) {
	categories, err := h.Repo.List()
	if err != nil {
		pkg.ErrorInternal(c, "获取分类失败")
		return
	}
	pkg.Success(c, map[string]interface{}{"list": categories})
}

func (h *CategoryHandler) Create(c *gin.Context) {
	var req dto.CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	cat := model.Category{
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		ParentID:    req.ParentID,
		Sort:        req.Sort,
	}

	if err := h.Repo.Create(&cat); err != nil {
		pkg.ErrorInternal(c, "创建分类失败")
		return
	}
	pkg.Success(c, cat)
}

func (h *CategoryHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	cat, err := h.Repo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "分类不存在")
		return
	}

	var req dto.CategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	cat.Name = req.Name
	cat.Slug = req.Slug
	cat.Description = req.Description
	cat.ParentID = req.ParentID
	cat.Sort = req.Sort

	h.Repo.Update(cat)
	pkg.Success(c, cat)
}

func (h *CategoryHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := h.Repo.Delete(uint(id)); err != nil {
		if err == gorm.ErrForeignKeyViolated {
			pkg.ErrorBadRequest(c, "该分类下存在文章，无法删除")
			return
		}
		pkg.ErrorInternal(c, "删除失败")
		return
	}
	pkg.Success(c, nil)
}
