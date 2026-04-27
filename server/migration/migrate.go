package migration

import (
	"fmt"
	"log"

	"blog-server/internal/model"
	"blog-server/internal/pkg"

	"gorm.io/gorm"
)

func Run(db *gorm.DB) {
	// Auto migrate all models
	err := db.AutoMigrate(
		&model.Permission{},
		&model.Role{},
		&model.User{},
		&model.Category{},
		&model.Tag{},
		&model.Article{},
		&model.Media{},
		&model.QRCode{},
		&model.Setting{},
	)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	log.Println("Database migration completed")

	// Seed permissions
	seedPermissions(db)
	// Seed default admin role
	seedAdminRole(db)
	// Seed default admin user
	seedAdminUser(db)
}

func seedPermissions(db *gorm.DB) {
	modules := []string{"article", "category", "tag", "media", "user", "role", "qrcode", "dashboard"}
	actions := []string{"create", "read", "update", "delete"}

	moduleLabels := map[string]string{
		"article": "文章", "category": "分类", "tag": "标签", "media": "媒体",
		"user": "用户", "role": "角色", "qrcode": "二维码", "dashboard": "仪表盘",
	}
	actionLabels := map[string]string{
		"create": "创建", "read": "查看", "update": "更新", "delete": "删除",
	}

	for _, mod := range modules {
		for _, act := range actions {
			var count int64
			db.Model(&model.Permission{}).Where("module = ? AND action = ?", mod, act).Count(&count)
			if count == 0 {
				perm := model.Permission{
					Module:      mod,
					Action:      act,
					Description: fmt.Sprintf("%s-%s", moduleLabels[mod], actionLabels[act]),
				}
				db.Create(&perm)
			}
		}
	}
	log.Println("Permissions seeded")
}

func seedAdminRole(db *gorm.DB) {
	var count int64
	db.Model(&model.Role{}).Where("name = ?", "超级管理员").Count(&count)
	if count > 0 {
		return
	}

	role := model.Role{
		Name:        "超级管理员",
		Description: "拥有全部权限",
	}
	db.Create(&role)

	// Assign all permissions to admin role
	var allPerms []model.Permission
	db.Find(&allPerms)
	db.Model(&role).Association("Permissions").Replace(allPerms)

	// Also create an editor role
	editorRole := model.Role{
		Name:        "编辑",
		Description: "可管理文章、标签、媒体",
	}
	db.Create(&editorRole)

	var editorPerms []model.Permission
	db.Where("module IN ? AND action IN ?",
		[]string{"article", "tag", "media", "qrcode", "dashboard"},
		[]string{"create", "read", "update"},
	).Find(&editorPerms)
	db.Model(&editorRole).Association("Permissions").Replace(editorPerms)

	log.Println("Roles seeded")
}

func seedAdminUser(db *gorm.DB) {
	var count int64
	db.Model(&model.User{}).Where("username = ?", "admin").Count(&count)
	if count > 0 {
		return
	}

	// Find admin role
	var role model.Role
	db.Where("name = ?", "超级管理员").First(&role)

	hash, _ := pkg.HashPassword("admin123")
	user := model.User{
		Username:     "admin",
		Email:        "admin@blog.com",
		PasswordHash: hash,
		RoleID:       role.ID,
		Status:       1,
	}
	db.Create(&user)
	log.Println("Admin user seeded (username: admin, password: admin123)")
}
