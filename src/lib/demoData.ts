// SaathChalo — Demo Data (Phase 2)
//
// Sample locations around VGU Jaipur for prototype mode.
// Used when Firebase is not configured and Leaflet is not yet wired.

export interface DemoLocation {
  id: string
  label: string
  lat: number
  lng: number
  address: string
}

// Common student locations around VGU, Jaipur
export const DEMO_LOCATIONS: DemoLocation[] = [
  { id: 'vgu-campus', label: 'VGU Main Gate', lat: 26.8595, lng: 75.7912, address: 'Vivekananda Global University, Jaipur' },
  { id: 'vgu-block-c', label: 'VGU Block C', lat: 26.8601, lng: 75.7930, address: 'VGU Campus, Block C, Jaipur' },
  { id: 'vgu-library', label: 'VGU Library', lat: 26.8588, lng: 75.7900, address: 'VGU Campus, Central Library, Jaipur' },
  { id: 'malviya-nagar', label: 'Home — Malviya Nagar', lat: 26.9124, lng: 75.8105, address: 'Malviya Nagar, Jaipur' },
  { id: 'tonk-road', label: 'Tonk Road', lat: 26.9050, lng: 75.8050, address: 'Tonk Road, Jaipur' },
  { id: 'mansarovar', label: 'Mansarovar', lat: 26.8880, lng: 75.7950, address: 'Mansarovar, Jaipur' },
  { id: 'jagatpura', label: 'Jagatpura', lat: 26.8680, lng: 75.8200, address: 'Jagatpura, Jaipur' },
  { id: 'sanganer', label: 'Sanganer', lat: 26.8350, lng: 75.7850, address: 'Sanganer, Jaipur' },
  { id: 'vaishali-nagar', label: 'Vaishali Nagar', lat: 26.9150, lng: 75.7650, address: 'Vaishali Nagar, Jaipur' },
  { id: 'c-scheme', label: 'C-Scheme', lat: 26.9220, lng: 75.8150, address: 'C-Scheme, Jaipur' },
]

/** Default pickup for customer home */
export const DEFAULT_PICKUP = DEMO_LOCATIONS[3] // Home — Malviya Nagar
/** Default drop for customer home */
export const DEFAULT_DROP = DEMO_LOCATIONS[0] // VGU Main Gate

// ── Demo Accounts (competition MVP) ─────────────────────────────────────────

export interface DemoAccount {
  id: string
  name: string
  email: string
  phone: string
  area: string
  roles: string[]
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected'
  label: string // short description shown in the login screen
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-priya',
    name: 'Priya Sharma',
    email: 'priya@vgu.ac.in',
    phone: '+91 98290 12345',
    area: 'Malviya Nagar',
    roles: ['customer'],
    verificationStatus: 'verified',
    label: 'Verified Customer',
  },
  {
    id: 'demo-arjun',
    name: 'Arjun Mehta',
    email: 'arjun@vgu.ac.in',
    phone: '+91 98290 23456',
    area: 'Jagatpura',
    roles: ['rider'],
    verificationStatus: 'verified',
    label: 'Verified Rider',
  },
  {
    id: 'demo-sneha',
    name: 'Sneha Gupta',
    email: 'sneha@vgu.ac.in',
    phone: '+91 98290 34567',
    area: 'Mansarovar',
    roles: ['customer', 'rider'],
    verificationStatus: 'verified',
    label: 'Customer + Rider',
  },
  {
    id: 'demo-rohan',
    name: 'Rohan Patel',
    email: 'rohan@vgu.ac.in',
    phone: '+91 98290 45678',
    area: 'Tonk Road',
    roles: ['customer'],
    verificationStatus: 'pending',
    label: 'Pending Verification',
  },
  {
    id: 'demo-kavya',
    name: 'Kavya Singh',
    email: 'kavya@vgu.ac.in',
    phone: '+91 98290 56789',
    area: 'Vaishali Nagar',
    roles: ['rider'],
    verificationStatus: 'verified',
    label: 'Rider (Women)',
  },
  {
    id: 'demo-aditya',
    name: 'Aditya Joshi',
    email: 'aditya@vgu.ac.in',
    phone: '+91 98290 67890',
    area: 'C-Scheme',
    roles: ['customer'],
    verificationStatus: 'none',
    label: 'New User (No Roles)',
  },
]
