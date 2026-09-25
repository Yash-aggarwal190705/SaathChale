import { useState, useEffect } from 'react'
import { subscribeToOpenTickets, updateTicketStatus, type Ticket } from './lib/ticketService'

export type RiderScreen =
  | 'setup-vehicle' | 'setup-documents' | 'setup-promise'
  | 'verification-pending' | 'verification-verified' | 'verification-rejected'
  | 'rider-home-idle' | 'rider-home-requests' | 'post-trip'
  | 'tickets-list' | 'tickets-empty' | 'ticket-detail' | 'ticket-accepted'
  | 'heading-to-pickup' | 'verify-otp' | 'ride-in-progress-r' | 'ride-summary' | 'rate-co-rider'

export const RIDER_SHEET_CONFIG: Record<RiderScreen, { height: number; sheetBottom: number }> = {
  'setup-vehicle':          { height: 760, sheetBottom: 0 },
  'setup-documents':        { height: 760, sheetBottom: 0 },
  'setup-promise':          { height: 720, sheetBottom: 0 },
  'verification-pending':   { height: 700, sheetBottom: 0 },
  'verification-verified':  { height: 620, sheetBottom: 0 },
  'verification-rejected':  { height: 700, sheetBottom: 0 },
  'rider-home-idle':        { height: 310, sheetBottom: 74 },
  'rider-home-requests':    { height: 500, sheetBottom: 74 },
  'post-trip':              { height: 790, sheetBottom: 0 },
  'tickets-list':           { height: 720, sheetBottom: 74 },
  'tickets-empty':          { height: 500, sheetBottom: 74 },
  'ticket-detail':          { height: 510, sheetBottom: 0 },
  'ticket-accepted':        { height: 278, sheetBottom: 0 },
  'heading-to-pickup':      { height: 500, sheetBottom: 0 },
  'verify-otp':             { height: 790, sheetBottom: 0 },
  'ride-in-progress-r':     { height: 222, sheetBottom: 0 },
  'ride-summary':           { height: 790, sheetBottom: 0 },
  'rate-co-rider':          { height: 560, sheetBottom: 0 },
}

export const RIDER_HIDE_TOPBAR = new Set<RiderScreen>([
  'setup-vehicle', 'setup-documents', 'setup-promise',
  'verification-pending', 'verification-verified', 'verification-rejected',
  'post-trip', 'verify-otp', 'ride-summary',
])

export const RIDER_SHOW_NAV = new Set<RiderScreen>([
  'rider-home-idle', 'rider-home-requests', 'tickets-list', 'tickets-empty',
])

// ── Icons ───────────────────────────────────────────────────────────────────

const ArrowLeftIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#101828" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 19-7-7 7-7M5 12h14" />
  </svg>
)
const CheckIcon = ({ color = '#12B76A' }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)
const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const MinusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)
const UploadIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)
const CheckCircleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
)
const AlertCircleIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#E5484D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)
const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill={filled ? '#F79009' : 'none'} stroke={filled ? '#F79009' : '#D0D5DD'} strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const SmallStarIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#F79009" stroke="#F79009" strokeWidth="1">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)
const ShieldCheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
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
const AlertTriangleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
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
const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D0D5DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
)
const BackspaceIcon = () => (
  <svg width="22" height="18" viewBox="0 0 24 18" fill="none" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 3H7L0 9l7 6h15a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
    <line x1="17" y1="6" x2="11" y2="12" /><line x1="11" y1="6" x2="17" y2="12" />
  </svg>
)
const MapPinSmIcon = ({ color = '#667085' }: { color?: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
  </svg>
)

// ── Primitives ───────────────────────────────────────────────────────────────

function Stepper({ current, total = 3 }: { current: number; total?: number }) {
  const steps = ['Vehicle', 'Documents', 'Promise']
  return (
    <div className="flex items-center gap-2 mb-1">
      {steps.map((label, i) => {
        const idx = i + 1
        const done = idx < current
        const active = idx === current
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: done ? '#12B76A' : active ? '#3B5BDB' : '#F2F4F7',
                  border: done ? 'none' : active ? 'none' : '1.5px solid #E4E7EC',
                }}
              >
                {done
                  ? <CheckIcon color="white" />
                  : <span style={{ fontSize: 11, fontWeight: 700, color: active ? 'white' : '#98A2B3' }}>{idx}</span>}
              </div>
              <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? '#101828' : done ? '#667085' : '#98A2B3' }}>
                {label}
              </span>
            </div>
            {i < total - 1 && (
              <div className="flex-1 h-px" style={{ width: 24, background: done ? '#12B76A' : '#E4E7EC', flexShrink: 0 }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function VehicleButton({ type, label, selected, onClick }: { type: string; label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-2 py-4 rounded-[12px] transition-all"
      style={{
        border: selected ? '2px solid #3B5BDB' : '1.5px solid #E4E7EC',
        background: selected ? '#EDF1FF' : 'white',
      }}
    >
      <span style={{ fontSize: 28 }}>{type === 'bike' ? '🏍️' : '🛵'}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: selected ? '#3B5BDB' : '#344054' }}>{label}</span>
    </button>
  )
}

function UploadField({ label, state }: { label: string; state: 'empty' | 'uploaded' | 'error' }) {
  return (
    <div className="rounded-[10px] overflow-hidden" style={{ border: `1.5px solid ${state === 'error' ? '#FDA29B' : state === 'uploaded' ? '#6CE9A6' : '#E4E7EC'}` }}>
      {state === 'uploaded' ? (
        <div className="flex items-center gap-3 px-3.5 py-3">
          <div className="w-10 h-10 rounded-[8px] flex items-center justify-center" style={{ background: '#ECFDF3' }}>
            <CheckCircleIcon size={20} />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>{label}</p>
            <p style={{ fontSize: 11, color: '#12B76A', marginTop: 1 }}>Uploaded · DL_front.jpg</p>
          </div>
          <span style={{ fontSize: 11, color: '#667085' }}>Change</span>
        </div>
      ) : state === 'error' ? (
        <div className="flex items-center gap-3 px-3.5 py-3">
          <div className="w-10 h-10 rounded-[8px] flex items-center justify-center" style={{ background: '#FEF3F2' }}>
            <AlertCircleIcon size={20} />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#B42318' }}>{label}</p>
            <p style={{ fontSize: 11, color: '#F04438', marginTop: 1 }}>Upload failed · Retry</p>
          </div>
        </div>
      ) : (
        <button className="w-full flex flex-col items-center gap-2 py-5"
          style={{ background: '#FAFAFA' }}>
          <UploadIcon />
          <div className="text-center">
            <p style={{ fontSize: 13, fontWeight: 600, color: '#344054' }}>{label}</p>
            <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 1 }}>Tap to upload · JPG or PDF</p>
          </div>
        </button>
      )}
    </div>
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

function SeatCounter({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(Math.max(1, value - 1))}
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: '#F2F4F7', border: '1px solid #E4E7EC', color: value <= 1 ? '#D0D5DD' : '#344054' }}
        disabled={value <= 1}>
        <MinusIcon />
      </button>
      <span style={{ fontSize: 20, fontWeight: 700, color: '#101828', minWidth: 20, textAlign: 'center' }}>{value}</span>
      <button onClick={() => onChange(Math.min(2, value + 1))}
        className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: '#F2F4F7', border: '1px solid #E4E7EC', color: value >= 2 ? '#D0D5DD' : '#344054' }}
        disabled={value >= 2}>
        <PlusIcon />
      </button>
    </div>
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

function CustomerSummaryCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-[12px]" style={{ border: '1.5px solid #E4E7EC' }}>
      <div className="rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ width: compact ? 40 : 48, height: compact ? 40 : 48, background: '#FFF4ED' }}>
        <span style={{ fontSize: compact ? 14 : 17, fontWeight: 700, color: '#B93815' }}>AM</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{ fontSize: compact ? 13 : 14, fontWeight: 700, color: '#101828' }}>Arjun M.</span>
          <VerifiedBadge />
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <SmallStarIcon />
          <span style={{ fontSize: 11, color: '#667085', fontWeight: 500 }}>4.6</span>
          <span style={{ fontSize: 11, color: '#D0D5DD', margin: '0 2px' }}>·</span>
          <span style={{ fontSize: 11, color: '#667085' }}>12 rides</span>
        </div>
        {!compact && <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 1 }}>CS, 2nd year · VGU Jaipur</p>}
      </div>
    </div>
  )
}

function TicketRequestCard({ onAccept, onDecline, onView, detour = '0.6 km', ticket }:
  { onAccept?: () => void; onDecline?: () => void; onView?: () => void; detour?: string; ticket?: Ticket }) {
  const initials = ticket ? ticket.customerName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'AM'
  const name = ticket ? ticket.customerName : 'Arjun M.'
  const route = ticket ? `${ticket.pickupLabel} → ${ticket.dropLabel}` : 'VGU Metro → Mansarovar'
  const time = ticket ? `${ticket.timeWindowStart}–${ticket.timeWindowEnd}` : '5:30–6:00 PM'
  const cost = ticket ? `₹${ticket.fuelShare} fuel share` : '₹40 fuel share'
  return (
    <div
      className="w-full text-left rounded-[12px] overflow-hidden transition-all"
      style={{ border: '1.5px solid #E4E7EC', cursor: 'pointer' }}
      onClick={onView}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onView?.()}
    >
      <div className="px-3.5 pt-3 pb-2.5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: '#FFF4ED' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#B93815' }}>{initials}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>{name}</span>
              <VerifiedBadge />
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full"
                style={{ background: '#FFF8ED', border: '1px solid #FEDF89', fontSize: 10, fontWeight: 600, color: '#B54708' }}>
                +{detour} detour
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#667085', marginTop: 2 }}>
              {route} · {time}
            </p>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#101828', marginTop: 2 }}>{cost}</p>
          </div>
          <ChevronRightIcon />
        </div>
      </div>
      {(onAccept || onDecline) && (
        <div className="flex border-t border-[#F2F4F7]" onClick={e => e.stopPropagation()}>
          <button onClick={onDecline}
            className="flex-1 py-2.5 text-center"
            style={{ fontSize: 13, fontWeight: 600, color: '#667085', borderRight: '1px solid #F2F4F7' }}>
            Decline
          </button>
          <button onClick={onAccept}
            className="flex-1 py-2.5 text-center"
            style={{ fontSize: 13, fontWeight: 700, color: '#3B5BDB' }}>
            Accept
          </button>
        </div>
      )}
    </div>
  )
}

function ChecklistItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center gap-3 py-2.5 text-left"
      style={{ borderBottom: '1px solid #F2F4F7' }}
    >
      <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
        style={{ background: checked ? '#12B76A' : '#F2F4F7', border: checked ? 'none' : '1.5px solid #E4E7EC' }}>
        {checked && <CheckIcon color="white" />}
      </div>
      <span style={{ fontSize: 14, fontWeight: 500, color: checked ? '#667085' : '#101828',
        textDecoration: checked ? 'line-through' : 'none' }}>
        {label}
      </span>
    </button>
  )
}

function NumericKeypad({ onPress }: { onPress: (key: string) => void }) {
  const keys = ['1','2','3','4','5','6','7','8','9','','0','⌫']
  return (
    <div className="grid grid-cols-3 gap-2">
      {keys.map((key, i) => (
        <button key={i}
          disabled={key === ''}
          onClick={() => key && onPress(key)}
          className="h-14 rounded-[12px] flex items-center justify-center transition-all active:scale-95"
          style={{ background: key === '' ? 'transparent' : key === '⌫' ? '#F2F4F7' : '#F7F8FA',
            fontSize: 22, fontWeight: 600, color: '#101828' }}>
          {key === '⌫' ? <BackspaceIcon /> : key}
        </button>
      ))}
    </div>
  )
}

function SlideToEndButton({ onEnd }: { onEnd: () => void }) {
  const [sliding, setSliding] = useState(false)
  const handleClick = () => {
    setSliding(true)
    setTimeout(() => { setSliding(false); onEnd() }, 700)
  }
  return (
    <div className="relative h-14 rounded-full overflow-hidden" style={{ background: '#12B76A' }}>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.75)', transition: 'opacity 0.3s',
          opacity: sliding ? 0 : 1 }}>
          Slide to end ride →
        </span>
      </div>
      <button
        onClick={handleClick}
        className="absolute top-1 left-1 w-12 h-12 rounded-full bg-white flex items-center justify-center"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'transform 0.65s cubic-bezier(0.4,0,0.2,1)',
          transform: sliding ? 'translateX(286px)' : 'translateX(0)' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>
  )
}

function EmptyStateIllustration({ message, sub }: { message: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#F2F4F7' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D0D5DD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 15s1.5-2 4-2 4 2 4 2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>
      <div className="text-center">
        <p style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>{message}</p>
        <p style={{ fontSize: 13, color: '#98A2B3', marginTop: 4, lineHeight: 1.6 }}>{sub}</p>
      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="px-3.5 py-2 rounded-full transition-all"
      style={{ background: active ? '#3B5BDB' : '#F2F4F7', color: active ? 'white' : '#667085',
        fontSize: 13, fontWeight: active ? 700 : 500, border: active ? 'none' : '1px solid #E4E7EC' }}>
      {label}
    </button>
  )
}

// ── Screen content ───────────────────────────────────────────────────────────

function A1Content({ vehicleType, setVehicleType, model, setModel, regNum, setRegNum,
  hasHelmet, setHasHelmet, onNext }: {
  vehicleType: 'bike' | 'scooter'; setVehicleType: (v: 'bike' | 'scooter') => void
  model: string; setModel: (s: string) => void
  regNum: string; setRegNum: (s: string) => void
  hasHelmet: boolean; setHasHelmet: (v: boolean) => void
  onNext: () => void
}) {
  return (
    <div className="space-y-4 pb-6 pt-2">
      <Stepper current={1} />
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Your vehicle</h2>
        <p style={{ fontSize: 13, color: '#667085', marginTop: 3 }}>This helps customers know what to look out for</p>
      </div>

      <div className="flex gap-3">
        <VehicleButton type="bike" label="Bike" selected={vehicleType === 'bike'} onClick={() => setVehicleType('bike')} />
        <VehicleButton type="scooter" label="Scooter" selected={vehicleType === 'scooter'} onClick={() => setVehicleType('scooter')} />
      </div>

      <div className="space-y-3">
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Make &amp; model
          </label>
          <input
            value={model}
            onChange={e => setModel(e.target.value)}
            placeholder="e.g. Honda Activa 6G"
            className="mt-1.5 w-full px-3.5 py-3 rounded-[8px] outline-none"
            style={{ border: '1.5px solid #E4E7EC', fontSize: 13, color: '#101828', fontFamily: 'Inter, sans-serif', background: '#FAFAFA' }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Registration number
          </label>
          <input
            value={regNum}
            onChange={e => setRegNum(e.target.value.toUpperCase())}
            placeholder="e.g. KA-01 MX 2234"
            className="mt-1.5 w-full px-3.5 py-3 rounded-[8px] outline-none"
            style={{ border: '1.5px solid #E4E7EC', fontSize: 13, color: '#101828', fontFamily: 'Inter, sans-serif',
              letterSpacing: '0.06em', fontWeight: 600, background: '#FAFAFA' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid #F2F4F7' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>Extra helmet available</p>
          <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 1 }}>Customers appreciate this</p>
        </div>
        <Toggle value={hasHelmet} onChange={setHasHelmet} />
      </div>

      <button onClick={onNext}
        className="w-full py-4 rounded-[16px] text-white transition-all active:scale-[0.98]"
        style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>
        Continue
      </button>
    </div>
  )
}

function A2Content({ onNext, onBack }: { onNext: () => void; onBack: () => void }) {
  return (
    <div className="space-y-4 pb-6 pt-2">
      <Stepper current={2} />
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Your documents</h2>
        <p style={{ fontSize: 13, color: '#667085', marginTop: 3 }}>Only used for identity verification</p>
      </div>

      <UploadField label="Driving license (front)" state="uploaded" />
      <UploadField label="Driving license (back)" state="empty" />
      <UploadField label="Registration certificate" state="empty" />

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-[8px]" style={{ background: '#F7F8FA', border: '1px solid #E4E7EC' }}>
        <InfoIcon />
        <p style={{ fontSize: 12, color: '#667085', lineHeight: 1.6 }}>
          Your documents are encrypted and only reviewed by our verification team. They are never shared with customers.
        </p>
      </div>

      <div className="flex gap-2">
        <button onClick={onBack}
          className="flex-none w-11 h-14 rounded-[12px] flex items-center justify-center"
          style={{ border: '1.5px solid #E4E7EC' }}>
          <ArrowLeftIcon />
        </button>
        <button onClick={onNext}
          className="flex-1 py-4 rounded-[12px] text-white"
          style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>
          Continue
        </button>
      </div>
    </div>
  )
}

function A3Content({ agreed, setAgreed, onSubmit, onBack }: {
  agreed: boolean; setAgreed: (v: boolean) => void; onSubmit: () => void; onBack: () => void
}) {
  const rules = [
    { icon: '₹', title: 'Share only fuel cost', sub: 'No extra charges. Your passengers pay their fair share of petrol costs only.' },
    { icon: '⛑️', title: 'Follow traffic rules', sub: 'Always wear a helmet. Ride safely and responsibly on every trip.' },
    { icon: '🤝', title: 'Respect your co-rider', sub: "Stay on route. Never share a passenger's contact or location." },
  ]
  return (
    <div className="space-y-4 pb-6 pt-2">
      <Stepper current={3} />
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Community promise</h2>
        <p style={{ fontSize: 13, color: '#667085', marginTop: 3 }}>SaathChalo only works when we look out for each other</p>
      </div>

      <div className="space-y-2.5">
        {rules.map((r, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5 rounded-[12px]" style={{ background: '#F7F8FA', border: '1px solid #E4E7EC' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{r.icon}</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>{r.title}</p>
              <p style={{ fontSize: 12, color: '#667085', marginTop: 2, lineHeight: 1.5 }}>{r.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setAgreed(!agreed)}
        className="w-full flex items-start gap-3 p-3.5 rounded-[10px] text-left"
        style={{ border: `1.5px solid ${agreed ? '#3B5BDB' : '#E4E7EC'}`, background: agreed ? '#EDF1FF' : 'white' }}>
        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: agreed ? '#3B5BDB' : 'white', border: agreed ? 'none' : '1.5px solid #D0D5DD' }}>
          {agreed && <CheckIcon color="white" />}
        </div>
        <p style={{ fontSize: 13, color: agreed ? '#3B5BDB' : '#344054', fontWeight: agreed ? 600 : 400, lineHeight: 1.5 }}>
          I agree to the community promise and will uphold these standards on every ride
        </p>
      </button>

      <div className="flex gap-2">
        <button onClick={onBack} className="flex-none w-11 h-14 rounded-[12px] flex items-center justify-center"
          style={{ border: '1.5px solid #E4E7EC' }}>
          <ArrowLeftIcon />
        </button>
        <button onClick={onSubmit} disabled={!agreed}
          className="flex-1 py-4 rounded-[12px] text-white transition-all"
          style={{ background: agreed ? '#3B5BDB' : '#E4E7EC', fontSize: 15, fontWeight: 700, color: agreed ? 'white' : '#98A2B3' }}>
          Submit for verification
        </button>
      </div>
    </div>
  )
}

function A4Content({ variant, setScreen }: {
  variant: 'pending' | 'verified' | 'rejected'; setScreen: (s: RiderScreen) => void
}) {
  if (variant === 'verified') return (
    <div className="flex flex-col items-center text-center gap-4 py-8">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#ECFDF3' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 22, fontWeight: 800, color: '#101828', letterSpacing: '-0.5px' }}>You're verified! 🎉</p>
        <p style={{ fontSize: 14, color: '#667085', marginTop: 6, lineHeight: 1.6 }}>Your profile has been approved. You can now start sharing your commute.</p>
      </div>
      <button onClick={() => setScreen('rider-home-idle')}
        className="w-full py-4 rounded-[16px] text-white"
        style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>
        Go to Home
      </button>
    </div>
  )

  if (variant === 'rejected') return (
    <div className="space-y-4 py-4">
      <div className="flex flex-col items-center text-center gap-3 py-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#FEF3F2' }}>
          <AlertCircleIcon size={32} />
        </div>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#101828' }}>Verification failed</p>
          <p style={{ fontSize: 13, color: '#667085', marginTop: 4, lineHeight: 1.6 }}>Please fix the issues below and resubmit</p>
        </div>
      </div>
      <div className="rounded-[10px] p-3.5 space-y-2" style={{ background: '#FEF3F2', border: '1px solid #FDA29B' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#B42318', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Reason</p>
        <p style={{ fontSize: 13, color: '#B42318', lineHeight: 1.6 }}>Driving license image is blurry. Please upload a clear, well-lit photo of the front side.</p>
      </div>
      <button onClick={() => setScreen('setup-documents')}
        className="w-full py-4 rounded-[16px] text-white"
        style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>
        Fix and resubmit
      </button>
    </div>
  )

  return (
    <div className="flex flex-col items-center text-center gap-5 py-8">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#EDF1FF' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <div>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Under review</p>
        <p style={{ fontSize: 14, color: '#667085', marginTop: 6, lineHeight: 1.7 }}>
          We're checking your documents.<br />This usually takes within 24 hours.
        </p>
      </div>
      <div className="w-full p-3.5 rounded-[10px] text-left" style={{ background: '#F7F8FA', border: '1px solid #E4E7EC' }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Submitted</p>
        {['Driving license (front)', 'Registration certificate'].map(d => (
          <div key={d} className="flex items-center gap-2 py-1.5">
            <CheckCircleIcon size={16} />
            <span style={{ fontSize: 13, color: '#344054' }}>{d}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12, color: '#98A2B3' }}>We'll notify you as soon as review is complete</p>
      {/* Demo buttons */}
      <div className="flex gap-2 w-full">
        <button onClick={() => setScreen('verification-verified')}
          className="flex-1 py-3 rounded-[10px]"
          style={{ background: '#ECFDF3', border: '1px solid #6CE9A6', fontSize: 12, fontWeight: 600, color: '#027A48' }}>
          Simulate: Verified
        </button>
        <button onClick={() => setScreen('verification-rejected')}
          className="flex-1 py-3 rounded-[10px]"
          style={{ background: '#FEF3F2', border: '1px solid #FDA29B', fontSize: 12, fontWeight: 600, color: '#B42318' }}>
          Simulate: Rejected
        </button>
      </div>
    </div>
  )
}

function A5Content({ available, setAvailable, setScreen }: {
  available: boolean; setAvailable: (v: boolean) => void; setScreen: (s: RiderScreen) => void
}) {
  return (
    <div className="space-y-3">
      {/* Availability toggle */}
      <div className="flex items-center justify-between px-4 py-3.5 rounded-[12px]"
        style={{ background: available ? '#ECFDF3' : '#F7F8FA', border: `1.5px solid ${available ? '#6CE9A6' : '#E4E7EC'}` }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>Available today</p>
          <p style={{ fontSize: 12, color: '#667085', marginTop: 1 }}>
            {available ? 'Customers can match with you' : 'Not visible to customers'}
          </p>
        </div>
        <Toggle value={available} onChange={setAvailable} />
      </div>

      {/* Today's trip */}
      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="flex items-center justify-between px-3.5 py-2.5"
          style={{ background: '#F7F8FA', borderBottom: '1px solid #E4E7EC' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Today's trip
          </span>
          <button style={{ fontSize: 12, fontWeight: 600, color: '#3B5BDB' }}>Edit</button>
        </div>
        <div className="px-3.5 py-3">
          <p style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>Today, 5:30 PM</p>
          <p style={{ fontSize: 12, color: '#667085', marginTop: 1 }}>VGU Jaipur → Mansarovar · 1 seat</p>
        </div>
      </div>

      {/* Fuel coverage */}
      <div className="rounded-[12px] px-3.5 py-3" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 12, fontWeight: 700, color: '#101828' }}>Fuel cost covered this week</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3B5BDB' }}>₹240</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E4E7EC' }}>
          <div className="h-full rounded-full" style={{ width: '80%', background: '#3B5BDB' }} />
        </div>
        <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 4 }}>of ~₹300 estimated weekly fuel cost</p>
      </div>

      <button onClick={() => setScreen('post-trip')}
        className="w-full py-3.5 rounded-[12px] transition-all"
        style={{ border: '1.5px solid #3B5BDB', background: '#EDF1FF', fontSize: 14, fontWeight: 700, color: '#3B5BDB' }}>
        + Post a trip
      </button>
    </div>
  )
}

function A6Content({ available, setAvailable, setScreen }: {
  available: boolean; setAvailable: (v: boolean) => void; setScreen: (s: RiderScreen) => void
}) {
  return (
    <div className="space-y-3">
      {/* Requests banner */}
      <div className="flex items-center gap-3 px-3.5 py-3 rounded-[12px]"
        style={{ background: '#EDF1FF', border: '1.5px solid #BAC8FF' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#3B5BDB' }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>3</span>
        </div>
        <div className="flex-1">
          <p style={{ fontSize: 13, fontWeight: 700, color: '#3B5BDB' }}>3 new ticket requests</p>
          <p style={{ fontSize: 11, color: '#5C7CFA', marginTop: 1 }}>on your route today</p>
        </div>
        <button onClick={() => setScreen('tickets-list')}
          style={{ fontSize: 13, fontWeight: 700, color: '#3B5BDB' }}>View</button>
      </div>

      <div className="flex items-center justify-between px-4 py-3.5 rounded-[12px]"
        style={{ background: available ? '#ECFDF3' : '#F7F8FA', border: `1.5px solid ${available ? '#6CE9A6' : '#E4E7EC'}` }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>Available today</p>
          <p style={{ fontSize: 12, color: '#667085', marginTop: 1 }}>
            {available ? 'Customers can match with you' : 'Not visible to customers'}
          </p>
        </div>
        <Toggle value={available} onChange={setAvailable} />
      </div>

      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="flex items-center justify-between px-3.5 py-2.5" style={{ background: '#F7F8FA', borderBottom: '1px solid #E4E7EC' }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Today's trip</span>
          <button style={{ fontSize: 12, fontWeight: 600, color: '#3B5BDB' }}>Edit</button>
        </div>
        <div className="px-3.5 py-3">
          <p style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>Today, 5:30 PM</p>
          <p style={{ fontSize: 12, color: '#667085', marginTop: 1 }}>VGU Jaipur → Mansarovar · 1 seat</p>
        </div>
      </div>

      <div className="rounded-[12px] px-3.5 py-3" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 12, fontWeight: 700, color: '#101828' }}>Fuel cost covered this week</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3B5BDB' }}>₹240</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E4E7EC' }}>
          <div className="h-full rounded-full" style={{ width: '80%', background: '#3B5BDB' }} />
        </div>
        <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 4 }}>of ~₹300 estimated weekly fuel cost</p>
      </div>
    </div>
  )
}

function A7Content({ setScreen, seats, setSeats, detour, setDetour, riderWomenOnly, setRiderWomenOnly, postDays, setPostDays }: {
  setScreen: (s: RiderScreen) => void
  seats: number; setSeats: (v: number) => void
  detour: number; setDetour: (v: number) => void
  riderWomenOnly: boolean; setRiderWomenOnly: (v: boolean) => void
  postDays: Record<string, boolean>; setPostDays: (d: Record<string, boolean>) => void
}) {
  const dayDefs = [{ k:'M',l:'M'},{k:'T',l:'T'},{k:'W',l:'W'},{k:'Th',l:'T'},{k:'F',l:'F'},{k:'S',l:'S'}]
  return (
    <div className="space-y-4 pb-6 pt-2">
      <div className="flex items-center gap-3">
        <button onClick={() => setScreen('rider-home-idle')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
          <ArrowLeftIcon />
        </button>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#101828' }}>Post a trip</h2>
      </div>

      {/* From / To */}
      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #D0D5DD' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid #E4E7EC' }}>
          <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 14 }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#12B76A' }} />
            <div className="w-px h-6" style={{ background: '#E4E7EC' }} />
          </div>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828', marginTop: 1 }}>VGU Jaipur</p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#3B5BDB' }} />
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828', marginTop: 1 }}>Mansarovar Metro</p>
          </div>
        </div>
      </div>

      {/* Departure time */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Departure time
        </label>
        <div className="flex mt-2">
          <div className="flex-1 py-2.5 rounded-[8px] text-center"
            style={{ background: '#EDF1FF', border: '1.5px solid #3B5BDB', fontSize: 15, fontWeight: 700, color: '#3B5BDB' }}>
            5:30 PM
          </div>
        </div>
      </div>

      {/* Day chips */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Days
        </label>
        <div className="flex gap-2 mt-2">
          {dayDefs.map(d => (
            <DayChip key={d.k} label={d.l} selected={!!postDays[d.k]}
              onClick={() => setPostDays({ ...postDays, [d.k]: !postDays[d.k] })} />
          ))}
        </div>
      </div>

      {/* Seats */}
      <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid #F2F4F7' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>Seats available</p>
          <p style={{ fontSize: 11, color: '#98A2B3' }}>Max 2 co-riders</p>
        </div>
        <SeatCounter value={seats} onChange={setSeats} />
      </div>

      {/* Detour slider */}
      <div style={{ borderTop: '1px solid #F2F4F7', paddingTop: 12 }}>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 14, fontWeight: 600, color: '#101828' }}>Max detour I can make</p>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#3B5BDB' }}>{detour.toFixed(1)} km</span>
        </div>
        <input type="range" min="0" max="3" step="0.5" value={detour}
          onChange={e => setDetour(parseFloat(e.target.value))}
          className="w-full h-2 rounded-full appearance-none"
          style={{ accentColor: '#3B5BDB' }} />
        <div className="flex justify-between mt-1">
          <span style={{ fontSize: 10, color: '#98A2B3' }}>0 km</span>
          <span style={{ fontSize: 10, color: '#98A2B3' }}>3 km</span>
        </div>
      </div>

      {/* Women only toggle */}
      <div className="flex items-center justify-between py-3" style={{ borderTop: '1px solid #F2F4F7' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#101828' }}>Women co-riders only</p>
          <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 1 }}>Match only with women customers</p>
        </div>
        <Toggle value={riderWomenOnly} onChange={setRiderWomenOnly} />
      </div>

      {/* Fuel estimate */}
      <div className="flex items-center justify-between px-3.5 py-3 rounded-[10px]"
        style={{ background: '#F7F8FA', border: '1px solid #E4E7EC' }}>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 13, color: '#667085' }}>Estimated per rider</span>
          <InfoIcon />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#101828' }}>₹3.9 / km</span>
      </div>

      <button onClick={() => setScreen('rider-home-idle')}
        className="w-full py-4 rounded-[16px] text-white transition-all active:scale-[0.98]"
        style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>
        Post trip
      </button>
    </div>
  )
}

function B1Content({ setScreen, riderUid, riderName }: { setScreen: (s: RiderScreen) => void; riderUid?: string | null; riderName?: string | null }) {
  const [filter, setFilter] = useState('Today')
  const [tickets, setTickets] = useState<Ticket[]>([])

  useEffect(() => {
    const unsub = subscribeToOpenTickets(setTickets)
    return unsub
  }, [])

  const handleAccept = async (ticket: Ticket) => {
    await updateTicketStatus(ticket.id, 'accepted', {
      riderId: riderUid ?? 'demo-rider',
      riderName: riderName ?? 'Demo Rider',
    })
    setScreen('ticket-accepted')
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-3 pt-1">
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#101828' }}>Ticket requests</h2>
        <span style={{ fontSize: 12, color: '#667085' }}>Sort: Least detour</span>
      </div>
      <div className="flex gap-2 mb-4">
        {['Today', 'Tomorrow', 'Recurring'].map(f => (
          <FilterChip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
        ))}
      </div>
      <div className="space-y-3">
        {tickets.length === 0 ? (
          <p style={{ fontSize: 13, color: '#98A2B3', textAlign: 'center', padding: '24px 0' }}>No open tickets right now</p>
        ) : (
          tickets.map(ticket => (
            <TicketRequestCard
              key={ticket.id}
              ticket={ticket}
              detour={`${(Math.random() * 1.5 + 0.3).toFixed(1)} km`}
              onView={() => setScreen('ticket-detail')}
              onAccept={() => handleAccept(ticket)}
              onDecline={() => {}}
            />
          ))
        )}
      </div>
    </div>
  )
}

function B2Content({ setScreen }: { setScreen: (s: RiderScreen) => void }) {
  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-3 pt-1">
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#101828' }}>Ticket requests</h2>
      </div>
      <div className="flex gap-2 mb-4">
        {['Today', 'Tomorrow', 'Recurring'].map(f => (
          <FilterChip key={f} label={f} active={f === 'Today'} onClick={() => {}} />
        ))}
      </div>
      <EmptyStateIllustration
        message="No requests right now"
        sub={"No requests on your route right now.\nWe'll notify you when there's a match."}
      />
      <button onClick={() => setScreen('post-trip')}
        className="w-full py-3.5 rounded-[12px] mt-4"
        style={{ border: '1.5px solid #3B5BDB', background: '#EDF1FF', fontSize: 14, fontWeight: 700, color: '#3B5BDB' }}>
        Post a trip
      </button>
    </div>
  )
}

function B3Content({ setScreen }: { setScreen: (s: RiderScreen) => void }) {
  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center gap-3 pt-1">
        <button onClick={() => setScreen('tickets-list')}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
          <ArrowLeftIcon />
        </button>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#101828' }}>Ticket detail</h2>
      </div>

      <CustomerSummaryCard />

      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="flex items-center gap-3 px-3.5 py-2.5" style={{ borderBottom: '1px solid #F2F4F7' }}>
          <MapPinSmIcon color="#12B76A" />
          <span style={{ fontSize: 13, color: '#344054' }}>VGU Metro Gate 1</span>
          <span className="ml-auto" style={{ fontSize: 13, fontWeight: 700, color: '#101828' }}>5:30–6:00 PM</span>
        </div>
        <div className="flex items-center gap-3 px-3.5 py-2.5" style={{ borderBottom: '1px solid #F2F4F7' }}>
          <MapPinSmIcon color="#3B5BDB" />
          <span style={{ fontSize: 13, color: '#344054' }}>Mansarovar Metro</span>
          <span className="ml-auto" style={{ fontSize: 11, color: '#98A2B3' }}>10.2 km</span>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2.5">
          <span className="px-2 py-0.5 rounded-full" style={{ background: '#FFF8ED', border: '1px solid #FEDF89', fontSize: 11, fontWeight: 600, color: '#B54708' }}>
            +0.6 km detour
          </span>
          <span className="px-2 py-0.5 rounded-full" style={{ background: '#ECFDF3', border: '1px solid #6CE9A6', fontSize: 11, fontWeight: 600, color: '#027A48' }}>
            On your route
          </span>
        </div>
      </div>

      {/* Fuel share breakdown */}
      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="px-3.5 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #F2F4F7' }}>
          <span style={{ fontSize: 12, color: '#667085' }}>10.8 km × ₹3.9</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>₹42</span>
        </div>
        <div className="px-3.5 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid #F2F4F7' }}>
          <span style={{ fontSize: 12, color: '#667085' }}>Platform fee</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>₹3</span>
        </div>
        <div className="px-3.5 py-3 flex items-center justify-between">
          <span style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>Collect from customer</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#3B5BDB' }}>₹45</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setScreen('tickets-list')}
          className="flex-1 py-3.5 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ border: '1.5px solid #FDA29B', fontSize: 13, fontWeight: 600, color: '#B42318' }}>
          <XCircleIcon /> Decline
        </button>
        <button onClick={() => setScreen('ticket-accepted')}
          className="flex-1 py-3.5 rounded-[12px] text-white flex items-center justify-center gap-1.5"
          style={{ background: '#3B5BDB', fontSize: 13, fontWeight: 700 }}>
          Accept
        </button>
      </div>
    </div>
  )
}

function B4Content({ setScreen }: { setScreen: (s: RiderScreen) => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 pt-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: '#ECFDF3', border: '1.5px solid #6CE9A6', fontSize: 13, fontWeight: 700, color: '#027A48' }}>
          <CheckIcon color="#027A48" /> Ticket accepted
        </span>
      </div>

      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
        <div className="flex items-center gap-3 px-3.5 py-3" style={{ borderBottom: '1px solid #F2F4F7' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#ECFDF3' }}>
            <MapPinSmIcon color="#12B76A" />
          </div>
          <div className="flex-1">
            <p style={{ fontSize: 11, color: '#98A2B3' }}>Pickup</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>VGU Metro Gate 1</p>
          </div>
          <div className="text-right">
            <p style={{ fontSize: 11, color: '#98A2B3' }}>By</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>5:30 PM</p>
          </div>
        </div>
        <div className="px-3.5 py-2.5">
          <p style={{ fontSize: 12, color: '#98A2B3' }}>Customer: Arjun M. · ₹45 total</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button className="flex-1 py-3.5 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ background: '#ECFDF3', color: '#027A48', fontSize: 13, fontWeight: 600 }}>
          <PhoneCallIcon /> Call (masked)
        </button>
        <button onClick={() => setScreen('tickets-list')}
          className="flex-1 py-3.5 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ border: '1.5px solid #FDA29B', fontSize: 13, fontWeight: 600, color: '#B42318' }}>
          <XCircleIcon /> Cancel
        </button>
      </div>

      <div className="flex items-start gap-2 px-3 py-2.5 rounded-[8px]"
        style={{ background: '#FFFAEB', border: '1px solid #FEDF89' }}>
        <AlertTriangleIcon />
        <p style={{ fontSize: 12, color: '#B54708', lineHeight: 1.6 }}>
          Cancelling within 30 min of pickup affects your reliability rating
        </p>
      </div>

      <button onClick={() => setScreen('heading-to-pickup')}
        className="w-full py-4 rounded-[16px] text-white"
        style={{ background: '#3B5BDB', fontSize: 14, fontWeight: 700 }}>
        Head to pickup →
      </button>
    </div>
  )
}

function C1Content({ checklist, setChecklist, setScreen }: {
  checklist: Record<string, boolean>; setChecklist: (v: Record<string, boolean>) => void
  setScreen: (s: RiderScreen) => void
}) {
  const items = [
    { key: 'helmet', label: 'Helmet ready (including spare)' },
    { key: 'license', label: 'Driving license with me' },
    { key: 'phone', label: 'Phone charged ≥ 30%' },
  ]
  return (
    <div className="space-y-3 pb-4">
      <div className="flex items-center justify-between pt-1">
        <div>
          <p style={{ fontSize: 13, color: '#98A2B3' }}>Your co-rider</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.5px' }}>Pickup in 6 min</p>
        </div>
        <span className="px-2.5 py-1 rounded-full"
          style={{ background: '#EDF1FF', border: '1.5px solid #BAC8FF', fontSize: 11, fontWeight: 700, color: '#3451B2' }}>
          On the way
        </span>
      </div>

      <CustomerSummaryCard compact />

      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          Pre-ride checklist
        </p>
        {items.map(item => (
          <ChecklistItem key={item.key} label={item.label} checked={!!checklist[item.key]}
            onChange={v => setChecklist({ ...checklist, [item.key]: v })} />
        ))}
      </div>

      <div className="flex gap-2">
        <button className="flex-none w-10 h-12 rounded-[10px] flex items-center justify-center"
          style={{ background: '#FEF3F2', border: '1.5px solid #FDA29B' }}>
          <AlertTriangleIcon />
        </button>
        <button className="flex-none w-10 h-12 rounded-[10px] flex items-center justify-center"
          style={{ background: '#F2F4F7', border: '1.5px solid #E4E7EC' }}>
          <ShareIcon />
        </button>
        <button onClick={() => setScreen('ride-in-progress-r')}
          className="flex-1 h-12 rounded-[12px] text-white"
          style={{ background: '#3B5BDB', fontSize: 14, fontWeight: 700 }}>
          I have reached pickup
        </button>
      </div>
    </div>
  )
}

function C2Content({ otpDigits, setOtpDigits, otpError, setOtpError, setScreen }: {
  otpDigits: string; setOtpDigits: (s: string) => void
  otpError: boolean; setOtpError: (v: boolean) => void
  setScreen: (s: RiderScreen) => void
}) {
  const handleKey = (key: string) => {
    setOtpError(false)
    if (key === '⌫') {
      setOtpDigits(otpDigits.slice(0, -1))
    } else if (otpDigits.length < 4) {
      setOtpDigits(otpDigits + key)
    }
  }
  const handleStart = () => {
    if (otpDigits.length === 4 && otpDigits === '4821') {
      setScreen('ride-in-progress-r')
    } else {
      setOtpError(true)
    }
  }
  return (
    <div className="space-y-5 pb-6 pt-2">
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Verify OTP</h2>
        <p style={{ fontSize: 13, color: '#667085', marginTop: 4 }}>Ask your co-rider for their 4-digit OTP</p>
      </div>

      {/* OTP boxes */}
      <div className="flex items-center justify-center gap-3">
        {[0,1,2,3].map(i => (
          <div key={i} className="w-14 h-16 rounded-[12px] flex items-center justify-center"
            style={{ border: `2px solid ${otpError ? '#F04438' : i < otpDigits.length ? '#3B5BDB' : '#E4E7EC'}`,
              background: otpError ? '#FEF3F2' : i < otpDigits.length ? '#EDF1FF' : 'white' }}>
            <span style={{ fontSize: 28, fontWeight: 800, color: otpError ? '#B42318' : '#101828', fontVariantNumeric: 'tabular-nums' }}>
              {otpDigits[i] || ''}
            </span>
          </div>
        ))}
      </div>

      {otpError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-[8px]"
          style={{ background: '#FEF3F2', border: '1px solid #FDA29B' }}>
          <AlertTriangleIcon />
          <p style={{ fontSize: 12, color: '#B42318', fontWeight: 600 }}>Wrong OTP — ask your co-rider to check again</p>
        </div>
      )}

      <NumericKeypad onPress={handleKey} />

      <button
        onClick={handleStart}
        disabled={otpDigits.length < 4}
        className="w-full py-4 rounded-[16px] text-white transition-all"
        style={{ background: otpDigits.length === 4 ? '#3B5BDB' : '#E4E7EC', fontSize: 15, fontWeight: 700,
          color: otpDigits.length === 4 ? 'white' : '#98A2B3' }}>
        Start ride
      </button>
      <p style={{ fontSize: 11, color: '#98A2B3', textAlign: 'center' }}>
        {otpDigits.length === 4 ? 'Hint: try 4 8 2 1' : `${4 - otpDigits.length} more digit${4 - otpDigits.length !== 1 ? 's' : ''} needed`}
      </p>
    </div>
  )
}

function C3Content({ setScreen, onSOS }: { setScreen: (s: RiderScreen) => void; onSOS?: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pt-1">
        <div>
          <p style={{ fontSize: 12, color: '#98A2B3' }}>Dropping at</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Mansarovar Metro</p>
          <p style={{ fontSize: 12, color: '#667085', marginTop: 1 }}>6:02 PM arrival · 4.3 km left</p>
        </div>
        <div className="text-right">
          <p style={{ fontSize: 28, fontWeight: 800, color: '#3B5BDB', letterSpacing: '-1px', lineHeight: 1 }}>18</p>
          <p style={{ fontSize: 11, color: '#98A2B3', fontWeight: 500 }}>min</p>
        </div>
      </div>
      <SlideToEndButton onEnd={() => setScreen('ride-summary')} />
      <div className="flex gap-2">
        <button onClick={onSOS} className="flex-1 py-3 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ background: '#FEF3F2', border: '1.5px solid #FDA29B', fontSize: 12, fontWeight: 700, color: '#B42318' }}>
          <AlertTriangleIcon /> SOS
        </button>
        <button className="flex-1 py-3 rounded-[12px] flex items-center justify-center gap-1.5"
          style={{ background: '#F2F4F7', border: '1.5px solid #E4E7EC', fontSize: 12, fontWeight: 600, color: '#344054' }}>
          <ShareIcon /> Share trip
        </button>
      </div>
    </div>
  )
}

function C4Content({ setScreen }: { setScreen: (s: RiderScreen) => void }) {
  const [payMode, setPayMode] = useState<'cash' | 'upi'>('cash')
  return (
    <div className="space-y-4 pb-6 pt-2">
      <div className="flex flex-col items-center gap-2 py-4">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#ECFDF3' }}>
          <span style={{ fontSize: 32 }}>🎉</span>
        </div>
        <p style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Ride complete!</p>
        <p style={{ fontSize: 13, color: '#667085' }}>Collect from Arjun M. before they leave</p>
      </div>

      <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
        {[
          { label: 'Distance', value: '10.8 km' },
          { label: 'Fuel share (₹3.9/km)', value: '₹42' },
          { label: 'Platform fee', value: '₹3' },
        ].map((row, i, arr) => (
          <div key={row.label} className="flex items-center justify-between px-3.5 py-3"
            style={{ borderBottom: i < arr.length - 1 ? '1px solid #F2F4F7' : 'none' }}>
            <span style={{ fontSize: 13, color: '#667085' }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>{row.value}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-3.5 py-3"
          style={{ background: '#F7F8FA', borderTop: '2px solid #E4E7EC' }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: '#101828' }}>Collect</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#3B5BDB' }}>₹45</span>
        </div>
      </div>

      {/* Payment mode */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Payment mode
        </label>
        <div className="flex gap-2 mt-2">
          {([['cash', '💵 Cash'], ['upi', '📱 UPI']] as const).map(([mode, label]) => (
            <button key={mode} onClick={() => setPayMode(mode)}
              className="flex-1 py-2.5 rounded-[8px] transition-all"
              style={{ border: `1.5px solid ${payMode === mode ? '#3B5BDB' : '#E4E7EC'}`,
                background: payMode === mode ? '#EDF1FF' : 'white',
                fontSize: 13, fontWeight: payMode === mode ? 700 : 500,
                color: payMode === mode ? '#3B5BDB' : '#344054' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Fuel coverage progress */}
      <div className="rounded-[12px] px-3.5 py-3" style={{ background: '#F7F8FA', border: '1px solid #E4E7EC' }}>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 12, color: '#667085' }}>Fuel cost covered this week</p>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#3B5BDB' }}>₹282</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E4E7EC' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: '94%', background: '#3B5BDB' }} />
        </div>
        <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 4 }}>of ~₹300 weekly estimate · updated after payment</p>
      </div>

      <button onClick={() => setScreen('rate-co-rider')}
        className="w-full py-4 rounded-[16px] text-white transition-all active:scale-[0.98]"
        style={{ background: '#12B76A', fontSize: 15, fontWeight: 700 }}>
        Confirm payment received
      </button>
    </div>
  )
}

function C5Content({ setScreen, stars, setStars, selectedTags, setSelectedTags }: {
  setScreen: (s: RiderScreen) => void
  stars: number; setStars: (n: number) => void
  selectedTags: string[]; setSelectedTags: (tags: string[]) => void
}) {
  const tags = ['On time', 'Friendly', 'Followed rules', 'Ready with OTP']
  const toggleTag = (tag: string) => {
    setSelectedTags(selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag])
  }
  return (
    <div className="space-y-5 pb-6 pt-2">
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#FFF4ED' }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: '#B93815' }}>AM</span>
        </div>
        <div className="text-center">
          <p style={{ fontSize: 18, fontWeight: 800, color: '#101828' }}>Rate Arjun M.</p>
          <p style={{ fontSize: 13, color: '#667085', marginTop: 2 }}>How was your ride together?</p>
        </div>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-2">
        {[1,2,3,4,5].map(n => (
          <button key={n} onClick={() => setStars(n)}>
            <StarIcon filled={n <= stars} />
          </button>
        ))}
      </div>

      {/* Tag chips */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
          What stood out?
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button key={tag} onClick={() => toggleTag(tag)}
              className="px-3 py-1.5 rounded-full transition-all"
              style={{ border: `1.5px solid ${selectedTags.includes(tag) ? '#3B5BDB' : '#E4E7EC'}`,
                background: selectedTags.includes(tag) ? '#EDF1FF' : 'white',
                fontSize: 13, fontWeight: selectedTags.includes(tag) ? 700 : 500,
                color: selectedTags.includes(tag) ? '#3B5BDB' : '#667085' }}>
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <textarea
        placeholder="Add a note (optional)"
        rows={3}
        className="w-full px-3.5 py-3 rounded-[10px] outline-none resize-none"
        style={{ border: '1.5px solid #E4E7EC', fontSize: 13, color: '#101828',
          fontFamily: 'Inter, sans-serif', background: '#FAFAFA' }}
      />

      <button onClick={() => setScreen('rider-home-idle')}
        className="w-full py-4 rounded-[16px] text-white transition-all active:scale-[0.98]"
        style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>
        Submit
      </button>
    </div>
  )
}

// ── RiderContent ─────────────────────────────────────────────────────────────

interface RiderContentProps {
  screen: RiderScreen
  setScreen: (s: RiderScreen) => void
  onSOS?: () => void
  riderUid?: string | null
  riderName?: string | null
}

export default function RiderContent({ screen, setScreen, onSOS, riderUid, riderName }: RiderContentProps) {
  const [vehicleType, setVehicleType] = useState<'bike' | 'scooter'>('bike')
  const [model, setModel] = useState('')
  const [regNum, setRegNum] = useState('')
  const [hasHelmet, setHasHelmet] = useState(false)
  const [agreedToPromise, setAgreedToPromise] = useState(false)
  const [available, setAvailable] = useState(true)
  const [seats, setSeats] = useState(1)
  const [detour, setDetour] = useState(1.5)
  const [riderWomenOnly, setRiderWomenOnly] = useState(false)
  const [postDays, setPostDays] = useState<Record<string, boolean>>({ M: true, T: true, W: true, Th: true, F: true, S: true })
  const [otpDigits, setOtpDigits] = useState('')
  const [otpError, setOtpError] = useState(false)
  const [stars, setStars] = useState(4)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [checklist, setChecklist] = useState<Record<string, boolean>>({ helmet: true, license: true, phone: false })

  return (
    <div className="px-4 overflow-y-auto" style={{ height: 'calc(100% - 22px)', scrollbarWidth: 'none' }}>
      {screen === 'setup-vehicle' && (
        <A1Content vehicleType={vehicleType} setVehicleType={setVehicleType}
          model={model} setModel={setModel} regNum={regNum} setRegNum={setRegNum}
          hasHelmet={hasHelmet} setHasHelmet={setHasHelmet} onNext={() => setScreen('setup-documents')} />
      )}
      {screen === 'setup-documents' && (
        <A2Content onNext={() => setScreen('setup-promise')} onBack={() => setScreen('setup-vehicle')} />
      )}
      {screen === 'setup-promise' && (
        <A3Content agreed={agreedToPromise} setAgreed={setAgreedToPromise}
          onSubmit={() => setScreen('verification-pending')} onBack={() => setScreen('setup-documents')} />
      )}
      {screen === 'verification-pending' && <A4Content variant="pending" setScreen={setScreen} />}
      {screen === 'verification-verified' && <A4Content variant="verified" setScreen={setScreen} />}
      {screen === 'verification-rejected' && <A4Content variant="rejected" setScreen={setScreen} />}
      {screen === 'rider-home-idle' && (
        <A5Content available={available} setAvailable={setAvailable} setScreen={setScreen} />
      )}
      {screen === 'rider-home-requests' && (
        <A6Content available={available} setAvailable={setAvailable} setScreen={setScreen} />
      )}
      {screen === 'post-trip' && (
        <A7Content setScreen={setScreen} seats={seats} setSeats={setSeats}
          detour={detour} setDetour={setDetour} riderWomenOnly={riderWomenOnly} setRiderWomenOnly={setRiderWomenOnly}
          postDays={postDays} setPostDays={setPostDays} />
      )}
      {screen === 'tickets-list' && <B1Content setScreen={setScreen} riderUid={riderUid} riderName={riderName} />}
      {screen === 'tickets-empty' && <B2Content setScreen={setScreen} />}
      {screen === 'ticket-detail' && <B3Content setScreen={setScreen} />}
      {screen === 'ticket-accepted' && <B4Content setScreen={setScreen} />}
      {screen === 'heading-to-pickup' && (
        <C1Content checklist={checklist} setChecklist={setChecklist} setScreen={setScreen} />
      )}
      {screen === 'verify-otp' && (
        <C2Content otpDigits={otpDigits} setOtpDigits={setOtpDigits}
          otpError={otpError} setOtpError={setOtpError} setScreen={setScreen} />
      )}
      {screen === 'ride-in-progress-r' && <C3Content setScreen={setScreen} onSOS={onSOS} />}
      {screen === 'ride-summary' && <C4Content setScreen={setScreen} />}
      {screen === 'rate-co-rider' && (
        <C5Content setScreen={setScreen} stars={stars} setStars={setStars}
          selectedTags={selectedTags} setSelectedTags={setSelectedTags} />
      )}
    </div>
  )
}
