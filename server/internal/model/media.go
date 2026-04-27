package model

import "time"

type Media struct {
	ID         uint      `gorm:"primarykey" json:"id"`
	Filename   string    `gorm:"size:255;not null" json:"filename"`
	URL        string    `gorm:"size:500;not null" json:"url"`
	MimeType   string    `gorm:"size:100" json:"mime_type"`
	Size       int64     `json:"size"`
	UploaderID uint      `gorm:"not null" json:"uploader_id"`
	CreatedAt  time.Time `json:"created_at"`
}
