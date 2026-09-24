# SaathChalo — Project Context

> **Single source of truth for anyone (human or AI agent) working on this codebase.**
> Derived from `docs/prd.md` (Product Requirements) and `docs/trd.md` (Technical Requirements).
> Last updated: 2026-09-24

---

## 1. What Is SaathChalo?

**SaathChalo** (Hindi: "let's travel together"; one word, capital S and capital C) is a **verified, closed-community ride-sharing web app** for daily commutes, starting with students at **Vivekananda Global University (VGU), Jaipur**.

- A bike/scooter owner (**"Rider"**) already travels a fixed route daily and has an empty pillion seat.
- A student who needs a ride (**"Customer"**) raises a ticket (pickup, drop, time window), usually the night before.
- The Rider accepts; the Customer pays only a **fuel-cost share** — cheaper than Ola/Uber/Rapido.
- It is **NOT a taxi marketplace**. Riders never "earn" — they recover fuel cost. This framing is legal and trust-critical.

**Naming:** the docs still say "SaathChalo" (working name). The product was renamed to **SaathChalo** before build. All user-facing copy must say *SaathChalo*; "SaathChalo" appears only in the reference docs.

**Purpose:** college startup pitch competition — a fully working web MVP built from existing Figma screens, on **free-tier infrastructure only** (Firebase Spark plan).

---

## 2. Goals & Non-Goals (MVP)

### Goals
1. Match verified students travelling the same route at the same time.
2. Transparent cost split framed as **"fuel share"**, never a "fare".
3. First ride with a stranger feels safe: ID verification, OTP ride-start, live location, SOS, trip sharing.
4. Prove demand with a real VGU pilot.
5. Ship fast from existing Figma designs as a responsive, installable PWA.

### Non-Goals (explicitly out of scope)
- Multi-city / multi-college matching (single campus only).
- Real-time on-demand hailing (MVP = scheduled/recurring/night-before tickets).
- In-app real-money payments (cash/UPI outside the app; app only calculates cost).
- Four-wheelers (two-wheeler pillion only).
- Any commercial transport / driver-for-hire features.
- Native app-store distribution (PWA only).
- Background (screen-locked) location tracking — browser limitation; foreground-only is accepted and must be communicated in-app.

---

## 3. Personas

| Persona | Description | Key need |
|---|---|---|
| **Customer** — "Ananya, 2nd year" | 8–12 km from campus, no vehicle, spends ₹1,000–2,000/mo on autos | Safety, predictability, cost; verified female rider option |
| **Rider** — "Rohit, 3rd year" | Owns a bike, same route daily, empty pillion | Zero extra effort, no legal risk, no no-shows |
| **Parent/Guardian** (indirect) | Decides if student "may" use it | Safety — verification, SOS, trip sharing exist partly for them |
| **College Admin** (future B2B) | Parking pressure, safety, sustainability | Not an MVP user |

---

## 4. Content & Branding Rules (enforce everywhere)

- Currency: **₹**. Always say **"fuel share"** / **"fuel cost covered"**.
- **NEVER** use: "fare", "earn", "earnings", "income", "profit", "commission", "driver".
- Never show another user's raw phone number → use **"Call (masked)"**.
- Cost formula shown as **two separate line items**: `Fuel share = distance × ₹3.9/km` + `Platform fee ₹3` = Total. Never a single blended number.
- UI text in English; fictional sample data only.
- App name: **SaathChalo** everywhere (splash, auth, "About SaathChalo", legal copy).
- Tagline: *"Chalo, saath chalein"*.

---

## 5. Design System (from Figma)

| Token | Value |
|---|---|
| Primary | `#3B5BDB` |
| Primary-dark | `#2B44B0` |
| Primary-light | `#EDF1FF` |
| Success | `#12B76A` |
| Warning | `#F79009` |
| Danger / SOS | `#E5484D` |
| Text-primary | `#101828` |
| Text-secondary | `#667085` |
| Border | `#E4E7EC` |
| Surface | `#FFFFFF` |
| Background | `#F7F8FA` |

- **Font:** Inter (400/500/600/700/800). H1 24/32 · H2 20/28 · Title 16/24 · Body 14/20 · Caption 12/16.
- **Spacing:** 4 / 8 / 12 / 16 / 24 / 32.
- **Radius:** 8 inputs · 12 cards · 16 buttons · 24 sheet top corners · full chips/pills.
- **Sheet shadow:** `0 -4px 20px rgba(16,24,40,0.12)`.
- **Layout pattern:** full-screen map + draggable bottom sheet (peek ≈ 248–280px, half ≈ 500px, full ≈ 760–790px). Sheet transitions: 300ms ease-out (code uses `0.32s cubic-bezier(0.32,0.72,0,1)`).
- **Responsive rule (TRD §3.2):** mobile-first at 375–430px; above ~768px the map + bottom sheet becomes **map + side panel** (not a stretched mobile view).

---

## 6. Technology Stack (per TRD §3)

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 19 + Vite 8 + TypeScript 5.7 | Already scaffolded |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | No tailwind.config needed; theme in `src/index.css` |
| Routing | React Router | **Not yet installed** — must add |
| Auth | Firebase Auth (email-link + Google) | Free tier; phone OTP deferred (Blaze-only) |
| Documents DB | Cloud Firestore | users / tickets / rides / ratings |
| Live location | Firebase Realtime Database | High-frequency small writes |
| Files | Firebase Storage | ID card, license, profile photos |
| Push | Firebase Cloud Messaging (web push via SW) | Android Chrome / desktop Chrome primary |
| Maps | Leaflet + OSM tiles (`react-leaflet`) | Replaces current SVG placeholder map |
| Geolocation | Browser `navigator.geolocation` | Free, foreground-only |
| State | React Context + hooks (or Zustand) | |
| PWA | `vite-plugin-pwa` | Manual `public/sw.js` + `manifest.webmanifest` exist today |
| Hosting | Firebase Hosting | HTTPS (required for Geolocation + Push) |

**Free-tier budget (Spark plan):** ~50–55 live rides/day based on ~360 location writes per 30-min ride — fine for a pilot, known scaling constraint.

---

## 7. Architecture & Data Model (TRD §2, §5)

Client-heavy web app + Firebase BaaS. No custom server; business logic = client code + Firestore Security Rules.

```
users/{uid}           profile, role(s), verificationStatus, rating, vehicle (rider), emergencyContact
tickets/{ticketId}    customerId, pickup/drop (geohash + locality), timeWindow, days[],
                      womenOnly, status (open/accepted/completed/cancelled), fuelShareEstimate
rides/{rideId}        riderId, customerId, ticketId, otp (hashed), status
                      (accepted/heading-to-pickup/started/completed/cancelled), costBreakdown
ratings/{rideId}      ratingBy, stars, tags[], comment
liveLocation/{rideId} (Realtime DB) lat/lng/heading/timestamp — written every ~5s during ride only
sharedTrips/{token}   time-limited public trip-share access for non-users
```

### Security highlights (TRD §8)
- Users read/write only their own `users/{uid}`; public subset exposed for matching.
- Ticket writable only by its `customerId`; exact pickup hidden until ride `accepted`.
- Live location readable only by matched rider + customer (+ scoped time-limited share token).
- All enforcement via Security Rules — never client-side checks alone.

---

## 8. Feature Modules (PRD §7 ↔ TRD §4)

| Module | Key behaviors |
|---|---|
| **Onboarding & Identity** | Splash → email-link/Google auth → profile (name + locality only) → college ID upload → manual admin review (pending/verified/rejected) → role select (Customer / Rider / Both) |
| **Rider Setup** | Vehicle type/model/reg no. + helmet → license + RC upload → Community Promise agreement → verification status screens |
| **Create/My Tickets** | Pickup/drop selection, time window, day chips (M–S), repeat-weekly, women-only toggle, fuel-share estimate, raise ticket |
| **Matching** | Scheduled/night-before; geohash bounding-box proximity heuristic; women-only filter; recurring matches |
| **Active Ride** | Rider accepts → heading to pickup → **4-digit OTP** verified by rider to start → in progress → slide-to-end → summary (fuel share + platform fee + payment mode) → mutual rating |
| **Live Location** | Foreground geolocation, writes every ~5s between `started` and `completed`; smoothed marker interpolation |
| **Ratings** | 1–5 stars + tags ("On time", "Friendly", "Followed rules", "Ready with OTP") + optional comment; cancellations affect rating |
| **Notifications** | FCM web push: accepted, reminders, cancellations, new matching tickets |
| **SOS & Trip Sharing** | Hold-to-confirm SOS → alert emergency contact + share live location + call actions; public share-trip link for non-users (no login) |

**Pricing example used in UI:** 10 km ride → `₹39 fuel share (10 × ₹3.9) + ₹3 platform fee = ₹42 total` — always shown as separate lines.

---

## 9. Screen Inventory (all built as prototype — PRD §11)

**Customer (7):** Home idle · searching · ticket form · waiting · rider accepted · rider arriving · ride in progress
**Rider (18):** setup vehicle/documents/promise · verification pending/verified/rejected · rider home idle/requests · post trip · tickets list/empty/detail/accepted · heading to pickup · verify OTP · ride in progress · ride summary · rate co-rider
**Common (12):** notifications list/empty/detail · profile · edit profile · verification status · emergency contact · ride history/detail · notification prefs · help & support · safety center
**Onboarding (14):** splash intro + 3 slides · auth · email sent · profile · college ID · guidelines · verify pending/approved/rejected · choose role · role confirmed
**SOS (7):** confirm · holding · active · calling · shared · cancel confirm · ended
**Public (not yet built):** shared-trip live view opened via link, no login required.

---

## 10. Current Codebase State

The app is currently a **high-fidelity interactive prototype**: every screen exists and is navigable, but all data is hardcoded sample data, navigation is state-based (no router), the map is a stylized SVG, and there is no backend.

| File | Role |
|---|---|
| `src/main.tsx` | Entry; registers `public/sw.js` in prod |
| `src/App.tsx` | Phone frame (390×844), section routing (onboarding/customer/rider/common), top bar, bottom sheet sizing per screen, customer screens + bottom navs, demo screen-picker dropdowns, SOS overlay mount |
| `src/OnboardingFlow.tsx` | All 14 onboarding screens + SVG illustrations |
| `src/RiderFlow.tsx` | All 18 rider screens; exports `RIDER_SHEET_CONFIG`, `RIDER_HIDE_TOPBAR`, `RIDER_SHOW_NAV` |
| `src/CommonFlow.tsx` | All 12 common screens (list-based, no map) |
| `src/SOSFlow.tsx` | 7 SOS screens with live timer |
| `src/components/Map.tsx` | SVG placeholder map, 9 `MapMode`s (idle/searching/route/radar/bike-near/in-progress/route-detour/dark/static) |
| `src/index.css` | Tailwind v4 import + Inter font + radar/breathe keyframes |
| `public/` | `manifest.webmanifest`, `sw.js`, app icon |

**Conventions in use (follow in all new code):**
- Inline-style objects for exact Figma tokens + Tailwind utilities for layout
- Small inline SVG icon components per file (Lucide-style)
- Screen-state union types per flow (`OnboardingScreen`, `RiderScreen`, `CommonScreen`, `SOSScreen`)
- Sheet height/position driven by config records (`*_SHEET_CONFIG`)
- 300–320ms ease-out transitions
- `docs/` folder for planning documents; `src/imports/pasted_text/` for original Figma briefs

---

## 11. Known MVP Limitations (disclose in pitch)

1. No server-side validation (Cloud Functions = paid plan) — client-side logic acceptable for trusted pilot.
2. No phone-OTP login (Blaze-only) — email-link/Google instead.
3. Manual ID/license verification (no OCR/KYC).
4. Matching is a bounding-box/geohash heuristic, not true route-overlap.
5. Free OSM tiles are pilot-grade only.
6. **Foreground-only location tracking** — tab must stay open during a ride; say so in-app ("Keep this tab open during your ride").
7. iOS Safari PWA/push gaps — Android-first pilot; iOS best-effort.

---

## 12. Success Metrics (post-build)

Weekly active users · % tickets accepted in window · completion vs cancellation rate · avg ₹ saved vs Ola/Rapido · recurring ticket adoption · avg rating + zero safety incidents · PWA install rate.

---

## 13. Reference Docs

- `docs/prd.md` — product requirements (personas, legal framing, features, revenue, roadmap)
- `docs/trd.md` — technical spec (architecture, data model, security, build instructions)
- `docs/IMPLEMENTATION_PLAN.md` — phased build plan + to-do list (companion to this file)
- `src/imports/pasted_text/*.md` — original Figma design briefs per page (design source of truth for visuals)

