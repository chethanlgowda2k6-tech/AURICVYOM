# AuricVyom — Technical Backend Audit & Architecture Specification

**Project**: AuricVyom Luxury Indian Travel Platform  
**Document**: Initial Frontend Audit & Backend Transition Architecture  
**Date**: September 2026  
**Status**: Completed  

---

## 1. Current Frontend Architecture

### 1.1 Core Technologies
- **Framework**: Modern Vanilla JavaScript (ES2022+ ES Modules) Single Page Application (SPA).
- **DOM Engine**: Dynamic component mounting into `#main-content-mount` via reactive state subscribers.
- **Styling**: Vanilla CSS3 custom property design tokens (`styles/main.css`), featuring royal dark luxury aesthetic (`#080c14`), pure gold accents (`#d4af37`), glassmorphism, responsive clamp layouts, and custom typography (`Cinzel`, `Playfair Display`, `Plus Jakarta Sans`, `Outfit`).
- **Assets**: 29 local static image assets in `images/destinations/` representing all 28 Indian state capitals + NCT Delhi, curated Unsplash imagery for properties and experiences.

### 1.2 Existing Navigation & State Management
- **State Store (`js/state.js`)**: Reactive Observer pattern (`StateManager`) managing:
  - `activeTab`: Current page view (`home`, `explore`, `destinations`, `stays`, `transport`, `aiPlanner`, `packages`, `experiences`, `saved`, `journal`, `dashboard`, `bookings`).
  - `currentUser`: Authenticated session object, loyalty tier, points, preferences.
  - `wishlist`: Array of saved destinations, stays, and experiences.
  - `activeTripPlan` & `savedTrips`: Day-by-day intelligent itinerary object.
  - `travelStories`: User-submitted editorial travel journal chronicles.
  - `userReviews`: Property and destination ratings and feedback.
  - `bookings`: Active and past travel reservations and vouchers.
  - `currency`: Selected currency (`INR ₹` / `USD $`) with dynamic price multipliers.
  - `searchQuery` & `activeFilters`: Universal search term, price range, categories.
  - `aiMessages`: Conversational message history for AI travel assistant.
- **Storage**: Client-side `localStorage` with fallback seeds.

---

## 2. Component Inventory & Backend Migration Requirements

| Component | Current Implementation | Data Source | API Migration Goal |
| :--- | :--- | :--- | :--- |
| **`Hero.js`** | 29 State Capitals carousel, auto-play, flight path animation, search bar. | Static `capitalCities.js` | `GET /api/v1/states`, `GET /api/v1/destinations/capitals` |
| **`PersonalizationSection.js`** | "Curated for User" recommendations based on profile & active trip. | Client-side filter on `destinations.js` | `GET /api/v1/recommendations` |
| **`ExploreIndiaView.js`** | Category filters (Trending, Weekend, Hidden, Nature, Adventure, Beach). | Static `destinations.js` | `GET /api/v1/destinations?category=...` |
| **`StaysView.js`** | Stays search, price, property type, and amenity filters. | Static `stays.js` | `GET /api/v1/stays`, `GET /api/v1/stays/:id/availability` |
| **`TransportView.js`** | Flights, Vande Bharat trains, buses, chauffeured SUVs, airport transfers. | Static `flights.js`, `trains.js`, `buses.js` | `GET /api/v1/transport/search` (Provider Abstraction) |
| **`AIPlanner.js`** | AI companion chat, quick action prompts, dynamic budget optimization. | Local keyword heuristics | `POST /api/v1/ai/itinerary`, `POST /api/v1/ai/chat` |
| **`AuthModal.js`** | Login, Signup, Forgot password modal tabs. | Simulated state in `state.js` | `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/me` |
| **`SavedTripsView.js`** | Wishlist cards, heart toggle, saved packages. | LocalStorage `wishlist` | `GET /api/v1/trips`, `POST /api/v1/trips/:id/save` |
| **`TravelJournalView.js`** | Gazette stories list, write a story modal. | LocalStorage `stories.js` | `GET /api/v1/journal`, `POST /api/v1/journal` |
| **`BookingModal.js` & `MyBookingsView.js`** | Multi-step booking checkout, UPI/Cards, voucher export. | Client simulation | `POST /api/v1/bookings`, `POST /api/v1/payments/verify` |
| **`Navbar.js` & `MobileBottomNav.js`** | Global header, currency switcher, profile drawer, mobile bottom bar. | `appState` reactive events | `GET /api/v1/currency/rates`, `POST /api/v1/auth/logout` |

---

## 3. Mock Data to be Migrated to Database

1. **Destinations & State Capitals**:
   - All 28 Indian States + 8 Union Territories + Capitals (`js/data/capitalCities.js`).
   - Detailed destination entities (`js/data/destinations.js`) with attractions, activities, cuisines, and coordinates.
2. **Luxury Stays & Properties**:
   - Palace suites, coffee estate bungalows, jungle lodges, houseboats, villas (`js/data/stays.js`).
   - Room tiers, amenities, policies, pricing, and availability records.
3. **Multi-Modal Transport Network**:
   - Domestic flight routes and airport hubs (`js/data/flights.js`).
   - Vande Bharat Express and railway routes (`js/data/trains.js`).
   - Luxury inter-city coach routes (`js/data/buses.js`).
   - Chauffeur 4x4 expedition fleets (`js/data/transport.js`).
4. **Experiences & Packages**:
   - Curated single/multi-day tour packages (`js/data/packages.js`, `js/data/experiences.js`).
5. **Travel Stories & Reviews**:
   - Editorial Gazette stories (`js/data/stories.js`) and verified traveler reviews (`js/data/reviews.js`).

---

## 4. Recommended Backend Architecture

### 4.1 Layered Architecture Pattern
```
Route Layer (Express Router)
      ↓
Controller Layer (Request parsing, Zod Validation, HTTP response formatting)
      ↓
Service Layer (Business rules, Personalization engine, AI orchestrator, Provider interfaces)
      ↓
Repository Layer (Prisma ORM database queries, pagination, relations)
      ↓
PostgreSQL Database (Supabase / Self-hosted)
```

### 4.2 Standard API Response Protocol
Every endpoint returns a consistent JSON envelope:

**Success (`HTTP 200/201`)**:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

**Error (`HTTP 4xx/5xx`)**:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid destination ID provided",
    "details": {}
  }
}
```

---

## 5. Security & Reliability Strategy
- **Authentication**: Dual token system (short-lived JWT access token in authorization header + secure HTTP-only refresh token with rotation).
- **Password Protection**: Argon2 / bcrypt hashing with minimum salt rounds of 10.
- **Request Hardening**: Helmet security headers, CORS origin whitelisting, express-rate-limit protection.
- **Input Validation**: Zod schema validation on every route before reaching controllers.
- **Provider Abstraction**: Integration interfaces (`TransportProvider`, `PaymentProvider`, `AIProvider`, `EmailProvider`) to decouple core business logic from third-party vendor APIs.

---

## 6. Required Environment Variables (`.env.example`)
```ini
# Application Configuration
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1
CORS_ORIGIN=http://localhost:3000

# Database Configuration (PostgreSQL / Supabase)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auricvyom?schema=public

# Authentication Secrets
JWT_SECRET=your_super_secret_jwt_access_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# AI Integration
AI_PROVIDER=gemini
AI_API_KEY=your_gemini_or_openai_api_key

# Payment Gateways (Mockable)
PAYMENT_PROVIDER=demo
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
STRIPE_SECRET_KEY=your_stripe_secret_key

# Currency Rates API (Mockable)
CURRENCY_API_KEY=your_exchange_rate_api_key
```
