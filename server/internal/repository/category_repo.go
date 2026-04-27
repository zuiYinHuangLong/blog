package repository

import (
	"blog-server/internal/model"
	"gorm.io/gorm"
)

type CategoryRepo struct {
	DB *gorm.DB
}

func NewCategoryRepo(db *gorm.DB) *CategoryRepo {
	return &CategoryRepo{DB: db}
}

func (r *CategoryRepo) Create(cat *model.Category) error {
	return r.DB.Create(cat).Error
}

func (r *CategoryRepo) Update(cat *model.Category) error {
	return r.DB.Save(cat).Error
}

func (r *CategoryRepo) Delete(id uint) error {
	// Check if articles exist under this category
	var count int64
	r.DB.Model(&model.Article{}).Where("category_id = ?", id).Count(&count)
	if count > 0 {
		return gorm.ErrForeignKeyViolated
	}
	return r.DB.Delete(&model.Category{}, id).Error
}

func (r *CategoryRepo) FindByID(id uint) (*model.Category, error) {
	var cat model.Category
	err := r.DB.First(&cat, id).Error
	return &cat, err
}

func (r *CategoryRepo) List() ([]model.Category, error) {
	var categories []model.Category
	err := r.DB.Order("sort ASC, id ASC").Find(&categories).Error
	return categories, err
}

func (r *CategoryRepo) Count() int64 {
	var count int64
	r.DB.Model(&model.Category{}).Count(&count)
	return count
}
