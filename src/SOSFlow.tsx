import { useState, useEffect } from 'react'

export type SOSScreen =
  | 'sos-confirm'
  | 'sos-holding'
  | 'sos-active'
  | 'sos-calling'
  | 'sos-shared'
  | 'sos-cancel-confirm'
  | 'sos-ended'

// ── Icons ────────────────────────────────────────────────────────────────────

const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.87a16 16 0 0 0 6.13 6.13l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
)

const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="2" y1="2" x2="22" y2="22"/>
    <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/>
    <path d="M5 10v2a7 7 0 0 0 12 5"/>
    <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
)

const VolumeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
  </svg>
)

const PhoneOffIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m10.68 13.31-2.37 2.37A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.62 2 2 0 0 1 1.99-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.87"/>
    <path d="M14 11.5 19.07 6.43"/>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07"/>
    <line x1="2" y1="2" x2="22" y2="22"/>
  </svg>
)

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E5484D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)

const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const BuildingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
  </svg>
)

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#12B76A" stroke="none">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
  </svg>
)

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E5484D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)

const XIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ── Shared subcomponents ─────────────────────────────────────────────────────

function SOSActiveBadge({ elapsed }: { elapsed: number }) {
  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const label = mins > 0 ? `${mins}:${String(secs).padStart(2, '0')}` : `0:${String(secs).padStart(2, '0')}`
  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full self-start"
      style={{ background: '#FEF3F2', border: '1.5px solid #FDA29B' }}>
      <div className="w-2 h-2 rounded-full" style={{ background: '#E5484D', animation: 'dotBreathe 1.2s ease-in-out infinite' }} />
      <span style={{ fontSize: 12, fontWeight: 700, color: '#B42318' }}>SOS Active · {label}</span>
    </div>
  )
}

function SOSActionButton({ icon, label, active, onPress }: {
  icon: React.ReactNode; label: string; active?: boolean; onPress?: () => void
}) {
  return (
    <button onClick={onPress}
      className="flex flex-col items-center justify-center gap-2 rounded-[14px] py-4"
      style={{
        background: active ? '#ECFDF3' : '#F7F8FA',
        border: active ? '1.5px solid #A6F4C5' : '1.5px solid #E4E7EC',
        flex: 1,
        minHeight: 90,
      }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: active ? '#D1FAE5' : '#EAECF0' }}>
        <span style={{ color: active ? '#12B76A' : '#344054' }}>{icon}</span>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#027A48' : '#344054', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
    </button>
  )
}

function TimelineLog({ entries }: { entries: { time: string; text: string; done?: boolean }[] }) {
  return (
    <div className="flex flex-col">
      {entries.map((e, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center" style={{ width: 20, flexShrink: 0 }}>
            <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: e.done ? '#ECFDF3' : '#EFF4FF', border: `1.5px solid ${e.done ? '#A6F4C5' : '#C7D7FD'}` }}>
              {e.done ? (
                <svg width="8" height="8" viewBox="0 0 10 10"><polyline points="2 5 4.5 7.5 8 3" stroke="#12B76A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#3B5BDB' }} />
              )}
            </div>
            {i < entries.length - 1 && (
              <div className="flex-1 w-px mt-1" style={{ background: '#E4E7EC', minHeight: 16 }} />
            )}
          </div>
          <div className="pb-3">
            <p style={{ fontSize: 12, fontWeight: 600, color: '#101828', lineHeight: 1.4 }}>{e.text}</p>
            <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 1 }}>{e.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── S1: SOS Trigger — Confirm ─────────────────────────────────────────────────

function S1Confirm({ onHold, onCancel }: { onHold: () => void; onCancel: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 50, borderRadius: 40 }}>
      <div className="flex flex-col items-center px-5 pt-6 pb-8 gap-5"
        style={{ background: 'white', borderRadius: '28px 28px 0 0' }}>
        {/* Header */}
        <div className="w-10 h-1 rounded-full" style={{ background: '#E4E7EC' }} />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#FEF3F2' }}>
            <ShieldIcon />
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Emergency SOS</p>
          <p style={{ fontSize: 13, color: '#667085', maxWidth: 280, lineHeight: 1.5 }}>
            Hold the button to alert your emergency contact and share your live location
          </p>
        </div>

        {/* Hold-to-confirm button */}
        <button onMouseDown={onHold} onTouchStart={onHold}
          className="flex flex-col items-center justify-center gap-2 rounded-full"
          style={{ width: 140, height: 140, background: '#FEF3F2', border: '4px solid #E5484D', flexShrink: 0, cursor: 'pointer' }}>
          {/* Ring: empty state */}
          <svg width="132" height="132" style={{ position: 'absolute', transform: 'rotate(-90deg)' }} viewBox="0 0 132 132">
            <circle cx="66" cy="66" r="58" fill="none" stroke="#FDA29B" strokeWidth="4" strokeDasharray="364" strokeDashoffset="364" />
          </svg>
          <span style={{ fontSize: 32 }}>🆘</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#B42318', position: 'relative' }}>Hold to activate</span>
        </button>

        {/* Cancel */}
        <button onClick={onCancel}
          className="w-full py-3.5 rounded-[14px] flex items-center justify-center gap-2"
          style={{ border: '1.5px solid #E4E7EC', background: 'white' }}>
          <XIcon />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#344054' }}>Cancel</span>
        </button>

        {/* Disclaimer */}
        <div className="flex items-start gap-2 px-1">
          <AlertIcon />
          <p style={{ fontSize: 11, color: '#667085', lineHeight: 1.4 }}>
            This is not a replacement for calling <span style={{ fontWeight: 700 }}>112</span> in a life-threatening emergency
          </p>
        </div>
      </div>
    </div>
  )
}

// ── S2: SOS Trigger — Holding ─────────────────────────────────────────────────

function S2Holding({ onActivate, onCancel }: { onActivate: () => void; onCancel: () => void }) {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPct(prev => (prev >= 100 ? 100 : prev + 4))
    }, 40)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (pct >= 100) onActivate()
  }, [pct, onActivate])

  const circumference = 2 * Math.PI * 58
  const dashOffset = circumference * (1 - pct / 100)

  return (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 50, borderRadius: 40 }}>
      <div className="flex flex-col items-center px-5 pt-6 pb-8 gap-5"
        style={{ background: 'white', borderRadius: '28px 28px 0 0' }}>
        <div className="w-10 h-1 rounded-full" style={{ background: '#E4E7EC' }} />
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#FEF3F2' }}>
            <ShieldIcon />
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Emergency SOS</p>
          <p style={{ fontSize: 13, color: '#667085', maxWidth: 280, lineHeight: 1.5 }}>
            Keep holding… activating in a moment
          </p>
        </div>

        {/* Hold button with progress ring */}
        <div className="relative flex items-center justify-center" style={{ width: 140, height: 140, flexShrink: 0 }}>
          <svg width="140" height="140" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }} viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="#FEE4E2" strokeWidth="8" />
            <circle cx="70" cy="70" r="60" fill="none" stroke="#E5484D" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.04s linear' }}
            />
          </svg>
          <div className="flex flex-col items-center justify-center rounded-full"
            style={{ width: 116, height: 116, background: '#FEF3F2', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 32 }}>🆘</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#B42318' }}>{pct}%</span>
          </div>
        </div>

        <button onClick={onCancel}
          className="w-full py-3.5 rounded-[14px] flex items-center justify-center gap-2"
          style={{ border: '1.5px solid #E4E7EC', background: 'white' }}>
          <XIcon />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#344054' }}>Cancel</span>
        </button>

        <div className="flex items-start gap-2 px-1">
          <AlertIcon />
          <p style={{ fontSize: 11, color: '#667085', lineHeight: 1.4 }}>
            This is not a replacement for calling <span style={{ fontWeight: 700 }}>112</span> in a life-threatening emergency
          </p>
        </div>
      </div>
    </div>
  )
}

// ── S3: SOS Activated — Action Grid ──────────────────────────────────────────

function S3Active({ elapsed, onCallContact, onShareConfirm, onCancelSOS }: {
  elapsed: number; onCallContact: () => void; onShareConfirm: () => void; onCancelSOS: () => void
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col"
      style={{ background: 'white', borderRadius: '28px 28px 0 0', zIndex: 50, maxHeight: '88%' }}>
      <div className="px-4 pt-4 pb-2 flex flex-col gap-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="w-10 h-1 rounded-full mx-auto" style={{ background: '#E4E7EC' }} />

        {/* Title + status badge */}
        <div className="flex items-center justify-between">
          <p style={{ fontSize: 18, fontWeight: 800, color: '#101828', letterSpacing: '-0.3px' }}>SOS Activated</p>
          <SOSActiveBadge elapsed={elapsed} />
        </div>

        {/* 2×2 action grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <SOSActionButton
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.87a16 16 0 0 0 6.13 6.13l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
            label={"Call Police\n(112)"}
          />
          <SOSActionButton
            icon={<PhoneIcon />}
            label="Call Emergency Contact"
            onPress={onCallContact}
          />
          <SOSActionButton
            icon={<MapPinIcon />}
            label="Live Location Shared"
            active
          />
          <SOSActionButton
            icon={<BuildingIcon />}
            label="Call Campus Security"
          />
        </div>

        {/* Timeline */}
        <div className="rounded-[14px] p-3" style={{ background: '#F9FAFB', border: '1px solid #F2F4F7' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', letterSpacing: '0.4px', marginBottom: 10 }}>ACTIVITY LOG</p>
          <TimelineLog entries={[
            { time: '8:42 PM', text: 'SOS activated', done: true },
            { time: '8:42 PM', text: 'Live location shared with Riya M. (Emergency Contact)', done: true },
            { time: '8:42 PM', text: 'Trip link sent via SMS to Riya M.', done: true },
          ]} />
        </div>

        {/* Cancel SOS */}
        <div className="flex flex-col items-center gap-1.5 pb-4">
          <button onClick={onCancelSOS}
            className="w-full py-3.5 rounded-[14px] flex items-center justify-center"
            style={{ border: '1.5px solid #FDA29B', background: '#FEF3F2' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#B42318' }}>Cancel SOS</span>
          </button>
          <p style={{ fontSize: 11, color: '#98A2B3' }}>Only cancel if you are safe</p>
        </div>
      </div>
    </div>
  )
}

// ── S4: SOS Activated — Calling Emergency Contact ─────────────────────────────

function S4Calling({ onBack }: { onBack: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center"
      style={{ background: '#101828', zIndex: 50, borderRadius: 40 }}>
      {/* Status bar spacing */}
      <div style={{ height: 54 }} />

      <div className="flex flex-col items-center flex-1 justify-center gap-4">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: '#3B5BDB', fontSize: 40, fontWeight: 700, color: 'white' }}>
          R
        </div>
        <div className="flex flex-col items-center gap-1">
          <p style={{ fontSize: 22, fontWeight: 800, color: 'white', letterSpacing: '-0.4px' }}>Riya M.</p>
          <p style={{ fontSize: 13, color: '#98A2B3' }}>Emergency Contact · Sister</p>
        </div>

        {/* Pulsing calling label */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: '#12B76A', animation: 'dotBreathe 1.2s ease-in-out infinite' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#12B76A' }}>Calling…</span>
        </div>
      </div>

      {/* Call controls */}
      <div className="w-full flex flex-col items-center gap-6 pb-14 px-8">
        <div className="flex justify-center gap-10">
          {/* Mute */}
          <div className="flex flex-col items-center gap-1.5">
            <button className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span style={{ color: 'white' }}><MicOffIcon /></span>
            </button>
            <span style={{ fontSize: 11, color: '#98A2B3' }}>Mute</span>
          </div>
          {/* Speaker */}
          <div className="flex flex-col items-center gap-1.5">
            <button className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.12)' }}>
              <span style={{ color: 'white' }}><VolumeIcon /></span>
            </button>
            <span style={{ fontSize: 11, color: '#98A2B3' }}>Speaker</span>
          </div>
        </div>

        {/* End call */}
        <button onClick={onBack}
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: '#E5484D' }}>
          <PhoneOffIcon />
        </button>
        <p style={{ fontSize: 12, color: '#667085' }}>End call to return to SOS screen</p>
      </div>
    </div>
  )
}

// ── S5: Trip Shared Confirmation ──────────────────────────────────────────────

function S5Shared({ elapsed, onCallContact, onCancelSOS }: {
  elapsed: number; onCallContact: () => void; onCancelSOS: () => void
}) {
  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col"
      style={{ background: 'white', borderRadius: '28px 28px 0 0', zIndex: 50, maxHeight: '88%' }}>
      <div className="px-4 pt-4 pb-2 flex flex-col gap-3 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="w-10 h-1 rounded-full mx-auto" style={{ background: '#E4E7EC' }} />

        <div className="flex items-center justify-between">
          <p style={{ fontSize: 18, fontWeight: 800, color: '#101828', letterSpacing: '-0.3px' }}>SOS Activated</p>
          <SOSActiveBadge elapsed={elapsed} />
        </div>

        {/* Success banner */}
        <div className="flex items-start gap-2.5 rounded-[12px] px-3 py-3"
          style={{ background: '#ECFDF3', border: '1.5px solid #A6F4C5' }}>
          <CheckCircleIcon />
          <div className="flex flex-col gap-0.5">
            <p style={{ fontSize: 12, fontWeight: 600, color: '#027A48', lineHeight: 1.4 }}>
              Your live location and trip details were sent to Riya M. (Emergency Contact) via SMS
            </p>
            <button>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#3B5BDB', textDecoration: 'underline' }}>
                View what was shared
              </span>
            </button>
          </div>
        </div>

        {/* 2×2 action grid */}
        <div className="grid grid-cols-2 gap-2.5">
          <SOSActionButton
            icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.87a16 16 0 0 0 6.13 6.13l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}
            label={"Call Police\n(112)"}
          />
          <SOSActionButton icon={<PhoneIcon />} label="Call Emergency Contact" onPress={onCallContact} />
          <SOSActionButton icon={<MapPinIcon />} label="Live Location Shared" active />
          <SOSActionButton icon={<BuildingIcon />} label="Call Campus Security" />
        </div>

        <div className="rounded-[14px] p-3" style={{ background: '#F9FAFB', border: '1px solid #F2F4F7' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', letterSpacing: '0.4px', marginBottom: 10 }}>ACTIVITY LOG</p>
          <TimelineLog entries={[
            { time: '8:42 PM', text: 'SOS activated', done: true },
            { time: '8:42 PM', text: 'Live location shared with Riya M.', done: true },
            { time: '8:43 PM', text: 'Trip link sent via SMS to Riya M.', done: true },
          ]} />
        </div>

        <div className="flex flex-col items-center gap-1.5 pb-4">
          <button onClick={onCancelSOS}
            className="w-full py-3.5 rounded-[14px] flex items-center justify-center"
            style={{ border: '1.5px solid #FDA29B', background: '#FEF3F2' }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#B42318' }}>Cancel SOS</span>
          </button>
          <p style={{ fontSize: 11, color: '#98A2B3' }}>Only cancel if you are safe</p>
        </div>
      </div>
    </div>
  )
}

// ── S6: Cancel SOS — Confirm ──────────────────────────────────────────────────

function S6CancelConfirm({ onConfirm, onKeep }: { onConfirm: () => void; onKeep: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.55)', zIndex: 60, borderRadius: 40 }}>
      <div className="flex flex-col px-5 pt-6 pb-10 gap-4"
        style={{ background: 'white', borderRadius: '28px 28px 0 0' }}>
        <div className="w-10 h-1 rounded-full mx-auto" style={{ background: '#E4E7EC' }} />

        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: '#ECFDF3' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Are you safe now?</p>
          <p style={{ fontSize: 13, color: '#667085', maxWidth: 280, lineHeight: 1.5 }}>
            This will stop sharing your live location with your emergency contact
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button onClick={onConfirm}
            className="w-full py-4 rounded-[14px] text-white"
            style={{ background: '#12B76A', fontSize: 14, fontWeight: 700 }}>
            Yes, I'm safe — end SOS
          </button>
          <button onClick={onKeep}
            className="w-full py-4 rounded-[14px]"
            style={{ border: '1.5px solid #FDA29B', background: '#FEF3F2', fontSize: 14, fontWeight: 600, color: '#B42318' }}>
            No, keep SOS active
          </button>
        </div>
      </div>
    </div>
  )
}

// ── S7: SOS Ended — Summary ───────────────────────────────────────────────────

function S7Ended({ onBackToRide }: { onBackToRide: () => void }) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: 'white', zIndex: 50, borderRadius: 40 }}>
      <div style={{ height: 54 }} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#ECFDF3' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#12B76A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <p style={{ fontSize: 24, fontWeight: 800, color: '#101828', letterSpacing: '-0.6px' }}>SOS ended</p>
          <p style={{ fontSize: 13, color: '#667085', lineHeight: 1.5 }}>
            You're safe. Here's a summary of what happened.
          </p>
        </div>

        <div className="w-full rounded-[16px] p-4" style={{ background: '#F9FAFB', border: '1px solid #F2F4F7' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', letterSpacing: '0.4px', marginBottom: 12 }}>SESSION LOG</p>
          <TimelineLog entries={[
            { time: '8:42 PM', text: 'SOS activated', done: true },
            { time: '8:42 PM', text: 'Live location shared with Riya M. (Emergency Contact)', done: true },
            { time: '8:43 PM', text: 'Trip link sent via SMS to Riya M.', done: true },
            { time: '8:44 PM', text: 'Call placed to Riya M.', done: true },
            { time: '8:47 PM', text: 'SOS ended — You confirmed you are safe', done: true },
          ]} />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-5 pb-12">
        <button onClick={onBackToRide}
          className="w-full py-4 rounded-[14px] text-white"
          style={{ background: '#3B5BDB', fontSize: 14, fontWeight: 700 }}>
          Back to ride
        </button>
        <button className="w-full py-3 rounded-[14px]"
          style={{ fontSize: 13, fontWeight: 600, color: '#667085' }}>
          Report an incident
        </button>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function SOSContent({
  screen, setScreen, onDismiss,
}: {
  screen: SOSScreen
  setScreen: (s: SOSScreen) => void
  onDismiss: () => void
}) {
  const [elapsed, setElapsed] = useState(0)

  // Tick the SOS timer whenever the flow is in an "active" state
  useEffect(() => {
    if (screen === 'sos-active' || screen === 'sos-shared') {
      const id = setInterval(() => setElapsed(e => e + 1), 1000)
      return () => clearInterval(id)
    }
  }, [screen])

  return (
    <>
      {screen === 'sos-confirm' && (
        <S1Confirm
          onHold={() => setScreen('sos-holding')}
          onCancel={onDismiss}
        />
      )}
      {screen === 'sos-holding' && (
        <S2Holding
          onActivate={() => { setElapsed(0); setScreen('sos-active') }}
          onCancel={onDismiss}
        />
      )}
      {screen === 'sos-active' && (
        <S3Active
          elapsed={elapsed}
          onCallContact={() => setScreen('sos-calling')}
          onShareConfirm={() => setScreen('sos-shared')}
          onCancelSOS={() => setScreen('sos-cancel-confirm')}
        />
      )}
      {screen === 'sos-calling' && (
        <S4Calling onBack={() => setScreen('sos-active')} />
      )}
      {screen === 'sos-shared' && (
        <S5Shared
          elapsed={elapsed}
          onCallContact={() => setScreen('sos-calling')}
          onCancelSOS={() => setScreen('sos-cancel-confirm')}
        />
      )}
      {screen === 'sos-cancel-confirm' && (
        <S6CancelConfirm
          onConfirm={() => setScreen('sos-ended')}
          onKeep={() => setScreen('sos-active')}
        />
      )}
      {screen === 'sos-ended' && (
        <S7Ended onBackToRide={onDismiss} />
      )}
    </>
  )
}
