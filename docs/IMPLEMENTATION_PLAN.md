# SaathChalo — Implementation Plan & To-Do List

> Phased plan to convert the existing Figma-faithful **UI prototype** into a fully working web MVP,
> following the build order in `docs/trd.md` §12 and screen inventory in `docs/prd.md` §11.
> Companion doc: `docs/PROJECT_CONTEXT.md`. Mark boxes as tasks complete.

---

## Guiding Principles

1. **Figma screens = visual source of truth** — already implemented; preserve them exactly.
2. **PRD/TRD = source of truth** for data, behavior, and integrations.
3. **Free-tier only** (Firebase Spark, OSM tiles, browser APIs). No paid services.
4. **Incremental wiring:** keep the prototype navigable at every step; replace hardcoded data with Firebase-backed state screen-group by screen-group.
5. **Mobile-first, then responsive:** keep the phone-frame experience working; add real responsive layout (map + side panel ≥768px) in a later phase.
6. Follow existing code conventions: inline-style design tokens + Tailwind layout utilities, inline SVG icons, screen-union-type flows, config-driven sheet sizing.

---

## Phase 0 — Foundation & Project Config

**Goal:** real app shell (routing, env, PWA tooling) around the existing screens.

- [ ] 0.1 Rename package: update `package.json` name to `saathchalo-web`; update `index.html` title/meta to SaathChalo.
- [ ] 0.2 Install deps: `react-router-dom`, `firebase`, `leaflet`, `react-leaflet`, `@types/leaflet`, `zustand`, `vite-plugin-pwa`.
- [ ] 0.3 Create `src/lib/firebase.ts` (initializeApp with env-based config: Auth, Firestore, RTDB, Storage, Messaging).
- [ ] 0.4 Create `.env.example` with Firebase web config keys + Vite env typing in `src/vite-env.d.ts`.
- [ ] 0.5 Add route structure with React Router: `/` (app shell), `/onboarding/*`, `/share/:token` (public trip view), auth-guarded app area.
- [ ] 0.6 Add auth-state context/provider (`src/context/AuthContext.tsx`) wrapping current `role`/`appSection` state so existing flows keep working during migration.
- [ ] 0.7 Replace manual `public/sw.js` + `public/manifest.webmanifest` with `vite-plugin-pwa` config (generate manifest icons in multiple sizes).
- [ ] 0.8 Verify build (`pnpm build`) and dev preview still show the prototype unchanged.

**Acceptance:** prototype renders identically; routing + env scaffold in place; no console errors.

---

## Phase 1 — Authentication & User Data Model

**Goal:** real Firebase Auth + Firestore user profiles replace the hardcoded onboarding state.

- [ ] 1.1 Implement email/password sign-up & sign-in in `AuthContext`; expose `user`, `loading`, `signUp`, `signIn`, `signOut`.
- [ ] 1.2 On first sign-up, create Firestore `users/{uid}` doc: `{ name, email, role: null, verificationStatus: 'none', createdAt }`.
- [ ] 1.3 Wire `OnboardingFlow` auth screens to real Firebase calls (replace fake email-sent delay with `sendEmailVerification`).
- [ ] 1.4 After email verified, show Profile Setup screen → update `users/{uid}` with `{ name, phone, collegeId, gender }`.
- [ ] 1.5 Implement College ID upload → Firebase Storage (`users/{uid}/college-id.jpg`); store download URL in user doc.
- [ ] 1.6 Role-select screen writes `users/{uid}.role = 'customer' | 'rider'`; redirect to appropriate home.
- [ ] 1.7 Verification status field (`none | pending | approved | rejected`) drives which screens are accessible.
- [ ] 1.8 Protect app routes: unauthenticated → `/onboarding/auth`; no role → `/onboarding/choose-role`.

**Acceptance:** can sign up, verify email, upload ID, pick role, and land on the correct home screen. Data persists in Firestore.

---

## Phase 2 — Customer Flow: Tickets & Matching

**Goal:** replace hardcoded ticket/search data with Firestore CRUD + simple geo matching.

- [ ] 2.1 Define `Ticket` type matching TRD §5.2: `{ id, creatorId, from, to, fromLatLng, toLatLng, departureTime, days[], womenOnly, repeatWeekly, status, createdAt }`.
- [ ] 2.2 Create-ticket form (`ticket-form` screen) writes to `tickets/{id}` in Firestore.
- [ ] 2.3 "My Tickets" list screen queries `tickets` where `creatorId == uid`, ordered by `createdAt desc`.
- [ ] 2.4 Searching screen: query open tickets where `from` is within bounding box of user's selected origin (TRD §4.4 heuristic).
- [ ] 2.5 Implement ticket status transitions: `open → matched → in_progress → completed / cancelled`.
- [ ] 2.6 When a Rider accepts, update ticket status + notify Customer (Firestore `onSnapshot`).
- [ ] 2.7 Fare display: always two line items — `distance × ₹3.9/km` + `₹3 platform fee`. Never use "fare" or "driver earns" language.
- [ ] 2.8 Persist day-selection chips, women-only toggle, and repeat-weekly toggle to the ticket document.

**Acceptance:** Customer can create a ticket, see it in "My Tickets", and a simulated Rider acceptance updates the UI in real time.

---

## Phase 3 — Rider Flow: Setup, Post Trip, Accept

**Goal:** wire Rider onboarding (vehicle, documents, promise) and trip posting to Firebase.

- [ ] 3.1 Extend `users/{uid}` with rider fields: `{ vehicle: { type, model, plate }, licenseUrl, insuranceUrl }`.
- [ ] 3.2 Setup-vehicle screen → save vehicle info to user doc.
- [ ] 3.3 Setup-documents screen → upload driving license + insurance to Storage; store URLs.
- [ ] 3.4 Setup-promise (community guidelines) → write `users/{uid}.acceptedPromise = true`.
- [ ] 3.5 Post-trip screen writes to `trips/{id}`: `{ riderId, from, to, departureTime, seats, days[], womenOnly, status }`.
- [ ] 3.6 Available-tickets list (for Rider): query open tickets whose route intersects the Rider's trip route.
- [ ] 3.7 Ticket-detail screen shows customer info + route; "Accept" button updates ticket status to `matched`.
- [ ] 3.8 Rider home shows active trip status, pending requests badge, and fuel-cost-covered stat (hardcoded formula for MVP).

**Acceptance:** Rider completes 3-step setup, posts a trip, sees matching tickets, and accepts one — both sides see the status change.

---

## Phase 4 — Active Ride: OTP, Status Machine, Ride Summary

**Goal:** implement the full ride lifecycle with OTP verification and real-time status sync.

- [ ] 4.1 Generate a 4-digit OTP when Rider marks "arrived at pickup"; store in `rides/{id}.otp`.
- [ ] 4.2 Customer enters OTP on `verify-otp` screen; on match, transition ride status to `in_progress`.
- [ ] 4.3 Ride status enum: `accepted → heading_to_pickup → arrived → in_progress → completed`.
- [ ] 4.4 Both Customer and Rider screens subscribe to `rides/{id}` via `onSnapshot` for instant updates.
- [ ] 4.5 Ride Summary screen: distance, duration, fuel share breakdown (`distance × ₹3.9/km` + `₹3 platform fee`), date/time.
- [ ] 4.6 Rating screen (1–5 stars + optional text) writes to `ratings/{rideId}` and updates `users/{uid}.avgRating`.
- [ ] 4.7 "Rate Co-Rider" for Rider mirrors the same flow in reverse.
- [ ] 4.8 Ride history: query `rides` where participant includes `uid`, ordered by `completedAt desc`.

**Acceptance:** full ride lifecycle works end-to-end between two browser tabs (Customer + Rider) with live status updates and mutual rating.

---

## Phase 5 — Map: Leaflet + OSM + Live Location

**Goal:** replace the SVG placeholder map with a real interactive map and live location sharing.

- [ ] 5.1 Install Leaflet CSS/JS; create `src/components/LiveMap.tsx` wrapping `react-leaflet` `<MapContainer>`.
- [ ] 5.2 Replace `src/components/Map.tsx` SVG with `LiveMap` for all map modes.
- [ ] 5.3 Use browser Geolocation API (`navigator.geolocation.watchPosition`) for foreground tracking.
- [ ] 5.4 Push location updates to RTDB: `live-locations/{rideId}/{userId}` → `{ lat, lng, heading, updatedAt }`.
- [ ] 5.5 Customer sees Rider marker moving in real time during pickup and ride.
- [ ] 5.6 Rider sees Customer pickup marker.
- [ ] 5.7 Route polyline: draw simplified polyline between `from` and `to` (OSRM free API or straight-line fallback).
- [ ] 5.8 Clear `live-locations/{rideId}` on ride completion.
- [ ] 5.9 Handle geolocation permission denied gracefully with fallback static map.

**Acceptance:** real map tiles render; two users see each other's markers updating live; route line drawn.

---

## Phase 6 — Notifications, SOS & Trip Sharing

**Goal:** push notifications, emergency SOS flow, and public trip-sharing link.

- [ ] 6.1 FCM setup: request permission, store device token in `users/{uid}.fcmToken`.
- [ ] 6.2 Trigger push on: ticket accepted, rider arriving, ride completed, verification approved/rejected.
- [ ] 6.3 In-app notification bell: query `notifications/{uid}`, show unread badge.
- [ ] 6.4 SOS button: confirm dialog → write `sos-alerts/{rideId}` with location + timestamp.
- [ ] 6.5 SOS confirmation screen shows "help is on the way" + option to call 112.
- [ ] 6.6 Share Trip: generate public URL `/share/{token}` → `shared-trips/{token}` → `{ rideId, riderName, route }`.
- [ ] 6.7 Public shared-trip view (no login): read-only live map showing ride progress.
- [ ] 6.8 Expire shared-trip token after ride completion.

**Acceptance:** push arrives on ticket acceptance; SOS writes alert doc; `/share/:token` renders live map without auth.

---

## Phase 7 — Profile, Settings & Responsive Layout

**Goal:** complete profile management and make the app truly responsive.

- [ ] 7.1 Profile screen: display name, college, role, verification badge, avg rating; edit name/phone.
- [ ] 7.2 Settings: notification toggles, women-only preference, delete account (soft-delete user doc).
- [ ] 7.3 Ride History tab: list past rides with date, route, co-rider name, rating given.
- [ ] 7.4 Responsive breakpoint ≥768px: map fills left side, bottom sheet becomes right side panel (TRD §3.2).
- [ ] 7.5 Desktop/tablet nav: replace bottom tab bar with left sidebar or top nav.
- [ ] 7.6 Ensure all Figma screens render correctly at 360px, 768px, and 1280px widths.

**Acceptance:** profile CRUD works; app is usable and visually correct on mobile, tablet, and desktop.

---

## Phase 8 — PWA, Offline & Deployment

**Goal:** make the app installable, offline-resilient, and deployed.

- [ ] 8.1 Configure `vite-plugin-pwa`: manifest (name, icons 192/512, theme color, start URL), SW caching.
- [ ] 8.2 Enable Firestore offline persistence (`enableIndexedDbPersistence`) for tickets/rides caching.
- [ ] 8.3 Add "Add to Home Screen" prompt detection (beforeinstallprompt) with custom install banner.
- [ ] 8.4 Deploy to Firebase Hosting: `firebase init hosting`, build, deploy.
- [ ] 8.5 Verify HTTPS-dependent APIs (Geolocation, Push, Service Worker) on deployed URL.
- [ ] 8.6 Test PWA install flow on a real Android device (Chrome).
- [ ] 8.7 Lighthouse PWA audit: aim for ≥90 PWA score.

**Acceptance:** app is installable from browser; works offline for cached screens; live at a public URL.

---

## Phase 9 — Firestore Security Rules & Final QA

**Goal:** lock down data access and verify the full flow end-to-end.

- [ ] 9.1 Firestore Security Rules per TRD §8: users read/write own doc; tickets readable by verified same-community users; rides readable only by participants; ratings writable once per participant.
- [ ] 9.2 RTDB rules: `live-locations/{rideId}` writable only by ride participants.
- [ ] 9.3 Storage rules: users upload/read only under `users/{uid}/`.
- [ ] 9.4 Test all rules with Firebase Rules Playground.
- [ ] 9.5 E2E test: two users complete sign-up → verification → match → ride → OTP → summary → rating.
- [ ] 9.6 Cross-browser test: Chrome Android, Chrome Desktop, Edge, Safari (best-effort).
- [ ] 9.7 Remove all `console.log` statements and hardcoded demo data.
- [ ] 9.8 Final build check: `pnpm build` succeeds with zero errors.

**Acceptance:** all security rules enforced; full E2E flow works with two real accounts; zero build errors.

---

## Master Checklist (Quick Reference)

| Phase | Focus | Key Deliverable |
|-------|-------|-----------------|
| 0 | Foundation | Router, Firebase init, PWA tooling, env config |
| 1 | Auth & Users | Email auth, Firestore user docs, role selection |
| 2 | Customer Tickets | Ticket CRUD, search/match, real-time status |
| 3 | Rider Flow | Vehicle setup, doc upload, trip post, accept |
| 4 | Active Ride | OTP, status machine, summary, rating |
| 5 | Map & Location | Leaflet + OSM, live markers, route polyline |
| 6 | Notify / SOS / Share | FCM push, SOS alert, public trip link |
| 7 | Profile & Responsive | Settings, history, tablet/desktop layout |
| 8 | PWA & Deploy | Installable, offline cache, Firebase Hosting |
| 9 | Security & QA | Firestore rules, E2E test, final build |

---

## Branding & Language Rules (enforced everywhere)

- Always say **"fuel share"** — never "fare", "earning", "driver income", or "payment to rider".
- Cost is always shown as **two line items**: `distance × ₹3.9/km` + `₹3 platform fee`.
- The person with the vehicle is a **"Rider"**; the co-traveler is a **"Customer"**.
- App name in UI: **SaathChalo** (tagline: "Together, let's go").
- No commercial transport language anywhere in copy, comments, or variable names.

---

*End of Implementation Plan.*