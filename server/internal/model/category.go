package model

import "time"

type Category struct {
	ID          uint       `gorm:"primarykey" json:"id"`
	Name        string     `gorm:"size:50;not null" json:"name"`
	Slug        string     `gorm:"size:50;uniqueIndex;not null" json:"slug"`
	Description string     `gorm:"size:200" json:"description"`
	ParentID    *uint      `gorm:"index" json:"parent_id"`
	Sort        int        `gorm:"default:0" json:"sort"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
