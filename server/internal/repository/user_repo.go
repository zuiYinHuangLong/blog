package repository

import (
	"blog-server/internal/model"
	"gorm.io/gorm"
)

type UserRepo struct {
	DB *gorm.DB
}

type UserCreate struct {
	Username     string
	Email        string
	PasswordHash string
	RoleID       uint
	Status       int
}

func NewUserRepo(db *gorm.DB) *UserRepo {
	return &UserRepo{DB: db}
}

func (r *UserRepo) FindByUsername(username string) (*model.User, error) {
	var user model.User
	err := r.DB.Where("username = ?", username).First(&user).Error
	return &user, err
}

func (r *UserRepo) FindByID(id uint) (*model.User, error) {
	var user model.User
	err := r.DB.First(&user, id).Error
	return &user, err
}

func (r *UserRepo) Create(user *model.User) error {
	return r.DB.Create(user).Error
}

func (r *UserRepo) CreateFull(u *UserCreate) error {
	user := model.User{
		Username:     u.Username,
		Email:        u.Email,
		PasswordHash: u.PasswordHash,
		RoleID:       u.RoleID,
		Status:       u.Status,
	}
	return r.DB.Create(&user).Error
}

func (r *UserRepo) Update(user *model.User) error {
	return r.DB.Save(user).Error
}

func (r *UserRepo) DeleteByID(id uint) error {
	return r.DB.Delete(&model.User{}, id).Error
}

func (r *UserRepo) List(offset, limit int) ([]model.User, int64, error) {
	var users []model.User
	var total int64
	r.DB.Model(&model.User{}).Count(&total)
	err := r.DB.Preload("Role").Offset(offset).Limit(limit).Order("id DESC").Find(&users).Error
	return users, total, err
}
