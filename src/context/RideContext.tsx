// SaathChalo — Ride Context
//
// Single source of truth for the customer's active ride ticket.
// The ticket's `status` field drives which screen is shown.
// All transitions are mocked with timers for now — swap for real
// WebSocket / Firestore listeners when a backend is ready.

import {
  createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode,
} from 'react'

// ── Types ────────────────────────────────────────────────────────────────────

export type RideStatus =
  | 'none' | 'searching' | 'waiting' | 'rider_accepted'
  | 'rider_arriving' | 'in_progress' | 'completed' | 'cancelled'

export interface RideRider {
  name: string
  vehicle: string
  rating: number
  phone: string
  liveLocation: { lat: number; lng: number } | null
  etaMinutes: number
}

export interface RideTicket {
  id: string
  pickup: string
  drop: string
  pickupLat: number
  pickupLng: number
  dropLat: number
  dropLng: number
  date: string
  time: string
  isRecurring: boolean
  recurringDays: string[]
  fare: number
  fuelShare: number
  platformFee: number
  distanceKm: number
  status: RideStatus
  rider: RideRider | null
  createdAt: number
}

export interface RideNotification {
  id: string
  icon: string
  title: string
  desc: string
  time: string
  unread: boolean
  targetStatus: RideStatus | null
}

interface RideContextValue {
  ticket: RideTicket | null
  notifications: RideNotification[]
  createRideTicket: (input: {
    pickup: string; drop: string
    pickupLat: number; pickupLng: number
    dropLat: number; dropLng: number
    date: string; time: string
    isRecurring: boolean; recurringDays: string[]
    distanceKm: number
  }) => void
  cancelRide: () => void
  simulateRiderAccept: () => void
  simulateRiderArrive: () => void
  startRide: () => void
  completeRide: () => void
  markNotificationsRead: () => void
  clearNotifications: () => void
  hasActiveTicket: boolean
}

const RideContext = createContext<RideContextValue | undefined>(undefined)

// ── Constants ────────────────────────────────────────────────────────────────

const RATE_PER_KM = 3.9
const PLATFORM_FEE = 3
const STORAGE_KEY = 'saathchalo_active_ticket'
const NOTIF_STORAGE_KEY = 'saathchalo_notifications'

// Mock delays (ms) for auto-transitions
const SEARCHING_DURATION = 4000
const WAITING_DURATION = 5000
const ARRIVING_TICK = 2000

const MOCK_RIDER: RideRider = {
  name: 'Rohit Sharma',
  vehicle: 'Honda Activa 6G · RJ14 AB 1234',
  rating: 4.8,
  phone: '+91 98765 43210',
  liveLocation: { lat: 26.9100, lng: 75.8080 },
  etaMinutes: 4,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function generateId(): string {
  return `ticket-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function calculateFare(distanceKm: number) {
  const fuelShare = Math.round(distanceKm * RATE_PER_KM * 100) / 100
  return { fuelShare, platformFee: PLATFORM_FEE, totalCost: fuelShare + PLATFORM_FEE }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function RideProvider({ children }: { children: ReactNode }) {
  const [ticket, setTicket] = useState<RideTicket | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as RideTicket
        if (parsed.status === 'completed' || parsed.status === 'cancelled' || parsed.status === 'none') {
          localStorage.removeItem(STORAGE_KEY)
          return null
        }
        return parsed
      }
    } catch { /* ignore */ }
    return null
  })

  const [notifications, setNotifications] = useState<RideNotification[]>(() => {
    try {
      const stored = localStorage.getItem(NOTIF_STORAGE_KEY)
      if (stored) return JSON.parse(stored)
    } catch { /* ignore */ }
    return []
  })

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const arrivingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Persist ticket
  useEffect(() => {
    if (ticket && !['none', 'completed', 'cancelled'].includes(ticket.status)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ticket))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [ticket])

  // Persist notifications
  useEffect(() => {
    localStorage.setItem(NOTIF_STORAGE_KEY, JSON.stringify(notifications.slice(0, 20)))
  }, [notifications])

  // Cleanup timers on unmount
  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (arrivingRef.current) clearInterval(arrivingRef.current)
  }, [])

  const addNotification = useCallback((icon: string, title: string, desc: string, targetStatus: RideStatus | null) => {
    const notif: RideNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      icon, title, desc,
      time: 'Just now',
      unread: true,
      targetStatus,
    }
    setNotifications(prev => [notif, ...prev])
  }, [])

  // ── Auto-transition effect ──────────────────────────────────────────────

  useEffect(() => {
    if (!ticket) return

    switch (ticket.status) {
      case 'searching':
        timerRef.current = setTimeout(() => {
          setTicket(prev => prev?.status === 'searching' ? { ...prev, status: 'waiting' } : prev)
          addNotification('📋', 'Ticket posted', 'Your ride request is now visible to riders on your route.', 'waiting')
        }, SEARCHING_DURATION)
        break

      case 'waiting':
        timerRef.current = setTimeout(() => {
          setTicket(prev => prev?.status === 'waiting' ? { ...prev, status: 'rider_accepted', rider: { ...MOCK_RIDER } } : prev)
          addNotification('✅', 'Rider accepted your ticket!', `${MOCK_RIDER.name} is heading to your pickup point.`, 'rider_accepted')
        }, WAITING_DURATION)
        break

      case 'rider_arriving': {
        let eta = ticket.rider?.etaMinutes ?? 4
        arrivingRef.current = setInterval(() => {
          eta -= 1
          if (eta <= 0) {
            if (arrivingRef.current) clearInterval(arrivingRef.current)
            setTicket(prev => prev?.status === 'rider_arriving'
              ? { ...prev, status: 'in_progress', rider: prev.rider ? { ...prev.rider, etaMinutes: 0 } : null }
              : prev)
            addNotification('🚗', 'Rider has arrived!', 'Your ride is now in progress. Have a safe trip!', 'in_progress')
          } else {
            setTicket(prev => prev?.status === 'rider_arriving'
              ? { ...prev, rider: prev.rider ? { ...prev.rider, etaMinutes: eta } : null }
              : prev)
          }
        }, ARRIVING_TICK)
        break
      }
      default:
        break
    }

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [ticket?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Actions ─────────────────────────────────────────────────────────────

  const createRideTicket = useCallback((input: {
    pickup: string; drop: string
    pickupLat: number; pickupLng: number
    dropLat: number; dropLng: number
    date: string; time: string
    isRecurring: boolean; recurringDays: string[]
    distanceKm: number
  }) => {
    const { fuelShare, platformFee, totalCost } = calculateFare(input.distanceKm)
    const newTicket: RideTicket = {
      id: generateId(),
      pickup: input.pickup, drop: input.drop,
      pickupLat: input.pickupLat, pickupLng: input.pickupLng,
      dropLat: input.dropLat, dropLng: input.dropLng,
      date: input.date, time: input.time,
      isRecurring: input.isRecurring, recurringDays: input.recurringDays,
      fare: totalCost, fuelShare, platformFee,
      distanceKm: input.distanceKm,
      status: 'searching', rider: null, createdAt: Date.now(),
    }
    setTicket(newTicket)
    addNotification('🔍', 'Searching for a rider…', `Looking for riders on the ${input.pickup} → ${input.drop} route.`, 'searching')
  }, [addNotification])

  const cancelRide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (arrivingRef.current) clearInterval(arrivingRef.current)
    addNotification('❌', 'Ride cancelled', 'Your ticket has been cancelled.', null)
    setTicket(null)
  }, [addNotification])

  const simulateRiderAccept = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setTicket(prev => prev?.status === 'waiting' ? { ...prev, status: 'rider_accepted', rider: { ...MOCK_RIDER } } : prev)
    addNotification('✅', 'Rider accepted your ticket!', `${MOCK_RIDER.name} is heading to your pickup point.`, 'rider_accepted')
  }, [addNotification])

  const simulateRiderArrive = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setTicket(prev => prev?.status === 'rider_accepted'
      ? { ...prev, status: 'rider_arriving', rider: prev.rider ? { ...prev.rider, etaMinutes: 4 } : MOCK_RIDER }
      : prev)
    addNotification('📍', 'Rider is on the way', 'Your rider is approaching your pickup location.', 'rider_arriving')
  }, [addNotification])

  const startRide = useCallback(() => {
    setTicket(prev => prev?.status === 'rider_arriving' ? { ...prev, status: 'in_progress' } : prev)
    addNotification('🚗', 'Ride started', 'You are now on your way. Have a safe trip!', 'in_progress')
  }, [addNotification])

  const completeRide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (arrivingRef.current) clearInterval(arrivingRef.current)
    addNotification('🎉', 'Ride completed!', 'You arrived at your destination. Thanks for riding with SaathChalo!', null)
    setTicket(null)
  }, [addNotification])

  const markNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }, [])

  const clearNotifications = useCallback(() => setNotifications([]), [])

  const hasActiveTicket = ticket !== null && !['none', 'completed', 'cancelled'].includes(ticket.status)

  return (
    <RideContext.Provider value={{
      ticket, notifications,
      createRideTicket, cancelRide, simulateRiderAccept, simulateRiderArrive,
      startRide, completeRide, markNotificationsRead, clearNotifications,
      hasActiveTicket,
    }}>
      {children}
    </RideContext.Provider>
  )
}

export function useRide(): RideContextValue {
  const ctx = useContext(RideContext)
  if (!ctx) throw new Error('useRide must be used within a <RideProvider>')
  return ctx
}