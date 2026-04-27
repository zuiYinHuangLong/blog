export interface APIResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedData<T> {
  list: T[]
  total: number
  page: number
  page_size: number
}

export type PaginatedResponse<T> = APIResponse<PaginatedData<T>>
