# VR Garlands

Premium floral & garland e-commerce application — mobile app + REST API backend.

## Project Overview

VR Garlands is a production-ready e-commerce platform for flowers, garlands, and pooja products. Built as a monorepo with a React Native Expo mobile app and a Node.js/Express API server backed by Neon PostgreSQL via Prisma ORM.

## Architecture

```
artifacts/
  vr-garlands/     — Expo React Native mobile app (consumer-facing)
  api-server/      — Node.js + Express + Prisma REST API
  mockup-sandbox/  — Component preview/design sandbox (Vite)
lib/
  api-client-react/ — React Query hooks generated from OpenAPI spec (Orval)
  api-spec/         — OpenAPI YAML spec + generator config
  api-zod/          — Zod validation schemas generated from OpenAPI spec
  db/               — Drizzle ORM schema (shared DB utilities)
```

## Tech Stack

### Mobile (artifacts/vr-garlands)
- React Native + Expo (SDK 54) + Expo Router
- TypeScript strict mode
- TanStack Query (via @workspace/api-client-react)
- Reanimated v3, Gesture Handler
- expo-auth-session for Google Sign-In

### API Server (artifacts/api-server)
- Node.js + Express 5
- Prisma ORM → Neon PostgreSQL
- JWT authentication (Bearer tokens)
- Google OAuth2 (token verification via `google-auth-library`)
- Razorpay payments integration
- Pino structured logging

## Running the Project

### Required Secrets
Set these in Replit Secrets before starting:

| Secret | Description |
|--------|-------------|
| `NEON_DATABASE_URL` | Neon PostgreSQL connection string (`postgresql://...`) |
| `GOOGLE_CLIENT_ID` | Google Cloud Console OAuth 2.0 Client ID |
| `JWT_SECRET` | Long random string for signing JWTs |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (starts with `rzp_`) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |

### Database Setup
There is no existing migrations directory. On first run, use `prisma migrate dev` to generate and apply the initial migration from the schema:

```bash
cd artifacts/api-server
pnpm exec prisma migrate dev --name init   # creates migrations/ and applies to Neon DB
# seed test data (dev only — requires running API):
curl -X POST https://$REPLIT_DEV_DOMAIN/api/seed
```

### Workflows
All three workflows start automatically:
- **API Server** — `pnpm --filter @workspace/api-server run dev`
- **VR Garlands (Expo)** — `pnpm --filter @workspace/vr-garlands run dev`
- **Component Preview Server** — `pnpm --filter @workspace/mockup-sandbox run dev`

## API Routes

All routes are prefixed with `/api`:

| Route | Description |
|-------|-------------|
| `POST /api/auth/google` | Google OAuth → JWT + user upsert |
| `GET /api/auth/me` | Current user profile |
| `GET /api/products` | List/search/filter products (paginated) |
| `GET /api/products/:id` | Product detail + reviews + related |
| `GET /api/categories` | All categories |
| `GET /api/categories/:id/products` | Products by category (paginated) |
| `GET/POST/PUT/DELETE /api/cart` | Cart management |
| `GET/POST/PUT/DELETE /api/addresses` | User addresses |
| `GET/POST/GET /:id /api/orders` | Orders (history + create + detail) |
| `POST /api/payments/create-order` | Create Razorpay order |
| `POST /api/payments/verify` | Verify Razorpay payment |
| `GET/POST/DELETE /api/wishlist` | Wishlist management |
| `GET/PUT /api/users/profile` | User profile |
| `GET /api/banners` | Active banners |
| `GET /api/offers` | Active offers |
| `POST /api/seed` | Seed dev data (dev only) |
| `GET /api/healthz` | Health check |

## Mobile Screens

| Screen | Route | Status |
|--------|-------|--------|
| Login | `(auth)/login` | ✅ Google Sign-In |
| Home | `(tabs)/index` | ✅ Banners, categories, offers, products |
| Categories | `(tabs)/categories` | ✅ Dynamic from DB |
| Orders | `(tabs)/orders` | ✅ Order history |
| Profile | `(tabs)/profile` | ✅ User info + logout |
| Product Detail | `product/[id]` | ✅ Images, reviews, related |
| Category Products | `category/[id]` | ✅ Paginated |
| Cart | `cart` | ✅ Real-time cart |
| Checkout | `checkout` | ✅ Address + order creation |
| Search | `search` | ✅ Live search |
| Addresses | `address/index` | ✅ List + delete |
| New Address | `address/new` | ✅ Create |

## What's Not Yet Built

- **Admin Panel** — No web-based admin app exists yet. Needed for: product/category/order/inventory/coupon/user management, analytics dashboard.
- **Missing DB models** — Coupon, Notification, DeliverySlot, SupportTicket, SearchHistory, RecentlyViewed not yet in Prisma schema.
- **Cloudinary upload** — Image URLs stored in DB but no upload flow from admin.
- **Coupon application** — Coupon code field exists on Order but no validation/discount logic.
- **Review submission** — Users can't submit reviews from the mobile app yet.

## User Preferences

- Do NOT rebuild or overwrite existing working screens/routes.
- Continue from current project state — analyze before writing any code.
- No hardcoded business data, mock APIs, or placeholder objects.
- All data from Neon PostgreSQL via Prisma.
- No AsyncStorage / LocalStorage usage.
