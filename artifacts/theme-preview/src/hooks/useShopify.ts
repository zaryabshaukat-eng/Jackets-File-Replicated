import { useState, useEffect, useRef } from 'react';
import * as shopify from '../lib/shopify';
import type { Product, ShopifyArticle } from '../lib/shopify';
import { ALL_PRODUCTS, BLOG_POSTS } from '../data/products';

// ── Cache ────────────────────────────────────────────────────────────────────
const cache: Record<string, { data: Product[]; ts: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): Product[] | null {
  const entry = cache[key];
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data;
  return null;
}

function setCached(key: string, data: Product[]) {
  cache[key] = { data, ts: Date.now() };
}

// Fallback: convert mock products to the new Product shape
function getMockProducts(): Product[] {
  return ALL_PRODUCTS.map(p => ({
    ...p,
    shopifyId: `mock-${p.id}`,
    variantId: undefined,
    imageUrl: undefined,
  }));
}

// ── useProducts ───────────────────────────────────────────────────────────────
export interface UseProductsOptions {
  collection?: string; // Shopify collection handle or category slug
  badge?: string;      // 'new' | 'sale'
  search?: string;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { collection, badge, search } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        let result: Product[];
        const cacheKey = `products:${collection ?? ''}:${badge ?? ''}:${search ?? ''}`;
        const cached = getCached(cacheKey);

        if (cached) {
          result = cached;
        } else if (search) {
          result = await shopify.searchProducts(search);
          if (result.length === 0) {
            // Local fallback search on mock data
            const q = search.toLowerCase();
            result = getMockProducts().filter(p =>
              p.title.toLowerCase().includes(q) ||
              p.category.toLowerCase().includes(q)
            );
          }
        } else if (collection && collection !== 'all') {
          // Try Shopify collection first
          result = await shopify.getCollectionProducts(collection);
          if (result.length === 0) {
            // Fallback: filter mock products by category
            const mock = getMockProducts();
            if (badge) {
              result = mock.filter(p => p.badge === badge);
            } else {
              result = mock.filter(p => p.category === collection);
              if (result.length === 0) result = mock; // last resort
            }
          }
        } else {
          // All products
          result = await shopify.getAllProducts(100);
          if (result.length === 0) result = getMockProducts();
        }

        // Filter by badge if specified and result came from Shopify
        if (badge && collection !== badge) {
          const badgeFiltered = result.filter(p => p.badge === badge);
          if (badgeFiltered.length > 0) result = badgeFiltered;
        }

        setCached(cacheKey, result);
        if (!cancelled) setProducts(result);
      } catch (err) {
        console.warn('Shopify fetch failed, using mock data:', err);
        if (!cancelled) {
          const mock = getMockProducts();
          if (search) {
            const q = search.toLowerCase();
            setProducts(mock.filter(p =>
              p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
            ));
          } else if (badge) {
            setProducts(mock.filter(p => p.badge === badge));
          } else if (collection && collection !== 'all') {
            const filtered = mock.filter(p => p.category === collection);
            setProducts(filtered.length > 0 ? filtered : mock);
          } else {
            setProducts(mock);
          }
          setError(null); // Silent fallback - UI still works
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [collection, badge, search]);

  return { products, loading, error };
}

// ── useProduct ────────────────────────────────────────────────────────────────
export function useProduct(handle: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!handle) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    async function load() {
      try {
        const result = await shopify.getProductByHandle(handle!);
        if (!cancelled) {
          if (result) {
            setProduct(result);
          } else {
            // Fallback to mock data
            const mock = getMockProducts().find(p => p.handle === handle) ?? null;
            setProduct(mock);
          }
        }
      } catch (err) {
        console.warn('Shopify product fetch failed:', err);
        if (!cancelled) {
          const mock = getMockProducts().find(p => p.handle === handle) ?? null;
          setProduct(mock);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [handle]);

  return { product, loading, error };
}

// ── Blog post adapter ────────────────────────────────────────────────────────

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  readTime: string;
  imageUrl?: string;
  content?: string;
  contentHtml?: string;
  author?: string;
}

function adaptArticle(article: ShopifyArticle): BlogPost {
  const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
    month: 'long', year: 'numeric',
  });
  const wordCount = article.content?.split(' ').length ?? 200;
  const readTime = `${Math.max(1, Math.round(wordCount / 200))} min`;
  return {
    slug: article.handle,
    title: article.title,
    date,
    excerpt: article.excerpt ?? (article.content ? article.content.slice(0, 180) + '...' : ''),
    readTime,
    imageUrl: article.image?.url,
    content: article.content,
    contentHtml: article.contentHtml,
    author: article.author.name,
  };
}

// Fallback mock posts
function getMockBlogPosts(): BlogPost[] {
  return BLOG_POSTS.map(p => ({ ...p, imageUrl: undefined, content: undefined }));
}

// ── useBlogPosts ──────────────────────────────────────────────────────────────
export function useBlogPosts(blogHandle = 'journal') {
  const [posts, setPosts]   = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const articles = await shopify.getBlogArticles(blogHandle, 20);
        if (!cancelled) {
          if (articles.length > 0) {
            setPosts(articles.map(adaptArticle));
          } else {
            setPosts(getMockBlogPosts());
          }
        }
      } catch {
        if (!cancelled) setPosts(getMockBlogPosts());
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [blogHandle]);

  return { posts, loading };
}

// ── useBlogPost ───────────────────────────────────────────────────────────────
export function useBlogPost(blogHandle: string, articleHandle: string | undefined) {
  const [post, setPost]       = useState<BlogPost | null>(null);
  const [posts, setPosts]     = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [article, allArticles] = await Promise.all([
          articleHandle ? shopify.getArticleByHandle(blogHandle, articleHandle) : (Promise.resolve(null) as Promise<shopify.ShopifyArticle | null>),
          shopify.getBlogArticles(blogHandle, 20),
        ]);
        if (!cancelled) {
          const adaptedAll = allArticles.length > 0 ? allArticles.map(adaptArticle) : getMockBlogPosts();
          setPosts(adaptedAll);
          if (article) {
            setPost(adaptArticle(article));
          } else if (articleHandle) {
            const fallback = adaptedAll.find(p => p.slug === articleHandle) ?? adaptedAll[0] ?? null;
            setPost(fallback);
          }
        }
      } catch {
        if (!cancelled) {
          const mock = getMockBlogPosts();
          setPosts(mock);
          if (articleHandle) {
            setPost(mock.find(p => p.slug === articleHandle) ?? mock[0] ?? null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [blogHandle, articleHandle]);

  return { post, posts, loading };
}
