package handler

import (
	"strconv"

	"blog-server/internal/dto"
	"blog-server/internal/model"
	"blog-server/internal/pkg"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RoleHandler struct {
	DB *gorm.DB
}

func NewRoleHandler(db *gorm.DB) *RoleHandler {
	return &RoleHandler{DB: db}
}

func (h *RoleHandler) ListRoles(c *gin.Context) {
	var roles []model.Role
	h.DB.Preload("Permissions").Find(&roles)
	pkg.Success(c, map[string]interface{}{"list": roles})
}

func (h *RoleHandler) CreateRole(c *gin.Context) {
	var req dto.RoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	role := model.Role{
		Name:        req.Name,
		Description: req.Description,
	}

	if err := h.DB.Create(&role).Error; err != nil {
		pkg.ErrorInternal(c, "创建角色失败")
		return
	}

	// Assign permissions
	if len(req.PermissionIDs) > 0 {
		var perms []model.Permission
		h.DB.Where("id IN ?", req.PermissionIDs).Find(&perms)
		h.DB.Model(&role).Association("Permissions").Replace(perms)
	}

	h.DB.Preload("Permissions").First(&role, role.ID)
	pkg.Success(c, role)
}

func (h *RoleHandler) UpdateRole(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	var role model.Role
	if err := h.DB.First(&role, uint(id)).Error; err != nil {
		pkg.ErrorNotFound(c, "角色不存在")
		return
	}

	var req dto.RoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	role.Name = req.Name
	role.Description = req.Description
	h.DB.Save(&role)

	// Update permissions
	var perms []model.Permission
	if len(req.PermissionIDs) > 0 {
		h.DB.Where("id IN ?", req.PermissionIDs).Find(&perms)
	}
	h.DB.Model(&role).Association("Permissions").Replace(perms)

	h.DB.Preload("Permissions").First(&role, role.ID)
	pkg.Success(c, role)
}

func (h *RoleHandler) DeleteRole(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)

	// Check if users exist with this role
	var count int64
	h.DB.Model(&model.User{}).Where("role_id = ?", uint(id)).Count(&count)
	if count > 0 {
		pkg.ErrorBadRequest(c, "该角色下存在用户，无法删除")
		return
	}

	// Remove permission associations
	var role model.Role
	h.DB.First(&role, uint(id))
	h.DB.Model(&role).Association("Permissions").Clear()

	h.DB.Delete(&model.Role{}, uint(id))
	pkg.Success(c, nil)
}

func (h *RoleHandler) ListPermissions(c *gin.Context) {
	var perms []model.Permission
	h.DB.Order("module ASC, action ASC").Find(&perms)
	pkg.Success(c, perms)
}
