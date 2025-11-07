export interface News {
  id: string
  publisher_name: string
  publisher_url: string
  title: string
  author: string
  published_at: Date
  article_url: string
  tickers: string[]
  amp_url?: string
  image_url: string
  description: string
  insights: any
  created_at: Date
  updated_at: Date
}