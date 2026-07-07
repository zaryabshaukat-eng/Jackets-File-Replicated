import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useLocation } from '../router';
import { COLOR_MAP } from '../data/products';
import type { Product } from '../lib/shopify';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../hooks/useShopify';

const SIZES  = ['XS','S','M','L','XL','XXL'];
const COLORS = [
  { key:'',         label:'All',      style:{ background:'linear-gradient(135deg,#0a0a0a 50%,#c8a96e 50%)' } },
  { key:'Black',    label:'Black',    style:{ background: COLOR_MAP.Black } },
  { key:'Brown',    label:'Brown',    style:{ background: COLOR_MAP.Brown } },
  { key:'Navy',     label:'Navy',     style:{ background: COLOR_MAP.Navy } },
  { key:'Olive',    label:'Olive',    style:{ background: COLOR_MAP.Olive } },
  { key:'Grey',     label:'Grey',     style:{ background: COLOR_MAP.Grey } },
  { key:'Camel',    label:'Camel',    style:{ background: COLOR_MAP.Camel } },
  { key:'Red',      label:'Red',      style:{ background: COLOR_MAP.Red } },
  { key:'Blue',     label:'Blue',     style:{ background: COLOR_MAP.Blue } },
];
const CATEGORIES = [
  { key:'',        label:'All Categories' },
  { key:'bomber',  label:'Bomber Jackets' },
  { key:'leather', label:'Leather Jackets' },
  { key:'puffer',  label:'Puffer Jackets' },
  { key:'denim',   label:'Denim Jackets' },
  { key:'trench',  label:'Trench Coats' },
  { key:'wind',    label:'Windbreakers' },
  { key:'fleece',  label:'Fleece & Sherpa' },
];
type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 24 }}>
      {[...Array(6)].map((_,i) => (
        <div key={i} style={{ borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ height: 260, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ padding: '12px 0' }}>
            <div style={{ height: 14, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 12, background: '#f0f0f0', borderRadius: 4, width: '60%' }} />
          </div>
        </div>
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  );
}

export default function SearchPage() {
  const params   = useSearchParams();
  const [, nav]  = useLocation();
  const rawQ     = params.get('q') ?? '';

  const [query,       setQuery]  = useState(rawQ);
  const [inputVal,    setInput]  = useState(rawQ);
  const [sortKey,     setSort]   = useState<SortKey>('relevance');
  const [priceMin,    setMin]    = useState(0);
  const [priceMax,    setMax]    = useState(500);
  const [activeColor, setColor]  = useState('');
  const [activeSize,  setSize]   = useState('');
  const [activecat,   setCat]    = useState('');
  const [visible,     setVisible] = useState(24);
  const [viewMode,    setView]   = useState<'grid'|'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Debounced search against Shopify
  const [debouncedSearch, setDebouncedSearch] = useState(rawQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setQuery(rawQ);
    setInput(rawQ);
    setDebouncedSearch(rawQ);
    setVisible(24);
  }, [rawQ]);

  // Load all products for browsing (when no query)
  const { products: allProducts, loading: allLoading } = useProducts({ collection: 'all' });
  // Load search results when there's a query
  const { products: searchResults, loading: searchLoading } = useProducts(
    debouncedSearch ? { search: debouncedSearch } : {}
  );

  const loading = debouncedSearch ? searchLoading : allLoading;
  const baseProducts = debouncedSearch ? searchResults : allProducts;

  const q = query.trim().toLowerCase();

  // Score and filter products
  const scored: Array<{ product: Product; score: number }> = useMemo(() => {
    return baseProducts.map(p => {
      let score = 0;
      if (!q) { score = 1; }
      else {
        const title  = p.title.toLowerCase();
        const cat    = p.category.toLowerCase();
        const colors = p.colors.toLowerCase();
        if (title === q)              score += 100;
        else if (title.startsWith(q)) score += 50;
        else if (title.includes(q))   score += 30;
        if (cat.includes(q))          score += 20;
        if (colors.includes(q))       score += 10;
        if (p.badge.includes(q))      score += 5;
        if (p.tags?.some(t => t.toLowerCase().includes(q))) score += 8;
      }
      return { product: p, score };
    }).filter(({ score }) => score > 0);
  }, [baseProducts, q]);

  // Dynamic price max
  const dataMaxPrice = useMemo(() => {
    if (baseProducts.length === 0) return 500;
    return Math.ceil(Math.max(...baseProducts.map(p => p.price)) / 50) * 50;
  }, [baseProducts]);

  const filtered: Product[] = useMemo(() => {
    return scored
      .filter(({ product: p }) => {
        if (p.price < priceMin || p.price > priceMax) return false;
        if (activeColor && !p.colors.toLowerCase().includes(activeColor.toLowerCase())) return false;
        if (activeSize  && !p.sizes.toLowerCase().includes(activeSize.toLowerCase()))   return false;
        if (activecat   && p.category !== activecat)                                     return false;
        return true;
      })
      .sort((a, b) => {
        switch (sortKey) {
          case 'price-asc':  return a.product.price - b.product.price;
          case 'price-desc': return b.product.price - a.product.price;
          case 'name-asc':   return a.product.title.localeCompare(b.product.title);
          case 'name-desc':  return b.product.title.localeCompare(a.product.title);
          default:           return b.score - a.score;
        }
      })
      .map(({ product }) => product);
  }, [scored, sortKey, priceMin, priceMax, activeColor, activeSize, activecat]);

  useEffect(() => { setVisible(24); }, [query, priceMin, priceMax, activeColor, activeSize, activecat, sortKey]);

  const shown   = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const fillLeft  = (priceMin / dataMaxPrice * 100).toFixed(1) + '%';
  const fillRight = ((dataMaxPrice - priceMax) / dataMaxPrice * 100).toFixed(1) + '%';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed) nav(`/search?q=${encodeURIComponent(trimmed)}`);
    else nav('/search');
  }

  function clearFilters() {
    setMin(0); setMax(dataMaxPrice); setColor(''); setSize(''); setCat(''); setSort('relevance');
  }

  const hasActiveFilters = priceMin > 0 || priceMax < dataMaxPrice || activeColor || activeSize || activecat;

  return (
    <div>
      {/* ── Search Header Banner ── */}
      <div style={{
        background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1208 100%)',
        padding: '48px var(--container-pad) 40px',
        color: '#fff',
        borderBottom: '1px solid rgba(200,169,110,.2)',
      }}>
        <div className="container">
          <nav style={{ fontSize:12, opacity:.6, marginBottom:20 }}>
            <Link href="/">Home</Link>
            <span style={{ margin:'0 8px' }}>/</span>
            <span>Search</span>
          </nav>
          <p className="section-label" style={{ color:'var(--clr-gold)', marginBottom:8 }}>Search Results</p>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(28px,4vw,48px)', fontWeight:400, marginBottom:24 }}>
            {q ? <>Results for "<em>{query}</em>"</> : 'Browse All Products'}
          </h1>

          {/* Search form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', gap:0, maxWidth:580 }}>
            <input
              type="search"
              value={inputVal}
              onChange={e => setInput(e.target.value)}
              placeholder="Search jackets, styles, colors…"
              style={{
                flex:1, padding:'14px 20px', border:'none', borderRadius:'4px 0 0 4px',
                fontSize:15, background:'rgba(255,255,255,.95)', color:'#0a0a0a', outline:'none',
              }}
            />
            <button type="submit" style={{
              padding:'14px 24px', background:'var(--clr-gold)', color:'#000', border:'none',
              borderRadius:'0 4px 4px 0', cursor:'pointer', fontWeight:600, fontSize:14,
              letterSpacing:'.06em', textTransform:'uppercase',
            }}>
              Search
            </button>
          </form>

          {q && !loading && (
            <p style={{ marginTop:16, fontSize:13, color:'rgba(255,255,255,.5)' }}>
              {filtered.length === 0 ? 'No results found' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`}
            </p>
          )}
        </div>
      </div>

      {/* ── Main layout ── */}
      <section className="product-gallery section-spacing">
        <div className="container">
          <div className="product-gallery__layout">

            {/* ── Filter Sidebar (desktop) ── */}
            <aside className="product-gallery__filters desktop-filters" aria-label="Filters">

              {/* Sort */}
              <div className="filter-group">
                <h3 className="filter-group__title">Sort By</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {([
                    ['relevance',  'Best Match'],
                    ['price-asc',  'Price: Low to High'],
                    ['price-desc', 'Price: High to Low'],
                    ['name-asc',   'Name: A → Z'],
                    ['name-desc',  'Name: Z → A'],
                  ] as [SortKey, string][]).map(([key, label]) => (
                    <button key={key}
                      onClick={() => setSort(key)}
                      style={{
                        background:'none', border:'none', cursor:'pointer', textAlign:'left',
                        padding:'6px 0', fontSize:13, color: sortKey===key ? 'var(--clr-gold)' : 'var(--clr-mid)',
                        fontWeight: sortKey===key ? 600 : 400,
                        display:'flex', alignItems:'center', gap:8,
                      }}>
                      <span style={{
                        width:10, height:10, borderRadius:'50%', flexShrink:0,
                        border: sortKey===key ? '3px solid var(--clr-gold)' : '1.5px solid var(--clr-light-border)',
                      }} />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div className="filter-group">
                <h3 className="filter-group__title">Category</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                  {CATEGORIES.map(c => (
                    <button key={c.key}
                      onClick={() => setCat(c.key)}
                      style={{
                        background:'none', border:'none', cursor:'pointer', textAlign:'left',
                        padding:'6px 0', fontSize:13, color: activecat===c.key ? 'var(--clr-gold)' : 'var(--clr-mid)',
                        fontWeight: activecat===c.key ? 600 : 400,
                        display:'flex', justifyContent:'space-between', alignItems:'center',
                      }}>
                      {c.label}
                      <span style={{ fontSize:11, color:'var(--clr-muted)' }}>
                        {c.key ? baseProducts.filter(p=>p.category===c.key).length : baseProducts.length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-group">
                <h3 className="filter-group__title">Price Range</h3>
                <div className="price-range-slider">
                  <div className="price-range-slider__track">
                    <div className="price-range-slider__fill" style={{ left:fillLeft, right:fillRight }} />
                    <input type="range" min="0" max={dataMaxPrice} step="10" value={priceMin} className="price-range-slider__input price-range-slider__input--min" aria-label="Min price"
                      onChange={e => setMin(Math.min(+e.target.value, priceMax))} />
                    <input type="range" min="0" max={dataMaxPrice} step="10" value={priceMax} className="price-range-slider__input price-range-slider__input--max" aria-label="Max price"
                      onChange={e => setMax(Math.max(+e.target.value, priceMin))} />
                  </div>
                  <div className="price-range-slider__values">
                    <span>${priceMin}</span><span>${priceMax}</span>
                  </div>
                </div>
              </div>

              {/* Color */}
              <div className="filter-group">
                <h3 className="filter-group__title">Color</h3>
                <div className="filter-colors">
                  {COLORS.map(c => (
                    <button key={c.key} className={`color-swatch${activeColor===c.key?' color-swatch--active':''}`}
                      style={c.style} title={c.label||'All'} aria-label={c.label||'All colors'}
                      onClick={() => setColor(c.key)} />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className="filter-group">
                <h3 className="filter-group__title">Size</h3>
                <div className="filter-sizes">
                  <button className={`size-btn${activeSize===''?' size-btn--active':''}`} onClick={()=>setSize('')}>All</button>
                  {SIZES.map(s=>(
                    <button key={s} className={`size-btn${activeSize===s?' size-btn--active':''}`} onClick={()=>setSize(s)}>{s}</button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button className="btn-clear-filters" onClick={clearFilters}>Clear All Filters</button>
              )}
            </aside>

            {/* ── Products Column ── */}
            <div className="product-gallery__main">
              {/* Mobile toolbar */}
              <div className="mobile-filter-toolbar mobile-only">
                <button className="mobile-filter-btn" onClick={() => setFiltersOpen(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                  Filter
                </button>
                <select className="mobile-sort-select" value={sortKey} onChange={e=>setSort(e.target.value as SortKey)}>
                  <option value="relevance">Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A → Z</option>
                  <option value="name-desc">Name: Z → A</option>
                </select>
              </div>

              {/* Desktop toolbar */}
              <div className="desktop-view-toggle desktop-only">
                <span className="view-label">View:</span>
                <button className={`view-toggle-btn${viewMode==='grid'?' view-toggle-btn--active':''}`} onClick={()=>setView('grid')} aria-label="Grid view">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button className={`view-toggle-btn${viewMode==='list'?' view-toggle-btn--active':''}`} onClick={()=>setView('list')} aria-label="List view">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
                <span style={{ marginLeft:'auto', fontSize:13, color:'var(--clr-muted)' }}>
                  {loading ? 'Loading…' : `${filtered.length} products`}
                </span>
              </div>

              {loading ? <Skeleton /> : (
                <>
                  {shown.length === 0 ? (
                    <div style={{ padding:'60px 0', textAlign:'center' }}>
                      <p style={{ fontSize:18, marginBottom:12, color:'var(--clr-mid)' }}>
                        {q ? `No products found for "${query}"` : 'No products match your filters.'}
                      </p>
                      {hasActiveFilters && (
                        <button className="btn-clear-filters" onClick={clearFilters}>Clear Filters</button>
                      )}
                    </div>
                  ) : (
                    <div className={`product-gallery__grid${viewMode==='list'?' product-gallery__grid--list':''}`}>
                      {shown.map(p => <ProductCard key={`${p.id}-${p.handle}`} product={p} />)}
                    </div>
                  )}

                  {hasMore && (
                    <div style={{ textAlign:'center', marginTop:40 }}>
                      <button className="btn btn-outline" onClick={() => setVisible(v => v + 24)} style={{ minWidth:180 }}>
                        Load More ({filtered.length - visible} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
