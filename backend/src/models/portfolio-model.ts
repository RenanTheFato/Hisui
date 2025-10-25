export interface Portfolio {
  id: string,
  name: string,
  description: string | null,
  userId: string,
  created_at: Date,
  updated_at: Date,
}