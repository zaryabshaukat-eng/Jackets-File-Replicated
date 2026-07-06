import { Link } from '../router';
import { COLOR_MAP, type Product } from '../data/products';

export default function ProductCard({ product, className = '' }: { product: Product; className?: string }) {
  const onSale = !!product.compare && product.compare > product.price;
  const pct     = onSale ? Math.round((product.compare! - product.price) / product.compare! * 100) : 0;
  return (
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
          <button className="product-card__action-btn product-card__cart-btn">
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
  );
}
