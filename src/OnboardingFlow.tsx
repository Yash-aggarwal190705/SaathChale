import { useState, useEffect, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import { uploadCollegeId, uploadProfilePhoto } from './lib/userService'
import { DEMO_ACCOUNTS, type DemoAccount } from './lib/demoData'

export type OnboardingScreen =
  | 'splash-intro' | 'splash-1' | 'splash-2' | 'splash-3'
  | 'auth' | 'email-sent' | 'profile'
  | 'college-id' | 'guidelines' | 'verify-pending' | 'verify-approved' | 'verify-rejected'
  | 'choose-role' | 'role-confirmed'

export const ALL_ONBOARDING_SCREENS: OnboardingScreen[] = [
  'splash-intro', 'splash-1', 'splash-2', 'splash-3',
  'auth', 'email-sent', 'profile',
  'college-id', 'guidelines', 'verify-pending', 'verify-approved', 'verify-rejected',
  'choose-role', 'role-confirmed',
]

// ── Illustrations ────────────────────────────────────────────────────────────

function IllustrationRide() {
  return (
    <svg viewBox="0 0 390 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bg1a" x1="0" y1="0" x2="0" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EEF2FF" /><stop offset="100%" stopColor="#BAC8FF" />
        </linearGradient>
        <linearGradient id="road1" x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%" stopColor="#C7D2FE" /><stop offset="100%" stopColor="#A5B4FC" />
        </linearGradient>
      </defs>
      <rect width="390" height="440" fill="url(#bg1a)" />
      {/* Background circles */}
      <circle cx="60" cy="80" r="80" fill="#C7D2FE" opacity="0.4" />
      <circle cx="340" cy="360" r="100" fill="#C7D2FE" opacity="0.3" />
      <circle cx="320" cy="100" r="40" fill="#A5B4FC" opacity="0.25" />
      {/* Road */}
      <ellipse cx="195" cy="390" rx="220" ry="40" fill="#A5B4FC" opacity="0.35" />
      <rect x="0" y="380" width="390" height="60" fill="#818CF8" opacity="0.2" />
      {/* Dashed road lines */}
      {[20,60,100,140,180,220,260,300,340].map(x => (
        <rect key={x} x={x} y="393" width="28" height="5" rx="2.5" fill="white" opacity="0.5" />
      ))}
      {/* Scooter body */}
      <g transform="translate(110, 290)">
        {/* Body */}
        <path d="M40 50 Q50 20 90 18 L140 18 Q160 18 165 35 L170 50Z" fill="#3B5BDB" />
        <path d="M40 50 Q45 30 80 28 L130 28 Q148 28 152 42 L155 50Z" fill="#4C6EF5" />
        {/* Seat */}
        <rect x="75" y="12" width="70" height="12" rx="6" fill="#364FC7" />
        {/* Handlebars */}
        <path d="M145 18 L158 8" stroke="#364FC7" strokeWidth="4" strokeLinecap="round" />
        <path d="M155 5 Q160 3 165 6" stroke="#364FC7" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Wheels */}
        <circle cx="30" cy="60" r="22" fill="#364FC7" />
        <circle cx="30" cy="60" r="14" fill="#748FFC" />
        <circle cx="30" cy="60" r="6" fill="white" />
        <circle cx="155" cy="60" r="22" fill="#364FC7" />
        <circle cx="155" cy="60" r="14" fill="#748FFC" />
        <circle cx="155" cy="60" r="6" fill="white" />
        {/* Step */}
        <path d="M52 50 L95 50 L95 58 L52 58Z" fill="#4263EB" />
        {/* Mudguard front */}
        <path d="M132 35 Q165 30 172 50" stroke="#4C6EF5" strokeWidth="5" fill="none" strokeLinecap="round" />
      </g>
      {/* Rider figure (back) */}
      <g transform="translate(196, 248)">
        {/* Head */}
        <circle cx="0" cy="0" r="17" fill="#F3F4F6" />
        {/* Helmet */}
        <path d="M-17 0 Q-17-22 0-24 Q17-22 17 0Z" fill="#3B5BDB" />
        <path d="M-17 0 L17 0" stroke="#4C6EF5" strokeWidth="3" strokeLinecap="round" />
        {/* Body */}
        <rect x="-14" y="16" width="28" height="32" rx="8" fill="#3B5BDB" />
        {/* Arms */}
        <path d="M14 22 Q30 26 38 24" stroke="#3B5BDB" strokeWidth="8" strokeLinecap="round" fill="none" />
        <path d="M-14 22 Q-20 26 -18 30" stroke="#3B5BDB" strokeWidth="7" strokeLinecap="round" fill="none" />
      </g>
      {/* Passenger figure (front) */}
      <g transform="translate(233, 252)">
        <circle cx="0" cy="0" r="15" fill="#FDE8D8" />
        <path d="M-15 0 Q-15-20 0-22 Q15-20 15 0Z" fill="#F79009" />
        <path d="M-15 0 L15 0" stroke="#FDB462" strokeWidth="3" strokeLinecap="round" />
        <rect x="-12" y="14" width="24" height="28" rx="7" fill="#F79009" />
        <path d="M-12 20 Q-22 24 -24 22" stroke="#F79009" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M12 20 Q22 24 24 22" stroke="#F79009" strokeWidth="7" strokeLinecap="round" fill="none" />
      </g>
      {/* Motion lines */}
      {[0,10,20].map((offset, i) => (
        <line key={i} x1={50 - offset} y1={330 + i * 12} x2={10 - offset} y2={330 + i * 12}
          stroke="#A5B4FC" strokeWidth={3 - i * 0.8} strokeLinecap="round" opacity="0.7" />
      ))}
      {/* College building silhouette */}
      <g transform="translate(270, 240)" opacity="0.18">
        <rect x="0" y="60" width="80" height="100" fill="#3B5BDB" />
        <rect x="10" y="40" width="60" height="25" fill="#3B5BDB" />
        <polygon points="40,0 70,40 10,40" fill="#3B5BDB" />
        {[15,35,55].map(x => [70,85,100].map(y => (
          <rect key={`${x}-${y}`} x={x} y={y} width="10" height="12" rx="1" fill="white" opacity="0.5" />
        )))}
      </g>
    </svg>
  )
}

function IllustrationFuelShare() {
  return (
    <svg viewBox="0 0 390 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bg2a" x1="0" y1="0" x2="0" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ECFDF5" /><stop offset="100%" stopColor="#A7F3D0" />
        </linearGradient>
      </defs>
      <rect width="390" height="440" fill="url(#bg2a)" />
      <circle cx="80" cy="100" r="90" fill="#6EE7B7" opacity="0.25" />
      <circle cx="320" cy="340" r="110" fill="#6EE7B7" opacity="0.2" />
      <circle cx="340" cy="90" r="50" fill="#34D399" opacity="0.15" />
      {/* Large coin */}
      <circle cx="195" cy="210" r="100" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="3" />
      <circle cx="195" cy="210" r="85" fill="white" stroke="#A7F3D0" strokeWidth="2" />
      {/* Rupee symbol */}
      <text x="195" y="240" textAnchor="middle" fontSize="72" fontWeight="800" fill="#059669" fontFamily="Inter, sans-serif">₹</text>
      {/* Dotted split line */}
      <line x1="195" y1="100" x2="195" y2="320" stroke="#059669" strokeWidth="3" strokeDasharray="8 6" opacity="0.5" />
      {/* Left person */}
      <g transform="translate(80, 330)">
        <circle cx="0" cy="0" r="22" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="2" />
        <circle cx="0" cy="-8" r="9" fill="#059669" opacity="0.7" />
        <path d="M-13 4 Q0 16 13 4" stroke="#059669" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
      {/* Right person */}
      <g transform="translate(310, 330)">
        <circle cx="0" cy="0" r="22" fill="#D1FAE5" stroke="#6EE7B7" strokeWidth="2" />
        <circle cx="0" cy="-8" r="9" fill="#059669" opacity="0.7" />
        <path d="M-13 4 Q0 16 13 4" stroke="#059669" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      </g>
      {/* Arrow left */}
      <path d="M170 210 L120 330" stroke="#059669" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.4" markerEnd="url(#arr)" />
      {/* Arrow right */}
      <path d="M220 210 L270 330" stroke="#059669" strokeWidth="2.5" strokeDasharray="6 4" opacity="0.4" />
      {/* "50%" labels */}
      <rect x="110" y="275" width="42" height="22" rx="11" fill="#059669" />
      <text x="131" y="290" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter, sans-serif">50%</text>
      <rect x="238" y="275" width="42" height="22" rx="11" fill="#059669" />
      <text x="259" y="290" textAnchor="middle" fontSize="11" fontWeight="700" fill="white" fontFamily="Inter, sans-serif">50%</text>
    </svg>
  )
}

function IllustrationSafety() {
  return (
    <svg viewBox="0 0 390 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bg3a" x1="0" y1="0" x2="0" y2="440" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FAF5FF" /><stop offset="100%" stopColor="#DDD6FE" />
        </linearGradient>
      </defs>
      <rect width="390" height="440" fill="url(#bg3a)" />
      <circle cx="70" cy="90" r="80" fill="#E9D5FF" opacity="0.4" />
      <circle cx="330" cy="350" r="100" fill="#DDD6FE" opacity="0.3" />
      <circle cx="330" cy="80" r="45" fill="#C4B5FD" opacity="0.2" />
      {/* Large shield */}
      <path d="M195 80 L280 115 L280 210 Q280 270 195 300 Q110 270 110 210 L110 115 Z"
        fill="#EDE9FE" stroke="#A78BFA" strokeWidth="3" />
      <path d="M195 95 L265 125 L265 207 Q265 258 195 285 Q125 258 125 207 L125 125 Z"
        fill="white" stroke="#C4B5FD" strokeWidth="2" />
      {/* Check inside shield */}
      <path d="M158 192 L182 216 L235 163" stroke="#7C3AED" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Orbiting badges */}
      <g transform="translate(88, 190)">
        <circle r="28" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" fontSize="20">🔒</text>
      </g>
      <g transform="translate(302, 190)">
        <circle r="28" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" fontSize="20">✅</text>
      </g>
      <g transform="translate(195, 335)">
        <circle r="28" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" fontSize="20">📍</text>
      </g>
      {/* Dotted orbit */}
      <circle cx="195" cy="192" r="107" stroke="#C4B5FD" strokeWidth="1.5" strokeDasharray="6 4" fill="none" opacity="0.6" />
    </svg>
  )
}

function IllustrationEmailSent() {
  return (
    <svg viewBox="0 0 390 300" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="bg4a" x1="0" y1="0" x2="0" y2="300" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EEF2FF" /><stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>
      </defs>
      <rect width="390" height="300" fill="url(#bg4a)" />
      {/* Envelope */}
      <rect x="90" y="60" width="210" height="150" rx="16" fill="white" stroke="#BAC8FF" strokeWidth="2" />
      <path d="M90 76 L195 158 L300 76" stroke="#748FFC" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M90 200 L155 140" stroke="#BAC8FF" strokeWidth="2" strokeLinecap="round" />
      <path d="M300 200 L235 140" stroke="#BAC8FF" strokeWidth="2" strokeLinecap="round" />
      {/* Notification dot */}
      <circle cx="300" cy="60" r="20" fill="#3B5BDB" />
      <text x="300" y="65" textAnchor="middle" fontSize="14" fontWeight="800" fill="white" fontFamily="Inter, sans-serif">!</text>
      {/* Motion lines */}
      <line x1="60" y1="110" x2="30" y2="110" stroke="#BAC8FF" strokeWidth="3" strokeLinecap="round" />
      <line x1="55" y1="130" x2="20" y2="130" stroke="#BAC8FF" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="60" y1="150" x2="35" y2="150" stroke="#BAC8FF" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  )
}

function IllustrationVerifyPending() {
  return (
    <svg viewBox="0 0 390 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="390" height="260" fill="#FFFBEB" />
      <circle cx="195" cy="130" r="90" fill="#FEF3C7" />
      <circle cx="195" cy="130" r="70" fill="#FDE68A" opacity="0.5" />
      {/* Clock face */}
      <circle cx="195" cy="130" r="52" fill="white" stroke="#F59E0B" strokeWidth="3" />
      <line x1="195" y1="130" x2="195" y2="92" stroke="#92400E" strokeWidth="4" strokeLinecap="round" />
      <line x1="195" y1="130" x2="222" y2="148" stroke="#B45309" strokeWidth="3" strokeLinecap="round" />
      <circle cx="195" cy="130" r="5" fill="#92400E" />
      {[0,60,120,180,240,300].map((deg, i) => {
        const r = 44, cx = 195 + r * Math.sin(deg * Math.PI / 180), cy = 130 - r * Math.cos(deg * Math.PI / 180)
        return <circle key={i} cx={cx} cy={cy} r={i % 3 === 0 ? 4 : 2.5} fill="#F59E0B" />
      })}
      {/* Magnifying glass */}
      <circle cx="280" cy="195" r="28" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <circle cx="280" cy="195" r="18" fill="none" stroke="#F59E0B" strokeWidth="3" />
      <line x1="292" y1="207" x2="304" y2="219" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function IllustrationVerifyApproved() {
  return (
    <svg viewBox="0 0 390 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="390" height="260" fill="#ECFDF5" />
      <circle cx="195" cy="130" r="90" fill="#D1FAE5" />
      <circle cx="195" cy="130" r="70" fill="#A7F3D0" opacity="0.5" />
      <circle cx="195" cy="130" r="54" fill="white" stroke="#10B981" strokeWidth="3" />
      <path d="M160 130 L183 153 L235 105" stroke="#059669" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* Stars */}
      {[[80,50],[310,60],[320,200],[75,200]].map(([x,y], i) => (
        <text key={i} x={x} y={y} textAnchor="middle" fontSize="24" opacity="0.6">⭐</text>
      ))}
    </svg>
  )
}

function IllustrationVerifyRejected() {
  return (
    <svg viewBox="0 0 390 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="390" height="260" fill="#FFF1F2" />
      <circle cx="195" cy="130" r="90" fill="#FFE4E6" />
      <circle cx="195" cy="130" r="70" fill="#FECDD3" opacity="0.5" />
      <circle cx="195" cy="130" r="54" fill="white" stroke="#F43F5E" strokeWidth="3" />
      <path d="M172 107 L218 153 M218 107 L172 153" stroke="#E11D48" strokeWidth="8" strokeLinecap="round" />
    </svg>
  )
}

// ── Shared components ────────────────────────────────────────────────────────

function PageDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{ height: 6, width: i === current ? 22 : 6,
            background: i === current ? '#3B5BDB' : '#D0D5DD' }} />
      ))}
    </div>
  )
}

function StepHeader({ step, total, onBack }: { step: number; total: number; onBack?: () => void }) {
  const pct = (step / total) * 100
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        {onBack && (
          <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#344054" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 19-7-7 7-7M5 12h14" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1.5">
            <span style={{ fontSize: 12, fontWeight: 600, color: '#667085' }}>Step {step} of {total}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E4E7EC' }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: '#3B5BDB' }} />
          </div>
        </div>
      </div>
    </div>
  )
}

function TrustBanner({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px]"
      style={{ background: '#EDF1FF', border: '1px solid #BAC8FF' }}>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3451B2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" />
      </svg>
      <span style={{ fontSize: 12, color: '#3451B2', fontWeight: 500, flex: 1 }}>{text}</span>
    </div>
  )
}

function InputField({ label, placeholder, helper, value, onChange, type = 'text', error }:
  { label: string; placeholder: string; helper?: string; value: string; onChange: (v: string) => void; type?: string; error?: string }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#344054', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full outline-none"
        style={{ padding: '12px 14px', borderRadius: 10, fontSize: 14, color: '#101828', fontFamily: 'Inter, sans-serif',
          border: `1.5px solid ${error ? '#FDA29B' : '#D0D5DD'}`, background: error ? '#FFF4F4' : 'white' }}
      />
      {helper && !error && <p style={{ fontSize: 11, color: '#98A2B3', marginTop: 5 }}>{helper}</p>}
      {error && <p style={{ fontSize: 11, color: '#B42318', marginTop: 5 }}>{error}</p>}
    </div>
  )
}

function PrimaryButton({ label, onClick, disabled = false, icon }: { label: string; onClick?: () => void; disabled?: boolean; icon?: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-4 rounded-[16px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
      style={{ background: disabled ? '#D0D5DD' : '#3B5BDB', color: 'white', fontSize: 15, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {icon}{label}
    </button>
  )
}

function GoogleButton({ onClick }: { onClick?: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full py-3.5 rounded-[14px] flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
      style={{ background: 'white', border: '1.5px solid #E4E7EC', fontSize: 14, fontWeight: 600, color: '#344054' }}>
      <svg width="20" height="20" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      Continue with Google
    </button>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: '#E4E7EC' }} />
      <span style={{ fontSize: 12, color: '#98A2B3', fontWeight: 500 }}>or</span>
      <div className="flex-1 h-px" style={{ background: '#E4E7EC' }} />
    </div>
  )
}

function SaathChaloLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center" style={{ background: '#3B5BDB' }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="6" cy="18" r="3" fill="white" />
          <circle cx="18" cy="18" r="3" fill="white" />
          <path d="M6 18 L8 8 L14 6 L20 14 L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M8 8 L18 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <span style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.5px' }}>SaathChalo</span>
    </div>
  )
}

function UploadArea({ uploaded, onToggle }: { uploaded: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className="w-full rounded-[12px] flex flex-col items-center justify-center gap-3 transition-all"
      style={{ height: 140, border: `2px dashed ${uploaded ? '#12B76A' : '#D0D5DD'}`,
        background: uploaded ? '#ECFDF3' : '#F9FAFB' }}>
      {uploaded ? (
        <>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#D1FAE5' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#027A48' }}>ID uploaded</p>
          <p style={{ fontSize: 11, color: '#6CE9A6' }}>Tap to replace</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#F2F4F7' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#667085' }}>Tap to upload</p>
          <p style={{ fontSize: 11, color: '#98A2B3' }}>JPG, PNG · Max 5 MB</p>
        </>
      )}
    </button>
  )
}

type RoleKey = 'customer' | 'rider' | 'both'

function RoleCard({ id, title, desc, icon, selected, onSelect }:
  { id: RoleKey; title: string; desc: string; icon: React.ReactNode; selected: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect}
      className="w-full flex items-center gap-4 p-4 rounded-[14px] text-left transition-all"
      style={{ border: `2px solid ${selected ? '#3B5BDB' : '#E4E7EC'}`, background: selected ? '#EDF1FF' : 'white' }}>
      <div className="w-11 h-11 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{ background: selected ? '#3B5BDB' : '#F2F4F7' }}>
        <span style={{ color: selected ? 'white' : '#667085' }}>{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 14, fontWeight: 700, color: selected ? '#3B5BDB' : '#101828' }}>{title}</p>
        <p style={{ fontSize: 12, color: '#667085', marginTop: 1 }}>{desc}</p>
      </div>
      {selected && (
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#3B5BDB' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  )
}

// ── Screen content components ────────────────────────────────────────────────

// ── SP0–SP2: Animated logo reveal ────────────────────────────────────────────

function SplashIntroScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0) // 0 = dot, 1 = wordmark assembling, 2 = settled + tagline

  useEffect(() => {
    const delays = [480, 560, 900]
    const t = setTimeout(() => {
      if (phase < 2) {
        setPhase(phase + 1)
      } else {
        onComplete()
      }
    }, delays[phase])
    return () => clearTimeout(t)
  }, [phase, onComplete])

  const ease = 'cubic-bezier(0.22, 1, 0.36, 1)'

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ background: '#3B5BDB', borderRadius: 40 }}>

      {/* ── Phase 0: single dot ── */}
      <div style={{
        position: 'absolute',
        width: phase === 0 ? 18 : phase === 1 ? 72 : 56,
        height: phase === 0 ? 18 : phase === 1 ? 72 : 56,
        borderRadius: '50%',
        background: 'white',
        opacity: phase === 2 ? 0 : 1,
        transform: `scale(${phase === 0 ? 0.4 : 1})`,
        transition: `all 0.5s ${ease}`,
      }} />

      {/* ── Phase 1→2: logo block ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(20px)',
        transition: `all 0.55s ${ease}`,
      }}>
        {/* Logo mark */}
        <div className="flex items-center gap-3">
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.18)',
            border: '2px solid rgba(255,255,255,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: phase === 1 ? 'scale(0.85)' : 'scale(1)',
            transition: `transform 0.45s ${ease}`,
          }}>
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <circle cx="6" cy="18" r="3" fill="white" />
              <circle cx="18" cy="18" r="3" fill="white" />
              <path d="M6 18 L8 8 L14 6 L20 14 L18 18"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <path d="M8 8 L18 10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          {/* Wordmark */}
          <div style={{ overflow: 'hidden' }}>
            <span style={{
              display: 'block',
              fontSize: 32,
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-0.8px',
              lineHeight: 1,
              transform: phase === 1 ? 'translateX(-8px)' : 'translateX(0)',
              opacity: phase >= 1 ? 1 : 0,
              transition: `all 0.5s ${ease} 0.08s`,
            }}>SaathChalo</span>
          </div>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.72)',
          letterSpacing: '0.02em',
          opacity: phase === 2 ? 1 : 0,
          transform: phase === 2 ? 'translateY(0)' : 'translateY(8px)',
          transition: `all 0.45s ${ease} 0.1s`,
        }}>Chalo, saath chalein</p>
      </div>

      {/* Subtle radial glow behind logo */}
      <div style={{
        position: 'absolute',
        width: 320,
        height: 320,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        opacity: phase >= 1 ? 1 : 0,
        transition: `opacity 0.6s ease`,
      }} />
    </div>
  )
}

function SplashScreen({ slide, onNext, onSkip }: { slide: 1 | 2 | 3; onNext: () => void; onSkip: () => void }) {
  const content = {
    1: { illo: <IllustrationRide />, headline: 'Share your daily ride', sub: 'Verified students from your own college, going your way' },
    2: { illo: <IllustrationFuelShare />, headline: 'Only fuel cost, shared', sub: 'No fares, no surge — just splitting the ride you\'re already taking' },
    3: { illo: <IllustrationSafety />, headline: 'Safety comes first', sub: 'ID verification, live trip sharing and an SOS button on every ride' },
  }[slide]

  return (
    <div className="flex flex-col" style={{ height: '100%' }}>
      {/* Skip */}
      <div className="flex justify-end pt-4 pr-4 pb-2 flex-shrink-0">
        <button onClick={onSkip} style={{ fontSize: 14, fontWeight: 600, color: '#667085' }}>Skip</button>
      </div>
      {/* Illustration */}
      <div className="flex-1 min-h-0">
        {content.illo}
      </div>
      {/* Content */}
      <div className="px-6 pt-6 pb-8 flex flex-col gap-5 flex-shrink-0" style={{ background: 'white', borderRadius: '24px 24px 0 0' }}>
        <PageDots total={3} current={slide - 1} />
        <div className="text-center">
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#101828', letterSpacing: '-0.5px', marginBottom: 8 }}>
            {content.headline}
          </h2>
          <p style={{ fontSize: 15, color: '#667085', lineHeight: 1.6 }}>{content.sub}</p>
        </div>
        <PrimaryButton label={slide === 3 ? 'Get Started' : 'Next'} onClick={onNext} />
      </div>
    </div>
  )
}

function AuthScreen({ onContinue, onSignedIn }: { onContinue: () => void; onSignedIn: () => void }) {
  const { signUp, signIn, signInWithGoogle, checkEmailVerified, firebaseReady, setUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'signup' | 'signin'>('signup')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  /** Instantly logs in as a demo account (no Firebase call needed). */
  const handleDemoLogin = (acct: DemoAccount) => {
    setUser({
      uid: acct.id,
      email: acct.email,
      name: acct.name,
      phone: acct.phone,
      area: acct.area,
      photoUrl: null,
      role: (acct.roles[0] as 'customer' | 'rider') ?? null,
      roles: acct.roles,
      verificationStatus: acct.verificationStatus,
      emailVerified: true,
    })
    onSignedIn()
  }

  const handleSubmit = async () => {
    if (!email.includes('@') || password.length < 6) return
    setBusy(true)
    setError('')
    try {
      if (firebaseReady) {
        if (mode === 'signup') {
          await signUp(email, password)
          onContinue() // → email-sent (new accounts must verify)
        } else {
          await signIn(email, password)
          // Existing verified accounts skip the email-sent step
          const verified = await checkEmailVerified()
          if (verified) onSignedIn()
          else onContinue()
        }
      } else {
        onContinue() // prototype mode
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed'
      setError(msg.replace('Firebase: ', ''))
    } finally {
      setBusy(false)
    }
  }

  const handleGoogle = async () => {
    setBusy(true)
    setError('')
    try {
      if (firebaseReady) await signInWithGoogle()
      onSignedIn()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed'
      setError(msg.replace('Firebase: ', ''))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-6 flex flex-col h-full">
      <div className="flex-1 flex flex-col justify-center gap-7">
        <div className="flex flex-col items-center gap-4 text-center">
          <SaathChaloLogo />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#101828', letterSpacing: '-0.5px' }}>Welcome to SaathChalo</h1>
            <p style={{ fontSize: 14, color: '#667085', marginTop: 8, lineHeight: 1.6 }}>
              Your verified college commute community
            </p>
          </div>
        </div>
        <div className="space-y-3">
          <InputField label="College or work email" placeholder="you@college.edu" value={email} onChange={setEmail} type="email" />
          <InputField label="Password" placeholder="Min. 6 characters" value={password} onChange={setPassword} type="password" />
          {error && <p style={{ fontSize: 12, color: '#E11D48', fontWeight: 500 }}>{error}</p>}
          <PrimaryButton label={busy ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'} onClick={handleSubmit} disabled={!email.includes('@') || password.length < 6 || busy} />
          <button onClick={() => { setMode(m => m === 'signup' ? 'signin' : 'signup'); setError('') }}
            style={{ fontSize: 13, color: '#3B5BDB', fontWeight: 600, width: '100%', textAlign: 'center' }}>
            {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
          <Divider />
          <GoogleButton onClick={handleGoogle} />

          {/* ── Demo Accounts (competition MVP) ── */}
          <div style={{ marginTop: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#344054', marginBottom: 8, textAlign: 'center' }}>
              Quick Demo Logins
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              {DEMO_ACCOUNTS.map((acct) => (
                <button
                  key={acct.id}
                  onClick={() => handleDemoLogin(acct)}
                  disabled={busy}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1.5px solid #E4E7EC',
                    background: '#FAFBFC',
                    cursor: busy ? 'not-allowed' : 'pointer',
                    textAlign: 'left',
                    opacity: busy ? 0.5 : 1,
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#3B5BDB' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = '#E4E7EC' }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#101828', display: 'block' }}>{acct.name}</span>
                  <span style={{ fontSize: 10, color: '#667085' }}>{acct.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="py-6 text-center flex-shrink-0">
        <p style={{ fontSize: 11, color: '#98A2B3', lineHeight: 1.7 }}>
          By continuing, you agree to our{' '}
          <span style={{ color: '#3B5BDB', fontWeight: 600 }}>Terms of Service</span>
          {' '}and{' '}
          <span style={{ color: '#3B5BDB', fontWeight: 600 }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  )
}

function EmailSentScreen({ onContinue }: { onContinue: () => void }) {
  const { user, resendVerification, checkEmailVerified, firebaseReady } = useAuth()
  const [countdown, setCountdown] = useState(30)
  const [resent, setResent] = useState(false)
  const [checking, setChecking] = useState(false)
  const [notVerified, setNotVerified] = useState(false)

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  // Poll for email verification every 5 seconds while on this screen
  useEffect(() => {
    if (!firebaseReady) return
    const interval = setInterval(async () => {
      const verified = await checkEmailVerified()
      if (verified) onContinue()
    }, 5000)
    return () => clearInterval(interval)
  }, [firebaseReady, checkEmailVerified, onContinue])

  const displayEmail = user?.email ?? 'your email'

  const handleResend = async () => {
    if (countdown > 0) return
    try {
      if (firebaseReady) await resendVerification()
      setResent(true)
      setCountdown(30)
    } catch { /* ignore */ }
  }

  const handleVerifyClick = async () => {
    if (!firebaseReady) {
      // Prototype mode: proceed immediately
      onContinue()
      return
    }
    setChecking(true)
    setNotVerified(false)
    try {
      const verified = await checkEmailVerified()
      if (verified) {
        onContinue()
      } else {
        setNotVerified(true)
      }
    } catch {
      setNotVerified(true)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="px-6 flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div style={{ width: '100%' }}>
          <IllustrationEmailSent />
        </div>
        <div className="text-center">
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#101828', letterSpacing: '-0.5px', marginBottom: 10 }}>Check your inbox</h2>
          <p style={{ fontSize: 14, color: '#667085', lineHeight: 1.7 }}>
            We sent a verification link to{' '}
            <span style={{ color: '#101828', fontWeight: 600 }}>{displayEmail}</span>
            {'. '}Tap it on this device to continue.
          </p>
          {resent && <p style={{ fontSize: 12, color: '#059669', marginTop: 8, fontWeight: 600 }}>✓ Verification email resent</p>}
          {notVerified && (
            <p style={{ fontSize: 12, color: '#E11D48', marginTop: 8, fontWeight: 600 }}>
              Email not yet verified. Please check your inbox and tap the link first.
            </p>
          )}
        </div>
        <div className="flex flex-col items-center gap-3 w-full">
          <button onClick={handleResend}
            style={{ fontSize: 14, fontWeight: 700, color: countdown > 0 ? '#98A2B3' : '#3B5BDB' }}>
            {countdown > 0 ? `Resend link (${countdown}s)` : 'Resend link'}
          </button>
          <button style={{ fontSize: 13, color: '#667085' }}>Use a different email</button>
        </div>
      </div>
      <div className="pb-8 flex-shrink-0">
        <PrimaryButton label={checking ? 'Checking…' : 'I verified my email →'} onClick={handleVerifyClick} disabled={checking} />
      </div>
    </div>
  )
}

function ProfileScreen({ onContinue }: { onContinue: () => void }) {
  const { user, updateProfile, firebaseReady } = useAuth()
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const url = URL.createObjectURL(file)
    setPhotoPreview(url)
  }

  const handleContinue = async () => {
    setBusy(true)
    try {
      if (firebaseReady && user?.uid) {
        let photoUrl: string | undefined
        if (photoFile) {
          photoUrl = await uploadProfilePhoto(user.uid, photoFile)
        }
        await updateProfile({ name: name.trim(), area: area.trim(), ...(photoUrl ? { photoUrl } : {}) })
      }
      onContinue()
    } catch { /* proceed anyway in prototype mode */ } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-6 flex flex-col h-full">
      <div className="pt-6 flex-shrink-0">
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#101828', letterSpacing: '-0.5px', marginBottom: 6 }}>Your profile</h2>
        <p style={{ fontSize: 14, color: '#667085', marginBottom: 24 }}>A few quick details to get you started</p>
      </div>
      <div className="flex-1 flex flex-col gap-5">
        {/* Photo upload */}
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <button onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: photoPreview ? '#EDF1FF' : '#F2F4F7', border: '2.5px solid #E4E7EC' }}>
              {photoPreview
                ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
              }
            </button>
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#3B5BDB', border: '2px solid white' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
          </div>
          <span style={{ fontSize: 12, color: '#98A2B3' }}>Tap to add photo</span>
        </div>
        <InputField label="Full name" placeholder="Arjun Mehta" value={name} onChange={setName} />
        <InputField label="Your area / locality" placeholder="Mansarovar, Jaipur"
          helper="Just your area, not your full address"
          value={area} onChange={setArea} />
      </div>
      <div className="py-6 flex-shrink-0">
        <PrimaryButton label={busy ? 'Saving…' : 'Continue'} onClick={handleContinue} disabled={!name.trim() || !area.trim() || busy} />
      </div>
    </div>
  )
}

function CollegeIDScreen({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const { user, updateProfile, firebaseReady } = useAuth()
  const [uploaded, setUploaded] = useState(false)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIdFile(file)
    setUploaded(true)
  }

  const handleSubmit = async () => {
    if (!uploaded) return
    setBusy(true)
    try {
      if (firebaseReady && user?.uid && idFile) {
        const collegeIdUrl = await uploadCollegeId(user.uid, idFile)
        await updateProfile({ collegeIdUrl, verificationStatus: 'pending' })
      }
      onContinue()
    } catch {
      // In prototype mode or on error, still proceed
      onContinue()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="px-6 flex flex-col h-full">
      <div className="pt-6 flex-shrink-0">
        <StepHeader step={1} total={2} onBack={onBack} />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px', marginBottom: 6 }}>
          Verify you're a student here
        </h2>
        <p style={{ fontSize: 14, color: '#667085', marginBottom: 16 }}>
          Upload your college ID card so we can confirm your enrollment.
        </p>
        <TrustBanner text="Used only to confirm your college. Never shown to other users." />
      </div>
      <div className="flex-1 flex flex-col justify-center gap-4">
        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFilePick} />
        {/* Upload area — now triggers real file picker */}
        <button onClick={() => fileInputRef.current?.click()}
          className="w-full flex flex-col items-center gap-3 p-8 rounded-[16px] transition-all"
          style={{ border: `2px dashed ${uploaded ? '#12B76A' : '#D0D5DD'}`, background: uploaded ? '#F0FDF4' : '#F9FAFB' }}>
          {uploaded ? (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#D1FADF' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#027A48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#027A48' }}>ID uploaded</p>
              <p style={{ fontSize: 11, color: '#6CE9A6' }}>Tap to replace</p>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: '#F2F4F7' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#667085' }}>Tap to upload</p>
              <p style={{ fontSize: 11, color: '#98A2B3' }}>JPG, PNG · Max 5 MB</p>
            </>
          )}
        </button>
        <div className="flex items-start gap-2 px-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>
          </svg>
          <p style={{ fontSize: 11, color: '#98A2B3', lineHeight: 1.6 }}>
            Clear photo with all four corners visible. Both physical and digital IDs accepted.
          </p>
        </div>
      </div>
      <div className="py-6 flex-shrink-0">
        <PrimaryButton label={busy ? 'Uploading…' : 'Submit for verification'} onClick={handleSubmit} disabled={!uploaded || busy} />
      </div>
    </div>
  )
}

function GuidelinesScreen({ onContinue, onBack }: { onContinue: () => void; onBack: () => void }) {
  const [agreed, setAgreed] = useState(false)
  const rules = [
    { icon: '💰', text: 'Only pay or accept fuel-cost sharing — no other charges' },
    { icon: '🤝', text: 'Treat your co-rider with respect and courtesy' },
    { icon: '🚦', text: 'Follow traffic and safety rules on every ride' },
  ]
  return (
    <div className="px-6 flex flex-col h-full">
      <div className="pt-6 flex-shrink-0">
        <StepHeader step={2} total={2} onBack={onBack} />
        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px', marginBottom: 6 }}>
          Community guidelines
        </h2>
        <p style={{ fontSize: 14, color: '#667085', marginBottom: 20 }}>
          SaathChalo works because everyone follows the same rules.
        </p>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {rules.map((r, i) => (
          <div key={i} className="flex items-start gap-3 p-3.5 rounded-[12px]" style={{ background: '#F9FAFB', border: '1.5px solid #F2F4F7' }}>
            <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{r.icon}</span>
            <p style={{ fontSize: 14, color: '#344054', fontWeight: 500, lineHeight: 1.55 }}>{r.text}</p>
          </div>
        ))}
        {/* Checkbox */}
        <button onClick={() => setAgreed(a => !a)}
          className="flex items-center gap-3 py-4 w-full text-left">
          <div className="w-5 h-5 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-colors"
            style={{ border: `2px solid ${agreed ? '#3B5BDB' : '#D0D5DD'}`, background: agreed ? '#3B5BDB' : 'white' }}>
            {agreed && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#344054' }}>I agree to the Community Guidelines</span>
        </button>
      </div>
      <div className="py-6 flex-shrink-0">
        <PrimaryButton label="Finish" onClick={onContinue} disabled={!agreed} />
      </div>
    </div>
  )
}

function VerifyPendingScreen({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="px-6 flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <div style={{ width: '100%' }}>
          <IllustrationVerifyPending />
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: '#FFFAEB', border: '1.5px solid #FDE272' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#F59E0B' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#B45309' }}>Under review</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px', marginBottom: 10 }}>
            We're verifying your ID
          </h2>
          <p style={{ fontSize: 14, color: '#667085', lineHeight: 1.7 }}>
            This usually takes under 24 hours. We'll notify you the moment you're verified.
          </p>
        </div>
        <div className="w-full p-3.5 rounded-[12px]" style={{ background: '#F9FAFB', border: '1.5px solid #E4E7EC' }}>
          <p style={{ fontSize: 12, color: '#667085', textAlign: 'center', lineHeight: 1.6 }}>
            Full features unlock after verification.{' '}
            <span style={{ fontWeight: 600, color: '#344054' }}>You can browse in the meantime.</span>
          </p>
        </div>
      </div>
      <div className="pb-8 flex-shrink-0">
        <button onClick={onExplore}
          className="w-full py-4 rounded-[16px]"
          style={{ border: '1.5px solid #D0D5DD', fontSize: 15, fontWeight: 700, color: '#344054', background: 'white' }}>
          Explore the app
        </button>
      </div>
    </div>
  )
}

function VerifyApprovedScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="px-6 flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-6">
        <div style={{ width: '100%' }}>
          <IllustrationVerifyApproved />
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: '#ECFDF3', border: '1.5px solid #6CE9A6' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#027A48" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#027A48' }}>Verified</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#101828', letterSpacing: '-0.6px', marginBottom: 10 }}>
            You're verified! 🎉
          </h2>
          <p style={{ fontSize: 14, color: '#667085', lineHeight: 1.7 }}>
            Welcome to the SaathChalo community. All features are now unlocked.
          </p>
        </div>
      </div>
      <div className="pb-8 flex-shrink-0">
        <PrimaryButton label="Continue" onClick={onContinue} />
      </div>
    </div>
  )
}

function VerifyRejectedScreen({ onReupload }: { onReupload: () => void }) {
  return (
    <div className="px-6 flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center gap-5">
        <div style={{ width: '100%' }}>
          <IllustrationVerifyRejected />
        </div>
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4"
            style={{ background: '#FFF1F2', border: '1.5px solid #FDA29B' }}>
            <div className="w-2 h-2 rounded-full" style={{ background: '#F43F5E' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#BE123C' }}>Verification failed</span>
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px', marginBottom: 10 }}>
            We couldn't verify your ID
          </h2>
          <div className="inline-block px-4 py-2.5 rounded-[10px] mb-2" style={{ background: '#FFF1F2', border: '1px solid #FDA29B' }}>
            <p style={{ fontSize: 13, color: '#BE123C', fontWeight: 500 }}>
              The photo was blurry — please try again
            </p>
          </div>
          <p style={{ fontSize: 13, color: '#667085', lineHeight: 1.6, marginTop: 8 }}>
            Take the photo in good lighting with all corners of the ID visible.
          </p>
        </div>
      </div>
      <div className="pb-8 flex-shrink-0 space-y-3">
        <PrimaryButton label="Re-upload ID" onClick={onReupload} />
        <div className="text-center">
          <button style={{ fontSize: 13, fontWeight: 600, color: '#667085' }}>Contact support</button>
        </div>
      </div>
    </div>
  )
}

function ChooseRoleScreen({ onContinue }: { onContinue: (role: RoleKey) => void }) {
  const { setRoles, firebaseReady } = useAuth()
  const [selected, setSelected] = useState<RoleKey | null>(null)
  const [busy, setBusy] = useState(false)

  const roleKeyToArray = (r: RoleKey): string[] => {
    if (r === 'both') return ['customer', 'rider']
    return [r]
  }

  const handleContinue = async () => {
    if (!selected) return
    setBusy(true)
    try {
      if (firebaseReady) {
        await setRoles(roleKeyToArray(selected))
      }
      onContinue(selected)
    } catch { /* proceed anyway */ } finally {
      setBusy(false)
    }
  }

  const roles: { id: RoleKey; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'customer',
      title: 'Customer',
      desc: 'I need a ride to college',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
    },
    {
      id: 'rider',
      title: 'Rider',
      desc: 'I have a vehicle and travel a fixed route',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/><path d="M15 6a1 1 0 0 0-1-1h-1.5a1 1 0 0 0-1 1v2.5L9 11v3l2.5 2H15V6z"/><path d="M15 6h2.621a1 1 0 0 1 .894.553L21 12v3h-2.5"/></svg>,
    },
    {
      id: 'both',
      title: 'Both',
      desc: 'I want to ride and offer seats',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    },
  ]
  return (
    <div className="px-6 flex flex-col h-full">
      <div className="pt-8 flex-shrink-0">
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#101828', letterSpacing: '-0.5px', marginBottom: 6 }}>
          How will you use SaathChalo?
        </h2>
        <p style={{ fontSize: 14, color: '#667085', marginBottom: 24 }}>
          You can change this anytime in Settings.
        </p>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {roles.map(r => (
          <RoleCard key={r.id} {...r} selected={selected === r.id} onSelect={() => setSelected(r.id)} />
        ))}
      </div>
      <div className="py-6 flex-shrink-0">
        <PrimaryButton label={busy ? 'Saving…' : 'Continue'} onClick={handleContinue} disabled={!selected || busy} />
      </div>
    </div>
  )
}

function RoleConfirmedScreen({ role, onFinish }: { role: RoleKey; onFinish: (dest: 'customer' | 'rider') => void }) {
  const configs = {
    customer: {
      emoji: '🎉',
      headline: "You're all set to find your first ride",
      sub: 'Browse riders going your way and raise your first ticket.',
      primary: 'Find a ride',
      bg: '#EEF2FF',
      accent: '#3B5BDB',
    },
    rider: {
      emoji: '🛵',
      headline: "Let's get your vehicle set up",
      sub: 'A few more steps to verify your vehicle and start accepting co-riders.',
      primary: 'Set up as a Rider',
      bg: '#FFF8ED',
      accent: '#F79009',
    },
    both: {
      emoji: '✨',
      headline: "You're joining as both!",
      sub: "You'll be able to find rides and offer seats on your route.",
      primary: null,
      bg: '#F0FDF4',
      accent: '#12B76A',
    },
  }[role]

  return (
    <div className="flex flex-col h-full" style={{ background: configs.bg }}>
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-6 text-center">
        <div className="w-28 h-28 rounded-full flex items-center justify-center"
          style={{ background: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          <span style={{ fontSize: 52 }}>{configs.emoji}</span>
        </div>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: '#101828', letterSpacing: '-0.5px', marginBottom: 10 }}>
            {configs.headline}
          </h2>
          <p style={{ fontSize: 14, color: '#667085', lineHeight: 1.7 }}>{configs.sub}</p>
        </div>
        {/* For "Both" — two action buttons */}
        {role === 'both' && (
          <div className="w-full space-y-3">
            <button onClick={() => onFinish('customer')}
              className="w-full py-4 rounded-[16px] text-white"
              style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>
              Find a ride
            </button>
            <button onClick={() => onFinish('rider')}
              className="w-full py-4 rounded-[16px]"
              style={{ background: 'white', border: '1.5px solid #D0D5DD', fontSize: 15, fontWeight: 700, color: '#344054' }}>
              Set up as a Rider
            </button>
          </div>
        )}
      </div>
      {role !== 'both' && (
        <div className="px-6 pb-10 flex-shrink-0">
          <PrimaryButton label={configs.primary!} onClick={() => onFinish(role === 'rider' ? 'rider' : 'customer')} />
        </div>
      )}
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function OnboardingContent({
  screen, setScreen, onComplete,
}: { screen: OnboardingScreen; setScreen: (s: OnboardingScreen) => void; onComplete?: (dest: 'customer' | 'rider') => void }) {
  const [confirmedRole, setConfirmedRole] = useState<RoleKey>('customer')

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden" style={{ borderRadius: '40px' }}>
      {/* Intro screens are full-bleed (no status bar offset) */}
      {screen === 'splash-intro' && (
        <SplashIntroScreen onComplete={() => setScreen('splash-1')} />
      )}
      {/* Content area (below status bar) */}
      <div style={{ flex: 1, marginTop: 44, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        visibility: screen === 'splash-intro' ? 'hidden' : 'visible' }}>
        {screen === 'splash-1' && <SplashScreen slide={1} onNext={() => setScreen('splash-2')} onSkip={() => setScreen('auth')} />}
        {screen === 'splash-2' && <SplashScreen slide={2} onNext={() => setScreen('splash-3')} onSkip={() => setScreen('auth')} />}
        {screen === 'splash-3' && <SplashScreen slide={3} onNext={() => setScreen('auth')} onSkip={() => setScreen('auth')} />}
        {screen === 'auth' && (
          <AuthScreen
            onContinue={() => setScreen('email-sent')}
            onSignedIn={() => setScreen('profile')}
          />
        )}
        {screen === 'email-sent' && <EmailSentScreen onContinue={() => setScreen('profile')} />}
        {screen === 'profile' && <ProfileScreen onContinue={() => setScreen('college-id')} />}
        {screen === 'college-id' && <CollegeIDScreen onContinue={() => setScreen('guidelines')} onBack={() => setScreen('profile')} />}
        {screen === 'guidelines' && <GuidelinesScreen onContinue={() => setScreen('verify-pending')} onBack={() => setScreen('college-id')} />}
        {screen === 'verify-pending' && <VerifyPendingScreen onExplore={() => setScreen('choose-role')} />}
        {screen === 'verify-approved' && <VerifyApprovedScreen onContinue={() => setScreen('choose-role')} />}
        {screen === 'verify-rejected' && <VerifyRejectedScreen onReupload={() => setScreen('college-id')} />}
        {screen === 'choose-role' && (
          <ChooseRoleScreen onContinue={r => { setConfirmedRole(r); setScreen('role-confirmed') }} />
        )}
        {screen === 'role-confirmed' && (
          <RoleConfirmedScreen role={confirmedRole} onFinish={dest => onComplete ? onComplete(dest) : setScreen('splash-1')} />
        )}
      </div>
    </div>
  )
}
