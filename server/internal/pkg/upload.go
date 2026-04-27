package pkg

import (
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"blog-server/config"
	"github.com/google/uuid"
)

func SaveUploadedFile(file *multipart.FileHeader) (string, error) {
	cfg := config.AppConfig.Upload

	// Validate mime type
	contentType := file.Header.Get("Content-Type")
	allowed := false
	for _, t := range cfg.AllowedTypes {
		if strings.EqualFold(contentType, t) {
			allowed = true
			break
		}
	}
	if !allowed {
		return "", fmt.Errorf("file type %s is not allowed", contentType)
	}

	// Validate size
	if file.Size > cfg.MaxSize {
		return "", fmt.Errorf("file size exceeds limit")
	}

	// Create upload directory
	if err := os.MkdirAll(cfg.Path, 0755); err != nil {
		return "", err
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	newFilename := uuid.New().String() + ext
	savePath := filepath.Join(cfg.Path, newFilename)

	src, err := file.Open()
	if err != nil {
		return "", err
	}
	defer src.Close()

	dst, err := os.Create(savePath)
	if err != nil {
		return "", err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, src); err != nil {
		return "", err
	}

	return "/uploads/" + newFilename, nil
}
