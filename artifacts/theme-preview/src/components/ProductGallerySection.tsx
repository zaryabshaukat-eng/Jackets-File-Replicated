import { useState, useMemo, useEffect } from 'react';
import { COLOR_MAP } from '../data/products';
import type { Product } from '../lib/shopify';
import ProductCard from './ProductCard';
import { useProducts } from '../hooks/useShopify';

interface Props {
  title?: string;
  label?: string;
  category?: string;   // collection handle / category slug
  badge?: string;      // 'new' | 'sale'
  initialCount?: number;
  loadMoreStep?: number;
  // If products are passed directly, skip fetching
  products?: Product[];
}

const SIZES = ['XS','S','M','L','XL','XXL'];
const COLORS = [
  { key:'',         label:'All', style:{ background:'linear-gradient(135deg,#0a0a0a 50%,#c8a96e 50%)' } },
  { key:'Black',    label:'Black',    style:{ background: COLOR_MAP.Black } },
  { key:'Brown',    label:'Brown',    style:{ background: COLOR_MAP.Brown } },
  { key:'Navy',     label:'Navy',     style:{ background: COLOR_MAP.Navy } },
  { key:'Olive',    label:'Olive',    style:{ background: COLOR_MAP.Olive } },
  { key:'Grey',     label:'Grey',     style:{ background: COLOR_MAP.Grey } },
  { key:'Camel',    label:'Camel',    style:{ background: COLOR_MAP.Camel } },
  { key:'Red',      label:'Red',      style:{ background: COLOR_MAP.Red } },
  { key:'Blue',     label:'Blue',     style:{ background: COLOR_MAP.Blue } },
];

function Skeleton() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 24, padding: '24px 0' }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ borderRadius: 8, overflow: 'hidden' }}>
          <div style={{ height: 280, background: 'linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
          <div style={{ padding: '12px 0' }}>
            <div style={{ height: 16, background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
            <div style={{ height: 14, background: '#f0f0f0', borderRadius: 4, width: '60%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductGallerySection({
  title = 'All Products',
  label = 'Collections',
  category,
  badge,
  initialCount = 25,
  loadMoreStep = 10,
  products: propProducts,
}: Props) {
  const [priceMin, setPriceMin]   = useState(0);
  const [priceMax, setPriceMax]   = useState(500);
  const [activeColor, setColor]   = useState('');
  const [activeSize,  setSize]    = useState('');
  const [visible,     setVisible] = useState(initialCount);
  const [viewMode,    setView]    = useState<'grid'|'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Fetch from Shopify unless products are provided directly
  const { products: fetchedProducts, loading } = useProducts(
    propProducts ? {} : { collection: category || (badge ? 'new-in' : 'all'), badge }
  );

  const allProducts = propProducts ?? fetchedProducts;

  // Dynamic price max based on data
  const dataMaxPrice = useMemo(() => {
    if (allProducts.length === 0) return 500;
    return Math.ceil(Math.max(...allProducts.map(p => p.price)) / 50) * 50;
  }, [allProducts]);

  useEffect(() => {
    if (priceMax === 500 && dataMaxPrice !== 500) setPriceMax(dataMaxPrice);
  }, [dataMaxPrice]);

  // Reset visible count when filters change
  useEffect(() => { setVisible(initialCount); }, [priceMin, priceMax, activeColor, activeSize, category, badge, initialCount]);

  const filtered: Product[] = useMemo(() => {
    return allProducts.filter(p => {
      if (p.price < priceMin || p.price > priceMax) return false;
      if (activeColor && !p.colors.toLowerCase().includes(activeColor.toLowerCase())) return false;
      if (activeSize  && !p.sizes.toLowerCase().includes(activeSize.toLowerCase()))  return false;
      return true;
    });
  }, [allProducts, priceMin, priceMax, activeColor, activeSize]);

  const shown    = filtered.slice(0, visible);
  const hasMore  = visible < filtered.length;
  const loadMore = () => setVisible(v => Math.min(v + loadMoreStep, filtered.length));

  // Price range fill update
  const fillLeft  = (priceMin / dataMaxPrice * 100).toFixed(1) + '%';
  const fillRight = ((dataMaxPrice - priceMax) / dataMaxPrice * 100).toFixed(1) + '%';

  return (
    <section className="product-gallery section-spacing" id="productGallery">
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div className="container">
        <div className="section-header">
          <p className="section-label">{label}</p>
          <h2 className="section-title">{title}</h2>
        </div>
        <div className="product-gallery__layout">

          {/* ── Filter Sidebar ── */}
          <aside className="product-gallery__filters desktop-filters" aria-label="Product filters">
            {/* Price */}
            <div className="filter-group">
              <h3 className="filter-group__title">Price Range</h3>
              <div className="price-range-slider">
                <div className="price-range-slider__track">
                  <div className="price-range-slider__fill" style={{ left: fillLeft, right: fillRight }} />
                  <input type="range" min="0" max={dataMaxPrice} step="10" value={priceMin} className="price-range-slider__input price-range-slider__input--min" aria-label="Min price"
                    onChange={e => { const v=+e.target.value; setPriceMin(Math.min(v, priceMax)); }} />
                  <input type="range" min="0" max={dataMaxPrice} step="10" value={priceMax} className="price-range-slider__input price-range-slider__input--max" aria-label="Max price"
                    onChange={e => { const v=+e.target.value; setPriceMax(Math.max(v, priceMin)); }} />
                </div>
                <div className="price-range-slider__values">
                  <span>${priceMin}</span>
                  <span>${priceMax}</span>
                </div>
              </div>
            </div>

            {/* Color */}
            <div className="filter-group">
              <h3 className="filter-group__title">Color</h3>
              <div className="filter-colors">
                {COLORS.map(c => (
                  <button key={c.key} className={`color-swatch${activeColor===c.key?' color-swatch--active':''}`}
                    style={c.style} title={c.label || 'All'} aria-label={c.label || 'All colors'}
                    onClick={() => setColor(c.key)} />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="filter-group">
              <h3 className="filter-group__title">Size</h3>
              <div className="filter-sizes">
                <button className={`size-btn${activeSize===''?' size-btn--active':''}`} onClick={() => setSize('')}>All</button>
                {SIZES.map(s => (
                  <button key={s} className={`size-btn${activeSize===s?' size-btn--active':''}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>

            <button className="btn-clear-filters" onClick={() => { setPriceMin(0); setPriceMax(dataMaxPrice); setColor(''); setSize(''); }}>
              Clear All Filters
            </button>
          </aside>

          {/* ── Products Column ── */}
          <div className="product-gallery__main">
            {/* Toolbar */}
            <div className="desktop-view-toggle desktop-only">
              <span className="view-label">View:</span>
              <button className={`view-toggle-btn${viewMode==='grid'?' view-toggle-btn--active':''}`} onClick={()=>setView('grid')} aria-label="Grid view">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
              </button>
              <button className={`view-toggle-btn${viewMode==='list'?' view-toggle-btn--active':''}`} onClick={()=>setView('list')} aria-label="List view">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              </button>
              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--clr-muted)' }}>
                {loading ? 'Loading…' : `${filtered.length} products`}
              </span>
            </div>

            {/* Mobile toolbar */}
            <div className="mobile-filter-toolbar mobile-only">
              <button className="mobile-filter-btn" onClick={() => setFiltersOpen(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
                Filter
              </button>
              <span style={{ fontSize: 13, color: 'var(--clr-muted)' }}>
                {loading ? 'Loading…' : `${filtered.length} results`}
              </span>
            </div>

            {/* Loading skeleton */}
            {loading && !propProducts && <Skeleton />}

            {/* Products grid */}
            {!loading && (
              <>
                {shown.length === 0 ? (
                  <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--clr-muted)' }}>
                    <p style={{ fontSize: 18, marginBottom: 12 }}>No products match your filters.</p>
                    <button className="btn-clear-filters" onClick={() => { setPriceMin(0); setPriceMax(dataMaxPrice); setColor(''); setSize(''); }}>
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className={`product-gallery__grid${viewMode === 'list' ? ' product-gallery__grid--list' : ''}`}>
                    {shown.map(p => <ProductCard key={`${p.id}-${p.handle}`} product={p} />)}
                  </div>
                )}

                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <button className="btn btn-outline" onClick={loadMore} style={{ minWidth: 180 }}>
                      Load More ({filtered.length - visible} remaining)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <div className="mobile-filter-drawer" style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'flex-end' }}>
          <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,.5)' }} onClick={() => setFiltersOpen(false)} />
          <div style={{ position:'relative', background:'var(--clr-white)', width:'100%', borderRadius:'16px 16px 0 0', padding:'24px', maxHeight:'80vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
              <h3 style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:400 }}>Filters</h3>
              <button onClick={() => setFiltersOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', padding:8 }} aria-label="Close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="filter-group">
              <h3 className="filter-group__title">Price Range</h3>
              <div className="price-range-slider">
                <div className="price-range-slider__track">
                  <div className="price-range-slider__fill" style={{ left: fillLeft, right: fillRight }} />
                  <input type="range" min="0" max={dataMaxPrice} step="10" value={priceMin} className="price-range-slider__input price-range-slider__input--min" aria-label="Min price"
                    onChange={e => setPriceMin(Math.min(+e.target.value, priceMax))} />
                  <input type="range" min="0" max={dataMaxPrice} step="10" value={priceMax} className="price-range-slider__input price-range-slider__input--max" aria-label="Max price"
                    onChange={e => setPriceMax(Math.max(+e.target.value, priceMin))} />
                </div>
                <div className="price-range-slider__values"><span>${priceMin}</span><span>${priceMax}</span></div>
              </div>
            </div>
            <div className="filter-group">
              <h3 className="filter-group__title">Color</h3>
              <div className="filter-colors">
                {COLORS.map(c => (
                  <button key={c.key} className={`color-swatch${activeColor===c.key?' color-swatch--active':''}`}
                    style={c.style} title={c.label || 'All'} onClick={() => setColor(c.key)} />
                ))}
              </div>
            </div>
            <div className="filter-group">
              <h3 className="filter-group__title">Size</h3>
              <div className="filter-sizes">
                <button className={`size-btn${activeSize===''?' size-btn--active':''}`} onClick={() => setSize('')}>All</button>
                {SIZES.map(s => (
                  <button key={s} className={`size-btn${activeSize===s?' size-btn--active':''}`} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button className="btn-clear-filters" style={{ flex:1 }} onClick={() => { setPriceMin(0); setPriceMax(dataMaxPrice); setColor(''); setSize(''); }}>Clear All</button>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={() => setFiltersOpen(false)}>Show {filtered.length} results</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
