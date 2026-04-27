package repository

import (
	"blog-server/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type SettingRepo struct {
	DB *gorm.DB
}

func NewSettingRepo(db *gorm.DB) *SettingRepo {
	return &SettingRepo{DB: db}
}

func (r *SettingRepo) Get(key string) string {
	var s model.Setting
	r.DB.Where("`key` = ?", key).First(&s)
	return s.Value
}

func (r *SettingRepo) Set(key, value string) error {
	s := model.Setting{Key: key, Value: value}
	return r.DB.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "key"}},
		DoUpdates: clause.AssignmentColumns([]string{"value", "updated_at"}),
	}).Create(&s).Error
}

func (r *SettingRepo) GetAll() []model.Setting {
	var settings []model.Setting
	r.DB.Find(&settings)
	return settings
}

func (r *SettingRepo) GetMap() map[string]string {
	settings := r.GetAll()
	m := make(map[string]string)
	for _, s := range settings {
		m[s.Key] = s.Value
	}
	return m
}
