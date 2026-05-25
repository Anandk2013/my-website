export type Brand = {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  snippet: string | null
  location: string
  city: string
  rating: number
  review_count: number
  recommend_pct: number
  years_in_business: number | null
  team_size: number | null
  projects_completed: number | null
  established_year: number | null
  response_time: string | null
  phone: string | null
  email: string | null
  address: string | null
  website: string | null
  is_verified: boolean
  logo_initials: string | null
  cover_gradient: string | null
  tags: string[]
  areas_served: string[]
  service_types: string[]
  design_styles: string[]
  plan_type: 'free' | 'pro'
  wallet_balance: number
  status: 'active' | 'paused' | 'pending_review' | 'rejected'
  auth_user_id: string | null
  created_at: string
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type MeetingType = 'video_call' | 'site_visit' | 'experience_center'

export type Booking = {
  id: string
  brand_id: string
  homeowner_id: string | null
  homeowner_name: string
  homeowner_email: string
  homeowner_phone: string
  meeting_type: MeetingType
  preferred_date: string | null
  preferred_time: string | null
  project_type: string | null
  budget_range: string | null
  notes: string | null
  status: BookingStatus
  review_rating: number | null
  review_text: string | null
  recommend: boolean | null
  reviewed_at: string | null
  created_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  city: string | null
  created_at: string
}

export type WalletTransaction = {
  id: string
  brand_id: string
  amount: number
  type: 'meeting_fee' | 'topup' | 'refund' | 'subscription' | 'free_meeting'
  description: string | null
  booking_id: string | null
  created_at: string
}
