package router

import (
	"blog-server/internal/handler"
	"blog-server/internal/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(r *gin.Engine, db *gorm.DB) {
	// Handlers
	authH := handler.NewAuthHandler(db)
	articleH := handler.NewArticleHandler(db)
	categoryH := handler.NewCategoryHandler(db)
	tagH := handler.NewTagHandler(db)
	mediaH := handler.NewMediaHandler(db)
	qrcodeH := handler.NewQRCodeHandler(db)
	dashboardH := handler.NewDashboardHandler(db)
	roleH := handler.NewRoleHandler(db)
	userH := handler.NewUserHandler(db)
	settingH := handler.NewSettingHandler(db)

	api := r.Group("/api/v1")

	// === Public routes (no auth) ===
	api.GET("/auth/public-key", authH.GetPublicKey)
	api.GET("/auth/captcha", settingH.GetCaptcha)
	api.POST("/auth/login", authH.Login)
	api.GET("/settings/public", settingH.GetPublicSettings)

	// Public articles
	pub := api.Group("/public")
	{
		pub.GET("/articles", articleH.PublicList)
		pub.GET("/articles/search", articleH.PublicSearch)
		pub.GET("/articles/:slug", articleH.PublicGetBySlug)
	}

	// Public categories & tags (used by blog frontend sidebar)
	api.GET("/categories", categoryH.List)
	api.GET("/tags", tagH.List)

	// === Authenticated routes ===
	auth := api.Group("")
	auth.Use(middleware.Auth())
	{
		// Profile
		auth.GET("/auth/profile", authH.Profile)
		auth.PUT("/auth/password", authH.ChangePassword)

		// Dashboard
		auth.GET("/dashboard/stats", dashboardH.Stats)

		// Articles CRUD
		auth.GET("/articles", articleH.List)
		auth.GET("/articles/:id", articleH.Get)
		auth.POST("/articles", middleware.RequirePermission(db, "article", "create"), articleH.Create)
		auth.PUT("/articles/:id", middleware.RequirePermission(db, "article", "update"), articleH.Update)
		auth.DELETE("/articles/:id", middleware.RequirePermission(db, "article", "delete"), articleH.Delete)
		auth.PUT("/articles/:id/status", middleware.RequirePermission(db, "article", "update"), articleH.UpdateStatus)

		// Categories CRUD
		auth.POST("/categories", middleware.RequirePermission(db, "category", "create"), categoryH.Create)
		auth.PUT("/categories/:id", middleware.RequirePermission(db, "category", "update"), categoryH.Update)
		auth.DELETE("/categories/:id", middleware.RequirePermission(db, "category", "delete"), categoryH.Delete)

		// Tags CRUD
		auth.POST("/tags", middleware.RequirePermission(db, "tag", "create"), tagH.Create)
		auth.PUT("/tags/:id", middleware.RequirePermission(db, "tag", "update"), tagH.Update)
		auth.DELETE("/tags/:id", middleware.RequirePermission(db, "tag", "delete"), tagH.Delete)

		// Media
		auth.POST("/media/upload", middleware.RequirePermission(db, "media", "create"), mediaH.Upload)
		auth.GET("/media", mediaH.List)
		auth.DELETE("/media/:id", middleware.RequirePermission(db, "media", "delete"), mediaH.Delete)

		// QR Codes
		auth.GET("/qrcodes", qrcodeH.List)
		auth.POST("/qrcodes", middleware.RequirePermission(db, "qrcode", "create"), qrcodeH.Create)
		auth.PUT("/qrcodes/:id/approve", middleware.RequirePermission(db, "qrcode", "update"), qrcodeH.Approve)
		auth.PUT("/qrcodes/:id/reject", middleware.RequirePermission(db, "qrcode", "update"), qrcodeH.Reject)
		auth.PUT("/qrcodes/:id/publish", middleware.RequirePermission(db, "qrcode", "update"), qrcodeH.Publish)
		auth.PUT("/qrcodes/:id/resubmit", qrcodeH.Resubmit)

		// Roles & Permissions
		auth.GET("/roles", middleware.RequirePermission(db, "role", "read"), roleH.ListRoles)
		auth.POST("/roles", middleware.RequirePermission(db, "role", "create"), roleH.CreateRole)
		auth.PUT("/roles/:id", middleware.RequirePermission(db, "role", "update"), roleH.UpdateRole)
		auth.DELETE("/roles/:id", middleware.RequirePermission(db, "role", "delete"), roleH.DeleteRole)
		auth.GET("/permissions", middleware.RequirePermission(db, "role", "read"), roleH.ListPermissions)

		// Users
		auth.GET("/users", middleware.RequirePermission(db, "user", "read"), userH.List)
		auth.POST("/users", middleware.RequirePermission(db, "user", "create"), userH.Create)
		auth.PUT("/users/:id", middleware.RequirePermission(db, "user", "update"), userH.Update)
		auth.DELETE("/users/:id", middleware.RequirePermission(db, "user", "delete"), userH.Delete)

		// Settings (admin)
		auth.GET("/settings", settingH.GetAllSettings)
		auth.PUT("/settings", settingH.UpdateSettings)
	}
}
