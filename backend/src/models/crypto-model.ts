export interface Crypto {
  id: string,
  name: string,
  ticker: string,
  blockchain: string,
  protocol: string | undefined,
  created_at: Date,
  updated_at: Date,
}