---
name: Shopify Storefront API — theme-preview wiring
description: How the existing theme-preview React/Vite artifact was connected to the Shopify Storefront API.
---

# Shopify Storefront API integration in theme-preview

## What was done
The `artifacts/theme-preview` React/Vite artifact (preview path `/`) was wired to the Shopify Storefront API without replacing the existing CSS/component structure. Only data-fetching was replaced.

## Key files
- `src/lib/shopify.ts` — Storefront API client + GraphQL queries + `adaptProduct()` adapter
- `src/hooks/useShopify.ts` — React hooks (useProducts, useProduct, useBlogPosts, useBlogPost) with silent mock fallback
- `src/context/CartContext.tsx` — cart state + real Shopify cartCreate mutation + checkout redirect
- `src/data/products.ts` — re-exports Product type; keeps mock data as fallback with `shopifyId` field

## Credential pattern
Tokens come from `import.meta.env` (never hardcoded). Priority order:
1. `VITE_PUBLIC_STORE_DOMAIN` / `VITE_PUBLIC_STOREFRONT_API_TOKEN` / `VITE_SHOPIFY_STOREFRONT_API_URL`
2. `PUBLIC_STORE_DOMAIN` / `PUBLIC_STOREFRONT_API_TOKEN` / `SHOPIFY_STOREFRONT_API_URL` (set in `.replit` `[userenv.shared]`)

**Why:** Storefront token is public/read-only; safe client-side. Private/admin tokens must NEVER be used here.

## Checkout flow
- Items with `variantId` starting with `"mock"` are blocked at checkout with explicit user message.
- Mixed carts (some real, some mock): real items proceed to Shopify checkout; mock items show a warning.
- All-mock cart: shows "Demo mode" error, no redirect.

## Workflow setup
The managed artifact workflow (`artifacts/theme-preview: web`) wasn't available through WorkflowsRestart. A "Start application" workflow was configured manually:
```
PORT=20716 BASE_PATH=/ pnpm --filter @workspace/theme-preview run dev
```
PORT and BASE_PATH are required by `vite.config.ts` and would normally be injected by the managed artifact workflow.

**Why:** vite.config.ts throws if PORT or BASE_PATH are missing — the managed workflow injects them via artifact.toml `[services.env]` but a plain workflow does not.
