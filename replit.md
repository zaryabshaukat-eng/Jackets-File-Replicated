# Universal Jackets — Shopify Theme

A modern, animated Shopify theme for Universal Jackets — premium outerwear. Pure Liquid/CSS/JS — no React, no Tailwind. GitHub-deployable to Shopify.

## Run & Operate

- No dev server needed — this is a static Shopify theme
- Theme files live in `shopify-theme/`
- See `shopify-theme/README.md` for full deployment instructions

## Stack

- Shopify Liquid (templating)
- Vanilla CSS with CSS custom properties (no framework)
- Vanilla JavaScript (no dependencies, ES6+)
- Google Fonts: Cormorant Garamond (headings) + Inter (body)

## Where things live

- `shopify-theme/layout/theme.liquid` — Master layout
- `shopify-theme/assets/main.css` — All styles (~65KB, comprehensive)
- `shopify-theme/assets/main.js` — All JavaScript (~25KB)
- `shopify-theme/sections/` — All page sections (announcement bar, header, hero, etc.)
- `shopify-theme/snippets/product-card.liquid` — Reusable product card snippet
- `shopify-theme/templates/` — Page templates (product, collection, blog, article, cart, etc.)
- `shopify-theme/config/settings_schema.json` — Theme editor settings
- `shopify-theme/locales/en.default.json` — Translations

## Theme Features

- Announcement bar with sparkle animation and 3 rotating messages
- Sticky header: Logo + Search (with live autocomplete) + 3-dot menu + Cart badge
- Mobile: Nav bar drops to bottom of screen on scroll (same icons)
- Hero carousel: fullscreen, auto-plays, touch-swipe, ken-burns zoom
- Recommended products: horizontal slider, auto-scrolls every 10s
- All Products gallery: price range slider, color swatches, size buttons — left sidebar on desktop, slide-up drawer on mobile
- Grid/List view toggle, pagination (desktop), Load More (mobile)
- Two infinite marquee rows (Featured → left, New Arrivals ← right)
- Custom design upload form with drag & drop
- Blog/Journal preview section
- Trust bar + full footer with 4 link columns
- AJAX add to cart on product cards and product page
- Product page: image gallery, variant swatches, size buttons, rating, quantity, accordions
- Split-panel auth pages (login, register, forgot password)
- Full SEO: JSON-LD schema, Open Graph, canonical URLs

## Deploying to Shopify

1. Push `shopify-theme/` folder contents to a GitHub repo
2. In Shopify Admin → Online Store → Themes → Add theme → Connect from GitHub
3. Publish — theme editor lets you customize all content without touching code

## User preferences

- No React, no Tailwind — Shopify-compatible Liquid/CSS/JS only
- Modern, stylish design with animations
- Mobile-friendly with sticky bottom nav bar on scroll
- Products available on main homepage and individual product pages with filter options

## Pointers

- See `shopify-theme/README.md` for detailed deployment and product setup instructions
