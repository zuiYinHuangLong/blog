package handler

import (
	"blog-server/internal/pkg"
	"blog-server/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type SettingHandler struct {
	SettingRepo *repository.SettingRepo
}

func NewSettingHandler(db *gorm.DB) *SettingHandler {
	return &SettingHandler{
		SettingRepo: repository.NewSettingRepo(db),
	}
}

// GetPublicSettings returns settings that don't require auth (captcha_enabled, logo_url)
func (h *SettingHandler) GetPublicSettings(c *gin.Context) {
	m := h.SettingRepo.GetMap()
	pkg.Success(c, gin.H{
		"captcha_enabled": m["captcha_enabled"],
		"logo_url":        m["logo_url"],
		"site_name":       m["site_name"],
	})
}

// GetAllSettings returns all settings (admin only)
func (h *SettingHandler) GetAllSettings(c *gin.Context) {
	m := h.SettingRepo.GetMap()
	pkg.Success(c, m)
}

// UpdateSettings batch updates settings
func (h *SettingHandler) UpdateSettings(c *gin.Context) {
	var req map[string]string
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	for key, value := range req {
		if err := h.SettingRepo.Set(key, value); err != nil {
			pkg.ErrorInternal(c, "保存设置失败")
			return
		}
	}

	pkg.Success(c, nil)
}

// GetCaptcha generates a new captcha
func (h *SettingHandler) GetCaptcha(c *gin.Context) {
	id, b64Image, err := pkg.GenerateCaptcha()
	if err != nil {
		pkg.ErrorInternal(c, "生成验证码失败")
		return
	}
	pkg.Success(c, gin.H{
		"captcha_id":    id,
		"captcha_image": b64Image,
	})
}
