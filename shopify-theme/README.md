# Universal Jackets — Shopify Theme

A modern, animated Shopify theme for Universal Jackets — premium outerwear.

## Theme Structure

```
shopify-theme/
├── assets/
│   ├── main.css          ← All styles (no Tailwind, no frameworks)
│   └── main.js           ← All JavaScript (vanilla JS only)
├── config/
│   ├── settings_schema.json  ← Theme editor settings
│   └── settings_data.json    ← Default values
├── layout/
│   └── theme.liquid      ← Master layout (head, header, footer, scripts)
├── locales/
│   └── en.default.json   ← Translations
├── sections/
│   ├── announcement-bar.liquid   ← Top announcement strip
│   ├── header.liquid             ← Logo, search, nav dots, cart
│   ├── hero-carousel.liquid      ← Fullscreen image slider
│   ├── recommended-products.liquid ← Auto-scrolling product strip
│   ├── product-gallery.liquid    ← All products + filters
│   ├── marquee-featured.liquid   ← Two infinite-scroll marquees
│   ├── custom-design.liquid      ← Upload-your-design contact form
│   ├── blog-preview.liquid       ← Journal/blog preview
│   └── footer.liquid             ← Trust bar + full footer
├── snippets/
│   ├── product-card.liquid  ← Reusable product card
│   └── pagination.liquid    ← Pagination component
└── templates/
    ├── index.json           ← Homepage section configuration
    ├── product.liquid        ← Single product page
    ├── collection.liquid     ← Collection/category page
    ├── blog.liquid           ← Blog listing
    ├── article.liquid        ← Blog article
    ├── page.liquid           ← Generic static page
    ├── cart.liquid           ← Cart page
    ├── search.liquid         ← Search results
    ├── 404.liquid            ← Not found page
    └── customers/
        ├── login.liquid      ← Sign in
        ├── register.liquid   ← Create account
        ├── account.liquid    ← Order history
        └── recover.liquid    ← Password reset
```

## Features

- **Announcement Bar** — sparkle text, 3 messages separated by `|`, with sale link
- **Header** — logo text, search box (with live autocomplete), unique 3-dot menu, cart badge
- **Mobile** — sticky bottom navigation bar appears on scroll; same as desktop header
- **Hero Carousel** — fullscreen, auto-plays every 5.5s, touch-swipe, ken-burns image zoom
- **Recommended Products** — horizontally scrollable, auto-scrolls every 10s, progress bar
- **Product Gallery** — 20 products, desktop left filters (price range slider, color swatches, sizes), mobile slide-up filter drawer, grid/list view toggle, pagination (desktop) / load more (mobile)
- **Marquee Rows** — Featured (left→right), New Arrivals (right→left), pause on hover
- **Custom Design Form** — drag & drop file upload, all contact fields, Shopify contact form
- **Blog Preview** — links to Journal section, article previews
- **Footer** — trust bar (Free Delivery / Returns / Secure Payment / 24/7 Support), brand info, 4 link columns, social icons
- **Product Page** — image gallery with thumbnails, variant swatches, size buttons, rating display, quantity selector, AJAX add to cart, accordions
- **Auth Pages** — split-panel design (decorative left + form right)
- **SEO** — Schema.org JSON-LD, canonical URLs, meta tags, Open Graph
- **Animations** — CSS keyframe animations, scroll-triggered reveals, parallax

## Deploying to Shopify

### Method 1: GitHub (Recommended)
1. Push this repo to GitHub
2. In Shopify Admin → Online Store → Themes → Add theme → Connect from GitHub
3. Select the repository and `shopify-theme/` as the theme root (or move files to root)
4. Click "Publish"

### Method 2: Shopify CLI
```bash
cd shopify-theme
shopify theme push --store your-store.myshopify.com
```

### Method 3: Zip Upload
1. Zip the contents of `shopify-theme/` (not the folder itself)
2. Shopify Admin → Online Store → Themes → Add theme → Upload zip file

## Admin & Customization

The Shopify admin panel (your-store.myshopify.com/admin) handles:
- **Products** — Add products with images, variants (Color, Size), compare-at price for sale badge
- **Collections** — Bomber Jackets, Leather Jackets, Puffer Jackets, Denim Jackets, Trench Coats, Windbreakers, New In, Bestsellers
- **Theme Editor** — Customize all section settings without touching code
- **Pages** — About, Lookbook, Contact, Shipping, Returns, Size Guide, Custom Design, FAQ
- **Blog** — Add articles under the "Journal" blog handle
- **Navigation** — Build collection menus with subcategories

## Product Setup Tips

For filters to work correctly, set up product variants with:
- **Option 1**: Color (Black, Brown, Navy, Olive, Grey, Camel, Red, White)
- **Option 2**: Size (XS, S, M, L, XL, XXL)
- Tag products with `new` or `New` for the "New" badge

## SEO Notes

- Add `{{ page_title }} | Universal Jackets` through Shopify's SEO fields
- Every product page includes JSON-LD Product schema
- Use Shopify's built-in SEO settings for meta descriptions
- Blog articles auto-generate BlogPosting schema
