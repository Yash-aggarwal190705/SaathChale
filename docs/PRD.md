# Product Requirements Document (PRD)
## SaathChalo — Verified Commute Sharing for Students (Web App)

**Document owner:** Yash
**Institution:** Vivekananda Global University (VGU), Jaipur
**Purpose:** Startup pitch competition (college) — Web App MVP
**Version:** 2.0 (Web)
**Status:** Draft for AI-agent build, using existing Figma screens

---

## 0. Change Note (v1 → v2)

This is the web-app version of the original SaathChalo PRD (v1, Flutter mobile app). Product scope, personas, legal framing, and success metrics are unchanged. What changed is the delivery platform: SaathChalo is now built as a **responsive Progressive Web App (PWA)** instead of a native Flutter app, using UI screens already designed in Figma. Platform-specific implications are called out in Section 7 and Section 8.

---

## 1. Executive Summary

SaathChalo is a verified, closed-community ride-sharing web app that connects people who already travel the same route at the same time, so they can share one vehicle instead of each paying full price for a separate ride. It launches first with students at VGU Jaipur, where daily commute cost and unreliable transport are common pain points.

Unlike Ola/Uber/Rapido, SaathChalo is not a taxi marketplace. Vehicle owners ("Riders") do not earn a profit — they recover a share of their fuel cost from a co-traveler ("Customer") who is already going the same way. This framing keeps the model closer to cost-sharing carpooling than commercial passenger transport, which matters both legally and for trust.

The MVP is delivered as a web app (installable as a PWA on Android/desktop) so it can be built and iterated quickly by an AI coding agent from existing Figma designs, with no app-store review cycle. The initial market is one college. The long-term vision is a network of verified campus and office commute communities across Tier 1 and Tier 2 Indian cities.

---

## 2. Problem Statement

- Daily commuting is a recurring, unavoidable cost for students and young professionals.
- Public transport is often unreliable, overcrowded, or unavailable at the times students actually travel.
- Private cabs and bike taxis (Ola/Uber/Rapido) are too expensive for daily, repeated use on a student budget.
- Many students already own a two-wheeler and travel the exact same route every day with empty pillion seats, while other students on the same route pay full price for autos or bike taxis.
- Existing carpooling apps (Quick Ride, BlaBlaCar) are general-purpose and not built around a single trusted, verified community like a college, so trust and matching density are weaker for a student user.

**Core insight:** the supply (empty seats on regular routes) already exists inside the campus community every single day. The problem is matching and trust, not vehicle availability.

---

## 3. Goals and Non-Goals

### 3.1 Goals (MVP)
1. Let verified students find and match with another verified student going the same route at the same time.
2. Make the cost split transparent and clearly framed as "fuel share," not a fare.
3. Make the first ride with a stranger feel safe (verification, OTP-based ride start, live location sharing, SOS).
4. Prove demand and behavior with a real pilot at VGU before any wider build-out.
5. Ship fast by building directly from the existing Figma screens as a responsive web app — no app-store dependency, instant updates, installable as a PWA.

### 3.2 Non-Goals (explicitly out of scope for MVP)
- Multi-city or multi-college matching (single campus only, to start).
- Real-time on-demand matching (MVP uses scheduled/recurring or night-before tickets, not instant hailing).
- In-app real-money payments (MVP uses cash or UPI outside the app, with in-app cost calculation only).
- Four-wheeler carpooling (two-wheeler pillion sharing only, to start).
- Driver-for-hire or commercial transport functionality of any kind.
- Native iOS/Android app store distribution (deferred — PWA only for MVP; see Section 7).
- True background (phone-locked) location tracking — MVP assumes the browser tab stays open/foregrounded during an active ride (see Section 8).

---

## 4. Target Users and Personas

### Persona 1: Customer — "Ananya, 2nd year"
- Lives 8–12 km from campus, no personal vehicle.
- Currently spends ₹1,000–2,000/month on autos and bike taxis.
- Cares most about: safety, predictability, and cost.
- Trigger to use the app: a verified female rider option and a reliable daily schedule.
- Device context: primarily an Android phone, Chrome browser.

### Persona 2: Rider — "Rohit, 3rd year"
- Owns a bike, already commutes the same route daily.
- Not looking for a side income, but wouldn't mind offsetting fuel cost.
- Cares most about: no extra effort, no legal risk, no unreliable no-shows.
- Trigger to use the app: it costs him nothing extra in time, and it's framed as cost-sharing, not a driving job.

### Persona 3: Parent / Guardian (indirect stakeholder)
- Cares about safety more than cost.
- Influences whether a student is "allowed" to use such an app.
- Verification, SOS, and trip-sharing features exist partly to satisfy this persona.

### Persona 4: College Administration (future B2B buyer)
- Cares about reduced campus parking pressure, safer commutes, and sustainability metrics.
- A future stakeholder for partnership/B2B revenue, not an MVP user.

---

## 5. Competitive Landscape

| Product | Model | Where SaathChalo differs |
|---|---|---|
| Quick Ride | General carpooling/bike-pooling, open to all users | SaathChalo targets one verified, closed community first — higher trust, denser matching |
| BlaBlaCar | Mostly intercity carpooling | SaathChalo is intra-city, daily/recurring commute focused |
| Ola/Uber Pool (discontinued) | Commercial pooling, regulatory pressure | SaathChalo is explicitly cost-sharing, not a commercial fare, by design and by wording |
| Ola/Uber/Rapido (regular) | On-demand commercial rides, full fare, native apps | SaathChalo is far cheaper (not a commercial service) and ships as a web app for faster iteration during the pilot |

**Positioning statement:** "SaathChalo is not a taxi app. It's how your own college community already gets around — we just help you find each other."

---

## 6. Legal and Safety Considerations (must-address before pitch)

- In India, using a privately registered ("white plate") vehicle for commercial passenger transport is restricted; cost-sharing carpooling occupies a legal grey area that varies by state.
- Product decisions made specifically to stay on the cost-sharing side of that line:
  - Riders are charged/paid strictly on a **per-km fuel-share basis**, capped at a rate that approximates real fuel cost, not a market fare.
  - UI and legal copy never use "fare," "earnings," "income," or "driver."
  - Any platform fee is charged to the Customer as a **matching/service fee**, not taken as a cut of the Rider's payment, to avoid resembling a commission-based commercial transport service.
- Before scaling beyond the pilot, get a lawyer or legal-aid clinic to review the model against the Motor Vehicles Act and the applicable state's carpooling/aggregator rules (Rajasthan-specific rules should be checked; some states like Maharashtra have separately approved regulated bike-pooling).
- Safety requirements are treated as core product features, not extras (see Section 8).

---

## 7. Product Scope — MVP Feature List

*(Screens referenced below already exist as Figma designs; the AI build agent should implement each against the corresponding Figma frame rather than redesigning it.)*

### 7.1 Onboarding & Identity
- Sign-up via college email or Google sign-in (phone OTP deferred — requires a paid Firebase tier and SMS provider).
- College ID upload for verification (manual admin approval for MVP/pilot).
- Role selection: Customer, Rider, or both (single account, switchable role).
- Rider-only setup: vehicle type, registration number, driving license upload, extra-helmet availability.

### 7.2 Customer Flow
- Home screen: map + draggable bottom sheet (Rapido/Uber-style), implemented as a responsive panel that becomes a side panel on desktop widths and a bottom sheet on mobile widths.
- Saved locations ("Home," "College") as quick-select chips.
- Create Ticket: pickup, drop, time window, one-time or recurring (day-of-week selection), live fuel-share estimate.
- My Tickets: pending / accepted / completed states, cancel option.
- Rider details view once matched: name, photo, rating, verified badge, vehicle number.
- Active ride screen: status stages (Reached Pickup → Start Ride → End Ride), OTP-based ride start, SOS button, trip-sharing link.
- Ride summary: distance, fuel-share amount, platform fee, total.
- Rating and review after ride.

### 7.3 Rider Flow
- Availability toggle ("I'm available today").
- Post a recurring trip (route, time, seat count, acceptable detour distance).
- Available Tickets list: matching requests filtered by route/time, with detour distance and customer rating shown before accepting.
- Accept/Decline actions.
- Same active-ride flow as Customer (OTP verification, status stages, SOS).
- "Fuel cost covered" summary instead of an earnings dashboard.

### 7.4 Trust & Safety (cross-cutting)
- ID verification badge visible on all profiles.
- OTP required to start every ride (prevents wrong-match / stranger mix-ups).
- SOS button on every active-ride screen (`tel:` link to emergency contact, `wa.me` link to share live-location link).
- "Share my trip" link to a trusted contact, showing live location via a public read-only web page (no login required to view).
- Post-ride two-way rating with quick tags (e.g., "On time," "Followed rules").
- Optional "women riders/customers only" matching toggle.

### 7.5 Live Location (MVP, free-tier, browser-based)
- Uses the browser Geolocation API (`navigator.geolocation.watchPosition`) to read the Rider's device location.
- Location is only read and written while the ride status is `started`, and only while the ride tab remains open in the foreground (see Section 8 constraint — no background tracking on web).
- Written to Firebase Realtime Database and streamed to the Customer's browser via a live listener.

### 7.6 Explicitly Deferred (Post-MVP)
- B2B dashboard for colleges/companies.
- Admin/moderation dashboard for verification and complaints.
- Semester-long "set once" passes.
- Gamification (streaks, CO₂-saved leaderboard).
- Four-wheeler carpooling.
- Multi-college / multi-city expansion.
- Native app wrapper (Capacitor/Flutter) for true background location tracking.

---

## 8. Non-Functional Requirements

- **Privacy:** live location visible only to the matched party (or an explicitly shared trip link) during an active ride; never stored beyond what's needed for support/dispute resolution.
- **Performance (prototype scale):** support at least 50–100 concurrent pilot users without hitting Firebase free-tier limits (see Section 11 in the TRD).
- **Accessibility:** large touch targets, one-handed usable bottom sheet/panel, since users are often walking or about to ride; keyboard-navigable on desktop.
- **Reliability:** cancellations and no-shows must be visible in the rating system to discourage flaking.
- **Data minimization:** collect only what verification and safety require; no home address stored beyond a general area/locality where avoidable.
- **Platform constraint (web-specific):** the app must remain the active foreground browser tab during an active ride for live location to keep updating — this is a known and accepted MVP limitation, not a bug, and should be communicated to the user in-app (e.g., "Keep this tab open during your ride").
- **Installability:** the app should be installable as a PWA (Add to Home Screen) on Android Chrome so it behaves like a native app icon for repeat users.
- **Browser support target:** Chrome/Edge (desktop + Android) as primary; Safari/iOS as best-effort (Web Push and background behavior are more limited on iOS Safari — document as a known gap, not a blocker for the pilot).

---

## 9. Success Metrics

### 9.1 Pilot / Validation Metrics (pre-build and pilot phase)
- Survey response rate and % of respondents reporting a real commute cost/reliability problem.
- % of survey respondents willing to try the app as Customer vs. Rider.
- Manual-match pilot (WhatsApp group): number of successful matches, average reported cost saved, completion rate of matched rides.

### 9.2 Product Metrics (post-MVP)
- Weekly active Riders and Customers.
- Match rate: % of tickets that get accepted within the target window.
- Ride completion rate vs. cancellation rate.
- Average cost saved per Customer vs. Ola/Uber/Rapido baseline.
- Repeat usage rate (recurring ticket adoption).
- Average rating and safety-incident reports (target: zero tolerance, tracked explicitly).
- PWA install rate (web-specific proxy for engagement/retention).

---

## 10. Revenue Model

1. **Flat platform/matching fee** charged to the Customer per ride (e.g., ₹3–5), not taken from the Rider's fuel share — keeps Rider payment strictly cost-sharing.
2. **Monthly pass** for Customers (e.g., ₹49–99) covering recurring matching and priority support — predictable revenue, fits daily commute behavior.
3. **Micro-insurance add-on** (future) via a third-party insurance partner, small commission per opt-in.
4. **B2B partnerships** (future) with colleges/companies paying for reduced parking pressure, safety data, and sustainability reporting.
5. **Local sponsorships** (future): petrol pumps, helmet vendors, campus cafés.

**Illustrative scale math (assumptions to validate with real data):** 100 daily Customers × 2 rides/day × 25 days/month × ₹5 platform fee ≈ ₹25,000/month per college. At 20 colleges, ≈ ₹5,00,000/month. These are planning assumptions, not verified figures — replace with pilot-derived numbers before presenting.

---

## 11. Screen Inventory (MVP — build from existing Figma file)

**Customer:** Home (map + bottom sheet, 5 states: idle, searching, ticket form, waiting, accepted), Create Ticket, My Tickets, Rider Details, Active Ride, Ride Summary, Rating, Profile/Settings.

**Rider:** Setup (vehicle, documents, community promise), Verification Status, Rider Home, Post a Trip, Available Tickets (list, empty, detail), Ticket Accepted, Heading to Pickup, Verify OTP, Ride in Progress, Ride Summary, Rate Co-Rider.

**Shared:** Login/Signup, Verification, Role Select, Notifications, Profile & Settings.

**Public (new for web, no login):** Shared-trip live-location view (opened via a link, for a trusted contact who isn't a SaathChalo user).

*The AI build agent should treat the Figma frames as the source of truth for layout, spacing, and component states, and implement each listed screen responsively (mobile-first, with sensible desktop/tablet breakpoints) rather than as a fixed-width mobile-only layout.*

---

## 12. Validation Plan (do this before / alongside building)

1. **Survey** (Google Form) to 50–100 VGU students: commute mode, cost, pain points, willingness to share, pricing sensitivity, safety must-haves.
2. **Manual pilot** via a WhatsApp group: manually match 5–10 Rider–Customer pairs for one week using survey data, before any app exists.
3. Capture real numbers from the pilot (completion rate, reported savings, safety concerns) to replace the illustrative figures in Sections 9 and 10 before the pitch.

---

## 13. Risks and Open Questions

| Risk | Mitigation |
|---|---|
| Legal ambiguity around cost-sharing vs. commercial transport | Strict "fuel share" framing, flat platform fee model, legal review before scaling |
| Low matching density outside a single college | Start single-campus; expand only after proving density; consider B2B campus partnerships |
| Trust/safety concerns (especially for women users) | ID verification, OTP start, SOS, live trip sharing, women-only matching toggle |
| Riders and Customers go off-platform after first match ("leakage") | Tie safety features, ratings, and insurance benefits to in-app matching; monthly pass model reduces incentive to bypass |
| Reliability (cancellations, no-shows) | Recurring bookings over one-off tickets where possible, rating penalties for late cancellations, Ola/Uber as a stated backup option |
| Firebase free-tier limits at scale | Acceptable for pilot; plan Blaze-tier migration budget post-validation |
| Web-only MVP means no true background location tracking | Explicitly scoped as foreground-only for the pilot; communicated in-app; native wrapper considered post-MVP |
| iOS Safari has weaker PWA/push support | Android-first rollout for the pilot, matching the primary student device base; iOS treated as best-effort |

**Open questions to resolve before/at the pitch:**
- Final legal position for Rajasthan specifically on cost-sharing/bike-pooling.
- Whether the "Purple Cow" differentiator is women-only safety, senior-mentor matching, or semester passes (needs survey data to decide).
- Insurance coverage question for pillion passengers in a shared-ride context.

---

## 14. Roadmap (indicative)

**Phase 0 — Validation (2–3 weeks):** Survey + manual WhatsApp pilot, legal check.
**Phase 1 — MVP build (competition timeline):** Existing Figma design system → responsive web app (React) → Firebase free-tier backend → live-location demo.
**Phase 2 — Post-competition:** Real payments, insurance add-on, admin dashboard, expand within VGU.
**Phase 3 — Scale:** Additional colleges, B2B partnerships, four-wheeler support, multi-city, evaluate native app wrapper for background location.

---

*End of document.*
