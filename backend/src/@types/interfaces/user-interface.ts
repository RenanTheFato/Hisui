export interface User {
  id: string,
  email: string,
  password_hash: string,
  username: string,
  role: string,
  is_verified: boolean
  verification_token: string | null,
  verification_token_expires: Date | null,
  created_at: Date,
  updated_at: Date,
}