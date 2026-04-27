package handler

import (
	"blog-server/internal/dto"
	"blog-server/internal/pkg"
	"blog-server/internal/repository"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserHandler struct {
	UserRepo *repository.UserRepo
	DB       *gorm.DB
}

func NewUserHandler(db *gorm.DB) *UserHandler {
	return &UserHandler{
		UserRepo: repository.NewUserRepo(db),
		DB:       db,
	}
}

func (h *UserHandler) List(c *gin.Context) {
	var query dto.PageQuery
	if err := c.ShouldBindQuery(&query); err != nil {
		query = dto.PageQuery{Page: 1, PageSize: 20}
	}
	query.Normalize()

	users, total, err := h.UserRepo.List(query.Offset(), query.PageSize)
	if err != nil {
		pkg.ErrorInternal(c, "获取用户列表失败")
		return
	}

	pkg.SuccessPage(c, users, total, query.Page, query.PageSize)
}

func (h *UserHandler) Create(c *gin.Context) {
	var req dto.UserCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	// Decrypt password with RSA
	password, err := pkg.RSADecrypt(req.Password)
	if err != nil {
		pkg.ErrorBadRequest(c, "密码解密失败")
		return
	}

	hash, err := pkg.HashPassword(password)
	if err != nil {
		pkg.ErrorInternal(c, "密码加密失败")
		return
	}

	user := &repository.UserCreate{
		Username:     req.Username,
		Email:        req.Email,
		PasswordHash: hash,
		RoleID:       req.RoleID,
		Status:       1,
	}

	if err := h.UserRepo.CreateFull(user); err != nil {
		pkg.ErrorInternal(c, "创建用户失败，用户名或邮箱可能已存在")
		return
	}

	pkg.Success(c, nil)
}

func (h *UserHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		pkg.ErrorBadRequest(c, "无效的ID")
		return
	}

	var req dto.UserUpdateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	user, err := h.UserRepo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "用户不存在")
		return
	}

	if req.Email != "" {
		user.Email = req.Email
	}
	if req.RoleID != 0 {
		user.RoleID = req.RoleID
	}
	if req.Status != nil {
		user.Status = *req.Status
	}
	if req.Password != "" {
		password, err := pkg.RSADecrypt(req.Password)
		if err != nil {
			pkg.ErrorBadRequest(c, "密码解密失败")
			return
		}
		hash, err := pkg.HashPassword(password)
		if err != nil {
			pkg.ErrorInternal(c, "密码加密失败")
			return
		}
		user.PasswordHash = hash
	}

	if err := h.UserRepo.Update(user); err != nil {
		pkg.ErrorInternal(c, "更新用户失败")
		return
	}

	pkg.Success(c, nil)
}

func (h *UserHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		pkg.ErrorBadRequest(c, "无效的ID")
		return
	}

	if uint(id) == c.GetUint("user_id") {
		pkg.ErrorBadRequest(c, "不能删除自己")
		return
	}

	if err := h.UserRepo.DeleteByID(uint(id)); err != nil {
		pkg.ErrorInternal(c, "删除用户失败")
		return
	}

	pkg.Success(c, nil)
}
