package dto

type ArticleRequest struct {
	Title       string `json:"title" binding:"required"`
	Slug        string `json:"slug"`
	Summary     string `json:"summary"`
	Content     string `json:"content" binding:"required"`
	ContentType string `json:"content_type"`
	CoverImage  string `json:"cover_image"`
	CategoryID  *uint  `json:"category_id"`
	TagIDs      []uint `json:"tag_ids"`
}

type ArticleStatusRequest struct {
	Status int `json:"status" binding:"oneof=0 1"`
}

type CategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Slug        string `json:"slug" binding:"required"`
	Description string `json:"description"`
	ParentID    *uint  `json:"parent_id"`
	Sort        int    `json:"sort"`
}

type TagRequest struct {
	Name string `json:"name" binding:"required"`
	Slug string `json:"slug" binding:"required"`
}

type RoleRequest struct {
	Name          string `json:"name" binding:"required"`
	Description   string `json:"description"`
	PermissionIDs []uint `json:"permission_ids"`
}

type QRCodeCreateRequest struct {
	ArticleID uint `json:"article_id" binding:"required"`
}

type QRCodeRejectRequest struct {
	Reason string `json:"reason" binding:"required"`
}
