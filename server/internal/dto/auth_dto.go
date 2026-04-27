package dto

type LoginRequest struct {
	Username  string `json:"username" binding:"required"`
	Password  string `json:"password" binding:"required"`
	CaptchaID string `json:"captcha_id"`
	Captcha   string `json:"captcha"`
}

type LoginResponse struct {
	AccessToken string      `json:"access_token"`
	User        interface{} `json:"user"`
	Permissions interface{} `json:"permissions"`
}

type ProfileResponse struct {
	User        interface{} `json:"user"`
	Permissions interface{} `json:"permissions"`
}

type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required"`
}

type UserCreateRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
	RoleID   uint   `json:"role_id" binding:"required"`
}

type UserUpdateRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	RoleID   uint   `json:"role_id"`
	Status   *int   `json:"status"`
}
