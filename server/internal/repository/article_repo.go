package repository

import (
	"blog-server/internal/model"
	"gorm.io/gorm"
)

type ArticleRepo struct {
	DB *gorm.DB
}

func NewArticleRepo(db *gorm.DB) *ArticleRepo {
	return &ArticleRepo{DB: db}
}

func (r *ArticleRepo) Create(article *model.Article) error {
	return r.DB.Create(article).Error
}

func (r *ArticleRepo) Update(article *model.Article) error {
	return r.DB.Save(article).Error
}

func (r *ArticleRepo) FindByID(id uint) (*model.Article, error) {
	var article model.Article
	err := r.DB.Preload("Author").Preload("Category").Preload("Tags").First(&article, id).Error
	return &article, err
}

func (r *ArticleRepo) FindBySlug(slug string) (*model.Article, error) {
	var article model.Article
	err := r.DB.Preload("Author").Preload("Category").Preload("Tags").
		Where("slug = ?", slug).First(&article).Error
	return &article, err
}

func (r *ArticleRepo) Delete(id uint) error {
	return r.DB.Delete(&model.Article{}, id).Error
}

func (r *ArticleRepo) List(offset, limit int, status *int, categoryID *uint, keyword, tag string) ([]model.Article, int64, error) {
	var articles []model.Article
	var total int64

	query := r.DB.Model(&model.Article{})

	if status != nil {
		query = query.Where("articles.status = ?", *status)
	}
	if categoryID != nil {
		query = query.Where("articles.category_id = ?", *categoryID)
	}
	if keyword != "" {
		query = query.Where("articles.title LIKE ? OR articles.summary LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if tag != "" {
		query = query.Joins("JOIN article_tags ON article_tags.article_id = articles.id").
			Joins("JOIN tags ON tags.id = article_tags.tag_id").
			Where("tags.slug = ?", tag)
	}

	query.Count(&total)

	err := query.Preload("Author").Preload("Category").Preload("Tags").
		Order("articles.created_at DESC").
		Offset(offset).Limit(limit).
		Find(&articles).Error

	return articles, total, err
}

func (r *ArticleRepo) IncrementViewCount(id uint) {
	r.DB.Model(&model.Article{}).Where("id = ?", id).UpdateColumn("view_count", gorm.Expr("view_count + 1"))
}

func (r *ArticleRepo) ReplaceTags(article *model.Article, tags []model.Tag) error {
	return r.DB.Model(article).Association("Tags").Replace(tags)
}

func (r *ArticleRepo) CountByStatus(status int) int64 {
	var count int64
	r.DB.Model(&model.Article{}).Where("status = ?", status).Count(&count)
	return count
}

func (r *ArticleRepo) TotalViewCount() int64 {
	var total int64
	r.DB.Model(&model.Article{}).Select("COALESCE(SUM(view_count), 0)").Scan(&total)
	return total
}
