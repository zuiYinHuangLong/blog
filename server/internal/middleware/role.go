package middleware

import (
	"blog-server/internal/model"
	"blog-server/internal/pkg"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// RequirePermission checks if the current user's role has a specific module+action permission
func RequirePermission(db *gorm.DB, module, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		roleID, exists := c.Get("role_id")
		if !exists {
			pkg.ErrorForbidden(c, "无权限")
			c.Abort()
			return
		}

		var count int64
		db.Table("role_permissions").
			Joins("JOIN permissions ON permissions.id = role_permissions.permission_id").
			Where("role_permissions.role_id = ? AND permissions.module = ? AND permissions.action = ?",
				roleID, module, action).
			Count(&count)

		if count == 0 {
			pkg.ErrorForbidden(c, "无权限执行此操作")
			c.Abort()
			return
		}

		c.Next()
	}
}

// LoadUserPermissions loads all permissions for a role
func LoadUserPermissions(db *gorm.DB, roleID uint) []model.Permission {
	var role model.Role
	db.Preload("Permissions").First(&role, roleID)
	return role.Permissions
}
