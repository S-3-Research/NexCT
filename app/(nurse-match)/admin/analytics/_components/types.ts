// Shared types for funnel analytics
export interface FunnelEvent {
  id: string
  session_id: string
  event_type: 'page_view' | 'step_view' | 'step_complete' | 'form_submit'
  page: 'landing' | 'apply'
  step: number | null
  geo_city: string | null
  geo_region: string | null
  geo_country: string | null
  geo_lat: number | null
  geo_lng: number | null
  device_type: 'mobile' | 'tablet' | 'desktop' | null
  browser: string | null
  is_test: boolean
  created_at: string
}
