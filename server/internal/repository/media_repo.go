package repository

import (
	"blog-server/internal/model"
	"gorm.io/gorm"
)

type MediaRepo struct {
	DB *gorm.DB
}

func NewMediaRepo(db *gorm.DB) *MediaRepo {
	return &MediaRepo{DB: db}
}

func (r *MediaRepo) Create(media *model.Media) error {
	return r.DB.Create(media).Error
}

func (r *MediaRepo) Delete(id uint) error {
	return r.DB.Delete(&model.Media{}, id).Error
}

func (r *MediaRepo) FindByID(id uint) (*model.Media, error) {
	var media model.Media
	err := r.DB.First(&media, id).Error
	return &media, err
}

func (r *MediaRepo) List(offset, limit int) ([]model.Media, int64, error) {
	var media []model.Media
	var total int64
	r.DB.Model(&model.Media{}).Count(&total)
	err := r.DB.Order("created_at DESC").Offset(offset).Limit(limit).Find(&media).Error
	return media, total, err
}
