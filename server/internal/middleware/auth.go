package middleware

import (
	"strings"

	"blog-server/internal/pkg"
	"github.com/gin-gonic/gin"
)

func Auth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			pkg.ErrorUnauthorized(c, "未提供认证信息")
			c.Abort()
			return
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			pkg.ErrorUnauthorized(c, "认证格式错误")
			c.Abort()
			return
		}

		claims, err := pkg.ParseToken(parts[1])
		if err != nil {
			pkg.ErrorUnauthorized(c, "认证已过期或无效")
			c.Abort()
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("role_id", claims.RoleID)
		c.Next()
	}
}
