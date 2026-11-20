# Yadgari Perfumes — Luxury Fragrance Storefront

Official production eCommerce storefront for **Yadgari Perfumes**, built with Next.js 16 (App Router), React, Tailwind CSS, TypeScript, MongoDB, Stripe, and enterprise Meta Ads tracking (Pixel + Conversions API).

## 🚀 Features & Capabilities

- **Meta Ads Tracking Suite**:
  - Synchronous `<head>` base script with ID `1803684254231950`.
  - Content Security Policy (CSP) whitelisting `connect.facebook.net` and `facebook.com`.
  - 11 Standard Events: `PageView`, `ViewContent`, `AddToCart`, `AddToWishlist`, `Search`, `InitiateCheckout`, `AddPaymentInfo`, `Purchase`, `Lead`, `Contact`, `CompleteRegistration`.
  - Meta Advanced Matching (EMQ) hashing customer email, phone, name, city.
  - Server-Side Conversions API (CAPI) on Stripe and COD checkouts with deduplication.
- **Edge Caching & Performance**:
  - 24-hour CDN Edge caching for root layout and site settings.
  - On-demand tag-based cache revalidation (`site-settings`, `products`, `categories`) when modified in Admin.
  - Zero redundant ISR writes.
- **Storefront & Admin Experience**:
  - Full product catalog with drag-and-drop & inline Up/Down swapping.
  - Category reordering with `sortOrder` schema.
  - Dynamic SMTP email service with automated order alerts.
  - Multi-method checkout: Stripe Cards, Cash on Delivery, Bank Transfer.

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Production build
npm run build
```

## ⚙️ Environment Variables

Configure your `.env.local`:

```env
MONGODB_URI="your-mongodb-connection-string"
NEXT_PUBLIC_APP_URL="https://yadgariperfumes.com"
NEXT_PUBLIC_META_PIXEL_ID="1803684254231950"
META_ACCESS_TOKEN="your_meta_system_user_capi_token"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
NEXTAUTH_SECRET="your_nextauth_secret"
```
