export interface AuthResponse {
  success?: boolean
  user_id?: number
  username?: string
  role?: string
  error?: string
}

export interface User {
  user_id: number
  username: string
  role: string
}