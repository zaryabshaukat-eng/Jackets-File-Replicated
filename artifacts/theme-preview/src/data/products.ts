// Re-export the Product type from the Shopify lib so existing imports keep working.
// The actual Shopify data fetching is in src/lib/shopify.ts + src/hooks/useShopify.ts

export type { Product } from '../lib/shopify';

export const COLOR_MAP: Record<string, string> = {
  Black: '#0a0a0a', Navy: '#1a237e', Brown: '#4e342e', Blue: '#1565c0',
  Camel: '#c8a96e', Beige: '#d4c4a0', Olive: '#4a5240', Grey: '#757575',
  White: '#efefef', Red: '#b71c1c', Burgundy: '#4a0e15', Green: '#2e5c2e',
  Khaki: '#8b7355', Teal: '#00695c', Cream: '#f0ece0', Charcoal: '#2d2d2d',
};

// Mock products used as fallback if Shopify store is empty
export const ALL_PRODUCTS = [
  // ── Bomber Jackets
  { id: 1,  shopifyId: 'mock-1',  title: 'Classic Bomber Jacket',       price: 189, compare: 249, colors: 'Black Navy',       sizes: 'S M L XL',        bg: 'linear-gradient(160deg,#1a1a2e,#0d0d1a)', badge: 'sale',     category: 'bomber',   handle: 'classic-bomber' },
  { id: 2,  shopifyId: 'mock-2',  title: 'Satin Varsity Bomber',         price: 219,               colors: 'Black Red',         sizes: 'XS S M L XL XXL', bg: 'linear-gradient(160deg,#1f0a0a,#0d0404)', badge: 'new',      category: 'bomber',   handle: 'satin-varsity' },
  { id: 3,  shopifyId: 'mock-3',  title: 'Quilted Bomber Jacket',        price: 175, compare: 220, colors: 'Navy Olive',        sizes: 'S M L XL',        bg: 'linear-gradient(160deg,#0b1f3c,#04100e)', badge: 'sale',     category: 'bomber',   handle: 'quilted-bomber' },
  { id: 4,  shopifyId: 'mock-4',  title: 'Suede Bomber Jacket',          price: 245,               colors: 'Camel Brown',       sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#2a1f0e,#160f06)', badge: '',         category: 'bomber',   handle: 'suede-bomber' },
  { id: 5,  shopifyId: 'mock-5',  title: 'MA-1 Flight Jacket',           price: 199,               colors: 'Olive Black Grey',  sizes: 'S M L XL XXL',    bg: 'linear-gradient(160deg,#1a2a1a,#0a160a)', badge: 'new',      category: 'bomber',   handle: 'ma1-flight' },
  { id: 6,  shopifyId: 'mock-6',  title: 'Reversible Puffer Bomber',     price: 159, compare: 199, colors: 'Black White',       sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#1c1c1c,#0a0a0a)', badge: 'sale',     category: 'bomber',   handle: 'reversible-puffer' },
  // ── Leather Jackets
  { id: 7,  shopifyId: 'mock-7',  title: 'Leather Moto Jacket',          price: 299,               colors: 'Brown Black',       sizes: 'XS S M L XL XXL', bg: 'linear-gradient(160deg,#2d1b0e,#1a0e06)', badge: 'new',      category: 'leather',  handle: 'leather-moto' },
  { id: 8,  shopifyId: 'mock-8',  title: 'Cropped Leather Jacket',       price: 259,               colors: 'Black Brown',       sizes: 'XS S M L',        bg: 'linear-gradient(160deg,#1a0808,#0a0404)', badge: 'new',      category: 'leather',  handle: 'cropped-leather' },
  { id: 9,  shopifyId: 'mock-9',  title: 'Double Breasted Leather',      price: 349,               colors: 'Black Navy Camel',  sizes: 'S M L XL',        bg: 'linear-gradient(160deg,#0a0a1a,#040408)', badge: '',         category: 'leather',  handle: 'double-leather' },
  { id: 10, shopifyId: 'mock-10', title: 'Biker Leather Jacket',         price: 279, compare: 359, colors: 'Black Burgundy',    sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#1a0a14,#080408)', badge: 'sale',     category: 'leather',  handle: 'biker-leather' },
  { id: 11, shopifyId: 'mock-11', title: 'Shearling Leather Coat',       price: 399,               colors: 'Brown Camel',       sizes: 'S M L XL XXL',    bg: 'linear-gradient(160deg,#2a1500,#150a00)', badge: '',         category: 'leather',  handle: 'shearling-coat' },
  // ── Puffer Jackets
  { id: 12, shopifyId: 'mock-12', title: 'Puffer Winter Coat',            price: 159,               colors: 'Navy Grey White',   sizes: 'S M L XL',        bg: 'linear-gradient(160deg,#0d1b2a,#061018)', badge: '',         category: 'puffer',   handle: 'puffer-winter' },
  { id: 13, shopifyId: 'mock-13', title: 'Long Puffer Parka',             price: 229,               colors: 'Black Navy Green',  sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#0a0a0a,#041010)', badge: 'new',      category: 'puffer',   handle: 'long-parka' },
  { id: 14, shopifyId: 'mock-14', title: 'Cropped Puffer Jacket',         price: 139, compare: 179, colors: 'Olive White Camel', sizes: 'XS S M L',        bg: 'linear-gradient(160deg,#1a2a10,#0e160a)', badge: 'sale',     category: 'puffer',   handle: 'cropped-puffer' },
  { id: 15, shopifyId: 'mock-15', title: 'Hooded Puffer Vest',            price: 99,                colors: 'Grey Black Navy',   sizes: 'S M L XL XXL',    bg: 'linear-gradient(160deg,#1c1c1c,#0e0e0e)', badge: '',         category: 'puffer',   handle: 'puffer-vest' },
  // ── Denim Jackets
  { id: 16, shopifyId: 'mock-16', title: 'Denim Trucker Jacket',          price: 129,               colors: 'Blue Black',        sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#1f2d4a,#111d30)', badge: 'new',      category: 'denim',    handle: 'denim-trucker' },
  { id: 17, shopifyId: 'mock-17', title: 'Oversized Denim Jacket',        price: 149,               colors: 'Blue Grey',         sizes: 'S M L XL XXL',    bg: 'linear-gradient(160deg,#1a2a40,#0e1a28)', badge: '',         category: 'denim',    handle: 'oversized-denim' },
  { id: 18, shopifyId: 'mock-18', title: 'Dark Wash Denim Jacket',        price: 115, compare: 145, colors: 'Black Navy',        sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#0d1520,#080d14)', badge: 'sale',     category: 'denim',    handle: 'dark-denim' },
  { id: 19, shopifyId: 'mock-19', title: 'Shearling Denim Jacket',        price: 179,               colors: 'Blue Camel',        sizes: 'S M L XL',        bg: 'linear-gradient(160deg,#1c2a40,#101828)', badge: 'new',      category: 'denim',    handle: 'shearling-denim' },
  // ── Trench Coats
  { id: 20, shopifyId: 'mock-20', title: 'Trench Coat Classic',           price: 245,               colors: 'Camel Beige',       sizes: 'S M L XL XXL',    bg: 'linear-gradient(160deg,#2a1f0e,#160f06)', badge: '',         category: 'trench',   handle: 'trench-classic' },
  { id: 21, shopifyId: 'mock-21', title: 'Double Breasted Trench',        price: 289,               colors: 'Black Navy Camel',  sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#0a0a1a,#040408)', badge: '',         category: 'trench',   handle: 'double-trench' },
  { id: 22, shopifyId: 'mock-22', title: 'Belted Trench Coat',            price: 265, compare: 320, colors: 'Cream Beige Grey',  sizes: 'S M L XL',        bg: 'linear-gradient(160deg,#2a2420,#18140e)', badge: 'sale',     category: 'trench',   handle: 'belted-trench' },
  { id: 23, shopifyId: 'mock-23', title: 'Short Trench Jacket',           price: 195,               colors: 'Camel Black',       sizes: 'XS S M L XL XXL', bg: 'linear-gradient(160deg,#241c0e,#140e08)', badge: 'new',      category: 'trench',   handle: 'short-trench' },
  // ── Windbreakers
  { id: 24, shopifyId: 'mock-24', title: 'Windbreaker Pro',               price: 99,  compare: 149, colors: 'Olive Grey',        sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#1a2a1a,#0a160a)', badge: 'sale',     category: 'wind',     handle: 'windbreaker-pro' },
  { id: 25, shopifyId: 'mock-25', title: 'Packable Rain Jacket',          price: 119,               colors: 'Navy Black Green',  sizes: 'S M L XL XXL',    bg: 'linear-gradient(160deg,#0a1018,#040810)', badge: '',         category: 'wind',     handle: 'packable-rain' },
  { id: 26, shopifyId: 'mock-26', title: 'Technical Shell Jacket',        price: 149, compare: 189, colors: 'Grey Black Teal',   sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#141c20,#080c10)', badge: 'sale',     category: 'wind',     handle: 'tech-shell' },
  { id: 27, shopifyId: 'mock-27', title: 'Rain Shell Jacket',             price: 139, compare: 179, colors: 'Navy Olive Grey',   sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#0a1a0a,#041006)', badge: 'sale',     category: 'wind',     handle: 'rain-shell' },
  // ── Fleece / Sherpa
  { id: 28, shopifyId: 'mock-28', title: 'Sherpa Fleece Jacket',          price: 175,               colors: 'Grey Brown White',  sizes: 'S M L XL',        bg: 'linear-gradient(160deg,#2a2a2a,#141414)', badge: '',         category: 'fleece',   handle: 'sherpa-fleece' },
  { id: 29, shopifyId: 'mock-29', title: 'Polar Fleece Zip-Up',           price: 95,                colors: 'Grey Navy Black',   sizes: 'XS S M L XL XXL', bg: 'linear-gradient(160deg,#1a1a20,#0e0e16)', badge: 'new',      category: 'fleece',   handle: 'polar-fleece' },
  { id: 30, shopifyId: 'mock-30', title: 'Sherpa-Lined Bomber',           price: 205, compare: 259, colors: 'Brown Black Camel', sizes: 'S M L XL',        bg: 'linear-gradient(160deg,#201408,#100a04)', badge: 'sale',     category: 'fleece',   handle: 'sherpa-bomber' },
  { id: 31, shopifyId: 'mock-31', title: 'Tech Fleece Hoodie',            price: 115,               colors: 'Grey Black Navy',   sizes: 'S M L XL XXL',    bg: 'linear-gradient(160deg,#1c1c1c,#0a0a0a)', badge: '',         category: 'fleece',   handle: 'tech-fleece' },
  // ── More styles
  { id: 32, shopifyId: 'mock-32', title: 'Utility Field Jacket',          price: 169,               colors: 'Olive Khaki Black', sizes: 'S M L XL XXL',    bg: 'linear-gradient(160deg,#1c2010,#0e1008)', badge: 'new',      category: 'bomber',   handle: 'utility-field' },
  { id: 33, shopifyId: 'mock-33', title: 'Military Fatigue Jacket',       price: 145, compare: 185, colors: 'Olive Khaki',       sizes: 'XS S M L XL',     bg: 'linear-gradient(160deg,#1e2014,#0c100a)', badge: 'sale',     category: 'bomber',   handle: 'military-fatigue' },
  { id: 34, shopifyId: 'mock-34', title: 'Lightweight Summer Jacket',     price: 89,                colors: 'Beige White Navy',  sizes: 'XS S M L XL XXL', bg: 'linear-gradient(160deg,#2a2418,#18140c)', badge: '',         category: 'wind',     handle: 'summer-jacket' },
  { id: 35, shopifyId: 'mock-35', title: 'Waxed Canvas Jacket',           price: 229,               colors: 'Brown Olive Black', sizes: 'S M L XL',        bg: 'linear-gradient(160deg,#1c1408,#0e0c06)', badge: 'new',      category: 'leather',  handle: 'waxed-canvas' },
];

export const BLOG_POSTS = [
  { slug: 'style-bomber-jacket', date: 'July 2025', title: 'How to Style a Bomber Jacket This Season', excerpt: 'From streetwear to smart-casual, five ways to wear our signature bomber without sacrificing comfort or edge.', readTime: '4 min' },
  { slug: 'leather-care-guide',  date: 'June 2025', title: 'The Art of Leather Care: A Complete Guide', excerpt: "Your leather jacket is an investment. Everything you need to keep it looking great for decades.", readTime: '6 min' },
  { slug: 'new-season-drop',     date: 'June 2025', title: "New Season Drop — What's In Store",         excerpt: "We're dropping 14 new styles this autumn. A first look at the silhouettes, materials, and palette.", readTime: '3 min' },
  { slug: 'puffer-coat-guide',   date: 'May 2025',  title: 'Choosing the Right Puffer Coat for Winter', excerpt: "Warmth ratings, fill power, and fit — everything you need to know before you buy your next winter coat.", readTime: '5 min' },
  { slug: 'trench-coat-history', date: 'May 2025',  title: 'The Timeless Trench: A Century of Style',   excerpt: "From World War I trenches to the modern runway, the trench coat has never gone out of style.", readTime: '7 min' },
  { slug: 'denim-jacket-tips',   date: 'April 2025', title: '5 Ways to Wear a Denim Jacket Year-Round', excerpt: "The denim jacket is one of the most versatile pieces in any wardrobe. Here's how to make it work in every season.", readTime: '4 min' },
];

export const NAV_LINKS = [
  { label: 'All Products',  href: '/collections/all' },
  { label: 'New In',        href: '/collections/new-in' },
  { label: 'Bestsellers',   href: '/collections/bestsellers' },
  { label: 'Lookbook',      href: '/pages/lookbook' },
  { label: 'Journal',       href: '/blogs/journal' },
  { label: 'Custom Design', href: '/pages/custom-design' },
  { label: 'About',         href: '/pages/about' },
];

export const FOOTER_LINKS = {
  support: [
    { label: 'Contact Us',       href: '/pages/contact' },
    { label: 'Shipping Info',    href: '/pages/shipping' },
    { label: 'Returns & Refunds',href: '/pages/returns' },
    { label: 'My Account',       href: '/account' },
    { label: 'FAQ',              href: '/pages/faq' },
  ],
  shop: [
    { label: 'New In',           href: '/collections/new-in' },
    { label: 'Bestsellers',      href: '/collections/bestsellers' },
    { label: 'Lookbook',         href: '/pages/lookbook' },
    { label: 'Journal',          href: '/blogs/journal' },
  ],
  company: [
    { label: 'About',            href: '/pages/about' },
    { label: 'Journal',          href: '/blogs/journal' },
    { label: 'Custom Design',    href: '/pages/custom-design' },
    { label: 'Size Guide',       href: '/pages/size-guide' },
    { label: 'Wholesale',        href: '/pages/wholesale' },
  ],
  legal: [
    { label: 'Privacy Policy',   href: '/pages/privacy' },
    { label: 'Terms of Service', href: '/pages/terms' },
    { label: 'Refund Policy',    href: '/pages/returns' },
  ],
};
