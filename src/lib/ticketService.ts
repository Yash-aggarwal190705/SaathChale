// SaathChalo — Ticket Service (Phase 2)
//
// Firestore CRUD for customer ride tickets + matching helpers.
// All functions gracefully degrade when Firebase is not configured,
// returning demo data in prototype mode.

import {
  collection, doc, addDoc, getDoc, getDocs, updateDoc,
  query, where, orderBy, limit, serverTimestamp, onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db, isFirebaseConfigured } from './firebase'

// ── Types ────────────────────────────────────────────────────────────────────

export type TicketStatus =
  | 'open' | 'accepted' | 'in-progress' | 'completed' | 'cancelled' | 'expired'

export interface Ticket {
  id: string
  customerId: string
  customerName: string
  pickupLat: number
  pickupLng: number
  pickupLabel: string
  dropLat: number
  dropLng: number
  dropLabel: string
  date: string
  timeWindowStart: string
  timeWindowEnd: string
  days: string[]
  repeatWeekly: boolean
  womenOnly: boolean
  status: TicketStatus
  riderId: string | null
  riderName: string | null
  distanceKm: number
  fuelShare: number
  platformFee: number
  totalCost: number
  createdAt?: unknown
  updatedAt?: unknown
}

export interface TicketCreateInput {
  customerId: string
  customerName: string
  pickupLat: number
  pickupLng: number
  pickupLabel: string
  dropLat: number
  dropLng: number
  dropLabel: string
  date: string
  timeWindowStart: string
  timeWindowEnd: string
  days: string[]
  repeatWeekly: boolean
  womenOnly: boolean
}

// ── Constants ────────────────────────────────────────────────────────────────

const RATE_PER_KM = 3.9
const PLATFORM_FEE = 3
const COLLECTION = 'tickets'

// ── Demo data ────────────────────────────────────────────────────────────────

const DEMO_TICKETS: Ticket[] = [
  {
    id: 'demo-1', customerId: 'demo-customer', customerName: 'Ananya Sharma',
    pickupLat: 26.9124, pickupLng: 75.8105, pickupLabel: 'Home — Malviya Nagar',
    dropLat: 26.8595, dropLng: 75.7912, dropLabel: 'VGU Main Gate',
    date: new Date().toISOString().split('T')[0],
    timeWindowStart: '08:00', timeWindowEnd: '09:00',
    days: ['M', 'T', 'W', 'Th', 'F'], repeatWeekly: true, womenOnly: true,
    status: 'open', riderId: null, riderName: null,
    distanceKm: 7.2, fuelShare: 28.08, platformFee: 3, totalCost: 31.08,
  },
  {
    id: 'demo-2', customerId: 'demo-customer-2', customerName: 'Priya Patel',
    pickupLat: 26.9050, pickupLng: 75.8050, pickupLabel: 'Tonk Road',
    dropLat: 26.8595, dropLng: 75.7912, dropLabel: 'VGU Main Gate',
    date: new Date().toISOString().split('T')[0],
    timeWindowStart: '08:30', timeWindowEnd: '09:30',
    days: ['M', 'W', 'F'], repeatWeekly: false, womenOnly: false,
    status: 'open', riderId: null, riderName: null,
    distanceKm: 5.8, fuelShare: 22.62, platformFee: 3, totalCost: 25.62,
  },
]

// ── Helpers ──────────────────────────────────────────────────────────────────

export function calculateCost(distanceKm: number) {
  const fuelShare = Math.round(distanceKm * RATE_PER_KM * 100) / 100
  return { fuelShare, platformFee: PLATFORM_FEE, totalCost: fuelShare + PLATFORM_FEE }
}

export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// ── Firestore operations ─────────────────────────────────────────────────────

/** Creates a new ticket. Returns the ticket ID. */
export async function createTicket(input: TicketCreateInput): Promise<string> {
  const distanceKm = Math.round(
    haversineKm(input.pickupLat, input.pickupLng, input.dropLat, input.dropLng) * 10,
  ) / 10
  const { fuelShare, platformFee, totalCost } = calculateCost(distanceKm)

  if (!isFirebaseConfigured || !db) {
    return `demo-${Date.now()}`
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...input,
    distanceKm, fuelShare, platformFee, totalCost,
    status: 'open' as TicketStatus,
    riderId: null,
    riderName: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

/** Gets a single ticket by ID. */
export async function getTicket(ticketId: string): Promise<Ticket | null> {
  if (!isFirebaseConfigured || !db) {
    return DEMO_TICKETS.find(t => t.id === ticketId) ?? null
  }
  try {
    const snap = await getDoc(doc(db, COLLECTION, ticketId))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as Ticket
  } catch (err) {
    console.error('[ticketService] getTicket failed:', err)
    return null
  }
}

/** Lists tickets for a given customer (newest first). */
export async function getCustomerTickets(customerId: string): Promise<Ticket[]> {
  if (!isFirebaseConfigured || !db) {
    return DEMO_TICKETS.filter(t => t.customerId === customerId)
  }
  try {
    const q = query(
      collection(db, COLLECTION),
      where('customerId', '==', customerId),
      orderBy('createdAt', 'desc'),
      limit(50),
    )
    const snap = await getDocs(q)
    return snap.docs.map(d => ({ id: d.id, ...d.data() }) as Ticket)
  } catch (err) {
    console.error('[ticketService] getCustomerTickets failed:', err)
    return []
  }
}

/** Searches for open tickets near a rider's location (bounding-box heuristic). */
export async function searchOpenTickets(params: {
  riderLat: number
  riderLng: number
  radiusKm?: number
  riderGender?: string
}): Promise<Ticket[]> {
  const { riderLat, riderLng, radiusKm = 5 } = params

  if (!isFirebaseConfigured || !db) {
    let tickets = DEMO_TICKETS.filter(t => t.status === 'open')
    if (params.riderGender !== 'female') tickets = tickets.filter(t => !t.womenOnly)
    return tickets
  }

  try {
    const latDelta = radiusKm / 111
    const lngDelta = radiusKm / (111 * Math.cos((riderLat * Math.PI) / 180))
    const q = query(
      collection(db, COLLECTION),
      where('status', '==', 'open'),
      where('pickupLat', '>=', riderLat - latDelta),
      where('pickupLat', '<=', riderLat + latDelta),
      orderBy('pickupLat'),
      limit(20),
    )
    const snap = await getDocs(q)
    let tickets = snap.docs.map(d => ({ id: d.id, ...d.data() }) as Ticket)
    tickets = tickets.filter(t =>
      t.pickupLng >= riderLng - lngDelta && t.pickupLng <= riderLng + lngDelta,
    )
    if (params.riderGender !== 'female') {
      tickets = tickets.filter(t => !t.womenOnly)
    }
    return tickets
  } catch (err) {
    console.error('[ticketService] searchOpenTickets failed:', err)
    return []
  }
}

/** Updates a ticket's status. */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  extra?: { riderId?: string; riderName?: string },
): Promise<void> {
  if (!isFirebaseConfigured || !db) return
  try {
    await updateDoc(doc(db, COLLECTION, ticketId), {
      status,
      ...(extra ?? {}),
      updatedAt: serverTimestamp(),
    })
  } catch (err) {
    console.error('[ticketService] updateTicketStatus failed:', err)
  }
}

/** Cancels a ticket. */
export async function cancelTicket(ticketId: string): Promise<void> {
  await updateTicketStatus(ticketId, 'cancelled')
}

/** Subscribes to real-time updates on a specific ticket. */
export function subscribeToTicket(
  ticketId: string,
  callback: (ticket: Ticket | null) => void,
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    const demo = DEMO_TICKETS.find(t => t.id === ticketId) ?? null
    callback(demo)
    return () => {}
  }
  return onSnapshot(doc(db, COLLECTION, ticketId), (snap) => {
    if (!snap.exists()) { callback(null); return }
    callback({ id: snap.id, ...snap.data() } as Ticket)
  })
}

/** Subscribes to open tickets (for riders browsing requests). */
export function subscribeToOpenTickets(
  callback: (tickets: Ticket[]) => void,
): Unsubscribe {
  if (!isFirebaseConfigured || !db) {
    callback(DEMO_TICKETS.filter(t => t.status === 'open'))
    return () => {}
  }
  const q = query(
    collection(db, COLLECTION),
    where('status', '==', 'open'),
    orderBy('createdAt', 'desc'),
    limit(30),
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Ticket))
  })
}