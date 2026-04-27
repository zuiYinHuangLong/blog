package model

import "time"

type Article struct {
	ID          uint       `gorm:"primarykey" json:"id"`
	Title       string     `gorm:"size:200;not null" json:"title"`
	Slug        string     `gorm:"size:200;uniqueIndex;not null" json:"slug"`
	Summary     string     `gorm:"size:500" json:"summary"`
	Content     string     `gorm:"type:longtext" json:"content"`
	ContentType string     `gorm:"size:10;default:markdown" json:"content_type"` // markdown or richtext
	CoverImage  string     `gorm:"size:500" json:"cover_image"`
	Status      int        `gorm:"default:0;index:idx_status_pub" json:"status"` // 0=draft, 1=published
	AuthorID    uint       `gorm:"not null" json:"author_id"`
	Author      User       `gorm:"foreignKey:AuthorID" json:"author,omitempty"`
	CategoryID  *uint      `gorm:"index" json:"category_id"`
	Category    *Category  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Tags        []Tag      `gorm:"many2many:article_tags;" json:"tags,omitempty"`
	ViewCount   int        `gorm:"default:0" json:"view_count"`
	PublishedAt *time.Time `gorm:"index:idx_status_pub" json:"published_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
