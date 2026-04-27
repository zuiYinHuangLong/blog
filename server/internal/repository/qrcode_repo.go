package repository

import (
	"blog-server/internal/model"
	"gorm.io/gorm"
)

type QRCodeRepo struct {
	DB *gorm.DB
}

func NewQRCodeRepo(db *gorm.DB) *QRCodeRepo {
	return &QRCodeRepo{DB: db}
}

func (r *QRCodeRepo) Create(qr *model.QRCode) error {
	return r.DB.Create(qr).Error
}

func (r *QRCodeRepo) Update(qr *model.QRCode) error {
	return r.DB.Save(qr).Error
}

func (r *QRCodeRepo) FindByID(id uint) (*model.QRCode, error) {
	var qr model.QRCode
	err := r.DB.Preload("Article").Preload("Creator").Preload("Reviewer").First(&qr, id).Error
	return &qr, err
}

func (r *QRCodeRepo) FindByArticleID(articleID uint) (*model.QRCode, error) {
	var qr model.QRCode
	err := r.DB.Where("article_id = ?", articleID).First(&qr).Error
	return &qr, err
}

func (r *QRCodeRepo) List(status string) ([]model.QRCode, error) {
	var qrcodes []model.QRCode
	query := r.DB.Preload("Article").Preload("Creator").Preload("Reviewer")
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Order("created_at DESC").Find(&qrcodes).Error
	return qrcodes, err
}
