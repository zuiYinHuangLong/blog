package handler

import (
	"strconv"
	"time"

	"blog-server/config"
	"blog-server/internal/dto"
	"blog-server/internal/model"
	"blog-server/internal/pkg"
	"blog-server/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type QRCodeHandler struct {
	QRRepo      *repository.QRCodeRepo
	ArticleRepo *repository.ArticleRepo
}

func NewQRCodeHandler(db *gorm.DB) *QRCodeHandler {
	return &QRCodeHandler{
		QRRepo:      repository.NewQRCodeRepo(db),
		ArticleRepo: repository.NewArticleRepo(db),
	}
}

func (h *QRCodeHandler) List(c *gin.Context) {
	status := c.Query("status")
	qrcodes, err := h.QRRepo.List(status)
	if err != nil {
		pkg.ErrorInternal(c, "获取二维码列表失败")
		return
	}

	type qrView struct {
		model.QRCode
		ArticleTitle string `json:"article_title"`
		CreatorName  string `json:"creator_name"`
		ReviewerName string `json:"reviewer_name"`
	}

	views := make([]qrView, len(qrcodes))
	for i, qr := range qrcodes {
		views[i] = qrView{QRCode: qr}
		views[i].ArticleTitle = qr.Article.Title
		views[i].CreatorName = qr.Creator.Username
		if qr.Reviewer != nil {
			views[i].ReviewerName = qr.Reviewer.Username
		}
	}

	pkg.Success(c, map[string]interface{}{"list": views})
}

func (h *QRCodeHandler) Create(c *gin.Context) {
	var req dto.QRCodeCreateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "参数错误")
		return
	}

	// Check article exists and is published
	article, err := h.ArticleRepo.FindByID(req.ArticleID)
	if err != nil {
		pkg.ErrorNotFound(c, "文章不存在")
		return
	}
	if article.Status != 1 {
		pkg.ErrorBadRequest(c, "文章未发布，无法生成二维码")
		return
	}

	// Check if QR code already exists for this article
	existing, _ := h.QRRepo.FindByArticleID(req.ArticleID)
	if existing != nil && existing.ID > 0 {
		pkg.ErrorBadRequest(c, "该文章已有二维码，请勿重复创建")
		return
	}

	userID := c.GetUint("user_id")
	blogBaseURL := config.AppConfig.Blog.BaseURL
	targetURL := blogBaseURL + "/article/" + article.Slug

	qr := model.QRCode{
		ArticleID: req.ArticleID,
		TargetURL: targetURL,
		Status:    "pending",
		CreatorID: userID,
	}

	if err := h.QRRepo.Create(&qr); err != nil {
		pkg.ErrorInternal(c, "创建二维码失败")
		return
	}

	pkg.Success(c, qr)
}

func (h *QRCodeHandler) Approve(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	qr, err := h.QRRepo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "二维码不存在")
		return
	}

	if qr.Status != "pending" {
		pkg.ErrorBadRequest(c, "当前状态不允许审批")
		return
	}

	reviewerID := c.GetUint("user_id")
	now := time.Now()
	qr.Status = "approved"
	qr.ReviewerID = &reviewerID
	qr.ReviewedAt = &now
	qr.RejectReason = ""

	h.QRRepo.Update(qr)
	pkg.Success(c, qr)
}

func (h *QRCodeHandler) Reject(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	qr, err := h.QRRepo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "二维码不存在")
		return
	}

	if qr.Status != "pending" {
		pkg.ErrorBadRequest(c, "当前状态不允许驳回")
		return
	}

	var req dto.QRCodeRejectRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		pkg.ErrorBadRequest(c, "请输入驳回原因")
		return
	}

	reviewerID := c.GetUint("user_id")
	now := time.Now()
	qr.Status = "rejected"
	qr.ReviewerID = &reviewerID
	qr.ReviewedAt = &now
	qr.RejectReason = req.Reason

	h.QRRepo.Update(qr)
	pkg.Success(c, qr)
}

func (h *QRCodeHandler) Publish(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	qr, err := h.QRRepo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "二维码不存在")
		return
	}

	if qr.Status != "approved" {
		pkg.ErrorBadRequest(c, "仅已审批的二维码可以发布")
		return
	}

	now := time.Now()
	qr.Status = "published"
	qr.PublishedAt = &now

	h.QRRepo.Update(qr)
	pkg.Success(c, qr)
}

func (h *QRCodeHandler) Resubmit(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("id"), 10, 32)
	qr, err := h.QRRepo.FindByID(uint(id))
	if err != nil {
		pkg.ErrorNotFound(c, "二维码不存在")
		return
	}

	if qr.Status != "rejected" {
		pkg.ErrorBadRequest(c, "仅被驳回的二维码可以重新提交")
		return
	}

	qr.Status = "pending"
	qr.ReviewerID = nil
	qr.ReviewedAt = nil
	qr.RejectReason = ""

	h.QRRepo.Update(qr)
	pkg.Success(c, qr)
}
