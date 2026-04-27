package repository

import (
	"blog-server/internal/model"
	"gorm.io/gorm"
)

type TagRepo struct {
	DB *gorm.DB
}

func NewTagRepo(db *gorm.DB) *TagRepo {
	return &TagRepo{DB: db}
}

func (r *TagRepo) Create(tag *model.Tag) error {
	return r.DB.Create(tag).Error
}

func (r *TagRepo) Update(tag *model.Tag) error {
	return r.DB.Save(tag).Error
}

func (r *TagRepo) Delete(id uint) error {
	// Remove tag associations first
	r.DB.Exec("DELETE FROM article_tags WHERE tag_id = ?", id)
	return r.DB.Delete(&model.Tag{}, id).Error
}

func (r *TagRepo) FindByID(id uint) (*model.Tag, error) {
	var tag model.Tag
	err := r.DB.First(&tag, id).Error
	return &tag, err
}

func (r *TagRepo) FindByIDs(ids []uint) ([]model.Tag, error) {
	var tags []model.Tag
	if len(ids) == 0 {
		return tags, nil
	}
	err := r.DB.Where("id IN ?", ids).Find(&tags).Error
	return tags, err
}

func (r *TagRepo) List() ([]model.Tag, error) {
	var tags []model.Tag
	err := r.DB.Order("id ASC").Find(&tags).Error
	return tags, err
}

func (r *TagRepo) Count() int64 {
	var count int64
	r.DB.Model(&model.Tag{}).Count(&count)
	return count
}
