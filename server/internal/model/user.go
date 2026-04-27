package model

import "time"

type User struct {
	ID           uint      `gorm:"primarykey" json:"id"`
	Username     string    `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Email        string    `gorm:"size:100;uniqueIndex;not null" json:"email"`
	PasswordHash string    `gorm:"size:255;not null" json:"-"`
	RoleID       uint      `gorm:"not null" json:"role_id"`
	Role         Role      `gorm:"foreignKey:RoleID" json:"role,omitempty"`
	Avatar       string    `gorm:"size:500" json:"avatar"`
	Status       int       `gorm:"default:1" json:"status"` // 1=active, 0=disabled
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
