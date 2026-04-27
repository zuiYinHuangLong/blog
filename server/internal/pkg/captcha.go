package pkg

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math/rand"
	"sync"
	"time"
)

var (
	captchaStore = &sync.Map{}
)

type CaptchaData struct {
	Code      string
	ExpiresAt time.Time
}

func GenerateCaptcha() (id string, b64Image string, err error) {
	// Generate random code (4 digits)
	code := fmt.Sprintf("%04d", rand.Intn(10000))

	// Generate captcha ID
	id = fmt.Sprintf("%d_%d", time.Now().UnixNano(), rand.Intn(99999))

	// Store captcha
	captchaStore.Store(id, &CaptchaData{
		Code:      code,
		ExpiresAt: time.Now().Add(5 * time.Minute),
	})

	// Generate image
	img := generateCaptchaImage(code)
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		return "", "", err
	}

	b64Image = "data:image/png;base64," + base64.StdEncoding.EncodeToString(buf.Bytes())
	return id, b64Image, nil
}

func VerifyCaptcha(id, code string) bool {
	val, ok := captchaStore.LoadAndDelete(id)
	if !ok {
		return false
	}
	data := val.(*CaptchaData)
	if time.Now().After(data.ExpiresAt) {
		return false
	}
	return data.Code == code
}

func generateCaptchaImage(code string) *image.RGBA {
	width, height := 120, 40
	img := image.NewRGBA(image.Rect(0, 0, width, height))

	// Background
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.Set(x, y, color.RGBA{240, 240, 240, 255})
		}
	}

	// Add noise lines
	for i := 0; i < 6; i++ {
		x1, y1 := rand.Intn(width), rand.Intn(height)
		x2, y2 := rand.Intn(width), rand.Intn(height)
		c := color.RGBA{uint8(rand.Intn(200)), uint8(rand.Intn(200)), uint8(rand.Intn(200)), 255}
		drawLine(img, x1, y1, x2, y2, c)
	}

	// Draw characters
	colors := []color.RGBA{
		{30, 80, 180, 255},
		{180, 30, 30, 255},
		{30, 130, 30, 255},
		{130, 30, 130, 255},
	}

	for i, ch := range code {
		x := 15 + i*25
		y := 10 + rand.Intn(8)
		drawChar(img, x, y, byte(ch), colors[i%len(colors)])
	}

	// Add noise dots
	for i := 0; i < 100; i++ {
		x, y := rand.Intn(width), rand.Intn(height)
		img.Set(x, y, color.RGBA{uint8(rand.Intn(255)), uint8(rand.Intn(255)), uint8(rand.Intn(255)), 255})
	}

	return img
}

func drawLine(img *image.RGBA, x1, y1, x2, y2 int, c color.RGBA) {
	dx := abs(x2 - x1)
	dy := abs(y2 - y1)
	sx, sy := 1, 1
	if x1 > x2 {
		sx = -1
	}
	if y1 > y2 {
		sy = -1
	}
	err := dx - dy

	for {
		if x1 >= 0 && x1 < img.Bounds().Max.X && y1 >= 0 && y1 < img.Bounds().Max.Y {
			img.Set(x1, y1, c)
		}
		if x1 == x2 && y1 == y2 {
			break
		}
		e2 := 2 * err
		if e2 > -dy {
			err -= dy
			x1 += sx
		}
		if e2 < dx {
			err += dx
			y1 += sy
		}
	}
}

func abs(x int) int {
	if x < 0 {
		return -x
	}
	return x
}

// Simple 5x7 bitmap font for digits
var digitFont = map[byte][7]uint8{
	'0': {0x1C, 0x22, 0x26, 0x2A, 0x32, 0x22, 0x1C},
	'1': {0x08, 0x18, 0x08, 0x08, 0x08, 0x08, 0x1C},
	'2': {0x1C, 0x22, 0x02, 0x0C, 0x10, 0x20, 0x3E},
	'3': {0x1C, 0x22, 0x02, 0x0C, 0x02, 0x22, 0x1C},
	'4': {0x04, 0x0C, 0x14, 0x24, 0x3E, 0x04, 0x04},
	'5': {0x3E, 0x20, 0x3C, 0x02, 0x02, 0x22, 0x1C},
	'6': {0x0C, 0x10, 0x20, 0x3C, 0x22, 0x22, 0x1C},
	'7': {0x3E, 0x02, 0x04, 0x08, 0x10, 0x10, 0x10},
	'8': {0x1C, 0x22, 0x22, 0x1C, 0x22, 0x22, 0x1C},
	'9': {0x1C, 0x22, 0x22, 0x1E, 0x02, 0x04, 0x18},
}

func drawChar(img *image.RGBA, x, y int, ch byte, c color.RGBA) {
	bitmap, ok := digitFont[ch]
	if !ok {
		return
	}
	scale := 3
	for row := 0; row < 7; row++ {
		for col := 0; col < 6; col++ {
			if bitmap[row]&(1<<(5-col)) != 0 {
				for dy := 0; dy < scale; dy++ {
					for dx := 0; dx < scale; dx++ {
						px := x + col*scale + dx
						py := y + row*scale + dy
						if px >= 0 && px < img.Bounds().Max.X && py >= 0 && py < img.Bounds().Max.Y {
							img.Set(px, py, c)
						}
					}
				}
			}
		}
	}
}
