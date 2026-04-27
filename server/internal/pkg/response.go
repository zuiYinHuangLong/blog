package pkg

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type PaginatedData struct {
	List     interface{} `json:"list"`
	Total    int64       `json:"total"`
	Page     int         `json:"page"`
	PageSize int         `json:"page_size"`
}

func Success(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "ok",
		Data:    data,
	})
}

func SuccessPage(c *gin.Context, list interface{}, total int64, page, pageSize int) {
	c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "ok",
		Data: PaginatedData{
			List:     list,
			Total:    total,
			Page:     page,
			PageSize: pageSize,
		},
	})
}

func Error(c *gin.Context, httpStatus int, message string) {
	c.JSON(httpStatus, Response{
		Code:    -1,
		Message: message,
		Data:    nil,
	})
}

func ErrorBadRequest(c *gin.Context, message string) {
	Error(c, http.StatusBadRequest, message)
}

func ErrorUnauthorized(c *gin.Context, message string) {
	Error(c, http.StatusUnauthorized, message)
}

func ErrorForbidden(c *gin.Context, message string) {
	Error(c, http.StatusForbidden, message)
}

func ErrorNotFound(c *gin.Context, message string) {
	Error(c, http.StatusNotFound, message)
}

func ErrorInternal(c *gin.Context, message string) {
	Error(c, http.StatusInternalServerError, message)
}
