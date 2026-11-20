---
name: commerce-release-qa
description: Verify this storefront's checkout, order confirmation emails, Stripe payments, and site functionality before a release.
---

Read AGENTS.md before changing code. Inventory storefront, account, and admin routes from src/app. Exercise representative browse, search, product selection, cart, checkout, tracking, authentication, and admin flows in a browser when fixtures are available. Record the route, scenario, expected outcome, and observed result for each failure or blocked check.

Use Stripe test mode and a test mailbox for checkout with side effects. Check success, decline, cancellation, redirect return, delayed confirmation, and repeated webhook delivery. Verify the paid amount and currency against the server-side order and verify that retries do not create a second order, stock adjustment, or confirmation email. Check that completed Stripe and cash-on-delivery orders reach the confirmation screen and that guests can access only the intended order.

If delegating, use the project checkout, Stripe, and storefront QA agents. Run type checks, lint and build separately from runtime checks. Distinguish verified behavior from checks blocked by credentials, seed data, or external services.
