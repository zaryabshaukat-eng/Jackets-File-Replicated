import { useState } from 'react';
import { Link } from '../router';
import { COLOR_MAP, type Product } from '../data/products';

function AddToCartModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize,  setSelectedSize]  = useState('');
  const [error, setError] = useState('');
  const [added, setAdded] = useState(false);

  const colors = product.colors.split(' ');
  const sizes  = product.sizes.split(' ');

  function confirm() {
    if (!selectedColor || !selectedSize) {
      setError(!selectedColor && !selectedSize ? 'Please select a colour and size.'
        : !selectedColor ? 'Please select a colour.' : 'Please select a size.');
      return;
    }
    setAdded(true);
    setTimeout(onClose, 1200);
  }

  return (
    <div className="pdp-modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pdp-modal" role="dialog" aria-modal="true" aria-label="Select options">
        <button className="pdp-modal__close" onClick={onClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>

        <div style={{ width: 72, height: 72, background: product.bg, borderRadius: 6, marginBottom: 16 }} />
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 400, marginBottom: 4 }}>{product.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--clr-muted)', marginBottom: 24 }}>
          {!!product.compare && product.compare > product.price
            ? <><span style={{ color: 'var(--clr-error)', fontWeight: 600 }}>${product.price}</span> <span style={{ textDecoration: 'line-through', marginLeft: 6 }}>${product.compare}</span></>
            : <span style={{ fontWeight: 600 }}>${product.price}.00</span>
          }
        </p>

        <div className="pdp-option-group" style={{ marginBottom: 20 }}>
          <div className="pdp-option-label">
            <span>Colour</span>
            {selectedColor && <span className="pdp-selected-value">{selectedColor}</span>}
          </div>
          <div className="pdp-color-swatches">
            {colors.map(c => (
              <button key={c}
                className={`pdp-color-swatch${selectedColor === c ? ' pdp-color-swatch--active' : ''}`}
                style={{ background: COLOR_MAP[c] ?? '#888' }} title={c}
                onClick={() => { setSelectedColor(c); setError(''); }}
                aria-label={c} aria-pressed={selectedColor === c} />
            ))}
          </div>
        </div>

        <div className="pdp-option-group" style={{ marginBottom: 20 }}>
          <div className="pdp-option-label">
            <span>Size</span>
            {selectedSize && <span className="pdp-selected-value">{selectedSize}</span>}
          </div>
          <div className="pdp-size-btns">
            {sizes.map(s => (
              <button key={s}
                className={`pdp-size-btn${selectedSize === s ? ' pdp-size-btn--active' : ''}`}
                onClick={() => { setSelectedSize(s); setError(''); }}
                aria-pressed={selectedSize === s}>{s}</button>
            ))}
          </div>
        </div>

        {error && (
          <div className="pdp-error" role="alert" style={{ marginBottom: 16 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {error}
          </div>
        )}

        {added ? (
          <div className="pdp-added-confirm">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            Added to Cart!
          </div>
        ) : (
          <button className="btn btn-primary btn-full" onClick={confirm}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            Add to Cart
          </button>
        )}

        <Link href={`/products/${product.handle}`} style={{ display: 'block', textAlign: 'center', marginTop: 12, fontSize: 13, color: 'var(--clr-gold)' }} onClick={onClose}>
          View full details →
        </Link>
      </div>
    </div>
  );
}

export default function ProductCard({ product, className = '' }: { product: Product; className?: string }) {
  const [showModal, setShowModal] = useState(false);
  const onSale = !!product.compare && product.compare > product.price;
  const pct    = onSale ? Math.round((product.compare! - product.price) / product.compare! * 100) : 0;

  return (
    <>
      <article
        className={`product-card ${className}`}
        data-colors={product.colors}
        data-sizes={product.sizes}
        data-price={product.price}
        data-category={product.category}
      >
        <div className="product-card__image-wrap">
          <Link href={`/products/${product.handle}`} className="product-card__img-link" aria-label={`View ${product.title}`}>
            <div className="product-card__placeholder-img" style={{ background: product.bg }} />
          </Link>
          <div className="product-card__badges">
            {onSale && <span className="badge badge--sale">-{pct}%</span>}
            {product.badge === 'new' && <span className="badge badge--new">New</span>}
          </div>
          <div className="product-card__actions">
            <Link href={`/products/${product.handle}`} className="product-card__action-btn product-card__view-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              View Product
            </Link>
            <button className="product-card__action-btn product-card__cart-btn" onClick={() => setShowModal(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Add to Cart
            </button>
          </div>
        </div>
        <div className="product-card__info">
          <h3 className="product-card__title"><Link href={`/products/${product.handle}`}>{product.title}</Link></h3>
          <div className="product-card__colors">
            {product.colors.split(' ').slice(0,5).map(c => (
              <span key={c} className="product-card__color-dot" title={c} style={{ background: COLOR_MAP[c] ?? '#888' }} />
            ))}
          </div>
          <div className="product-card__price-row">
            {onSale ? (
              <>
                <span className="product-card__price product-card__price--sale">${product.price}.00</span>
                <span className="product-card__price product-card__price--compare">${product.compare}.00</span>
              </>
            ) : (
              <span className="product-card__price">${product.price}.00</span>
            )}
          </div>
        </div>
      </article>

      {showModal && <AddToCartModal product={product} onClose={() => setShowModal(false)} />}
    </>
  );
}
