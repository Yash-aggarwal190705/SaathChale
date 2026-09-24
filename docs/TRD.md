# Technical Requirements Document (TRD)
## SaathChalo — Web App MVP Technical Specification

**Document owner:** Yash
**Companion document:** PRD.md (product requirements, web app version)
**Version:** 2.0 (Web)
**Status:** Draft for AI build agent — implement against existing Figma screens

---

## 0. Change Note (v1 → v2)

This is the web-app version of the original SaathChalo TRD (v1, Flutter mobile). The data model, Firebase services, and business logic are almost entirely unchanged — only the **client layer** changes, from Flutter/Dart to a responsive web front end. Sections 3, 4, 6, and 9 have the most meaningful edits; the Firestore/Realtime Database schemas in Section 5 are copied over as-is since they are platform-agnostic.

---

## 1. Purpose and Scope

This document defines the technical implementation of SaathChalo's web MVP: architecture, data model, APIs/interfaces, third-party services, security, and non-functional constraints, so that an AI coding agent can build a fully working web app from the existing Figma screens. It assumes the product scope defined in PRD.md (single-college pilot, two-wheeler pillion sharing, scheduled/recurring matching, no in-app payments).

Everything here is scoped to be buildable on **free-tier infrastructure**, since this is a student competition project with no funding yet. Paid-tier upgrade paths are noted where relevant.

**Instruction to the build agent:** treat the Figma file as the source of truth for visual design (layout, spacing, typography, component states, colors). This document is the source of truth for data, behavior, and integrations. Where Figma shows a fixed mobile frame, implement it responsively per Section 3.2 rather than reproducing a fixed pixel width.

---

## 2. System Overview

SaathChalo is a **client-heavy web app with a lightweight managed backend** (Firebase), not a custom server. There is no dedicated application server for the MVP — business logic lives in the web client plus Firestore Security Rules, which is sufficient at pilot scale and avoids any paid compute tier.

```
┌───────────────────────────┐        ┌──────────────────────────┐
│   Web App (React + Vite)   │        │      Firebase (BaaS)      │
│  Responsive, installable    │◄──────►│  - Authentication          │
│  as a PWA                   │        │  - Firestore (documents)   │
│                              │        │  - Realtime Database        │
│  - Customer flow             │        │    (live location only)     │
│  - Rider flow                 │        │  - Cloud Messaging (push)   │
│  - Map (Leaflet + OSM tiles)   │        │  - Storage (ID/license imgs)│
│  - Public shared-trip view      │        │                             │
└───────────────────────────┘        └──────────────────────────┘
          │
          ▼
┌─────────────────────┐
│  OpenStreetMap tile   │
│  servers (Leaflet)    │
└─────────────────────┘
```

**Why this architecture:** Firebase's Spark (free) plan covers Auth, Firestore, Realtime Database, Cloud Messaging, and Storage without a billing account, and all of these have first-class Web SDKs. Cloud Functions and phone-number OTP auth require the paid Blaze plan, so MVP logic avoids both (see Section 7 and Section 9), exactly as in the original mobile plan.

---

## 3. Technology Stack

### 3.1 Core stack

| Layer | Technology | Justification |
|---|---|---|
| Front end framework | React (via Vite) | Fast dev/build loop for an AI agent to iterate against Figma screens; huge component/library ecosystem |
| Language | TypeScript | Type safety across the data model (users/tickets/rides), fewer agent-introduced bugs |
| Styling | Tailwind CSS | Matches design-token-driven Figma workflows well; fast to translate Figma spacing/typography into utility classes |
| Routing | React Router | Standard client-side routing for the screen inventory in PRD Section 11 |
| Authentication | Firebase Authentication (Web SDK) — Email link / Google Sign-In | Free tier; phone OTP deferred (paid tier), same as mobile plan |
| Primary database | Cloud Firestore (Web SDK) | Document model fits Users/Tickets/Rides; generous free read/write quota |
| Live location store | Firebase Realtime Database (Web SDK) | Lower latency/overhead than Firestore for high-frequency small writes |
| File storage | Firebase Storage (Web SDK) | ID cards, license photos, profile photos |
| Push notifications | Firebase Cloud Messaging (Web Push, via service worker) | Free; works on Android Chrome/desktop Chrome; limited on iOS Safari (documented gap) |
| Maps | Leaflet.js + OpenStreetMap tiles (`react-leaflet`) | Direct web equivalent of `flutter_map`; no billing account required |
| Geolocation | Browser Geolocation API (`navigator.geolocation`) | Native browser API, free, no package needed |
| State management | React Context + hooks, or Zustand for shared ride/session state | Lightweight, matches Provider/Riverpod's role in the original plan |
| PWA / installability | `vite-plugin-pwa` (Workbox under the hood) | Generates the service worker + manifest for "Add to Home Screen" and offline app-shell caching |
| Routing/distance (optional) | OSRM or OpenRouteService (free tier, rate-limited) | Straight-line/haversine distance as fallback if quota exceeded — unchanged from mobile plan |
| Design source | Existing Figma file | Already built; the agent implements directly from it instead of generating a new design system |

### 3.2 Responsive behavior requirement

Since the Figma screens were designed as mobile frames, the build agent must:
- Implement each screen mobile-first, matching the Figma layout at mobile widths (~375–430px) pixel-for-pixel where reasonable.
- Add sensible breakpoints (e.g., Tailwind's `sm`/`md`/`lg`) so the app is still usable on tablet/desktop widths — the map + bottom sheet pattern (Section 4, Customer Home) should become a map + side panel layout above a ~768px breakpoint rather than a stretched mobile view.
- Preserve all interaction states already defined in Figma (idle, searching, ticket form, waiting, accepted, etc.) as real component states in code, not static screens.

---

## 4. Functional Modules (technical breakdown of PRD features)

### 4.1 Auth & Identity Module
- Sign-up via college email (Firebase email-link auth) or Google Sign-In, using `firebase/auth` web SDK.
- On first login, create a `users/{uid}` Firestore document.
- ID verification: user uploads a college ID image to Firebase Storage via a `<input type="file">` + `uploadBytes()`; a `verificationStatus` field (`pending` / `verified` / `rejected`) is set manually by an admin for the MVP (no automated OCR/verification service at this stage).
- Role stored as an array field (`roles: ["customer"]`, `["rider"]`, or both) so a single account can switch modes.
- Auth state persisted via Firebase's browser persistence so a refresh doesn't log the user out.

### 4.2 Rider Onboarding Module
- Multi-step form (React multi-step wizard matching the Figma "Setup" screens): vehicle details, license upload, extra-helmet flag, community-guidelines acceptance.
- Writes to `riderProfiles/{uid}` subdocument, linked to `users/{uid}`.
- Verification status mirrors the identity verification flow (manual review for MVP).

### 4.3 Ticket Module (Customer)
- `tickets/{ticketId}` document: pickup (lat/lng + label), drop (lat/lng + label), time window, recurring flag + days array, status, estimated fuel share, women-only flag.
- Created client-side, written directly to Firestore (no server round-trip needed).
- Status lifecycle: `pending → accepted → completed` or `pending → cancelled`.
- Map pickup/drop selection implemented with `react-leaflet` draggable markers + a geocoding search box (Nominatim, OSM's free geocoder, rate-limited — cache/debounce queries client-side).

### 4.4 Matching Module
- **MVP approach: client-side query matching, not a matching algorithm service** (unchanged from mobile plan).
- Riders query Firestore for tickets where pickup/drop fall within a bounding box of their posted route (simple geo-bounding using lat/lng range queries, since Firestore doesn't natively support radius queries without a geohashing library).
- Recommended: use `geofirestore` (the JS/web equivalent of `geoflutterfire`) for "tickets near my route" queries within Firestore's native query model.
- This is explicitly a v1 heuristic, not a production-grade route-matching algorithm; documented as a known simplification.

### 4.5 Ride Lifecycle Module
- `rides/{rideId}` document created when a Rider accepts a `ticket`.
- 4-digit OTP generated client-side and shown to the Customer; Rider must enter it to transition `accepted → started`.
- Status transitions: `accepted → started → completed`, each writing a timestamp.
- On `started`, the app begins writing Rider location to Realtime Database at `liveLocations/{rideId}`; on `completed` or `cancelled`, the client stops writing and the record can be cleared.
- **Web-specific constraint:** the app must warn the user (e.g., a persistent banner: "Keep this tab open to keep sharing your live location") since `watchPosition` and the write loop stop if the tab is closed or the browser fully backgrounds it on mobile. This is a disclosed MVP limitation, not a bug (see Section 9).

### 4.6 Live Location Module
- Path: `liveLocations/{rideId}/{lat, lng, heading, timestamp}`.
- Rider's browser calls `navigator.geolocation.watchPosition()` and writes every 3–5 seconds, **only while `rides/{rideId}.status == started`**.
- Customer's browser subscribes via a Realtime Database `onValue` listener scoped to that specific `rideId` — no other user can read another ride's location (enforced via Security Rules, see Section 8).
- Map marker interpolates between updates (client-side CSS/JS tweening, e.g., animating the Leaflet marker's `setLatLng` over the update interval) for smooth movement rather than jumping.

### 4.7 Ratings Module
- `ratings/{ratingId}`: `rideId`, `fromUserId`, `toUserId`, `stars`, `tags[]`, `comment`.
- Aggregated `ratingAvg` and `ratingCount` maintained on the `users/{uid}` document, updated client-side after each new rating write (acceptable at pilot scale; a Cloud Function would be the correct approach post-Blaze-upgrade to prevent tampering).

### 4.8 Notifications Module
- Web Push via Firebase Cloud Messaging, requiring a registered service worker (`firebase-messaging-sw.js`) and user permission prompt (`Notification.requestPermission()`).
- Push for: ticket accepted, ride reminder (time-window approaching), cancellation, new matching ticket available (Rider side).
- Triggered client-side for MVP (e.g., the accepting Rider's client calls a callable that sends via FCM topic/token) since Cloud Functions (server-triggered) require Blaze — unchanged from mobile plan.
- **Known limitation:** client-triggered notifications are less reliable than server-triggered ones; acceptable for a pilot demo, flagged as a post-MVP hardening item.
- **Known web-specific gap:** iOS Safari's support for Web Push/PWA notifications is limited and version-dependent — document this explicitly for the pilot cohort (Android-first, per PRD Section 8).

### 4.9 Safety Module
- SOS button: opens `tel:{emergencyNumber}` and/or a `https://wa.me/?text=...` link pre-filled with the current live-location share link.
- "Share trip" generates a read-only, time-limited link (e.g., `/trip/{rideId}?token=...`) backed by a Firestore document with an expiry timestamp, checked client-side, rendering a public no-login page that shows only the live map marker for that ride.

---

## 5. Data Model (Firestore + Realtime Database schemas)

*Unchanged from the mobile TRD — the schema is platform-agnostic and works identically from the Web SDK.*

### 5.1 Firestore Collections

```
users/{uid}
  - name: string
  - photoUrl: string
  - email: string
  - collegeIdUrl: string
  - verificationStatus: "pending" | "verified" | "rejected"
  - roles: string[]              // ["customer"], ["rider"], or both
  - ratingAvg: number
  - ratingCount: number
  - area: string                 // general locality, not full address
  - createdAt: timestamp

riderProfiles/{uid}
  - vehicleType: "bike" | "scooter"
  - vehicleNumber: string
  - licenseUrl: string
  - extraHelmet: boolean
  - defaultRoute: { pickup: geopoint, drop: geopoint }
  - available: boolean
  - detourToleranceKm: number

tickets/{ticketId}
  - customerId: string (ref users)
  - pickup: { lat, lng, label }
  - drop: { lat, lng, label }
  - timeWindowStart: timestamp
  - timeWindowEnd: timestamp
  - recurring: boolean
  - days: string[]                // e.g. ["Mon","Tue",...]
  - status: "pending" | "accepted" | "completed" | "cancelled"
  - estimatedFuelShare: number
  - womenOnly: boolean
  - createdAt: timestamp

rides/{rideId}
  - ticketId: string (ref tickets)
  - riderId: string (ref users)
  - customerId: string (ref users)
  - status: "accepted" | "started" | "completed" | "cancelled"
  - otp: string
  - startTime: timestamp
  - endTime: timestamp
  - distanceKm: number
  - fuelShareAmount: number
  - platformFee: number
  - paymentMode: "cash" | "upi"

ratings/{ratingId}
  - rideId: string
  - fromUserId: string
  - toUserId: string
  - stars: number
  - tags: string[]
  - comment: string
  - createdAt: timestamp
```

### 5.2 Realtime Database

```
liveLocations/
  {rideId}/
    lat: number
    lng: number
    heading: number
    updatedAt: timestamp
```

Cleared or TTL'd after ride completion (manual deletion in MVP; scheduled cleanup post-Blaze).

---

## 6. API / Interface Summary

Since there is no custom backend server, "APIs" in the MVP are the Firebase Web SDK calls made directly from the React app:

| Action | Firebase Web SDK call |
|---|---|
| Sign up / log in | `signInWithEmailLink()` / `signInWithPopup()` (Google) from `firebase/auth` |
| Upload ID/license | `uploadBytes()` from `firebase/storage` |
| Create/read/update ticket | `firebase/firestore`: `addDoc`/`getDocs`/`updateDoc` on `tickets` collection |
| Query matching tickets | `firebase/firestore`: `query()` with range/geohash filters |
| Accept ticket → create ride | `runTransaction()` (write `rides`, update `tickets.status`) |
| Stream live location | `firebase/database`: `onValue(ref('liveLocations/{rideId}'), ...)` |
| Send push notification | FCM Web client call (token-based), via a registered service worker |
| Submit rating | `addDoc()` on `firebase/firestore` `ratings` collection |

If/when the project moves to a paid tier, these become Cloud Functions-fronted APIs (callable via `httpsCallable()`) for validation, anti-abuse, and server-triggered notifications — noted as the Phase 2 migration path.

---

## 7. Third-Party Services and Free-Tier Constraints

| Service | Free-tier limit (approx.) | Impact on MVP |
|---|---|---|
| Firestore | ~50k reads/day, ~20k writes/day | Sufficient for pilot (dozens of users); monitor as pilot grows |
| Realtime Database | ~100 simultaneous connections | Fine for pilot; live location writes every 3–5s during active rides only |
| Firebase Storage | 5 GB stored, 1 GB/day download | Fine for ID/license images at pilot scale |
| Firebase Auth (email/Google) | Free, unlimited | No constraint |
| Firebase Auth (phone OTP) | Requires Blaze (paid) plan | **Deferred** — MVP uses email/Google sign-in instead |
| Cloud Functions | Requires Blaze (paid) plan | **Deferred** — logic kept client-side + Security Rules for MVP |
| Firebase Hosting | Free tier: 10 GB storage, 360 MB/day transfer | Used to deploy the built React app + PWA assets; sufficient for pilot traffic |
| OpenStreetMap tiles | Free, but fair-use policy (not for heavy production traffic) | Fine for demo/pilot; revisit tile provider before scaling |
| Nominatim (OSM geocoding) | Free, rate-limited (~1 req/sec) | Debounce/cache search-box queries client-side to stay within limits |
| OSRM/OpenRouteService (routing) | Free tier, rate-limited | Optional; fallback to straight-line distance if unavailable |

**Estimated location-write budget:** ~360 writes per 30-minute active ride → free Realtime Database/Firestore quotas support roughly 50–55 rides/day, which comfortably covers a college pilot but is a known scaling constraint. Unchanged from the mobile plan.

---

## 8. Security and Privacy

- **Firestore Security Rules** enforce:
  - A user can read/write only their own `users/{uid}` document (except public fields like name, photo, rating — exposed via a restricted view or separate public profile subset).
  - A `ticket` is writable only by its `customerId`; readable broadly (for matching) but with sensitive fields (exact pickup address) restricted until a ride is `accepted`.
  - A `ride`'s live location path is readable only by the matched `riderId` and `customerId` for that specific `rideId`, plus a scoped, time-limited exception for a valid "share trip" token (Section 4.9).
- **Data minimization:** store general locality/area rather than full home address where possible; avoid storing raw phone numbers visible to the other party (masked call/contact only).
- **OTP-gated ride start** prevents a mismatched or malicious pairing from beginning a "ride" session and location share.
- **Time-scoped location sharing:** live location is written only between `started` and `completed`/`cancelled` — never continuously.
- **ID/license images** stored in Firebase Storage with access restricted to the uploading user and admin review process (manual for MVP).
- **Web-specific:** the app should be served over HTTPS only (required for both the Geolocation API and Web Push to function in the browser); Firebase Hosting provides this by default.
- **CORS / API key exposure:** Firebase Web SDK API keys are not secret (they identify the project, not authenticate it), but Firestore/Storage/Realtime Database Security Rules must be the actual enforcement layer — never rely on client-side checks alone.

---

## 9. Known Technical Limitations (MVP, disclosed transparently)

1. **No server-side validation** — since Cloud Functions require a paid plan, some logic (rating aggregation, notification triggers) runs client-side, which is fine for a trusted pilot group but would need server enforcement before public launch.
2. **No phone-based OTP login** — deferred to Blaze plan; MVP uses college email/Google sign-in instead.
3. **Manual ID/license verification** — no automated document verification (OCR/KYC service) at MVP stage; an admin reviews uploads manually.
4. **Geo-matching is a simplified heuristic** — bounding-box/geohash proximity matching, not a true route-overlap or detour-optimization algorithm.
5. **OpenStreetMap free tiles** are not intended for heavy production traffic — acceptable for a pilot/demo, would need a paid tile provider (or Google Maps with billing) before wider scale.
6. **No true background location tracking** — this is the main new limitation versus a native app. The browser's Geolocation API only reports while the tab is open; on mobile, if the browser is fully backgrounded or the screen locks, updates can pause or stop. The MVP explicitly requires the ride to stay in the foreground, and the UI should say so clearly during an active ride.
7. **iOS Safari PWA/push gaps** — Web Push and some PWA install behaviors are limited or version-gated on iOS Safari; the pilot should be positioned Android-first (matches the primary student device base per the PRD), with iOS treated as best-effort.

---

## 10. Non-Functional Requirements

- **Availability:** best-effort; no formal SLA at MVP stage (Firebase Spark plan has no uptime guarantee).
- **Performance target:** panel/bottom-sheet transitions at 300ms with ease-out curves; live marker updates smoothed via interpolation, not raw jump-per-update; initial page load should be optimized via Vite's code-splitting so the app shell is interactive quickly on a mid-range Android phone over campus Wi-Fi/4G.
- **Scalability ceiling (MVP):** designed and tested for a single-college pilot (dozens to low hundreds of users), not a multi-city production load.
- **Offline handling:** Firestore's built-in offline persistence (`enableIndexedDbPersistence`) should be enabled so ticket creation/viewing degrades gracefully on poor connectivity; live location naturally requires connectivity.
- **Platform:** Android Chrome first (matches primary student device base); desktop Chrome/Edge supported for admin/manual-review use; iOS Safari best-effort only for the MVP.
- **Installability:** must pass basic PWA installability criteria (manifest with icons, HTTPS, registered service worker) so "Add to Home Screen" works on Android.

---

## 11. Migration Path (Post-MVP, once funded / Blaze plan enabled)

1. Move ratings aggregation, notification triggers, and matching logic into Cloud Functions for integrity and server-side enforcement.
2. Add phone-number OTP authentication.
3. Introduce automated ID verification (KYC/OCR service) to replace manual review.
4. Evaluate Google Maps Platform (with billing) for richer routing/ETA accuracy, or a paid OSM tile provider for production-grade map traffic.
5. Add a proper geospatial matching/route-optimization service instead of the bounding-box heuristic.
6. Introduce real payment integration (e.g., Razorpay) with escrow-style fuel-share settlement.
7. Add TTL-based cleanup jobs for live location data instead of manual clearing.
8. If background location tracking becomes essential (vs. the accepted foreground-only MVP limitation), evaluate wrapping the web app in Capacitor for native background geolocation, or a full native rebuild.

---

## 12. Build Instructions for the AI Agent (summary)

1. Scaffold a Vite + React + TypeScript + Tailwind project; add `vite-plugin-pwa`.
2. Set up Firebase project (Spark/free plan) and initialize Auth, Firestore, Realtime Database, Storage, and Hosting; wire up the Web SDK config.
3. Implement Firestore Security Rules per Section 8 before writing any data-bearing screens.
4. Build shared screens first (Login/Signup, Role Select, Verification), then Customer flow, then Rider flow, matching the Figma screens listed in PRD Section 11 one-to-one.
5. Implement the map (Leaflet + OSM) and live-location module per Sections 4.3 and 4.6.
6. Implement the public "Share Trip" route last, since it depends on the ride/location model already being in place.
7. Deploy to Firebase Hosting; verify PWA installability and HTTPS-dependent APIs (Geolocation, Push) work on a real Android device before the pilot.

---

## 13. Traceability to PRD

| PRD Feature (Section 7) | TRD Module |
|---|---|
| Onboarding & Identity | 4.1 |
| Rider Setup | 4.2 |
| Create/My Tickets | 4.3 |
| Matching | 4.4 |
| Active Ride / OTP / Status | 4.5 |
| Live Location | 4.6 |
| Ratings | 4.7 |
| Notifications | 4.8 |
| SOS / Trip Sharing | 4.9 |

---

*End of document.*
