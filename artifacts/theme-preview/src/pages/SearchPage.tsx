import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams, useLocation } from '../router';
import { ALL_PRODUCTS, COLOR_MAP, type Product } from '../data/products';
import ProductCard from '../components/ProductCard';

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

  // Sync query state when URL param changes
  useEffect(() => {
    setQuery(rawQ);
    setInput(rawQ);
    setVisible(24);
  }, [rawQ]);

  // Reset visible when filters change
  useEffect(() => { setVisible(24); }, [query, priceMin, priceMax, activeColor, activeSize, activecat, sortKey]);

  const q = query.trim().toLowerCase();

  const scored: Array<{ product: Product; score: number }> = useMemo(() => {
    return ALL_PRODUCTS.map(p => {
      let score = 0;
      if (!q) { score = 1; }
      else {
        const title    = p.title.toLowerCase();
        const cat      = p.category.toLowerCase();
        const colors   = p.colors.toLowerCase();
        if (title === q)                    score += 100;
        else if (title.startsWith(q))       score += 50;
        else if (title.includes(q))         score += 30;
        if (cat.includes(q))                score += 20;
        if (colors.includes(q))             score += 10;
        if (p.badge.includes(q))            score += 5;
      }
      return { product: p, score };
    }).filter(({ score }) => score > 0);
  }, [q]);

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

  const shown   = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  const fillLeft  = (priceMin / 500 * 100).toFixed(1) + '%';
  const fillRight = ((500 - priceMax) / 500 * 100).toFixed(1) + '%';

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputVal.trim();
    if (trimmed) nav(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  function clearFilters() {
    setMin(0); setMax(500); setColor(''); setSize(''); setCat(''); setSort('relevance');
  }

  const hasActiveFilters = priceMin > 0 || priceMax < 500 || activeColor || activeSize || activecat;

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

          {q && (
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

              {/* Sort (sidebar on desktop) */}
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
                        {c.key ? ALL_PRODUCTS.filter(p=>p.category===c.key).length : ALL_PRODUCTS.length}
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
                    <input type="range" min="0" max="500" step="10" value={priceMin} className="price-range-slider__input price-range-slider__input--min" aria-label="Min price"
                      onChange={e => setMin(Math.min(+e.target.value, priceMax))} />
                    <input type="range" min="0" max="500" step="10" value={priceMax} className="price-range-slider__input price-range-slider__input--max" aria-label="Max price"
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
                  <button className={`size-btn${activeSize===''?' size-btn--active':''}`} onClick={() => setSize('')}>All</button>
                  {SIZES.map(s => (
                    <button key={s} className={`size-btn${activeSize===s?' size-btn--active':''}`} onClick={() => setSize(s)}>{s}</button>
                  ))}
                </div>
              </div>

              {hasActiveFilters && (
                <button className="btn-clear-filters" onClick={clearFilters}>Clear All Filters</button>
              )}
            </aside>

            {/* ── Results Column ── */}
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

                {/* Sort dropdown (desktop toolbar) */}
                <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:12 }}>
                  <label htmlFor="sort-select" style={{ fontSize:13, color:'var(--clr-muted)' }}>Sort:</label>
                  <select id="sort-select" value={sortKey} onChange={e=>setSort(e.target.value as SortKey)}
                    style={{ fontSize:13, padding:'6px 10px', border:'1px solid var(--clr-light-border)', borderRadius:4, background:'#fff', cursor:'pointer' }}>
                    <option value="relevance">Best Match</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="name-asc">Name: A → Z</option>
                    <option value="name-desc">Name: Z → A</option>
                  </select>
                  <span style={{ fontSize:13, color:'var(--clr-muted)' }}>{filtered.length} results</span>
                </div>
              </div>

              {/* Mobile toolbar */}
              <div className="mobile-filter-bar mobile-only" style={{ borderBottom:'1px solid var(--clr-light-border)', paddingBottom:12, marginBottom:16, gap:8 }}>
                <span style={{ fontSize:12, color:'var(--clr-muted)' }}>{filtered.length} results</span>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginLeft:'auto' }}>
                  <button onClick={()=>setFiltersOpen(o=>!o)} style={{
                    fontSize:12, padding:'5px 12px', border:'1px solid var(--clr-light-border)',
                    borderRadius:4, background:'none', cursor:'pointer', display:'flex', gap:6, alignItems:'center',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/></svg>
                    Filters {hasActiveFilters && <span style={{ background:'var(--clr-gold)', color:'#000', borderRadius:10, padding:'1px 6px', fontSize:10 }}>!</span>}
                  </button>
                  <div className="mobile-view-toggle">
                    <button className={`view-toggle-btn${viewMode==='grid'?' view-toggle-btn--active':''}`} onClick={()=>setView('grid')} aria-label="Grid view">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                    </button>
                    <button className={`view-toggle-btn${viewMode==='list'?' view-toggle-btn--active':''}`} onClick={()=>setView('list')} aria-label="List view">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile filter panel */}
              {filtersOpen && (
                <div style={{ background:'var(--clr-bg-soft)', borderRadius:8, padding:24, marginBottom:24, display:'flex', flexDirection:'column', gap:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <h3 style={{ fontWeight:600 }}>Filters</h3>
                    <button onClick={()=>setFiltersOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', fontSize:20, lineHeight:1 }}>×</button>
                  </div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10, color:'var(--clr-muted)' }}>Sort By</p>
                    <select value={sortKey} onChange={e=>setSort(e.target.value as SortKey)}
                      style={{ width:'100%', padding:'8px 12px', border:'1px solid var(--clr-light-border)', borderRadius:4 }}>
                      <option value="relevance">Best Match</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name-asc">Name: A → Z</option>
                      <option value="name-desc">Name: Z → A</option>
                    </select>
                  </div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10, color:'var(--clr-muted)' }}>Category</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {CATEGORIES.map(c => (
                        <button key={c.key} onClick={()=>setCat(c.key)}
                          style={{ padding:'5px 12px', borderRadius:20, fontSize:12, border:'1px solid', cursor:'pointer',
                            background: activecat===c.key ? 'var(--clr-black)' : 'transparent',
                            color: activecat===c.key ? '#fff' : 'var(--clr-mid)',
                            borderColor: activecat===c.key ? 'var(--clr-black)' : 'var(--clr-light-border)',
                          }}>
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, textTransform:'uppercase', letterSpacing:'.08em', marginBottom:10, color:'var(--clr-muted)' }}>Size</p>
                    <div className="filter-sizes">
                      <button className={`size-btn${activeSize===''?' size-btn--active':''}`} onClick={()=>setSize('')}>All</button>
                      {SIZES.map(s=><button key={s} className={`size-btn${activeSize===s?' size-btn--active':''}`} onClick={()=>setSize(s)}>{s}</button>)}
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <button className="btn-clear-filters" onClick={()=>{clearFilters();setFiltersOpen(false);}}>Clear All Filters</button>
                  )}
                </div>
              )}

              {/* Results */}
              {q && filtered.length === 0 ? (
                <div style={{ padding:'80px 0', textAlign:'center' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ opacity:.3, marginBottom:20 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <h2 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:400, marginBottom:12 }}>No results for "{query}"</h2>
                  <p style={{ color:'var(--clr-muted)', fontSize:14, maxWidth:400, margin:'0 auto 32px' }}>
                    Try a different search term, check for typos, or browse our collections.
                  </p>
                  <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                    <Link href="/collections/all" className="btn btn-primary" style={{ display:'inline-flex' }}>Browse All Jackets</Link>
                    {hasActiveFilters && (
                      <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
                    )}
                  </div>
                  <div style={{ marginTop:48 }}>
                    <p style={{ fontSize:13, color:'var(--clr-muted)', marginBottom:16 }}>Popular searches:</p>
                    <div style={{ display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap' }}>
                      {['Bomber Jacket','Leather Moto','Puffer Coat','Trench Coat','Windbreaker'].map(s=>(
                        <button key={s} onClick={()=>nav(`/search?q=${encodeURIComponent(s)}`)}
                          style={{ padding:'6px 16px', borderRadius:20, fontSize:13, border:'1px solid var(--clr-light-border)', background:'none', cursor:'pointer', color:'var(--clr-mid)' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Active filter chips */}
                  {hasActiveFilters && (
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
                      {activecat && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:'var(--clr-black)', color:'#fff', borderRadius:20, fontSize:12 }}>
                          {CATEGORIES.find(c=>c.key===activecat)?.label}
                          <button onClick={()=>setCat('')} style={{ background:'none',border:'none',cursor:'pointer',color:'#fff',lineHeight:1,padding:0 }}>×</button>
                        </span>
                      )}
                      {activeColor && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:'var(--clr-black)', color:'#fff', borderRadius:20, fontSize:12 }}>
                          {activeColor}
                          <button onClick={()=>setColor('')} style={{ background:'none',border:'none',cursor:'pointer',color:'#fff',lineHeight:1,padding:0 }}>×</button>
                        </span>
                      )}
                      {activeSize && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:'var(--clr-black)', color:'#fff', borderRadius:20, fontSize:12 }}>
                          Size {activeSize}
                          <button onClick={()=>setSize('')} style={{ background:'none',border:'none',cursor:'pointer',color:'#fff',lineHeight:1,padding:0 }}>×</button>
                        </span>
                      )}
                      {(priceMin > 0 || priceMax < 500) && (
                        <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px', background:'var(--clr-black)', color:'#fff', borderRadius:20, fontSize:12 }}>
                          ${priceMin}–${priceMax}
                          <button onClick={()=>{setMin(0);setMax(500);}} style={{ background:'none',border:'none',cursor:'pointer',color:'#fff',lineHeight:1,padding:0 }}>×</button>
                        </span>
                      )}
                      <button onClick={clearFilters} style={{ padding:'4px 12px', background:'none', border:'1px solid var(--clr-light-border)', borderRadius:20, fontSize:12, cursor:'pointer', color:'var(--clr-muted)' }}>
                        Clear all
                      </button>
                    </div>
                  )}

                  <div className="products-grid" data-view={viewMode}>
                    {shown.map(p => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>

                  {hasMore && (
                    <div style={{ textAlign:'center', marginTop:48 }}>
                      <button className="btn-load-more" onClick={()=>setVisible(v=>Math.min(v+12, filtered.length))}>
                        Load More
                        <span style={{ marginLeft:8, opacity:.6, fontSize:12 }}>({filtered.length - visible} remaining)</span>
                      </button>
                    </div>
                  )}
                  {!hasMore && filtered.length > 12 && (
                    <p style={{ textAlign:'center', marginTop:40, fontSize:13, color:'var(--clr-muted)' }}>All {filtered.length} results shown</p>
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
