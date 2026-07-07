import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from '../router';
import { COLOR_MAP } from '../data/products';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { useProduct, useProducts } from '../hooks/useShopify';

const REVIEWS = [
  { name: 'James K.', rating: 5, date: 'June 2025', text: 'Absolutely love this jacket. The quality is exceptional — fits perfectly and looks even better in person.' },
  { name: 'Priya M.', rating: 5, date: 'May 2025', text: 'Worth every penny. I\'ve been searching for a jacket like this for years. The material feels premium and the stitching is flawless.' },
  { name: 'Carlos R.', rating: 4, date: 'May 2025', text: 'Great jacket, very warm and stylish. Sizing runs slightly small so I went up one size — perfect fit.' },
  { name: 'Sophie L.', rating: 5, date: 'April 2025', text: 'Second jacket I\'ve bought from Universal Jackets. Both are incredible. Will definitely be back for a third.' },
];

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i <= Math.floor(rating) ? '#C8A96E' : i - 0.5 <= rating ? 'url(#half)' : 'none'} stroke="#C8A96E" strokeWidth="1.5">
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#C8A96E"/>
              <stop offset="50%" stopColor="transparent"/>
            </linearGradient>
          </defs>
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

function ProductImage({ src, alt, fallback, style }: { src?: string; alt: string; fallback: string; style?: React.CSSProperties }) {
  const [err, setErr] = useState(false);
  if (src && !err) {
    return <img src={src} alt={alt} onError={() => setErr(true)} style={{ width:'100%', height:'100%', objectFit:'cover', objectPosition:'center', display:'block', ...style }} />;
  }
  return <div style={{ background: fallback, width:'100%', height:'100%', ...style }} />;
}

export default function ProductDetailPage() {
  const { handle } = useParams<{ handle: string }>();
  const [, navigate] = useLocation();
  const { addItem } = useCart();

  const { product, loading } = useProduct(handle);
  const { products: allProducts } = useProducts({ collection: 'all' });

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize]   = useState('');
  const [activeImg, setActiveImg]         = useState(0);
  const [cartState, setCartState]         = useState<'idle'|'picking'|'added'>('idle');
  const [error, setError]                 = useState('');
  const [qty, setQty]                     = useState(1);

  useEffect(() => {
    setSelectedColor('');
    setSelectedSize('');
    setActiveImg(0);
    setCartState('idle');
    setError('');
    setQty(1);
  }, [handle]);

  if (loading) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', minHeight: '60vh' }}>
        <div className="container">
          <div style={{ display: 'inline-block', width: 48, height: 48, border: '3px solid #e0e0e0', borderTopColor: 'var(--clr-gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center', minHeight: '60vh' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 40, fontWeight: 400, marginBottom: 16 }}>Product Not Found</h1>
          <p style={{ color: 'var(--clr-muted)', marginBottom: 32 }}>This product doesn't exist or has been removed.</p>
          <Link href="/collections/all" className="btn btn-primary">Browse All Jackets</Link>
        </div>
      </div>
    );
  }

  const colors = product.colors.split(' ').filter(Boolean);
  const sizes  = product.sizes.split(' ').filter(Boolean);
  const onSale = !!product.compare && product.compare > product.price;
  const pct    = onSale ? Math.round((product.compare! - product.price) / product.compare! * 100) : 0;
  const avgRating = 4.6;
  const reviewCount = 47;

  // Images — use real Shopify images if available, fallback to gradients
  const imgUrls: (string | undefined)[] = product.images && product.images.length > 0
    ? product.images.slice(0, 4)
    : [undefined, undefined, undefined, undefined];

  const imgGradients = [
    product.bg,
    `linear-gradient(200deg,#111,#1a0a00)`,
    `linear-gradient(280deg,#0a0a0a,#1a1208)`,
    `linear-gradient(120deg,#111,#0a0a0a)`,
  ];

  const related = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Find the best matching variant for the selected color/size
  function getVariantForSelection(): string | undefined {
    if (!product?.variants || product.variants.length === 0) return product?.variantId;
    const match = product.variants.find(v => {
      const opts = v.selectedOptions;
      const colorOpt = opts.find(o => o.name.toLowerCase() === 'color' || o.name.toLowerCase() === 'colour');
      const sizeOpt  = opts.find(o => o.name.toLowerCase() === 'size');
      const colorMatch = !colorOpt || !selectedColor || colorOpt.value === selectedColor;
      const sizeMatch  = !sizeOpt  || !selectedSize  || sizeOpt.value  === selectedSize;
      return colorMatch && sizeMatch && v.availableForSale;
    });
    return match?.id ?? product?.variantId;
  }

  function doAddToCart() {
    const variantId = getVariantForSelection();
    addItem(product!, selectedColor || colors[0] || '', selectedSize || sizes[0] || '', qty, variantId);
    setCartState('added');
    setError('');
    setTimeout(() => setCartState('idle'), 3000);
  }

  function handleAddToCart() {
    if (colors.length > 0 && !selectedColor) {
      setCartState('picking');
      setError(sizes.length > 0 && !selectedSize ? 'Please select a colour and size.' : 'Please select a colour.');
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      setCartState('picking');
      setError('Please select a size.');
      return;
    }
    doAddToCart();
  }

  function confirmSelection() {
    if (colors.length > 0 && !selectedColor) {
      setError(sizes.length > 0 && !selectedSize ? 'Please select a colour and size.' : 'Please select a colour.');
      return;
    }
    if (sizes.length > 0 && !selectedSize) {
      setError('Please select a size.');
      return;
    }
    setCartState('idle');
    doAddToCart();
  }

  return (
    <div style={{ minHeight: '70vh' }}>
      {/* Breadcrumb + Back Button row */}
      <div className="container" style={{ paddingTop: 28, paddingBottom: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <nav style={{ fontSize: 12, color: 'var(--clr-muted)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href="/collections/all">Jackets</Link>
            <span>/</span>
            <Link href={`/collections/${product.category}`} style={{ textTransform: 'capitalize' }}>{product.category}</Link>
            <span>/</span>
            <span style={{ color: 'var(--clr-black)' }}>{product.title}</span>
          </nav>
          <Link href="/collections/all" className="btn-back-products">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to Products
          </Link>
        </div>
      </div>

      {/* Main Layout */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>
        <div className="pdp-layout">

          {/* Left — Images */}
          <div className="pdp-images">
            <div className="pdp-images__main" style={{ borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
              <ProductImage
                src={imgUrls[activeImg]}
                alt={product.title}
                fallback={imgGradients[activeImg]}
                style={{ position: 'absolute', inset: 0 }}
              />
              {onSale && <span className="badge badge--sale" style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>-{pct}%</span>}
              {product.badge === 'new' && <span className="badge badge--new" style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>New</span>}
            </div>
            <div className="pdp-images__thumbs">
              {imgGradients.map((bg, i) => (
                <button key={i} className={`pdp-thumb${activeImg === i ? ' pdp-thumb--active' : ''}`}
                  style={{ overflow: 'hidden', position: 'relative' }}
                  onClick={() => setActiveImg(i)} aria-label={`View image ${i + 1}`}>
                  <ProductImage src={imgUrls[i]} alt={`${product.title} view ${i+1}`} fallback={bg} style={{ position: 'absolute', inset: 0 }} />
                </button>
              ))}
            </div>
          </div>

          {/* Right — Info */}
          <div className="pdp-info">
            <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--clr-gold)', marginBottom: 8 }}>{product.category}</p>
            <h1 className="pdp-title">{product.title}</h1>

            {/* Rating Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <Stars rating={avgRating} />
              <span style={{ fontSize: 13, color: 'var(--clr-muted)' }}>{avgRating} ({reviewCount} reviews)</span>
            </div>

            {/* Price */}
            <div className="pdp-price-row">
              {onSale ? (
                <>
                  <span className="pdp-price pdp-price--sale">${product.price.toFixed(2)}</span>
                  <span className="pdp-price pdp-price--compare">${product.compare!.toFixed(2)}</span>
                  <span className="pdp-save-badge">Save {pct}%</span>
                </>
              ) : (
                <span className="pdp-price">${product.price.toFixed(2)}</span>
              )}
            </div>

            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--clr-mid)', marginBottom: 28, maxWidth: 480 }}>
              {product.description
                ? product.description.slice(0, 240) + (product.description.length > 240 ? '…' : '')
                : `A premium ${product.category} jacket designed for those who demand both style and substance. Crafted from high-quality materials, this piece delivers exceptional warmth, a tailored silhouette, and lasting durability — season after season.`
              }
            </p>

            {/* Color Picker */}
            {colors.length > 0 && (
              <div className="pdp-option-group">
                <div className="pdp-option-label">
                  <span>Colour</span>
                  {selectedColor && <span className="pdp-selected-value">{selectedColor}</span>}
                </div>
                <div className="pdp-color-swatches">
                  {colors.map(c => (
                    <button key={c} className={`pdp-color-swatch${selectedColor === c ? ' pdp-color-swatch--active' : ''}`}
                      style={{ background: COLOR_MAP[c] ?? '#888' }} title={c}
                      onClick={() => { setSelectedColor(c); setError(''); }}
                      aria-label={c} aria-pressed={selectedColor === c} />
                  ))}
                </div>
              </div>
            )}

            {/* Size Picker */}
            {sizes.length > 0 && (
              <div className="pdp-option-group">
                <div className="pdp-option-label">
                  <span>Size</span>
                  {selectedSize && <span className="pdp-selected-value">{selectedSize}</span>}
                  <Link href="/pages/size-guide" style={{ fontSize: 12, color: 'var(--clr-gold)', marginLeft: 'auto' }}>Size Guide</Link>
                </div>
                <div className="pdp-size-btns">
                  {sizes.map(s => (
                    <button key={s} className={`pdp-size-btn${selectedSize === s ? ' pdp-size-btn--active' : ''}`}
                      onClick={() => { setSelectedSize(s); setError(''); }}
                      aria-pressed={selectedSize === s}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Validation Error */}
            {error && (
              <div className="pdp-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {/* Qty + Cart */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', marginTop: 4 }}>
              <div className="pdp-qty">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Decrease qty">−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} aria-label="Increase qty">+</button>
              </div>
              <button
                className={`btn btn-primary pdp-cart-btn${cartState === 'added' ? ' pdp-cart-btn--added' : ''}`}
                onClick={handleAddToCart}
                style={{ flex: 1 }}
              >
                {cartState === 'added' ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Added to Cart
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="pdp-trust">
              {[
                { icon: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>, text: 'Free shipping over $120' },
                { icon: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></>, text: '7-day returns' },
                { icon: <><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></>, text: 'Secure payment' },
              ].map((b,i) => (
                <div key={i} className="pdp-trust__item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{b.icon}</svg>
                  <span>{b.text}</span>
                </div>
              ))}
            </div>

            {/* Accordion Details */}
            <div className="pdp-accordion">
              {[
                { label: 'Product Details', body: product.description || `Premium ${product.category} jacket with expert construction, quality hardware, and a tailored silhouette. Features inner lining, reinforced seams, and multiple pockets. Available in ${colors.join(', ')}.` },
                { label: 'Sizing & Fit', body: 'This style fits true to size. If you\'re between sizes, we recommend sizing up for a relaxed fit. See our Size Guide for detailed measurements. Model is 6\'1" wearing size L.' },
                { label: 'Shipping & Returns', body: 'Free shipping on orders over $120. Standard delivery 5–8 business days. Express available at checkout. Returns accepted within 7 days — unworn, tags attached.' },
                { label: 'Care Instructions', body: 'Spot clean where possible. Dry clean recommended for leather styles. For puffer jackets, machine wash on gentle cold cycle and tumble dry low with 2 clean tennis balls.' },
              ].map(item => (
                <details key={item.label} className="pdp-accordion__item">
                  <summary className="pdp-accordion__trigger">
                    {item.label}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </summary>
                  <p className="pdp-accordion__body">{item.body}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="pdp-reviews">
          <div className="pdp-reviews__header">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 32, fontWeight: 400 }}>Customer Reviews</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
              <Stars rating={avgRating} size={20} />
              <span style={{ fontSize: 15, color: 'var(--clr-muted)' }}>{avgRating} out of 5 · {reviewCount} reviews</span>
            </div>
          </div>
          <div className="pdp-reviews__grid">
            {REVIEWS.map((r, i) => (
              <div key={i} className="pdp-review-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{r.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--clr-muted)' }}>{r.date}</p>
                  </div>
                  <Stars rating={r.rating} size={13} />
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.65, color: 'var(--clr-mid)' }}>{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="pdp-related">
            <p className="section-label">You May Also Like</p>
            <h2 className="section-title" style={{ marginBottom: 32 }}>Related Jackets</h2>
            <div className="pdp-related__grid">
              {related.map(p => <ProductCard key={`${p.id}-${p.handle}`} product={p} />)}
            </div>
          </div>
        )}

        {/* Bottom Back Button */}
        <div style={{ textAlign: 'center', paddingTop: 48 }}>
          <Link href="/collections/all" className="btn-back-products btn-back-products--lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to All Products
          </Link>
        </div>
      </div>

      {/* Color + Size Modal */}
      {cartState === 'picking' && (
        <div className="pdp-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setCartState('idle'); }}>
          <div className="pdp-modal" role="dialog" aria-modal="true" aria-label="Select options">
            <button className="pdp-modal__close" onClick={() => setCartState('idle')} aria-label="Close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div style={{ width: 72, height: 72, borderRadius: 6, marginBottom: 16, overflow: 'hidden' }}>
              <ProductImage src={product.imageUrl} alt={product.title} fallback={product.bg} style={{ width: '100%', height: '100%' }} />
            </div>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, marginBottom: 4 }}>{product.title}</h3>
            <p style={{ fontSize: 13, color: 'var(--clr-muted)', marginBottom: 24 }}>Please choose your options to continue</p>

            {colors.length > 0 && (
              <div className="pdp-option-group" style={{ marginBottom: 20 }}>
                <div className="pdp-option-label">
                  <span>Colour</span>
                  {selectedColor && <span className="pdp-selected-value">{selectedColor}</span>}
                </div>
                <div className="pdp-color-swatches">
                  {colors.map(c => (
                    <button key={c} className={`pdp-color-swatch${selectedColor === c ? ' pdp-color-swatch--active' : ''}`}
                      style={{ background: COLOR_MAP[c] ?? '#888' }} title={c}
                      onClick={() => { setSelectedColor(c); setError(''); }} aria-label={c} />
                  ))}
                </div>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="pdp-option-group" style={{ marginBottom: 20 }}>
                <div className="pdp-option-label"><span>Size</span>{selectedSize && <span className="pdp-selected-value">{selectedSize}</span>}</div>
                <div className="pdp-size-btns">
                  {sizes.map(s => (
                    <button key={s} className={`pdp-size-btn${selectedSize === s ? ' pdp-size-btn--active' : ''}`}
                      onClick={() => { setSelectedSize(s); setError(''); }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="pdp-error" role="alert" style={{ marginBottom: 16 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <button className="btn btn-primary btn-full" onClick={confirmSelection}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Add to Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
