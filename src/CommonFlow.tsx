import { useState } from 'react'

export type CommonScreen =
  | 'notif-list' | 'notif-empty' | 'notif-detail'
  | 'profile' | 'edit-profile' | 'verify-status' | 'emergency-contact'
  | 'ride-history' | 'ride-detail' | 'notif-prefs' | 'help-support' | 'safety-center'

export const ALL_COMMON_SCREENS: CommonScreen[] = [
  'notif-list', 'notif-empty', 'notif-detail',
  'profile', 'edit-profile', 'verify-status', 'emergency-contact',
  'ride-history', 'ride-detail', 'notif-prefs', 'help-support', 'safety-center',
]

export const COMMON_SHOW_NAV = new Set<CommonScreen>(['profile'])

// ── Icons ────────────────────────────────────────────────────────────────────

const IC = {
  back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#101828" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7M5 12h14"/></svg>,
  chevron: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D0D5DD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>,
  user: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  shield: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>,
  phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.89 12 19.79 19.79 0 0 1 1.77 3.5 2 2 0 0 1 3.74 1.35h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.02z"/></svg>,
  clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  card: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  flag: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  help: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  file: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  info: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  logout: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  camera: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  edit: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#667085" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B42318" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  plus: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  sos: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  share: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  star: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="#F79009" stroke="#F79009" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  check: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  home: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  ticket: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>,
  profileTab: (active: boolean) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#3B5BDB' : '#98A2B3'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
}

// ── Primitives ───────────────────────────────────────────────────────────────

function ScreenTopBar({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-4 flex-shrink-0"
      style={{ height: 56, borderBottom: '1px solid #F2F4F7', background: 'white' }}>
      <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 flex-shrink-0">
        <IC.back />
      </button>
      <span className="flex-1" style={{ fontSize: 17, fontWeight: 700, color: '#101828' }}>{title}</span>
      {action}
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

function SegmentedTabs({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex mx-4 my-3 p-1 rounded-[10px] gap-0.5" style={{ background: '#F2F4F7' }}>
      {tabs.map((tab, i) => (
        <button key={tab} onClick={() => onChange(i)} className="flex-1 py-2 rounded-[8px] transition-all"
          style={{ fontSize: 13, fontWeight: active === i ? 700 : 500,
            background: active === i ? 'white' : 'transparent',
            color: active === i ? '#101828' : '#667085',
            boxShadow: active === i ? '0 1px 4px rgba(16,24,40,0.08)' : 'none' }}>
          {tab}
        </button>
      ))}
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-4 pt-5 pb-1.5">
      <span style={{ fontSize: 11, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
    </div>
  )
}

type SettingRowProps = {
  icon?: React.ReactNode
  iconBg?: string
  label: string
  value?: string
  toggle?: boolean
  toggleValue?: boolean
  onToggle?: (v: boolean) => void
  danger?: boolean
  onPress?: () => void
  noBorder?: boolean
}
function SettingRow({ icon, iconBg = '#F2F4F7', label, value, toggle, toggleValue, onToggle, danger, onPress, noBorder }: SettingRowProps) {
  return (
    <div className="w-full flex items-center gap-3 px-4 text-left"
      style={{ height: 54, borderBottom: noBorder ? 'none' : '1px solid #F9FAFB', cursor: onPress ? 'pointer' : 'default' }}
      onClick={onPress}
      role={onPress ? 'button' : undefined}
      tabIndex={onPress ? 0 : undefined}
      onKeyDown={onPress ? (e => e.key === 'Enter' && onPress()) : undefined}>
      {icon && (
        <div className="w-8 h-8 rounded-[8px] flex items-center justify-center flex-shrink-0"
          style={{ background: danger ? '#FEF3F2' : iconBg, color: danger ? '#B42318' : '#344054' }}>
          {icon}
        </div>
      )}
      <span className="flex-1" style={{ fontSize: 14, fontWeight: 500, color: danger ? '#B42318' : '#101828' }}>{label}</span>
      {toggle ? (
        <div onClick={e => { e.stopPropagation(); onToggle?.(!toggleValue) }}>
          <Toggle value={!!toggleValue} onChange={v => onToggle?.(v)} />
        </div>
      ) : value ? (
        <span style={{ fontSize: 13, color: '#667085', marginRight: 6 }}>{value}</span>
      ) : null}
      {!toggle && <IC.chevron />}
    </div>
  )
}

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full"
      style={{ background: '#EDF1FF', fontSize: 10, color: '#3451B2', fontWeight: 600 }}>
      <IC.shield /> Verified
    </span>
  )
}

function InputField({ label, placeholder, value, onChange, readOnly }: {
  label: string; placeholder: string; value: string; onChange?: (v: string) => void; readOnly?: boolean
}) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#344054', display: 'block', marginBottom: 6 }}>{label}</label>
      <input
        type="text" value={value} readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full outline-none"
        style={{ padding: '11px 14px', borderRadius: 10, fontSize: 14, color: readOnly ? '#667085' : '#101828',
          fontFamily: 'Inter, sans-serif', border: '1.5px solid #D0D5DD', background: readOnly ? '#F9FAFB' : 'white' }}
      />
    </div>
  )
}

// ── A: Notifications ─────────────────────────────────────────────────────────

const NOTIFS = [
  { id: 1, icon: '✅', title: 'Ticket accepted by Rohit S.', desc: 'Your 8:15 AM ride to VGU Jaipur is confirmed.', time: '2 min ago', unread: true, tab: 'rides' },
  { id: 2, icon: '⏰', title: 'Your ride starts in 30 minutes', desc: 'Rohit S. is heading to your pickup point.', time: '27 min ago', unread: true, tab: 'rides' },
  { id: 3, icon: '❌', title: 'Priya cancelled your ride', desc: 'Your ride for tomorrow (Oct 19) has been cancelled.', time: '3 hr ago', unread: false, tab: 'rides' },
  { id: 4, icon: '🎯', title: 'New matching ticket on your route', desc: 'A student at VGU needs a ride from Mansarovar — matches your usual route.', time: 'Yesterday', unread: false, tab: 'rides' },
  { id: 5, icon: '🎉', title: "You're verified! Welcome to SaathChalo", desc: 'Your college ID has been confirmed. All features are now unlocked.', time: '2 days ago', unread: false, tab: 'alerts' },
]

function NotifItem({ notif, onPress }: { notif: typeof NOTIFS[0]; onPress: () => void }) {
  return (
    <button onClick={onPress} className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
      style={{ background: notif.unread ? '#F5F8FF' : 'white', borderBottom: '1px solid #F2F4F7' }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: notif.unread ? '#EDF1FF' : '#F2F4F7', fontSize: 18 }}>
        {notif.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p style={{ fontSize: 13, fontWeight: notif.unread ? 700 : 500, color: '#101828', flex: 1, lineHeight: 1.45 }}>{notif.title}</p>
          <span style={{ fontSize: 11, color: '#98A2B3', flexShrink: 0 }}>{notif.time}</span>
        </div>
        <p style={{ fontSize: 12, color: '#667085', marginTop: 2, lineHeight: 1.5 }}>{notif.desc}</p>
      </div>
      {notif.unread && (
        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#3B5BDB' }} />
      )}
    </button>
  )
}

function NotifList({ onBack, onDetail }: { onBack: () => void; onDetail: () => void }) {
  const [tab, setTab] = useState(0)
  const tabs = ['All', 'Rides', 'Alerts']
  const filtered = tab === 0 ? NOTIFS : tab === 1 ? NOTIFS.filter(n => n.tab === 'rides') : NOTIFS.filter(n => n.tab === 'alerts')
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Notifications" onBack={onBack} />
      <SegmentedTabs tabs={tabs} active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {filtered.length === 0 ? (
          <EmptyStateView text="No notifications in this category yet." />
        ) : filtered.map(n => <NotifItem key={n.id} notif={n} onPress={onDetail} />)}
      </div>
    </div>
  )
}

function EmptyStateView({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-16 gap-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: '#F2F4F7' }}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D0D5DD" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>
        </svg>
      </div>
      <p style={{ fontSize: 14, color: '#98A2B3', textAlign: 'center', lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}

function NotifEmpty({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Notifications" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-5">
        <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: '#EDF1FF' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
        <div className="text-center">
          <p style={{ fontSize: 16, fontWeight: 700, color: '#101828', marginBottom: 8 }}>No notifications yet</p>
          <p style={{ fontSize: 14, color: '#667085', lineHeight: 1.7 }}>
            {"We'll let you know when something needs your attention."}
          </p>
        </div>
      </div>
    </div>
  )
}

function NotifDetail({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Notification" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4" style={{ scrollbarWidth: 'none' }}>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 11, color: '#98A2B3' }}>2 minutes ago</span>
        </div>
        <div>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px', marginBottom: 6 }}>
            Ticket accepted by Rohit S.
          </p>
          <p style={{ fontSize: 14, color: '#667085', lineHeight: 1.7 }}>
            Your 8:15 AM ride to VGU Jaipur on Monday has been confirmed. Rohit will be at Mansarovar Metro, Gate 2.
          </p>
        </div>
        {/* Ride summary card */}
        <div className="rounded-[14px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
          <div className="px-4 py-3.5" style={{ background: '#F7F8FA', borderBottom: '1px solid #E4E7EC' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming ride</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#12B76A' }} />
              <span style={{ fontSize: 13, fontWeight: 500, color: '#101828' }}>Mansarovar Metro, Gate 2</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#3B5BDB"><circle cx="12" cy="12" r="10"/></svg>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#101828' }}>VGU Jaipur</span>
            </div>
            <div className="flex items-center justify-between pt-1" style={{ borderTop: '1px solid #F2F4F7' }}>
              <span style={{ fontSize: 12, color: '#667085' }}>Monday · 8:15 AM · ₹43</span>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#EDF1FF' }}>
                  <span style={{ fontSize: 8, fontWeight: 800, color: '#3451B2' }}>RS</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#344054' }}>Rohit S.</span>
              </div>
            </div>
          </div>
        </div>
        <button className="w-full py-4 rounded-[16px] text-white"
          style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>
          View ride details
        </button>
      </div>
    </div>
  )
}

// ── B: Profile & Settings ────────────────────────────────────────────────────

function ProfileHeader() {
  return (
    <div className="px-4 pt-6 pb-5 flex flex-col items-center gap-3" style={{ borderBottom: '1px solid #F2F4F7' }}>
      <div className="relative">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: '#EDF1FF', border: '3px solid white', boxShadow: '0 0 0 2px #BAC8FF' }}>
          <span style={{ fontSize: 26, fontWeight: 800, color: '#3451B2' }}>AM</span>
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span style={{ fontSize: 20, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px' }}>Arjun Mehta</span>
          <VerifiedBadge />
        </div>
        <div className="flex items-center justify-center gap-1 mt-1">
          <IC.star /><span style={{ fontSize: 13, color: '#667085', fontWeight: 500 }}>4.8 · 24 rides</span>
        </div>
        <div className="flex items-center justify-center gap-2 mt-2.5">
          <span className="px-2.5 py-1 rounded-full" style={{ fontSize: 12, fontWeight: 700, background: '#EDF1FF', color: '#3451B2' }}>Customer</span>
          <span className="px-2.5 py-1 rounded-full" style={{ fontSize: 12, fontWeight: 700, background: '#FFF8ED', color: '#B45309' }}>Rider</span>
        </div>
      </div>
    </div>
  )
}

function ProfileScreen({ setScreen, onGoHome }: { setScreen: (s: CommonScreen) => void; onGoHome: () => void }) {
  return (
    <div className="flex flex-col h-full">
      {/* Title bar - no back arrow since this is a root tab */}
      <div className="flex items-center px-4 flex-shrink-0" style={{ height: 56, borderBottom: '1px solid #F2F4F7' }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#101828' }}>Profile</span>
      </div>
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <ProfileHeader />
        <SectionHeader label="Account" />
        <SettingRow icon={<IC.user />} iconBg="#EDF1FF" label="Edit Profile" onPress={() => setScreen('edit-profile')} />
        <SettingRow icon={<IC.shield />} iconBg="#ECFDF3" label="Verification Status" onPress={() => setScreen('verify-status')} />
        <SettingRow icon={<IC.phone />} iconBg="#FFF0F6" label="Emergency Contact" onPress={() => setScreen('emergency-contact')} noBorder />

        <SectionHeader label="Activity" />
        <SettingRow icon={<IC.clock />} iconBg="#F0FDF4" label="Ride History" onPress={() => setScreen('ride-history')} />
        <SettingRow icon={<IC.card />} iconBg="#FFFBEB" label="Payment Mode" value="Cash" />
        <SettingRow icon={<IC.bell />} iconBg="#EEF2FF" label="Notification Preferences" onPress={() => setScreen('notif-prefs')} noBorder />

        <SectionHeader label="Trust & Safety" />
        <SettingRow icon={<IC.shield />} iconBg="#EEF2FF" label="Safety Center" onPress={() => setScreen('safety-center')} />
        <SettingRow icon={<IC.flag />} iconBg="#FFF1F2" label="Report a Problem" noBorder />

        <SectionHeader label="Support" />
        <SettingRow icon={<IC.help />} iconBg="#F0FDF4" label="Help & Support" onPress={() => setScreen('help-support')} />
        <SettingRow icon={<IC.file />} iconBg="#F7F8FA" label="Terms & Privacy" />
        <SettingRow icon={<IC.info />} iconBg="#F7F8FA" label="About SaathChalo" noBorder />

        <div className="px-4 pt-2 pb-3">
          <button className="w-full flex items-center gap-3 px-1 py-3.5"
            style={{ borderTop: '1px solid #F2F4F7' }}>
            <IC.logout />
            <span style={{ fontSize: 14, fontWeight: 600, color: '#B42318' }}>Log Out</span>
          </button>
        </div>
        <div style={{ height: 20 }} />
      </div>
      {/* Bottom nav */}
      <div className="flex-shrink-0 flex" style={{ borderTop: '1px solid #F2F4F7', background: 'white', paddingBottom: 24 }}>
        {[
          { label: 'Home', icon: <IC.home />, onPress: onGoHome },
          { label: 'Tickets', icon: <IC.ticket />, onPress: () => setScreen('ride-history') },
          { label: 'Profile', icon: IC.profileTab(true), onPress: () => {}, active: true },
        ].map(item => (
          <button key={item.label} className="flex-1 flex flex-col items-center gap-0.5 py-2.5" onClick={item.onPress}>
            {item.icon}
            <span style={{ fontSize: 10, fontWeight: item.active ? 700 : 500, color: item.active ? '#3B5BDB' : '#98A2B3' }}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function EditProfileScreen({ onBack }: { onBack: () => void }) {
  const [name, setName] = useState('Arjun Mehta')
  const [area, setArea] = useState('Mansarovar, Jaipur')
  const [hasPhoto, setHasPhoto] = useState(true)
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Edit Profile" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5" style={{ scrollbarWidth: 'none' }}>
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <button onClick={() => setHasPhoto(h => !h)}
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: hasPhoto ? '#EDF1FF' : '#F2F4F7', border: '2.5px solid #E4E7EC' }}>
              {hasPhoto
                ? <span style={{ fontSize: 26, fontWeight: 800, color: '#3451B2' }}>AM</span>
                : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
              }
            </button>
            <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: '#3B5BDB', border: '2px solid white' }}>
              <IC.camera />
            </div>
          </div>
          <span style={{ fontSize: 12, color: '#667085' }}>Tap to change photo</span>
        </div>
        <InputField label="Full name" placeholder="Arjun Mehta" value={name} onChange={setName} />
        <InputField label="Area / locality" placeholder="Mansarovar, Jaipur" value={area} onChange={setArea} />
        <InputField label="College email" placeholder="" value="arjun.m@vgu.ac.in" readOnly />
        <div className="px-3 py-2.5 rounded-[10px]" style={{ background: '#F9FAFB', border: '1px solid #E4E7EC' }}>
          <p style={{ fontSize: 12, color: '#98A2B3', lineHeight: 1.6 }}>
            Your email is verified and cannot be changed. Contact support if you need to update it.
          </p>
        </div>
      </div>
      <div className="px-4 pb-8 flex-shrink-0">
        <button className="w-full py-4 rounded-[16px] text-white"
          style={{ background: '#3B5BDB', fontSize: 15, fontWeight: 700 }}>
          Save Changes
        </button>
      </div>
    </div>
  )
}

function VerifyStatusScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Verification Status" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5" style={{ scrollbarWidth: 'none' }}>
        <div className="rounded-[14px] p-4 flex items-center gap-3" style={{ background: '#ECFDF3', border: '1.5px solid #6CE9A6' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#D1FAE5' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#027A48' }}>Identity verified</p>
            <p style={{ fontSize: 12, color: '#065F46' }}>Verified on Oct 12, 2024 · VGU Jaipur</p>
          </div>
        </div>
        <div className="space-y-3">
          <p style={{ fontSize: 13, fontWeight: 700, color: '#344054' }}>Why this matters</p>
          {[
            'Only verified students can book or offer rides',
            'Your ID is never shared with other riders',
            'Verification builds a safer, trusted community',
          ].map((txt, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#3B5BDB' }}>
                <IC.check />
              </div>
              <p style={{ fontSize: 13, color: '#344054', lineHeight: 1.55 }}>{txt}</p>
            </div>
          ))}
        </div>
        <div className="rounded-[12px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
          <div className="px-4 py-3" style={{ background: '#F7F8FA', borderBottom: '1px solid #E4E7EC' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verified with</p>
          </div>
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="w-12 h-12 rounded-[8px] flex items-center justify-center" style={{ background: '#F2F4F7', border: '1px solid #E4E7EC' }}>
              <svg width="24" height="18" viewBox="0 0 32 24" fill="none"><rect width="32" height="24" rx="4" fill="#E4E7EC"/><rect x="2" y="8" width="28" height="3" rx="1" fill="#D0D5DD"/><rect x="2" y="14" width="14" height="2" rx="1" fill="#D0D5DD"/></svg>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>College Student ID</p>
              <p style={{ fontSize: 12, color: '#667085' }}>VGU Jaipur · 2024</p>
            </div>
          </div>
        </div>
        <button className="w-full py-3.5 rounded-[14px]"
          style={{ border: '1.5px solid #D0D5DD', fontSize: 14, fontWeight: 600, color: '#344054', background: 'white' }}>
          Update ID document
        </button>
      </div>
    </div>
  )
}

function EmergencyContactScreen({ onBack }: { onBack: () => void }) {
  const contacts = [
    { name: 'Sunita Mehta', rel: 'Mother', phone: '+91 98765 XXXXX' },
    { name: 'Rakesh Mehta', rel: 'Father', phone: '+91 87654 XXXXX' },
  ]
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Emergency Contact" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4" style={{ scrollbarWidth: 'none' }}>
        <div className="p-3.5 rounded-[12px] flex items-start gap-2.5" style={{ background: '#EDF1FF', border: '1px solid #BAC8FF' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#3451B2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <p style={{ fontSize: 12, color: '#3451B2', lineHeight: 1.6 }}>
            Your emergency contact receives the trip-sharing link automatically when you use SOS or "Share trip" during a ride.
          </p>
        </div>
        {contacts.map((c, i) => (
          <div key={i} className="rounded-[14px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
            <div className="px-4 py-3.5 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#F2F4F7' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#344054' }}>{c.name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>{c.name}</p>
                <p style={{ fontSize: 12, color: '#667085' }}>{c.rel} · {c.phone}</p>
              </div>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#F2F4F7' }}>
                  <IC.edit />
                </button>
                <button className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#FEF3F2' }}>
                  <IC.trash />
                </button>
              </div>
            </div>
          </div>
        ))}
        <button className="w-full flex items-center gap-3 py-4 px-4 rounded-[14px]"
          style={{ border: '2px dashed #D0D5DD', background: '#F9FAFB' }}>
          <IC.plus />
          <span style={{ fontSize: 14, fontWeight: 600, color: '#3B5BDB' }}>Add emergency contact</span>
        </button>
      </div>
    </div>
  )
}

function RideHistoryScreen({ onBack, onDetail }: { onBack: () => void; onDetail: () => void }) {
  const [tab, setTab] = useState(0)
  const customerRides = [
    { from: 'Mansarovar Metro', to: 'VGU Jaipur', date: 'Mon, Oct 21', amount: '₹43', status: 'Completed' as const },
    { from: 'VGU Jaipur', to: 'Mansarovar', date: 'Fri, Oct 18', amount: '₹43', status: 'Completed' as const },
    { from: 'Mansarovar', to: 'MNIT Jaipur', date: 'Wed, Oct 16', amount: '₹38', status: 'Completed' as const },
    { from: 'C-Scheme', to: 'VGU Jaipur', date: 'Mon, Oct 14', amount: '₹55', status: 'Cancelled' as const },
  ]
  const statusColor = (s: 'Completed' | 'Cancelled') =>
    s === 'Completed' ? { bg: '#ECFDF3', text: '#027A48' } : { bg: '#FFF1F2', text: '#B42318' }
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Ride History" onBack={onBack} />
      <SegmentedTabs tabs={['As Customer', 'As Rider']} active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {tab === 0 ? (
          customerRides.map((r, i) => {
            const sc = statusColor(r.status)
            return (
              <button key={i} onClick={onDetail}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                style={{ borderBottom: '1px solid #F2F4F7' }}>
                <div className="flex flex-col items-center gap-1 flex-shrink-0" style={{ width: 10 }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#12B76A' }} />
                  <div className="w-px flex-1 min-h-[18px]" style={{ background: '#E4E7EC' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#3B5BDB' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>{r.from}</p>
                  <p style={{ fontSize: 11, color: '#98A2B3', margin: '2px 0' }}>{r.date}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#101828' }}>{r.to}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>{r.amount}</span>
                  <span className="px-2 py-0.5 rounded-full" style={{ fontSize: 10, fontWeight: 700, background: sc.bg, color: sc.text }}>{r.status}</span>
                </div>
                <IC.chevron />
              </button>
            )
          })
        ) : (
          <EmptyStateView text="You haven't offered any rides yet. Post a trip to get started." />
        )}
      </div>
    </div>
  )
}

function MiniMapThumbnail() {
  return (
    <svg viewBox="0 0 358 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', borderRadius: 10 }}>
      <rect width="358" height="130" fill="#E8E5DC" rx="10"/>
      {[20,45,70,95,120].map(y => <rect key={y} x="0" y={y} width="358" height="5" fill="#F0EDE5" />)}
      {[50,110,170,230,290].map(x => <rect key={x} x={x} y="0" width="5" height="130" fill="#F0EDE5" />)}
      <path d="M30 105 Q80 80 130 70 Q180 60 220 35 Q250 20 328 18" stroke="#3B5BDB" strokeWidth="3" strokeDasharray="7 4" fill="none" opacity="0.85"/>
      <circle cx="30" cy="105" r="8" fill="#12B76A"/>
      <circle cx="30" cy="105" r="4" fill="white"/>
      <circle cx="328" cy="18" r="10" fill="#3B5BDB"/>
      <circle cx="328" cy="18" r="4" fill="white"/>
    </svg>
  )
}

function RideDetailScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Ride Details" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4" style={{ scrollbarWidth: 'none' }}>
        <div>
          <p style={{ fontSize: 13, color: '#98A2B3' }}>Monday, Oct 21 · 8:15 AM</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: '#101828', letterSpacing: '-0.4px', marginTop: 2 }}>Mansarovar Metro → VGU Jaipur</p>
        </div>
        <MiniMapThumbnail />
        {/* Rider card (compact) */}
        <div className="flex items-center gap-3 p-3.5 rounded-[12px]" style={{ border: '1.5px solid #E4E7EC' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#EDF1FF' }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#3451B2' }}>RS</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>Rohit S.</span>
              <VerifiedBadge />
            </div>
            <p style={{ fontSize: 11, color: '#98A2B3' }}>Honda Activa · KA-01 MX 2234</p>
          </div>
          <div className="flex items-center gap-1">
            <IC.star /><span style={{ fontSize: 12, fontWeight: 600, color: '#667085' }}>4.8</span>
          </div>
        </div>
        {/* Cost breakdown */}
        <div className="rounded-[14px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
          <div className="px-4 py-3" style={{ background: '#F7F8FA', borderBottom: '1px solid #E4E7EC' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Cost breakdown</p>
          </div>
          {[
            { label: 'Distance', value: '10.2 km' },
            { label: 'Fuel share (10.2 km × ₹3.9/km)', value: '₹40' },
            { label: 'Platform fee', value: '₹3' },
          ].map((row, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #F2F4F7' }}>
              <span style={{ fontSize: 13, color: '#667085' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#344054' }}>{row.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3.5">
            <span style={{ fontSize: 14, fontWeight: 700, color: '#101828' }}>Total paid</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: '#101828' }}>₹43</span>
          </div>
          <div className="px-4 pb-3.5 flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full" style={{ background: '#F2F4F7', fontSize: 11, fontWeight: 600, color: '#344054' }}>Cash</span>
            <span style={{ fontSize: 11, color: '#98A2B3' }}>Paid at end of ride</span>
          </div>
        </div>
        {/* Rating */}
        <div className="flex items-center justify-between px-4 py-3.5 rounded-[12px]" style={{ background: '#F9FAFB', border: '1.5px solid #E4E7EC' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#344054' }}>Your rating for Rohit S.</span>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map(s => (
              <svg key={s} width="16" height="16" viewBox="0 0 24 24" fill={s <= 5 ? '#F79009' : '#E4E7EC'} stroke={s <= 5 ? '#F79009' : '#E4E7EC'} strokeWidth="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function NotifPrefsScreen({ onBack }: { onBack: () => void }) {
  const [prefs, setPrefs] = useState({ accepted: true, reminders: true, cancelled: true, matching: false, promos: false })
  const set = (k: keyof typeof prefs) => (v: boolean) => setPrefs(p => ({ ...p, [k]: v }))
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Notification Preferences" onBack={onBack} />
      <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <SectionHeader label="Ride Alerts" />
        <SettingRow icon={<IC.check />} iconBg="#ECFDF3" label="Ticket accepted" toggle toggleValue={prefs.accepted} onToggle={set('accepted')} />
        <SettingRow icon={<IC.bell />} iconBg="#EEF2FF" label="Ride reminders" toggle toggleValue={prefs.reminders} onToggle={set('reminders')} />
        <SettingRow icon={<IC.flag />} iconBg="#FFF1F2" label="Cancellations" toggle toggleValue={prefs.cancelled} onToggle={set('cancelled')} />
        <SettingRow icon={<IC.star />} iconBg="#FFFBEB" label="New matching tickets" toggle toggleValue={prefs.matching} onToggle={set('matching')} noBorder />
        <SectionHeader label="General" />
        <SettingRow icon={<IC.info />} iconBg="#F7F8FA" label="Promotions and updates" toggle toggleValue={prefs.promos} onToggle={set('promos')} noBorder />
        <div className="px-4 py-4">
          <p style={{ fontSize: 12, color: '#98A2B3', lineHeight: 1.6 }}>
            Important safety and account alerts are always sent regardless of these preferences.
          </p>
        </div>
      </div>
    </div>
  )
}

const FAQS = [
  { q: 'How is the fuel share calculated?', a: 'Fuel share = distance × ₹3.9/km + ₹3 platform fee. For a 10 km ride: ₹39 + ₹3 = ₹42 total. Both amounts are shown separately before you confirm.' },
  { q: 'What if my rider cancels?', a: "If a rider cancels, you'll be notified immediately and your ticket goes back to active. Frequent cancellations affect a rider's rating and may limit their access." },
  { q: 'How does verification work?', a: 'You upload a photo of your college ID. Our team reviews it within 24 hours. Once approved, you get full access to SaathChalo and a Verified badge on your profile.' },
  { q: 'Can I be both a Customer and a Rider?', a: "Yes. You can switch roles anytime from your Profile. As a Rider, you post your regular route and accept co-riders. As a Customer, you raise tickets for rides you need." },
  { q: 'Is my personal information safe?', a: "Your phone number is never shown to other users — calls go through a masked number. Your ID is used only for verification and is never shared with riders or customers." },
]

function HelpSupportScreen({ onBack }: { onBack: () => void }) {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Help & Support" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4" style={{ scrollbarWidth: 'none' }}>
        <button className="w-full flex items-center gap-3 p-4 rounded-[14px]"
          style={{ background: '#EDF1FF', border: '1.5px solid #BAC8FF' }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#3B5BDB' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          </div>
          <div className="text-left">
            <p style={{ fontSize: 14, fontWeight: 700, color: '#3451B2' }}>Contact Support</p>
            <p style={{ fontSize: 12, color: '#4C6EF5' }}>Chat with us · Usually replies in 5 min</p>
          </div>
          <IC.chevron />
        </button>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#344054', marginBottom: 12 }}>Frequently asked questions</p>
          <div className="rounded-[14px] overflow-hidden" style={{ border: '1.5px solid #E4E7EC' }}>
            {FAQS.map((faq, i) => (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? '1px solid #F2F4F7' : 'none' }}>
                <button
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                  onClick={() => setOpen(open === i ? null : i)}>
                  <span className="flex-1" style={{ fontSize: 13, fontWeight: 600, color: '#101828', lineHeight: 1.45 }}>{faq.q}</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ flexShrink: 0, transform: open === i ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>
                {open === i && (
                  <div className="px-4 pb-4" style={{ borderTop: '1px solid #F2F4F7' }}>
                    <p style={{ fontSize: 13, color: '#667085', lineHeight: 1.7, paddingTop: 10 }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SafetyCenterScreen({ onBack, onEmergencyContact }: { onBack: () => void; onEmergencyContact: () => void }) {
  const features = [
    { icon: <IC.sos />, color: '#FEF3F2', iconColor: '#B42318', title: 'SOS Button', desc: 'Tap during any ride to instantly alert emergency contacts with your live location.' },
    { icon: <IC.share />, color: '#EDF1FF', iconColor: '#3451B2', title: 'Share Trip', desc: 'Share a live trip link with anyone — family or friends can track in real time, no app needed.' },
    { icon: <IC.shield />, color: '#ECFDF3', iconColor: '#027A48', title: 'ID Verification', desc: 'Every user is verified with a college ID before their first ride. No anonymous accounts.' },
    { icon: <IC.users />, color: '#FDF4FF', iconColor: '#9333EA', title: 'Community Guidelines', desc: 'All SaathChalo riders agree to our community rules: fuel-share only, respectful behaviour, traffic safety.' },
  ]
  return (
    <div className="flex flex-col h-full">
      <ScreenTopBar title="Safety Center" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4" style={{ scrollbarWidth: 'none' }}>
        <p style={{ fontSize: 14, color: '#667085', lineHeight: 1.7 }}>
          SaathChalo is built for verified college communities. These features keep every ride safe.
        </p>
        {features.map((f, i) => (
          <div key={i} className="flex items-start gap-3.5 p-4 rounded-[14px]" style={{ background: '#F9FAFB', border: '1.5px solid #F2F4F7' }}>
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ background: f.color, color: f.iconColor }}>
              {f.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 14, fontWeight: 700, color: '#101828', marginBottom: 3 }}>{f.title}</p>
              <p style={{ fontSize: 12, color: '#667085', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          </div>
        ))}
        <button onClick={onEmergencyContact}
          className="w-full flex items-center gap-3 px-4 py-4 rounded-[14px]"
          style={{ background: '#FFF8ED', border: '1.5px solid #FEDF89' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#FFFAEB' }}>
            <IC.phone />
          </div>
          <div className="text-left flex-1">
            <p style={{ fontSize: 14, fontWeight: 700, color: '#B45309' }}>Edit Emergency Contact</p>
            <p style={{ fontSize: 12, color: '#92400E' }}>Sunita Mehta · Mother</p>
          </div>
          <IC.chevron />
        </button>
      </div>
    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────────

export default function CommonContent({
  screen, setScreen, onGoHome,
}: {
  screen: CommonScreen
  setScreen: (s: CommonScreen) => void
  onGoHome: () => void
}) {
  // Track whether sub-screens were opened from profile or directly (e.g. via bottom nav)
  const [fromProfile, setFromProfile] = useState(false)

  const goToFromProfile = (s: CommonScreen) => {
    setFromProfile(true)
    setScreen(s)
  }
  const backFromSubscreen = () => {
    if (fromProfile) {
      setFromProfile(false)
      setScreen('profile')
    } else {
      onGoHome()
    }
  }

  return (
    <div className="absolute inset-0 bg-white flex flex-col overflow-hidden" style={{ borderRadius: '40px' }}>
      <div style={{ height: 44, flexShrink: 0 }} />
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {screen === 'notif-list'         && <NotifList onBack={onGoHome} onDetail={() => setScreen('notif-detail')} />}
        {screen === 'notif-empty'        && <NotifEmpty onBack={onGoHome} />}
        {screen === 'notif-detail'       && <NotifDetail onBack={() => setScreen('notif-list')} />}
        {screen === 'profile'            && <ProfileScreen setScreen={goToFromProfile} onGoHome={onGoHome} />}
        {screen === 'edit-profile'       && <EditProfileScreen onBack={backFromSubscreen} />}
        {screen === 'verify-status'      && <VerifyStatusScreen onBack={backFromSubscreen} />}
        {screen === 'emergency-contact'  && <EmergencyContactScreen onBack={backFromSubscreen} />}
        {screen === 'ride-history'       && <RideHistoryScreen onBack={backFromSubscreen} onDetail={() => setScreen('ride-detail')} />}
        {screen === 'ride-detail'        && <RideDetailScreen onBack={() => setScreen('ride-history')} />}
        {screen === 'notif-prefs'        && <NotifPrefsScreen onBack={backFromSubscreen} />}
        {screen === 'help-support'       && <HelpSupportScreen onBack={backFromSubscreen} />}
        {screen === 'safety-center'      && <SafetyCenterScreen onBack={backFromSubscreen} onEmergencyContact={() => setScreen('emergency-contact')} />}
      </div>
    </div>
  )
}
