import { useState, useMemo, useEffect } from 'react';
import { ALL_PRODUCTS, COLOR_MAP, type Product } from '../data/products';
import ProductCard from './ProductCard';

interface Props {
  title?: string;
  label?: string;
  category?: string;   // undefined = all products
  badge?: string;      // 'new' | 'sale' = filter by badge
  initialCount?: number;
  loadMoreStep?: number;
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

export default function ProductGallerySection({
  title = 'All Products',
  label = 'Collections',
  category,
  badge,
  initialCount = 25,
  loadMoreStep = 10,
}: Props) {
  const [priceMin, setPriceMin]   = useState(0);
  const [priceMax, setPriceMax]   = useState(500);
  const [activeColor, setColor]   = useState('');
  const [activeSize,  setSize]    = useState('');
  const [visible,     setVisible] = useState(initialCount);
  const [viewMode,    setView]    = useState<'grid'|'list'>('grid');

  // Reset visible count when filters change
  useEffect(() => { setVisible(initialCount); }, [priceMin, priceMax, activeColor, activeSize, category, badge, initialCount]);

  const filtered: Product[] = useMemo(() => {
    return ALL_PRODUCTS.filter(p => {
      if (category && p.category !== category) return false;
      if (badge && p.badge !== badge) return false;
      if (p.price < priceMin || p.price > priceMax) return false;
      if (activeColor && !p.colors.toLowerCase().includes(activeColor.toLowerCase())) return false;
      if (activeSize  && !p.sizes.toLowerCase().includes(activeSize.toLowerCase()))  return false;
      return true;
    });
  }, [category, badge, priceMin, priceMax, activeColor, activeSize]);

  const shown    = filtered.slice(0, visible);
  const hasMore  = visible < filtered.length;
  const loadMore = () => setVisible(v => Math.min(v + loadMoreStep, filtered.length));

  // Price range fill update
  const fillLeft  = (priceMin / 500 * 100).toFixed(1) + '%';
  const fillRight = ((500 - priceMax) / 500 * 100).toFixed(1) + '%';

  return (
    <section className="product-gallery section-spacing" id="productGallery">
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
                  <input type="range" min="0" max="500" step="10" value={priceMin} className="price-range-slider__input price-range-slider__input--min" aria-label="Min price"
                    onChange={e => { const v=+e.target.value; setPriceMin(Math.min(v, priceMax)); }} />
                  <input type="range" min="0" max="500" step="10" value={priceMax} className="price-range-slider__input price-range-slider__input--max" aria-label="Max price"
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

            <button className="btn-clear-filters" onClick={() => { setPriceMin(0); setPriceMax(500); setColor(''); setSize(''); }}>
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
              <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--clr-muted)' }}>{filtered.length} products</span>
            </div>

            {/* Mobile toolbar */}
            <div className="mobile-filter-bar mobile-only" style={{ borderBottom: '1px solid var(--clr-light-border)', paddingBottom: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 12, color: 'var(--clr-muted)' }}>{filtered.length} products</span>
              <div className="mobile-view-toggle">
                <button className={`view-toggle-btn${viewMode==='grid'?' view-toggle-btn--active':''}`} onClick={()=>setView('grid')} aria-label="Grid view">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </button>
                <button className={`view-toggle-btn${viewMode==='list'?' view-toggle-btn--active':''}`} onClick={()=>setView('list')} aria-label="List view">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                </button>
              </div>
            </div>

            {/* Grid */}
            {shown.length > 0 ? (
              <div className="products-grid" data-view={viewMode}>
                {shown.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--clr-muted)' }}>
                <p style={{ fontSize: 18, fontFamily: 'var(--font-serif)', marginBottom: 8 }}>No products found</p>
                <p style={{ fontSize: 14 }}>Try adjusting your filters.</p>
                <button className="btn btn-outline" style={{ marginTop: 24 }} onClick={() => { setPriceMin(0); setPriceMax(500); setColor(''); setSize(''); }}>Clear Filters</button>
              </div>
            )}

            {/* Load More */}
            {hasMore && (
              <div className="load-more-wrapper" style={{ textAlign: 'center', marginTop: 48 }}>
                <button className="btn-load-more" onClick={loadMore}>
                  Load More Products
                  <span style={{ marginLeft: 8, opacity: .6, fontSize: 12 }}>({filtered.length - visible} remaining)</span>
                </button>
              </div>
            )}
            {!hasMore && filtered.length > initialCount && (
              <p style={{ textAlign:'center', marginTop:40, fontSize:13, color:'var(--clr-muted)' }}>All {filtered.length} products shown</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
