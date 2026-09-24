import { useState, useEffect } from 'react'
import Map, { type MapMode } from './components/Map'
import RiderContent, {
  RIDER_SHEET_CONFIG, RIDER_HIDE_TOPBAR, RIDER_SHOW_NAV, type RiderScreen,
} from './RiderFlow'
import OnboardingContent, { ALL_ONBOARDING_SCREENS, type OnboardingScreen } from './OnboardingFlow'
import CommonContent, { ALL_COMMON_SCREENS, type CommonScreen } from './CommonFlow'
import SOSContent, { type SOSScreen } from './SOSFlow'
import { useAuth } from './context/AuthContext'

type CustomerScreen =
  | 'idle' | 'searching' | 'ticket-form' | 'waiting'
  | 'rider-accepted' | 'rider-arriving' | 'ride-in-progress'

// ── Map mode derivation ──────────────────────────────────────────────────────

const CUSTOMER_MAP_MODES: Record<CustomerScreen, MapMode> = {
  idle: 'idle',
  searching: 'searching',
  'ticket-form': 'route',
  waiting: 'radar',
  'rider-accepted': 'route',
  'rider-arriving': 'bike-near',
  'ride-in-progress': 'in-progress',
}

const RIDER_MAP_MODES: Record<RiderScreen, MapMode> = {
  'setup-vehicle': 'static', 'setup-documents': 'static', 'setup-promise': 'static',
  'verification-pending': 'static', 'verification-verified': 'static', 'verification-rejected': 'static',
  'rider-home-idle': 'idle', 'rider-home-requests': 'idle',
  'post-trip': 'route',
  'tickets-list': 'idle', 'tickets-empty': 'idle',
  'ticket-detail': 'route-detour',
  'ticket-accepted': 'route',
  'heading-to-pickup': 'bike-near',
  'verify-otp': 'dark',
  'ride-in-progress-r': 'in-progress',
  'ride-summary': 'dark',
  'rate-co-rider': 'dark',
}

// ── Sheet config for customer screens ───────────────────────────────────────

const CUSTOMER_SHEET_CONFIG: Record<CustomerScreen, { height: number; sheetBottom: number }> = {
  idle: { height: 248, sheetBottom: 74 },
  searching: { height: 790, sheetBottom: 0 },
  'ticket-form': { height: 498, sheetBottom: 0 },
  waiting: { height: 278, sheetBottom: 0 },
  'rider-accepted': { height: 488, sheetBottom: 0 },
  'rider-arriving': { height: 504, sheetBottom: 0 },
  'ride-in-progress': { height: 186, sheetBottom: 0 },
}

// ── Icons ───────────────────────────────────────────────────────────────────

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
)
const BellIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
)
const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7M5 12h14" />
  </svg>
)
const ClockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)
const ChevronRightIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D0D5DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
)
const MapPinSmIcon = ({ color = '#667085' }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)
const MapChooseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
    <line x1="9" y1="3" x2="9" y2="18" /><line x1="15" y1="6" x2="15" y2="21" />
  </svg>
)
const PhoneCallIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12 19.79 19.79 0 0 1 1.77 3.5 2 2 0 0 1 3.74 1.35h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z" />
  </svg>
)
const XCircleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" />
  </svg>
)
const ShareIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
)
const InfoIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
  </svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)
const StarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#F79009" stroke="#F79009" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const ShieldCheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
  </svg>
)

// Customer nav icons
const HomeNavIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#3B5BDB' : 'none'} stroke={active ? '#3B5BDB' : '#98A2B3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const TicketNavIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#3B5BDB' : '#98A2B3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
    <path d="M13 5v2M13 17v2M13 11v2" />
  </svg>
)
const UserNavIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#3B5BDB' : '#98A2B3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
)
// Rider nav icons
const TripNavIcon = ({ active }: { active: boolean }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#3B5BDB' : '#98A2B3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 14-4-4 4-4" /><path d="M8 10h12" />
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
  </svg>
)

// ── Customer primitives ──────────────────────────────────────────────────────

function PillStatus({ status }: { status: 'pending' | 'rider-found' | 'on-the-way' }) {
  const cfg = {
    pending: { label: 'Waiting for rider', bg: '#FFFAEB', color: '#B54708', border: '#FEDF89' },
    'rider-found': { label: 'Rider found', bg: '#ECFDF3', color: '#027A48', border: '#6CE9A6' },
    'on-the-way': { label: 'On the way', bg: '#EDF1FF', color: '#3451B2', border: '#BAC8FF' },
  }[status]
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full"
      style={{ fontSize: 11, fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.border}` }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)} className="relative flex-shrink-0 transition-colors duration-200"
      style={{ width: 44, height: 26, borderRadius: 13, background: value ? '#3B5BDB' : '#E4E7EC' }}>
      <div className="absolute top-0.5 w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform duration-200"
        style={{ transform: `translateX(${value ? 20 : 2}px)` }} />
    </button>
  )
}

function DayChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150"
      style={{ background: selected ? '#3B5BDB' : '#F2F4F7', color: selected ? 'white' : '#344054',
        fontSize: 12, fontWeight: 700, border: selected ? 'none' : '1px solid #E4E7EC' }}>
      {label}
    </button>
  )
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
      style={{ background: '#EDF1FF', fontSize: 10, color: '#3451B2', fontWeight: 600 }}>
      <ShieldCheckIcon /> Verified
    </span>
  )
}

function RiderCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-[12px]" style={{ border: '1.5px solid #E4E7EC' }}>
      <div className="rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ width: compact ? 40 : 48, height: compact ? 40 : 48, background: '#EDF1FF' }}>
        <span style={{ fontSize: compact ? 14 : 17, fontWeight: 700, color: '#3451B2' }}>RS</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: '#101828' }}>Rohit S.</span>
          <VerifiedBadge />
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <StarIcon />
          <span style={{ fontSize: 11, color: '#667085', fontWeight: 500 }}>4.8</span>
          <span style={{ fontSize: 11, color: '#D0D5DD', margin: '0 2px' }}>·</span>
          <span style={{ fontSize: 11, color: '#667085' }}>KA-01 MX 2234</span>
        </div>
        {!compact && <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 1 }}>VGU, 3rd year · Honda Activa</p>}
        {compact && <p style={{ fontSize: 11, color: '#98A2B3' }}>Honda Activa</p>}
      </div>
      <button className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: '#ECFDF3', color: '#027A48' }}>
        <PhoneCallIcon />
      </button>
    </div>
  )
}

function OTPCard() {
  return (
    <div className="rounded-[12px] p-4 text-center" style={{ background: '#F9FAFB', border: '1.5px solid #E4E7EC' }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Your OTP</p>
      <div className="flex items-center justify-center gap-2.5">
        {['4','8','2','1'].map((d, i) => (
          <div key={i} className="w-11 h-12 rounded-[8px] flex items-center justify-center"
            style={{ background: 'white', border: '1.5px solid #D0D5DD' }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: '#101828', fontVariantNumeric: 'tabular-nums' }}>{d}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 10, lineHeight: 1.6 }}>Share this OTP with your rider to start</p>
    </div>
  )
}

// ── Customer screen content ──────────────────────────────────────────────────

function IdleContent({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="space-y-3">
      <button className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[10px] text-left transition-all active:scale-[0.99]"
        style={{ background: '#F7F8FA', border: '1.5px solid #E4E7EC', color: '#98A2B3' }} onClick={onSearch}>
        <SearchIcon />
        <span style={{ fontSize: 14, color: '#98A2B3' }}>Where to?</span>
      </button>
      <div className="flex gap-2 flex-wrap">
        {[{ emoji: '🏠', label: 'Home' }, { emoji: '🎓', label: 'College' }].map(c => (
          <button key={c.label}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full"
            style={{ background: '#F2F4F7', border: '1px solid #E4E7EC', fontSize: 13, fontWeight: 500, color: '#344054' }}
            onClick={onSearch}>
            <span style={{ fontSize: 15 }}>{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>
      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="flex items-center gap-2 px-3.5 py-2.5"
          style={{ background: '#F7F8FA', borderBottom: '1px solid #E4E7EC' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Upcoming</span>
        </div>
        <div className="px-3.5 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>Tomorrow, 8:15 AM</p>
              <p style={{ fontSize: 12, color: '#667085', marginTop: 2 }}>Mansarovar → VGU Jaipur</p>
              <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 4 }}>₹40 fuel share · Mon–Fri</p>
            </div>
            <PillStatus status="pending" />
          </div>
        </div>
      </div>
    </div>
  )
}

function SearchingContent({ onSelect, onBack }: { onSelect: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-3 pt-1">
        <button className="w-9 h-9 flex items-center justify-center rounded-full" onClick={onBack}><ArrowLeftIcon /></button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#101828' }}>Plan your ride</span>
      </div>
      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #D0D5DD' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #E4E7EC' }}>
          <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 16 }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#12B76A' }} />
            <div className="w-px h-7" style={{ background: '#E4E7EC' }} />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pickup</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#101828', marginTop: 1 }}>Current location</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#3B5BDB' }} />
          <input autoFocus type="text" placeholder="Where to?" className="flex-1 outline-none"
            style={{ fontSize: 13, color: '#101828', fontFamily: 'Inter, sans-serif' }} />
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {[{ emoji: '🏠', label: 'Home' }, { emoji: '🎓', label: 'College' }].map(c => (
          <button key={c.label}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full"
            style={{ background: '#F2F4F7', border: '1px solid #E4E7EC', fontSize: 13, fontWeight: 500, color: '#344054' }}
            onClick={onSelect}>
            <span style={{ fontSize: 15 }}>{c.emoji}</span>{c.label}
          </button>
        ))}
        <button className="flex items-center gap-2 px-3.5 py-2 rounded-full"
          style={{ background: '#F2F4F7', border: '1px solid #E4E7EC', fontSize: 13, fontWeight: 500, color: '#667085' }}>
          <MapChooseIcon /> Choose on map
        </button>
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Recent</p>
        {[
          { from: 'Mansarovar', to: 'VGU Jaipur', time: '8:15 AM' },
          { from: 'Vaishali Nagar', to: 'MNIT Jaipur', time: '9:00 AM' },
          { from: 'C-Scheme', to: 'JNU Jaipur', time: '8:45 AM' },
        ].map((r, i) => (
          <button key={i}
            className="w-full flex items-center gap-3 py-3 text-left"
            style={{ borderBottom: i < 2 ? '1px solid #F2F4F7' : 'none' }}
            onClick={onSelect}>
            <ClockIcon />
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 500, color: '#101828' }}>{r.from} → {r.to}</p>
              <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 1 }}>Usual: {r.time}</p>
            </div>
            <ChevronRightIcon />
          </button>
        ))}
      </div>
    </div>
  )
}

function TicketFormContent({ days, setDays, repeatWeekly, setRepeatWeekly, womenOnly, setWomenOnly, onRaise, onBack }: {
  days: Record<string, boolean>; setDays: (d: Record<string, boolean>) => void
  repeatWeekly: boolean; setRepeatWeekly: (v: boolean) => void
  womenOnly: boolean; setWomenOnly: (v: boolean) => void
  onRaise: () => void; onBack: () => void
}) {
  const dayDefs = [{ k:'M',l:'M'},{k:'T',l:'T'},{k:'W',l:'W'},{k:'Th',l:'T'},{k:'F',l:'F'},{k:'S',l:'S'}]
  return (
    <div className="space-y-4 pb-6">
      <div className="flex items-center gap-3 pt-1">
        <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100" onClick={onBack}><ArrowLeftIcon /></button>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#101828' }}>Raise a ticket</span>
      </div>
      <div className="rounded-[12px] p-3.5" style={{ background: '#F7F8FA', border: '1.5px solid #E4E7EC' }}>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-0.5 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#12B76A' }} />
            <div className="w-px h-7" style={{ background: '#D0D5DD' }} />
            <MapPinSmIcon color="#3B5BDB" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>Mansarovar Metro</p>
            <p style={{ fontSize: 11, color: '#667085', margin: '4px 0' }}>10.2 km · ~28 min</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>VGU Jaipur</p>
          </div>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Time window</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 py-2.5 rounded-[8px] text-center"
            style={{ background: 'white', border: '1.5px solid #E4E7EC', fontSize: 13, fontWeight: 600, color: '#344054' }}>8:00 AM</div>
          <span style={{ fontSize: 13, color: '#98A2B3' }}>to</span>
          <div className="flex-1 py-2.5 rounded-[8px] text-center"
            style={{ background: '#EDF1FF', border: '1.5px solid #3B5BDB', fontSize: 13, fontWeight: 600, color: '#3B5BDB' }}>8:30 AM</div>
        </div>
      </div>
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Days</p>
        <div className="flex gap-2">
          {dayDefs.map(d => (
            <DayChip key={d.k} label={d.l} selected={!!days[d.k]} onClick={() => setDays({ ...days, [d.k]: !days[d.k] })} />
          ))}
        </div>
      </div>
      <div style={{ borderTop: '1px solid #F2F4F7', paddingTop: 4 }}>
        {[
          { label: 'Repeat weekly', sub: 'Auto-raise this ticket every week', value: repeatWeekly, onChange: setRepeatWeekly },
        ].map(t => (
          <div key={t.label} className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid #F2F4F7' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>{t.label}</p>
              <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 1 }}>{t.sub}</p>
            </div>
            <Toggle value={t.value} onChange={t.onChange} />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3.5 py-3 rounded-[10px]"
        style={{ background: '#F7F8FA', border: '1px solid #E4E7EC' }}>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 13, color: '#667085' }}>Estimated cost per km</span>
          <InfoIcon />
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: '#101828' }}>₹3.9 / km</span>
      </div>
      <button onClick={onRaise}
        className="w-full py-4 rounded-[16px] text-white transition-all active:scale-[0.98]"
        style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>Raise Ticket</button>
    </div>
  )
}

function WaitingContent({ onCancel, onRiderFound }: { onCancel: () => void; onRiderFound: () => void }) {
  return (
    <div className="space-y-3">
      <div className="text-center py-1">
        <p style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>Finding a rider on your route…</p>
        <p style={{ fontSize: 12, color: '#98A2B3', marginTop: 3 }}>We'll notify you when a rider accepts</p>
      </div>
      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="px-3.5 py-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p style={{ fontSize: 12, color: '#667085' }}>Tomorrow, 8:00–8:30 AM</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#101828', marginTop: 2 }}>Mansarovar → VGU Jaipur</p>
              <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 3 }}>₹40 fuel share · Mon–Fri</p>
            </div>
            <PillStatus status="pending" />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-3.5 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ border: '1.5px solid #E4E7EC', fontSize: 13, fontWeight: 600, color: '#667085' }}>
          <XCircleIcon /> Cancel
        </button>
        <button onClick={onRiderFound}
          className="flex-1 py-3.5 rounded-[12px] text-white flex items-center justify-center gap-1.5"
          style={{ background: '#3B5BDB', fontSize: 13, fontWeight: 600 }}>
          Simulate →
        </button>
      </div>
    </div>
  )
}

function RiderAcceptedContent({ onRideDay, onCancel }: { onRideDay: () => void; onCancel: () => void }) {
  return (
    <div className="space-y-3 pb-2">
      <PillStatus status="rider-found" />
      <RiderCard />
      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="flex items-center gap-3 px-3.5 py-3" style={{ borderBottom: '1px solid #F2F4F7' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#ECFDF3' }}>
            <MapPinSmIcon color="#12B76A" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 11, color: '#98A2B3' }}>Pickup point</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>Mansarovar Metro, Gate 2</p>
          </div>
          <div className="text-right">
            <p style={{ fontSize: 11, color: '#98A2B3' }}>Arrive by</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>8:15 AM</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-3.5 py-3">
          <span style={{ fontSize: 13, color: '#667085' }}>Fuel share</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>₹40</span>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 py-3.5 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ border: '1.5px solid #FDA29B', fontSize: 13, fontWeight: 600, color: '#B42318' }}>
          <XCircleIcon /> Cancel
        </button>
        <button onClick={onRideDay}
          className="flex-1 py-3.5 rounded-[12px] text-white flex items-center justify-center gap-1.5"
          style={{ background: '#3B5BDB', fontSize: 13, fontWeight: 600 }}>Ride day →</button>
      </div>
    </div>
  )
}

function RiderArrivingContent({ onStartRide, onSOS }: { onStartRide: () => void; onSOS?: () => void }) {
  return (
    <div className="space-y-3 pb-2">
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: 12, color: '#98A2B3' }}>Your rider</p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#101828', letterSpacing: '-0.5px' }}>Arrives in 4 min</p>
        </div>
        <PillStatus status="on-the-way" />
      </div>
      <RiderCard compact />
      <div className="flex gap-2">
        <button onClick={onSOS} className="flex-1 py-3.5 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ background: '#FEF3F2', border: '1.5px solid #FDA29B', fontSize: 13, fontWeight: 700, color: '#B42318' }}>
          <AlertIcon /> SOS
        </button>
        <button onClick={onStartRide}
          className="flex-[2] flex-1 py-3.5 rounded-[12px] text-white flex items-center justify-center gap-1.5"
          style={{ background: '#3B5BDB', fontSize: 14, fontWeight: 700 }}>
          <ShareIcon /> Start ride
        </button>
      </div>
    </div>
  )
}

function RideInProgressContent({ onEnd, onSOS }: { onEnd: () => void; onSOS: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p style={{ fontSize: 12, color: '#98A2B3' }}>Heading to</p>
          <p style={{ fontSize: 18, fontWeight: 700, color: '#101828', letterSpacing: '-0.4px' }}>VGU Jaipur</p>
          <p style={{ fontSize: 12, color: '#667085', marginTop: 1 }}>8:43 AM arrival · 6.4 km left</p>
        </div>
        <div className="text-right">
          <p style={{ fontSize: 28, fontWeight: 800, color: '#3B5BDB', letterSpacing: '-1px', lineHeight: 1 }}>24</p>
          <p style={{ fontSize: 11, color: '#98A2B3', fontWeight: 500 }}>min</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onSOS} className="flex-1 py-3 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ background: '#FEF3F2', border: '1.5px solid #FDA29B', fontSize: 12, fontWeight: 700, color: '#B42318' }}>
          <AlertIcon /> SOS
        </button>
        <button className="flex-1 py-3 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ background: '#F2F4F7', border: '1.5px solid #E4E7EC', fontSize: 12, fontWeight: 600, color: '#344054' }}>
          <ShareIcon /> Share trip
        </button>
        <button onClick={onEnd}
          className="flex-1 py-3 rounded-[12px] text-white flex items-center justify-center"
          style={{ background: '#12B76A', fontSize: 12, fontWeight: 700 }}>End ride</button>
      </div>
    </div>
  )
}

// ── Chrome ───────────────────────────────────────────────────────────────────

function StatusBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-11 z-30 flex items-center justify-between px-7">
      <span style={{ fontSize: 15, fontWeight: 700, color: '#101828', letterSpacing: '-0.3px' }}>9:41</span>
      <div className="flex items-center gap-1.5">
        <svg width="17" height="12" viewBox="0 0 17 12" fill="#101828">
          <rect x="0" y="6" width="3" height="6" rx="1" /><rect x="4.5" y="4" width="3" height="8" rx="1" />
          <rect x="9" y="2" width="3" height="10" rx="1" /><rect x="13.5" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" stroke="#101828" strokeWidth="1.5" strokeLinecap="round">
          <path d="M1 4a9 9 0 0 1 14 0" /><path d="M3.5 7a5.5 5.5 0 0 1 9 0" />
          <path d="M6 10a2.5 2.5 0 0 1 4 0" /><circle cx="8" cy="12" r="1" fill="#101828" stroke="none" />
        </svg>
        <svg width="25" height="12" viewBox="0 0 25 12" fill="none">
          <rect x="0.5" y="0.5" width="20" height="11" rx="2" stroke="#101828" />
          <path d="M21.5 4v4a2 2 0 0 0 0-4z" fill="#101828" />
          <rect x="2" y="2" width="16" height="8" rx="1" fill="#101828" />
        </svg>
      </div>
    </div>
  )
}

function TopBar({ role, onSwitch, onNotif }: { role: 'customer' | 'rider'; onSwitch: () => void; onNotif?: () => void }) {
  return (
    <div className="absolute top-11 left-0 right-0 flex items-center justify-between px-4 pt-3 pb-2 z-20">
      <button className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
        style={{ boxShadow: '0 2px 8px rgba(16,24,40,0.18)' }}>
        <div className="w-full h-full flex items-center justify-center" style={{ background: '#EDF1FF' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#3451B2', letterSpacing: '0.02em' }}>AS</span>
        </div>
      </button>
      <div className="flex items-center p-1 gap-0.5"
        style={{ background: 'rgba(255,255,255,0.92)', borderRadius: 999, boxShadow: '0 2px 12px rgba(16,24,40,0.14)' }}>
        <button onClick={role === 'rider' ? onSwitch : undefined}
          className="px-4 py-1.5 rounded-full transition-all"
          style={{ background: role === 'customer' ? '#3B5BDB' : 'transparent', fontSize: 13, fontWeight: 700,
            color: role === 'customer' ? 'white' : '#667085' }}>
          Customer
        </button>
        <button onClick={role === 'customer' ? onSwitch : undefined}
          className="px-4 py-1.5 rounded-full transition-all"
          style={{ background: role === 'rider' ? '#3B5BDB' : 'transparent', fontSize: 13, fontWeight: 700,
            color: role === 'rider' ? 'white' : '#667085' }}>
          Rider
        </button>
      </div>
      <button onClick={onNotif} className="w-10 h-10 rounded-full flex items-center justify-center relative flex-shrink-0"
        style={{ background: 'white', boxShadow: '0 2px 8px rgba(16,24,40,0.18)' }}>
        <BellIcon />
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#E5484D', border: '1.5px solid white' }} />
      </button>
    </div>
  )
}

function CustomerBottomNav({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const items = [
    { id: 'home', label: 'Home', icon: (a: boolean) => <HomeNavIcon active={a} /> },
    { id: 'tickets', label: 'My Tickets', icon: (a: boolean) => <TicketNavIcon active={a} /> },
    { id: 'profile', label: 'Profile', icon: (a: boolean) => <UserNavIcon active={a} /> },
  ]
  return (
    <div className="absolute left-0 right-0 flex z-20"
      style={{ bottom: 0, background: 'white', borderTop: '1px solid #F2F4F7', paddingBottom: 24 }}>
      {items.map(item => (
        <button key={item.id} className="flex-1 flex flex-col items-center gap-0.5 py-2.5" onClick={() => setActive(item.id)}>
          {item.icon(active === item.id)}
          <span style={{ fontSize: 10, fontWeight: active === item.id ? 700 : 500, color: active === item.id ? '#3B5BDB' : '#98A2B3' }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}

function RiderBottomNav({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const items = [
    { id: 'home', label: 'Home', icon: (a: boolean) => <HomeNavIcon active={a} />, badge: false },
    { id: 'tickets', label: 'Tickets', icon: (a: boolean) => <TicketNavIcon active={a} />, badge: true },
    { id: 'trips', label: 'Trips', icon: (a: boolean) => <TripNavIcon active={a} />, badge: false },
    { id: 'profile', label: 'Profile', icon: (a: boolean) => <UserNavIcon active={a} />, badge: false },
  ]
  return (
    <div className="absolute left-0 right-0 flex z-20"
      style={{ bottom: 0, background: 'white', borderTop: '1px solid #F2F4F7', paddingBottom: 24 }}>
      {items.map(item => (
        <button key={item.id} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative" onClick={() => setActive(item.id)}>
          {item.icon(active === item.id)}
          {item.badge && (
            <div className="absolute top-2 right-[calc(50%-12px)] w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: '#E5484D', border: '1.5px solid white' }}>
              <span style={{ fontSize: 9, fontWeight: 800, color: 'white' }}>3</span>
            </div>
          )}
          <span style={{ fontSize: 10, fontWeight: active === item.id ? 700 : 500, color: active === item.id ? '#3B5BDB' : '#98A2B3' }}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { user, loading: authLoading, firebaseReady } = useAuth()
  const [appSection, setAppSection] = useState<'onboarding' | 'customer' | 'rider' | 'common'>('onboarding')
  const [onboardingScreen, setOnboardingScreen] = useState<OnboardingScreen>('splash-intro')
  const [commonScreen, setCommonScreen] = useState<CommonScreen>('profile')
  const [prevSection, setPrevSection] = useState<'customer' | 'rider'>('customer')
  const [role, setRole] = useState<'customer' | 'rider'>('customer')
  const [customerScreen, setCustomerScreen] = useState<CustomerScreen>('idle')
  const [riderScreen, setRiderScreen] = useState<RiderScreen>('rider-home-idle')
  const [customerNavTab, setCustomerNavTab] = useState('home')
  const [riderNavTab, setRiderNavTab] = useState('home')
  const [showSOS, setShowSOS] = useState(false)
  const [sosScreen, setSosScreen] = useState<SOSScreen>('sos-confirm')
  const [days, setDays] = useState<Record<string, boolean>>({ M: true, T: true, W: true, Th: true, F: true, S: false })
  const [repeatWeekly, setRepeatWeekly] = useState(false)
  const [womenOnly, setWomenOnly] = useState(false)

  // ── Auth-based routing ─────────────────────────────────────────────────────
  // Restores sessions on load and auto-navigates after sign-in. Prototype mode
  // (no .env) keeps the original manual state-based navigation untouched.
  useEffect(() => {
    if (authLoading || !firebaseReady) return

    if (!user) {
      // Not signed in → onboarding
      setAppSection('onboarding')
      setOnboardingScreen('splash-intro')
      return
    }

    if (!user.roles || user.roles.length === 0) return

    // Signed in with a role → leave onboarding, unless the user is mid-way
    // through the role-selection steps (choose-role → role-confirmed).
    if (
      appSection === 'onboarding' &&
      onboardingScreen !== 'choose-role' &&
      onboardingScreen !== 'role-confirmed'
    ) {
      const primaryRole = user.roles[0] as 'customer' | 'rider'
      setRole(primaryRole)
      setAppSection(primaryRole)
      if (primaryRole === 'rider') setRiderScreen('rider-home-idle')
      else setCustomerScreen('idle')
    }
  }, [authLoading, user, firebaseReady, appSection, onboardingScreen])

  // ── Verification gate (task 1.7) ──────────────────────────────────────────
  // Unverified users can browse but cannot raise tickets. In prototype mode
  // (no Firebase) everything stays unlocked.
  const isVerified = !firebaseReady || user?.verificationStatus === 'verified'
  const handleCustomerSearch = () => {
    if (!isVerified) {
      setAppSection('onboarding')
      setOnboardingScreen(
        user?.verificationStatus === 'rejected' ? 'verify-rejected' : 'verify-pending',
      )
      return
    }
    setCustomerScreen('searching')
  }

  const isOnboarding = appSection === 'onboarding'
  const isCommon = appSection === 'common'

  const goToCommon = (screen: CommonScreen) => {
    if (appSection === 'customer' || appSection === 'rider') setPrevSection(appSection)
    setAppSection('common')
    setCommonScreen(screen)
  }
  const goFromCommon = () => {
    setAppSection(prevSection)
    setRole(prevSection)
    setCustomerNavTab('home')
    setRiderNavTab('home')
  }

  const mapMode: MapMode = role === 'customer'
    ? CUSTOMER_MAP_MODES[customerScreen]
    : RIDER_MAP_MODES[riderScreen]

  const sheetConfig = role === 'customer'
    ? CUSTOMER_SHEET_CONFIG[customerScreen]
    : RIDER_SHEET_CONFIG[riderScreen]

  const hideTopBar = role === 'customer'
    ? customerScreen === 'searching'
    : RIDER_HIDE_TOPBAR.has(riderScreen)

  const showCustomerNav = role === 'customer' && customerScreen === 'idle'
  const showRiderNav = role === 'rider' && RIDER_SHOW_NAV.has(riderScreen)

  const handleRoleSwitch = () => {
    const next = appSection === 'customer' ? 'rider' : 'customer'
    setRole(next)
    setAppSection(next)
  }

  const allCustomerScreens: CustomerScreen[] = ['idle','searching','ticket-form','waiting','rider-accepted','rider-arriving','ride-in-progress']
  const allRiderScreens: RiderScreen[] = [
    'setup-vehicle','setup-documents','setup-promise',
    'verification-pending','verification-verified','verification-rejected',
    'rider-home-idle','rider-home-requests','post-trip',
    'tickets-list','tickets-empty','ticket-detail','ticket-accepted',
    'heading-to-pickup','verify-otp','ride-in-progress-r','ride-summary','rate-co-rider',
  ]

  const dropdownStyle = (active: boolean) => ({
    width: '100%', padding: '7px 10px', borderRadius: 10, fontSize: 12, fontWeight: 600,
    background: active ? '#3B5BDB' : 'rgba(255,255,255,0.07)',
    color: active ? 'white' : 'rgba(255,255,255,0.45)',
    border: active ? '1.5px solid #3B5BDB' : '1.5px solid rgba(255,255,255,0.12)',
    outline: 'none', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
    appearance: 'none' as const, WebkitAppearance: 'none' as const,
  })

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6" style={{ background: '#0d0d1a' }}>
      {/* Phone frame */}
      <div className="relative overflow-hidden flex-shrink-0"
        style={{ width: 390, height: 844, borderRadius: 44, background: '#F7F8FA',
          boxShadow: '0 0 0 11px #1c1c2e, 0 0 0 13px #2e2e42, 0 40px 100px rgba(0,0,0,0.7)' }}>

        {/* Common: full-screen, no map */}
        {isCommon ? (
          <>
            <StatusBar />
            <CommonContent screen={commonScreen} setScreen={setCommonScreen} onGoHome={goFromCommon} />
          </>
        ) : isOnboarding ? (
          <>
            <StatusBar />
            <OnboardingContent
              screen={onboardingScreen}
              setScreen={setOnboardingScreen}
              onComplete={dest => {
                setAppSection(dest)
                setRole(dest)
                if (dest === 'rider') setRiderScreen('setup-vehicle')
                else setCustomerScreen('idle')
              }}
            />
          </>
        ) : (
          <>
            <Map mode={mapMode} />
            <StatusBar />
            {!hideTopBar && <TopBar role={role} onSwitch={handleRoleSwitch} onNotif={() => goToCommon('notif-list')} />}

            {/* Sheet */}
            <div className="absolute left-0 right-0 bg-white z-20"
              style={{ height: sheetConfig.height, bottom: sheetConfig.sheetBottom,
                borderRadius: '24px 24px 0 0', boxShadow: '0 -4px 20px rgba(16,24,40,0.12)',
                transition: 'height 0.32s cubic-bezier(0.32,0.72,0,1), bottom 0.32s cubic-bezier(0.32,0.72,0,1)' }}>
              <div className="flex justify-center pt-2.5 pb-1.5 flex-shrink-0">
                <div className="w-10 h-1 rounded-full" style={{ background: '#D0D5DD' }} />
              </div>
              {role === 'customer' ? (
                <div className="px-4 overflow-y-auto" style={{ height: 'calc(100% - 22px)', scrollbarWidth: 'none' }}>
                  {customerScreen === 'idle' && <IdleContent onSearch={handleCustomerSearch} />}
                  {customerScreen === 'searching' && (
                    <SearchingContent onSelect={() => setCustomerScreen('ticket-form')} onBack={() => setCustomerScreen('idle')} />
                  )}
                  {customerScreen === 'ticket-form' && (
                    <TicketFormContent days={days} setDays={setDays}
                      repeatWeekly={repeatWeekly} setRepeatWeekly={setRepeatWeekly}
                      womenOnly={womenOnly} setWomenOnly={setWomenOnly}
                      onRaise={() => setCustomerScreen('waiting')} onBack={() => setCustomerScreen('searching')} />
                  )}
                  {customerScreen === 'waiting' && (
                    <WaitingContent onCancel={() => setCustomerScreen('idle')} onRiderFound={() => setCustomerScreen('rider-accepted')} />
                  )}
                  {customerScreen === 'rider-accepted' && (
                    <RiderAcceptedContent onRideDay={() => setCustomerScreen('rider-arriving')} onCancel={() => setCustomerScreen('idle')} />
                  )}
                  {customerScreen === 'rider-arriving' && (
                    <RiderArrivingContent onStartRide={() => setCustomerScreen('ride-in-progress')}
                      onSOS={() => { setSosScreen('sos-confirm'); setShowSOS(true) }} />
                  )}
                  {customerScreen === 'ride-in-progress' && (
                    <RideInProgressContent onEnd={() => setCustomerScreen('idle')}
                      onSOS={() => { setSosScreen('sos-confirm'); setShowSOS(true) }} />
                  )}
                </div>
              ) : (
                <RiderContent screen={riderScreen} setScreen={setRiderScreen}
                  onSOS={() => { setSosScreen('sos-confirm'); setShowSOS(true) }} />
              )}
            </div>

            {showCustomerNav && (
              <CustomerBottomNav active={customerNavTab} setActive={tab => {
                if (tab === 'profile') goToCommon('profile')
                else if (tab === 'tickets') goToCommon('ride-history')
                else if (tab === 'home') { setCustomerNavTab('home'); setCustomerScreen('idle') }
                else setCustomerNavTab(tab)
              }} />
            )}
            {showRiderNav && (
              <RiderBottomNav active={riderNavTab} setActive={tab => {
                if (tab === 'profile') goToCommon('profile')
                else if (tab === 'tickets') { setRiderNavTab('tickets'); setRiderScreen('tickets-list') }
                else if (tab === 'home') { setRiderNavTab('home'); setRiderScreen('rider-home-idle') }
                else if (tab === 'trips') goToCommon('ride-history')
                else setRiderNavTab(tab)
              }} />
            )}
          </>
        )}

        {/* SOS overlay */}
        {showSOS && (
          <SOSContent
            screen={sosScreen}
            setScreen={setSosScreen}
            onDismiss={() => setShowSOS(false)}
          />
        )}

        {/* Home indicator */}
        <div className="absolute left-1/2 -translate-x-1/2 z-30 rounded-full"
          style={{ bottom: 8, width: 130, height: 4, background: 'rgba(16,24,40,0.22)' }} />
      </div>

      {/* Demo screen picker — 4 dropdowns */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center" style={{ maxWidth: 520, width: '100%' }}>
        {[
          { label: 'Onboarding', active: isOnboarding, screens: ALL_ONBOARDING_SCREENS,
            value: isOnboarding ? onboardingScreen : '',
            onChange: (s: string) => { setAppSection('onboarding'); setOnboardingScreen(s as OnboardingScreen) } },
          { label: 'Customer', active: appSection === 'customer', screens: allCustomerScreens,
            value: appSection === 'customer' ? customerScreen : '',
            onChange: (s: string) => { setAppSection('customer'); setRole('customer'); setCustomerScreen(s as CustomerScreen) } },
          { label: 'Rider', active: appSection === 'rider', screens: allRiderScreens,
            value: appSection === 'rider' ? riderScreen : '',
            onChange: (s: string) => { setAppSection('rider'); setRole('rider'); setRiderScreen(s as RiderScreen) } },
          { label: 'Common', active: isCommon, screens: ALL_COMMON_SCREENS,
            value: isCommon ? commonScreen : '',
            onChange: (s: string) => { goToCommon(s as CommonScreen) } },
          { label: 'SOS', active: showSOS,
            screens: ['sos-confirm','sos-holding','sos-active','sos-calling','sos-shared','sos-cancel-confirm','sos-ended'] as SOSScreen[],
            value: showSOS ? sosScreen : '',
            onChange: (s: string) => { setAppSection('customer'); setRole('customer'); setCustomerScreen('ride-in-progress'); setSosScreen(s as SOSScreen); setShowSOS(true) } },
        ].map(d => (
          <div key={d.label} className="flex flex-col gap-1" style={{ minWidth: 110, flex: 1 }}>
            <label style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingLeft: 2 }}>
              {d.label}
            </label>
            <select value={d.value} onChange={e => d.onChange(e.target.value)} style={dropdownStyle(d.active)}>
              {(d.screens as string[]).map(s => (
                <option key={s} value={s} style={{ background: '#1c1c2e', color: 'white' }}>{s}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}
