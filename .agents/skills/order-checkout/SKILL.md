---
name: order-checkout
description: Maintain this storefront's Stripe, cash-on-delivery, and manual checkout flows, order confirmation screens, and customer receipts.
---

Read AGENTS.md. Start with the checkout page and its enabled payment methods. Keep shipping and product pricing server-authoritative. Preserve the order's currency and payment state across the checkout quote, stored order, confirmation page, and customer receipt.

For Stripe, trace the PaymentIntent and pending checkout through the signed webhook. Check ID, amount, currency, and successful payment status before creating an order or changing inventory. Order creation and the stock update require a transaction-capable MongoDB deployment. Check webhook replay and preserve the cart until confirmation. Cash-on-delivery and manual orders have separate pending payment labels.

Keep private delivery details restricted to the account that owns the order. Check the order link from the receipt and preserve the tracking route for guests. Report mail transport failures separately from order creation, and use an isolated store and test mailbox for end-to-end checks.
