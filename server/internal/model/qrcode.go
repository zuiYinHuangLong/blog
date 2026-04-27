package model

import "time"

// QRCode status: pending -> approved -> published, or pending -> rejected -> (resubmit) pending
type QRCode struct {
	ID           uint       `gorm:"primarykey" json:"id"`
	ArticleID    uint       `gorm:"not null;index" json:"article_id"`
	Article      Article    `gorm:"foreignKey:ArticleID" json:"article,omitempty"`
	QRUrl        string     `gorm:"size:500" json:"qr_url"`         // generated QR image path
	TargetURL    string     `gorm:"size:500;not null" json:"target_url"` // the article's public URL
	Status       string     `gorm:"size:20;default:pending;index" json:"status"`
	CreatorID    uint       `gorm:"not null" json:"creator_id"`
	Creator      User       `gorm:"foreignKey:CreatorID" json:"creator,omitempty"`
	ReviewerID   *uint      `json:"reviewer_id"`
	Reviewer     *User      `gorm:"foreignKey:ReviewerID" json:"reviewer,omitempty"`
	RejectReason string     `gorm:"size:500" json:"reject_reason"`
	ReviewedAt   *time.Time `json:"reviewed_at"`
	PublishedAt  *time.Time `json:"published_at"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}
