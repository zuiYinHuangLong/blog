package model

import "time"

type Role struct {
	ID          uint         `gorm:"primarykey" json:"id"`
	Name        string       `gorm:"size:50;uniqueIndex;not null" json:"name"`
	Description string       `gorm:"size:200" json:"description"`
	Permissions []Permission `gorm:"many2many:role_permissions;" json:"permissions,omitempty"`
	CreatedAt   time.Time    `json:"created_at"`
	UpdatedAt   time.Time    `json:"updated_at"`
}

type Permission struct {
	ID          uint   `gorm:"primarykey" json:"id"`
	Module      string `gorm:"size:50;not null;uniqueIndex:idx_module_action" json:"module"`
	Action      string `gorm:"size:50;not null;uniqueIndex:idx_module_action" json:"action"`
	Description string `gorm:"size:200" json:"description"`
}
