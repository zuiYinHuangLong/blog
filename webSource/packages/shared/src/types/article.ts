export interface Article {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  content_type: 'markdown' | 'richtext'
  cover_image: string
  status: number // 0=draft, 1=published
  author_id: number
  author_name?: string
  category_id: number | null
  category_name?: string
  tags: Tag[]
  view_count: number
  qrcode?: QRCode
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description: string
  parent_id: number | null
  sort: number
  children?: Category[]
  article_count?: number
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  article_count?: number
  created_at: string
  updated_at: string
}

export interface Media {
  id: number
  filename: string
  url: string
  mime_type: string
  size: number
  uploader_id: number
  created_at: string
}

/** 二维码审批状态 */
export type QRCodeStatus = 'pending' | 'approved' | 'rejected' | 'published'

export interface QRCode {
  id: number
  article_id: number
  article_title?: string
  qr_url: string // 二维码图片地址
  target_url: string // 扫码跳转地址（文章前台链接）
  status: QRCodeStatus
  creator_id: number
  creator_name?: string
  reviewer_id: number | null
  reviewer_name?: string
  reject_reason: string
  reviewed_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}
