package handler

import (
	"blog-server/internal/dto"
	"blog-server/internal/middleware"
	"blog-server/internal/pkg"
	"blog-server/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	UserRepo    *repository.UserRepo
	SettingRepo *repository.SettingRepo
	DB          *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{
		UserRepo:    repository.NewUserRepo(db),
		SettingRepo: repository.NewSettingRepo(db),
		DB:          db,
	}
}

func (h *AuthHandler) GetPublicKey(c *gin.Context) {
	pkg.Success(c, gin.H{"public_key": pkg.GetPublicKeyPEM()})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	// Check if captcha is enabled
	if h.SettingRepo.Get("captcha_enabled") == "true" {
		if req.CaptchaID == "" || req.Captcha == "" {
			pkg.ErrorBadRequest(c, "请输入验证码")
			return
		}
		if !pkg.VerifyCaptcha(req.CaptchaID, req.Captcha) {
			pkg.ErrorBadRequest(c, "验证码错误或已过期")
			return
		}
	}

	// RSA decrypt password
	password, err := pkg.RSADecrypt(req.Password)
	if err != nil {
		pkg.ErrorBadRequest(c, "密码解密失败")
		return
	}

	user, err := h.UserRepo.FindByUsername(req.Username)
	if err != nil {
		pkg.ErrorUnauthorized(c, "用户名或密码错误")
		return
	}

	if user.Status == 0 {
		pkg.ErrorForbidden(c, "账号已被禁用")
		return
	}

	if !pkg.CheckPassword(password, user.PasswordHash) {
		pkg.ErrorUnauthorized(c, "用户名或密码错误")
		return
	}

	token, err := pkg.GenerateToken(user.ID, user.RoleID)
	if err != nil {
		pkg.ErrorInternal(c, "生成Token失败")
		return
	}

	permissions := middleware.LoadUserPermissions(h.DB, user.RoleID)

	pkg.Success(c, dto.LoginResponse{
		AccessToken: token,
		User: map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role_id":  user.RoleID,
			"avatar":   user.Avatar,
			"status":   user.Status,
		},
		Permissions: permissions,
	})
}

func (h *AuthHandler) Profile(c *gin.Context) {
	userID := c.GetUint("user_id")
	roleID := c.GetUint("role_id")

	user, err := h.UserRepo.FindByID(userID)
	if err != nil {
		pkg.ErrorNotFound(c, "用户不存在")
		return
	}

	permissions := middleware.LoadUserPermissions(h.DB, roleID)

	pkg.Success(c, dto.ProfileResponse{
		User: map[string]interface{}{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role_id":  user.RoleID,
			"avatar":   user.Avatar,
			"status":   user.Status,
		},
		Permissions: permissions,
	})
}

func (h *AuthHandler) ChangePassword(c *gin.Context) {
	userID := c.GetUint("user_id")

	var req dto.ChangePasswordRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	// RSA decrypt passwords
	oldPass, err := pkg.RSADecrypt(req.OldPassword)
	if err != nil {
		pkg.ErrorBadRequest(c, "密码解密失败")
		return
	}
	newPass, err := pkg.RSADecrypt(req.NewPassword)
	if err != nil {
		pkg.ErrorBadRequest(c, "密码解密失败")
		return
	}

	user, err := h.UserRepo.FindByID(userID)
	if err != nil {
		pkg.ErrorNotFound(c, "用户不存在")
		return
	}

	if !pkg.CheckPassword(oldPass, user.PasswordHash) {
		pkg.ErrorBadRequest(c, "原密码错误")
		return
	}

	hash, err := pkg.HashPassword(newPass)
	if err != nil {
		pkg.ErrorInternal(c, "密码加密失败")
		return
	}

	user.PasswordHash = hash
	h.UserRepo.Update(user)

	pkg.Success(c, nil)
}
