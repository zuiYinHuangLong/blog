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

type TagHandler struct {
	Repo *repository.TagRepo
}

func NewTagHandler(db *gorm.DB) *TagHandler {
	return &TagHandler{Repo: repository.NewTagRepo(db)}
}

func (h *TagHandler) List(c *gin.Context) {
	tags, err := h.Repo.List()
	if err != nil {
		pkg.ErrorInternal(c, "获取标签失败")
		return
	}
	pkg.Success(c, map[string]interface{}{"list": tags})
}

func (h *TagHandler) Create(c *gin.Context) {
	var req dto.TagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	tag := model.Tag{Name: req.Name, Slug: req.Slug}
	if err := h.Repo.Create(&tag); err != nil {
		pkg.ErrorInternal(c, "创建标签失败")
		return
	}
	pkg.Success(c, tag)
}

func (h *TagHandler) Update(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	tag, err := h.Repo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "标签不存在")
		return
	}

	var req dto.TagRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	tag.Name = req.Name
	tag.Slug = req.Slug
	h.Repo.Update(tag)
	pkg.Success(c, tag)
}

func (h *TagHandler) Delete(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	if err := h.Repo.Delete(uint(id)); err != nil {
		pkg.ErrorInternal(c, "删除失败")
		return
	}
	pkg.Success(c, nil)
}
