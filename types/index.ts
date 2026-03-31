export type UserRole = 'user' | 'admin'
export type UserStatus = 'pending' | 'active' | 'suspended'
export type KYCStatus = 'none' | 'pending' | 'approved' | 'rejected'
export type UserTier = 'starter' | 'silver' | 'gold' | 'platinum'

export interface User {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role: UserRole
  status: UserStatus
  kyc_status: KYCStatus
  tier: UserTier
  referral_code: string | null
  referred_by: string | null
  two_factor_enabled: boolean
  last_login: string | null
  created_at: string
}

export interface Balance {
  id: string
  user_id: string
  crypto_balance: number
  stocks_balance: number
  affiliate_balance: number
  total_balance: number
  total_pnl: number
  pnl_percentage: number
  updated_at: string
}

export interface Trade {
  id: string
  user_id: string
  trade_id: string
  platform: 'Coinbase' | 'Bybit' | 'IBKR' | 'Amazon'
  asset: string
  type: 'BUY' | 'SELL' | 'EARN'
  amount: number
  price: number | null
  pnl: number | null
  status: 'pending' | 'completed' | 'failed'
  note: string | null
  created_at: string
}

export interface WithdrawalRequest {
  id: string
  user_id: string
  request_id: string
  amount: number
  currency: string
  wallet_address: string
  network: string
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

export interface Deposit {
  id: string
  user_id: string
  deposit_id: string
  amount: number
  currency: string
  tx_hash: string | null
  provider: string | null
  status: 'pending' | 'confirmed' | 'failed'
  confirmed_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'alert'
  is_read: boolean
  action_url: string | null
  sent_by: string | null
  created_at: string
}

export interface SupportChat {
  id: string
  user_id: string
  status: 'open' | 'closed'
  subject: string | null
  last_message: string | null
  last_message_at: string | null
  assigned_to: string | null
  created_at: string
}

export interface SupportMessage {
  id: string
  chat_id: string
  sender_id: string
  sender_role: 'user' | 'admin'
  message: string
  is_read: boolean
  created_at: string
}

export interface AffiliateLink {
  id: string
  user_id: string
  link_code: string
  label: string | null
  url: string
  clicks: number
  conversions: number
  earnings: number
  is_active: boolean
  created_at: string
}

export interface PortfolioSnapshot {
  id: string
  user_id: string
  total_balance: number
  crypto_balance: number
  stocks_balance: number
  affiliate_balance: number
  pnl: number
  snapshot_date: string
}

export interface KYCDocument {
  id: string
  user_id: string
  doc_type: 'passport' | 'drivers_license' | 'national_id'
  front_url: string | null
  back_url: string | null
  selfie_url: string | null
  status: 'pending' | 'approved' | 'rejected'
  admin_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  submitted_at: string
}

export interface AuditLog {
  id: string
  admin_id: string
  action: string
  target_user_id: string | null
  details: Record<string, unknown> | null
  ip_address: string | null
  created_at: string
}