package handler

import (
	"fmt"
	"strconv"

	"blog-server/internal/dto"
	"blog-server/internal/model"
	"blog-server/internal/pkg"
	"blog-server/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type MediaHandler struct {
	Repo *repository.MediaRepo
}

func NewMediaHandler(db *gorm.DB) *MediaHandler {
	return &MediaHandler{Repo: repository.NewMediaRepo(db)}
}

func (h *MediaHandler) Upload(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		pkg.ErrorBadRequest(c, "请选择文件")
		return
	}

	url, err := pkg.SaveUploadedFile(file)
	if err != nil {
		pkg.ErrorBadRequest(c, err.Error())
		return
	}

	userID := c.GetUint("user_id")
	media := model.Media{
		Filename:   file.Filename,
		URL:        url,
		MimeType:   file.Header.Get("Content-Type"),
		Size:       file.Size,
		UploaderID: userID,
	}

	if err := h.Repo.Create(&media); err != nil {
		pkg.ErrorInternal(c, "保存文件信息失败")
		return
	}

	pkg.Success(c, media)
}

func (h *MediaHandler) List(c *gin.Context) {
	var query dto.PageQuery
	c.ShouldBindQuery(&query)
	query.Normalize()

	media, total, err := h.Repo.List(query.Offset(), query.PageSize)
	if err != nil {
		pkg.ErrorInternal(c, "获取媒体列表失败")
		return
	}
	pkg.SuccessPage(c, media, total, query.Page, query.PageSize)
}

func (h *MediaHandler) Delete(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		pkg.ErrorBadRequest(c, fmt.Sprintf("无效ID: %s", idStr))
		return
	}
	if err := h.Repo.Delete(uint(id)); err != nil {
		pkg.ErrorInternal(c, "删除失败")
		return
	}
	pkg.Success(c, nil)
}
