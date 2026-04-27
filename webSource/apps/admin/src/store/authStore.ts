import type { Permission, User } from '@blog/shared'
import { request, rsaEncrypt } from '@blog/shared'

import { create } from 'zustand'

interface AuthState {
  user: User | null
  permissions: Permission[]
  token: string | null
  setAuth: (user: User, token: string, permissions: Permission[]) => void
  logout: () => void
  hasPermission: (module: string, action: string) => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  permissions: [],
  token: localStorage.getItem('access_token'),

  setAuth: (user, token, permissions) => {
    localStorage.setItem('access_token', token)
    set({ user, token, permissions })
  },

  logout: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null, permissions: [] })
  },

  hasPermission: (module: string, action: string) => {
    const { permissions } = get()
    return permissions.some((p) => p.module === module && p.action === action)
  }
}))

export async function loginApi(
  username: string,
  password: string,
  captchaId?: string,
  captcha?: string
) {
  const encryptedPassword = await rsaEncrypt(password)
  const res = await request.post('/auth/login', {
    username,
    password: encryptedPassword,
    captcha_id: captchaId || '',
    captcha: captcha || ''
  })
  return res.data.data
}

export async function fetchProfile() {
  const res = await request.get('/auth/profile')
  return res.data.data
}
