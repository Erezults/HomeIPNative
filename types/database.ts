export interface Network {
  id: string
  user_id: string
  name: string
  subnet: string
  gateway: string
  dhcp_range_start: string
  dhcp_range_end: string
  dns_primary: string
  dns_secondary: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  network_id: string
  name: string
  name_en: string
  icon: string
  color: string
  image_url: string
  sort_order: number
  created_at: string
}

export interface Room {
  id: string
  network_id: string
  name: string
  name_en: string
  icon: string
  color: string
  sort_order: number
  created_at: string
}

export interface Device {
  id: string
  network_id: string
  name: string
  description: string
  ip_address: string
  mac_address: string
  category_id: string | null
  room_id: string | null
  is_active: boolean
  notes: string
  image_url: string
  model: string
  serial_number: string
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'dark' | 'light'
  language: 'he' | 'en'
  preferences: Record<string, unknown>
}

export interface ViewerCode {
  id: string
  network_id: string
  code: string
  label: string
  is_active: boolean
  is_frozen: boolean
  can_edit: boolean
  allowed_categories: string[]
  allowed_rooms: string[]
  last_used_at: string | null
  created_at: string
}

export interface ViewerSession {
  id: string
  viewer_code_id: string
  session_token: string
  created_at: string
  expires_at: string
}
