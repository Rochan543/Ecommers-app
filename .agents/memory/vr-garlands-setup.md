---
name: VR Garlands setup fixes
description: Key decisions and security fixes made during initial import setup — what was broken and why it was fixed that way
---

# VR Garlands Setup Decisions

## Missing packages (artifacts/api-server/package.json)
google-auth-library, jsonwebtoken, razorpay were imported in source but absent from package.json — added as runtime dependencies.

## Prisma generate must run before build
Dev script: `prisma generate && pnpm run build && pnpm run start`
Without prisma generate, server crashes with "did not initialize yet" on cold start.

## Auth security fix
- Original: mobile sent googleUserInfo payload; server trusted it directly (no cryptographic check)
- Fixed: mobile sends `{ accessToken }` only; server calls Google's userinfo endpoint itself
- Files: `artifacts/vr-garlands/app/(auth)/login.tsx`, `artifacts/api-server/src/routes/auth.ts`

## Payment ownership fix (payments.ts)
Added two checks before updating order/payment status:
1. payment.razorpayOrderId must match the payload razorpayOrderId
2. order.userId must equal req.userId (prevents cross-user order tampering)

## Cart BOLA fix (cart.ts)
PUT/DELETE /api/cart/items/:id now look up user's cart first, then verify cartItem.cartId === userCart.id before any mutation. Returns 404 for non-owned items.

## TypeScript fixes applied
- prisma.ts: removed $on("error"/"warn") — not typed in Prisma v5 without explicit generic
- All route files: cast req.params with String() — Express 5 types params as string | string[]
- lib/api-zod/src/index.ts: removed duplicate `export * from "./generated/types"` (GetCategoryProductsParams collision with api.ts)
- vr-garlands screens: `{ query: { enabled: ... } as any }` — orval hooks manage queryKey internally, TanStack v5 requires it in type
- login.tsx: removed `background: 'linear-gradient(...)'` — web-only CSS, invalid in RN StyleSheet
- profile.tsx + checkout.tsx: `/address/index` → `/address` (Expo Router typed routes)

**Why:** All were pre-existing bugs in the imported project, not introduced by setup.
