# Sqodex Shopify Template Setup Guide

Welcome to the definitive Next.js 15 E-Commerce Template. This repository uses the Repository Pattern, Server Actions, Upstash Redis caching, MongoDB, and NextAuth v5.

Follow these steps to deploy this template for a new client.

## 1. Prerequisites
- Node.js 18+
- A MongoDB Cluster (e.g., MongoDB Atlas)
- An Upstash Redis database
- A Stripe account
- A Vercel account

## 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in the following critical variables:

### Database & Cache
- \`MONGODB_URI\`: Connection string to your MongoDB cluster.
- \`UPSTASH_REDIS_REST_URL\` and \`UPSTASH_REDIS_REST_TOKEN\`: Found in your Upstash console.

### Authentication
- \`AUTH_SECRET\`: Generate a secure random string (e.g., \`openssl rand -base64 32\`).
- \`AUTH_GOOGLE_ID\` and \`AUTH_GOOGLE_SECRET\`: From Google Cloud Console for OAuth.

### Stripe
- \`STRIPE_SECRET_KEY\` and \`STRIPE_PUBLISHABLE_KEY\`: From the Stripe Dashboard (API Keys).
- \`STRIPE_WEBHOOK_SECRET\`: Run \`stripe listen --forward-to localhost:3000/api/webhooks/stripe\` to get your local signing secret, or configure an endpoint in the Stripe Dashboard for production.

### Email (Nodemailer)
- Configure your SMTP host, port, user, and password to enable automated order confirmation emails.

## 3. Initializing the Database (Super Admin)
Because the Admin routes (`/admin/*`) are protected by NextAuth middleware, you need a Super Admin to access them.
1. Start the app: \`npm run dev\`
2. Sign in via Google at \`/api/auth/signin\`.
3. Open your MongoDB GUI (e.g., MongoDB Compass), find the newly created `users` document, and manually change the \`role\` string to \`"SUPER_ADMIN"\`.
4. You can now access \`/admin/dashboard\`.

## 4. Hardening & Monitoring (Optional but Recommended)
- **Sentry**: Run \`npx @sentry/nextjs@latest wizard -i nextjs\` to automatically install and configure Sentry for production error tracking.
- **Vercel Analytics**: Enable Speed Insights and Web Analytics directly from the Vercel dashboard.

## 5. Deployment
1. Push your cloned repo to GitHub.
2. Import the project into Vercel.
3. Add all your `.env.local` variables into Vercel's Environment Variables settings.
4. Deploy!
