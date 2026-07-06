---
name: Shopify theme conventions for Universal Jackets
description: Key conventions and gotchas for the shopify-theme/ folder in this project
---

## Asset naming
- The Shopify theme's assets are `assets/main.css` and `assets/main.js` (NOT `theme.css`/`theme.js`).
- Do NOT rename these files — dozens of Liquid templates reference them by these names.

## Deprecated Liquid filters
- `img_url` filter is deprecated in modern Shopify (2022+). Always use `image_url`.
- Old: `{{ image | img_url: '600x750', crop: 'center' }}`
- New: `{{ image | image_url: width: 600, height: 750, crop: 'center' }}`

## Variant JSON for product page JS
- The `templates/product.liquid` must include a `<script data-product-variants type="application/json">{{ product.variants | json }}</script>` tag so the vanilla JS variant picker can read it.

## JS utility convention
- `$` = querySelector (returns ONE element)
- `$$` = querySelectorAll (returns an array)
- Always use `$$` when calling `.forEach()` on query results. Using `$(...).forEach(...)` is a runtime bug (querySelector returns null or a single element, not an array).

## main.js structure
- The file was previously corrupted with duplicated IIFE blocks and broken string literals. It was fully rewritten in clean order.
- Keep one copy of each IIFE: initHeroCarousel, initRecSlider, initNavDrawer, initSearch, initFilters, initProductPage, accordion listener, quick-add listener, initAOS, initFileUpload, initPasswordToggle, initMarquee, reduced-motion check.

**Why:** Prior session left the file with code blocks duplicated 3x and broken string concatenations from a failed generation attempt.
