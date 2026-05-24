export type Brand = {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  location: string
  city: string
  rating: number
  review_count: number
  years_in_business: number | null
  team_size: number | null
  projects_completed: number | null
  established_year: number | null
  response_time: string | null
  phone: string | null
  email: string | null
  address: string | null
  is_verified: boolean
  logo_initials: string | null
  cover_gradient: string | null
  tags: string[]
  areas_served: string[]
  recommend_pct: number
  created_at: string
}

export type Booking = {
  id: string
  brand_id: string
  homeowner_id: string | null
  homeowner_name: string
  homeowner_email: string
  homeowner_phone: string
  meeting_type: 'video_call' | 'site_visit' | 'experience_center'
  preferred_date: string | null
  preferred_time: string | null
  project_type: string | null
  budget_range: string | null
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  city: string | null
  created_at: string
}
