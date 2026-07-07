// Shopify Storefront API client
// Uses VITE_ prefixed env vars so the public storefront token is set at
// build time from process.env — never hardcoded in source.
// Only public (read-only) Storefront API tokens are safe for client-side use.
// NEVER set PRIVATE_STOREFRONT_API_TOKEN or SHOPIFY_ADMIN_API_TOKEN here.

const STORE_DOMAIN = import.meta.env.VITE_PUBLIC_STORE_DOMAIN as string
  || import.meta.env.PUBLIC_STORE_DOMAIN as string
  || '';
const STOREFRONT_API_TOKEN = import.meta.env.VITE_PUBLIC_STOREFRONT_API_TOKEN as string
  || import.meta.env.PUBLIC_STOREFRONT_API_TOKEN as string
  || '';
const API_VERSION = '2024-04';
const STOREFRONT_API_URL = import.meta.env.VITE_SHOPIFY_STOREFRONT_API_URL as string
  || import.meta.env.SHOPIFY_STOREFRONT_API_URL as string
  || (STORE_DOMAIN ? `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json` : '');

// ── Types ────────────────────────────────────────────────────────────────────

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: { name: string; value: string }[];
  price: { amount: string; currencyCode: string };
  compareAtPrice: { amount: string; currencyCode: string } | null;
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  productType: string;
  tags: string[];
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ShopifyVariant }[] };
}

export interface ShopifyArticle {
  id: string;
  title: string;
  handle: string;
  publishedAt: string;
  excerpt: string | null;
  content: string;
  contentHtml: string;
  author: { name: string };
  image: ShopifyImage | null;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  lines: {
    edges: {
      node: {
        id: string;
        quantity: number;
        merchandise: { id: string; title: string };
      };
    }[];
  };
}

// ── Adapted types (compatible with existing UI) ────────────────────────────

export interface Product {
  id: number;
  shopifyId: string;
  title: string;
  price: number;
  compare?: number;
  colors: string;
  sizes: string;
  bg: string;
  badge: string;
  category: string;
  handle: string;
  imageUrl?: string;
  images?: string[];
  description?: string;
  descriptionHtml?: string;
  variantId?: string;
  variants?: ShopifyVariant[];
  tags?: string[];
}

// ── Category mapping ──────────────────────────────────────────────────────

const PRODUCT_TYPE_TO_CATEGORY: Record<string, string> = {
  'bomber jacket': 'bomber',
  'bomber jackets': 'bomber',
  'leather jacket': 'leather',
  'leather jackets': 'leather',
  'puffer jacket': 'puffer',
  'puffer jackets': 'puffer',
  'puffer coat': 'puffer',
  'denim jacket': 'denim',
  'denim jackets': 'denim',
  'trench coat': 'trench',
  'trench coats': 'trench',
  'windbreaker': 'wind',
  'windbreakers': 'wind',
  'fleece': 'fleece',
  'fleece jacket': 'fleece',
  'sherpa': 'fleece',
};

const TAG_TO_CATEGORY: Record<string, string> = {
  bomber: 'bomber',
  leather: 'leather',
  puffer: 'puffer',
  denim: 'denim',
  trench: 'trench',
  windbreaker: 'wind',
  wind: 'wind',
  fleece: 'fleece',
  sherpa: 'fleece',
};

const GRADIENT_PALETTE = [
  'linear-gradient(160deg,#1a1a2e,#0d0d1a)',
  'linear-gradient(160deg,#1f0a0a,#0d0404)',
  'linear-gradient(160deg,#0b1f3c,#04100e)',
  'linear-gradient(160deg,#2a1f0e,#160f06)',
  'linear-gradient(160deg,#1a2a1a,#0a160a)',
  'linear-gradient(160deg,#1c1c1c,#0a0a0a)',
  'linear-gradient(160deg,#2d1b0e,#1a0e06)',
  'linear-gradient(160deg,#1a0808,#0a0404)',
  'linear-gradient(160deg,#0a0a1a,#040408)',
  'linear-gradient(160deg,#1a0a14,#080408)',
];

function getGradient(index: number): string {
  return GRADIENT_PALETTE[index % GRADIENT_PALETTE.length];
}

function deriveCategory(product: ShopifyProduct): string {
  const type = product.productType?.toLowerCase().trim();
  if (type && PRODUCT_TYPE_TO_CATEGORY[type]) return PRODUCT_TYPE_TO_CATEGORY[type];
  for (const tag of product.tags) {
    const t = tag.toLowerCase().trim();
    if (TAG_TO_CATEGORY[t]) return TAG_TO_CATEGORY[t];
  }
  return 'bomber'; // default
}

function deriveBadge(product: ShopifyProduct, price: number, compare: number | undefined): string {
  const tags = product.tags.map(t => t.toLowerCase());
  if (tags.includes('new')) return 'new';
  if (compare && compare > price) return 'sale';
  if (tags.includes('sale')) return 'sale';
  return '';
}

// ── Adapter ───────────────────────────────────────────────────────────────

let productCounter = 0;

export function adaptProduct(sp: ShopifyProduct, index = 0): Product {
  const price = parseFloat(sp.priceRange.minVariantPrice.amount);
  const compareAtAmount = sp.compareAtPriceRange?.minVariantPrice?.amount;
  const compareAt = compareAtAmount ? parseFloat(compareAtAmount) : undefined;
  const compare = compareAt && compareAt > price ? compareAt : undefined;

  // Extract color options from variants
  const colorSet = new Set<string>();
  const sizeSet = new Set<string>();
  sp.variants.edges.forEach(({ node: v }) => {
    v.selectedOptions.forEach(opt => {
      const name = opt.name.toLowerCase();
      if (name === 'color' || name === 'colour') colorSet.add(opt.value);
      if (name === 'size') sizeSet.add(opt.value);
    });
  });

  const colors = colorSet.size > 0 ? [...colorSet].join(' ') : 'Black';
  const sizes = sizeSet.size > 0 ? [...sizeSet].join(' ') : 'S M L XL';

  const imageUrls = sp.images.edges.map(e => e.node.url);
  const imageUrl = imageUrls[0];

  // Numeric ID from Shopify GID
  const shopifyNumId = parseInt(sp.id.split('/').pop() || '0', 10);

  return {
    id: shopifyNumId || ++productCounter,
    shopifyId: sp.id,
    title: sp.title,
    handle: sp.handle,
    price,
    compare,
    colors,
    sizes,
    bg: getGradient(index),
    badge: deriveBadge(sp, price, compare),
    category: deriveCategory(sp),
    imageUrl,
    images: imageUrls,
    description: sp.description,
    descriptionHtml: sp.descriptionHtml,
    variantId: sp.variants.edges[0]?.node.id,
    variants: sp.variants.edges.map(e => e.node),
    tags: sp.tags,
  };
}

// ── GraphQL fetcher ───────────────────────────────────────────────────────

async function shopifyFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(STOREFRONT_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_API_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Shopify API error: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join(', '));
  }
  return json.data as T;
}

// ── GraphQL Fragments ─────────────────────────────────────────────────────

const PRODUCT_FIELDS = `
  id title handle description descriptionHtml productType tags
  priceRange {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  compareAtPriceRange {
    minVariantPrice { amount currencyCode }
  }
  images(first: 6) {
    edges { node { url altText } }
  }
  variants(first: 50) {
    edges {
      node {
        id title availableForSale
        selectedOptions { name value }
        price { amount currencyCode }
        compareAtPrice { amount currencyCode }
      }
    }
  }
`;

// ── API Functions ─────────────────────────────────────────────────────────

export async function getAllProducts(first = 100): Promise<Product[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] };
  }>(`
    query GetAllProducts($first: Int!) {
      products(first: $first, sortKey: TITLE) {
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }
  `, { first });

  return data.products.edges.map((e, i) => adaptProduct(e.node, i));
}

export async function getProductByHandle(handle: string): Promise<Product | null> {
  const data = await shopifyFetch<{
    product: ShopifyProduct | null;
  }>(`
    query GetProduct($handle: String!) {
      product(handle: $handle) { ${PRODUCT_FIELDS} }
    }
  `, { handle });

  return data.product ? adaptProduct(data.product, 0) : null;
}

export async function getCollectionProducts(collectionHandle: string, first = 100): Promise<Product[]> {
  const data = await shopifyFetch<{
    collection: { products: { edges: { node: ShopifyProduct }[] } } | null;
  }>(`
    query GetCollection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        products(first: $first, sortKey: TITLE) {
          edges { node { ${PRODUCT_FIELDS} } }
        }
      }
    }
  `, { handle: collectionHandle, first });

  if (!data.collection) return [];
  return data.collection.products.edges.map((e, i) => adaptProduct(e.node, i));
}

export async function searchProducts(query: string, first = 50): Promise<Product[]> {
  const data = await shopifyFetch<{
    products: { edges: { node: ShopifyProduct }[] };
  }>(`
    query SearchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query, sortKey: RELEVANCE) {
        edges { node { ${PRODUCT_FIELDS} } }
      }
    }
  `, { query, first });

  return data.products.edges.map((e, i) => adaptProduct(e.node, i));
}

export async function getBlogArticles(blogHandle = 'journal', first = 20): Promise<ShopifyArticle[]> {
  try {
    const data = await shopifyFetch<{
      blog: { articles: { edges: { node: ShopifyArticle }[] } } | null;
    }>(`
      query GetBlogArticles($handle: String!, $first: Int!) {
        blog(handle: $handle) {
          articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
            edges {
              node {
                id title handle publishedAt excerpt content contentHtml
                author { name }
                image { url altText }
              }
            }
          }
        }
      }
    `, { handle: blogHandle, first });

    return data.blog?.articles.edges.map(e => e.node) ?? [];
  } catch {
    return [];
  }
}

export async function getArticleByHandle(blogHandle: string, articleHandle: string): Promise<ShopifyArticle | null> {
  try {
    const data = await shopifyFetch<{
      blog: { articleByHandle: ShopifyArticle | null } | null;
    }>(`
      query GetArticle($blogHandle: String!, $articleHandle: String!) {
        blog(handle: $blogHandle) {
          articleByHandle(handle: $articleHandle) {
            id title handle publishedAt excerpt content contentHtml
            author { name }
            image { url altText }
          }
        }
      }
    `, { blogHandle, articleHandle });

    return data.blog?.articleByHandle ?? null;
  } catch {
    return null;
  }
}

// ── Cart API ──────────────────────────────────────────────────────────────

export async function createCart(lines: { merchandiseId: string; quantity: number }[]): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartCreate: { cart: ShopifyCart; userErrors: { field: string[]; message: string }[] };
  }>(`
    mutation CreateCart($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id checkoutUrl
          lines(first: 50) {
            edges {
              node {
                id quantity
                merchandise { ... on ProductVariant { id title } }
              }
            }
          }
        }
        userErrors { field message }
      }
    }
  `, { input: { lines } });

  if (data.cartCreate.userErrors.length > 0) {
    throw new Error(data.cartCreate.userErrors.map(e => e.message).join(', '));
  }
  return data.cartCreate.cart;
}

export async function addCartLines(
  cartId: string,
  lines: { merchandiseId: string; quantity: number }[]
): Promise<ShopifyCart> {
  const data = await shopifyFetch<{
    cartLinesAdd: { cart: ShopifyCart };
  }>(`
    mutation AddLines($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { id checkoutUrl }
      }
    }
  `, { cartId, lines });

  return data.cartLinesAdd.cart;
}
