import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { Link, useLocation } from '../router';
import { NAV_LINKS, FOOTER_LINKS, ALL_PRODUCTS, type Product } from '../data/products';
import { useCart, type CartItem } from '../context/CartContext';

const CATEGORIES = [
  { label: 'Bomber Jackets', slug: 'bomber' },
  { label: 'Leather Jackets', slug: 'leather' },
  { label: 'Puffer Jackets', slug: 'puffer' },
  { label: 'Denim Jackets', slug: 'denim' },
  { label: 'Trench Coats', slug: 'trench' },
  { label: 'Windbreakers', slug: 'wind' },
  { label: 'Fleece & Sherpa', slug: 'fleece' },
];

function LiveSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [, nav] = useLocation();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const navigateToSearch = useCallback((term: string) => {
    const t = term.trim();
    if (!t) return;
    onClose();
    nav(`/search?q=${encodeURIComponent(t)}`);
  }, [nav, onClose]);

  const q = query.trim().toLowerCase();

  const matchedProducts: Product[] = q.length > 0
    ? ALL_PRODUCTS.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.colors.toLowerCase().includes(q)
      ).slice(0, 8)
    : [];

  const matchedCategories = q.length > 0
    ? CATEGORIES.filter(c => c.label.toLowerCase().includes(q) || c.slug.includes(q))
    : [];

  const hasResults = matchedProducts.length > 0 || matchedCategories.length > 0;

  return (
    <div className="search-overlay__bar">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search jackets, styles, sizes…"
        className="search-overlay__input"
        aria-label="Search"
        onKeyDown={e => {
          if (e.key === 'Escape') onClose();
          if (e.key === 'Enter') navigateToSearch(query);
        }}
      />
      <button className="search-overlay__close" onClick={onClose} aria-label="Close search">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>

      {/* Live Results */}
      {q.length > 0 && (
        <div className="search-live-results" role="listbox">
          {!hasResults ? (
            <div className="search-live-results__empty">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p>No results for "<strong>{query}</strong>"</p>
              <p style={{ fontSize: 13, color: 'var(--clr-muted)', marginTop: 4 }}>Try a different search term or browse categories.</p>
            </div>
          ) : (
            <>
              {matchedCategories.length > 0 && (
                <div className="search-live-results__section">
                  <p className="search-live-results__label">Categories</p>
                  {matchedCategories.map(c => (
                    <Link key={c.slug} href={`/collections/${c.slug}`} className="search-live-results__cat" onClick={onClose}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
                      {c.label}
                      <span className="search-live-results__cat-count">
                        {ALL_PRODUCTS.filter(p => p.category === c.slug).length} products
                      </span>
                    </Link>
                  ))}
                </div>
              )}
              {matchedProducts.length > 0 && (
                <div className="search-live-results__section">
                  <p className="search-live-results__label">Products</p>
                  {matchedProducts.map(p => {
                    const onSale = !!p.compare && p.compare > p.price;
                    return (
                      <Link key={p.id} href={`/products/${p.handle}`} className="search-live-results__item" onClick={onClose}>
                        <div className="search-live-results__img" style={{ background: p.bg }} />
                        <div className="search-live-results__meta">
                          <span className="search-live-results__name">
                            {p.title.split(new RegExp(`(${query})`, 'gi')).map((part, i) =>
                              part.toLowerCase() === q
                                ? <mark key={i}>{part}</mark>
                                : part
                            )}
                          </span>
                          <span className="search-live-results__cat-tag" style={{ textTransform: 'capitalize' }}>{p.category}</span>
                        </div>
                        <div className="search-live-results__price">
                          {onSale && <span style={{ color: 'var(--clr-error)', fontSize: 12 }}>${p.price}</span>}
                          {!onSale && <span>${p.price}</span>}
                          {onSale && <span style={{ textDecoration: 'line-through', color: 'var(--clr-muted)', fontSize: 11 }}>${p.compare}</span>}
                        </div>
                      </Link>
                    );
                  })}
                  <button
                    className="search-live-results__view-all"
                    onClick={() => navigateToSearch(query)}
                    style={{ width:'100%', textAlign:'left', cursor:'pointer', background:'none', border:'none', padding:0 }}
                  >
                    View all results for "{query}"
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Default suggestions when empty */}
      {q.length === 0 && (
        <div className="search-live-results" role="listbox">
          <div className="search-live-results__section">
            <p className="search-live-results__label">Popular Searches</p>
            {['Bomber Jacket', 'Leather Moto', 'Puffer Coat', 'Trench Coat', 'Windbreaker'].map(s => (
              <button key={s} className="search-live-results__suggestion"
                onClick={() => setQuery(s)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                {s}
              </button>
            ))}
          </div>
          <div className="search-live-results__section">
            <p className="search-live-results__label">Browse Categories</p>
            <div className="search-live-results__cat-grid">
              {CATEGORIES.slice(0, 6).map(c => (
                <Link key={c.slug} href={`/collections/${c.slug}`} className="search-live-results__cat-chip" onClick={onClose}>
                  {c.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CartDrawer() {
  const { isOpen, closeCart, items, updateQty, removeItem, subtotal, totalItems, checkout, checkoutLoading, checkoutError } = useCart();

  function CartItemImage({ item }: { item: CartItem }) {
    const [err, setErr] = useState(false);
    if (item.imageUrl && !err) {
      return <img src={item.imageUrl} alt={item.title} onError={() => setErr(true)} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />;
    }
    return <div style={{ background: item.bg, width: '100%', height: '100%' }} />;
  }

  return (
    <>
      <div className={`cart-drawer-overlay${isOpen ? ' is-open' : ''}`} onClick={closeCart} aria-hidden="true" />
      <aside className={`cart-drawer${isOpen ? ' is-open' : ''}`} aria-label="Shopping cart" role="dialog" aria-modal="true">
        <div className="cart-drawer__head">
          <h2 className="cart-drawer__title">
            Your Cart
            {totalItems > 0 && <span className="cart-drawer__count">{totalItems}</span>}
          </h2>
          <button className="cart-drawer__close" onClick={closeCart} aria-label="Close cart">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-drawer__empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <p>Your cart is empty</p>
            <Link href="/collections/all" className="btn btn-primary" style={{ marginTop: 16 }} onClick={closeCart}>
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {items.map((item: CartItem) => (
                <div key={item.id} className="cart-drawer-item">
                  <div className="cart-drawer-item__img" style={{ overflow: 'hidden' }}>
                    <CartItemImage item={item} />
                  </div>
                  <div className="cart-drawer-item__body">
                    <Link href={`/products/${item.handle}`} className="cart-drawer-item__title" onClick={closeCart}>
                      {item.title}
                    </Link>
                    <p className="cart-drawer-item__variant">{item.color} · {item.size}</p>
                    <p className="cart-drawer-item__price">${(item.price * item.qty).toFixed(2)}</p>
                    <div className="cart-drawer-item__controls">
                      <div className="cart-drawer-qty">
                        <button className="cart-drawer-qty__btn" onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease">−</button>
                        <span className="cart-drawer-qty__num">{item.qty}</span>
                        <button className="cart-drawer-qty__btn" onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase">+</button>
                      </div>
                      <button className="cart-drawer-remove" onClick={() => removeItem(item.id)} aria-label="Remove">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <p className="cart-drawer__shipping-note">Shipping & taxes calculated at checkout</p>
              {checkoutError && (
                <p style={{ fontSize: 12, color: 'var(--clr-error)', marginBottom: 8 }}>{checkoutError}</p>
              )}
              <button
                className="btn btn-primary btn-full cart-drawer__checkout"
                onClick={checkout}
                disabled={checkoutLoading}
                style={{ opacity: checkoutLoading ? 0.7 : 1 }}
              >
                {checkoutLoading ? (
                  <>
                    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    Redirecting to checkout…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><polyline points="12 5 19 12 12 19"/></svg>
                    Checkout · ${subtotal.toFixed(2)}
                  </>
                )}
              </button>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <button className="cart-drawer__continue" onClick={closeCart}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}

export default function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);
  const { totalItems, openCart } = useCart();

  const openSearch  = () => { setSearchOpen(true);  document.body.style.overflow = 'hidden'; };
  const closeSearch = () => { setSearchOpen(false); document.body.style.overflow = ''; };

  useEffect(() => {
    const header  = document.getElementById('siteHeader');
    const mBar    = document.getElementById('mobileBottomBar');
    const onScroll = () => {
      const y = window.scrollY;
      header?.classList.toggle('scrolled', y > 10);
      if (window.innerWidth < 768) mBar?.classList.toggle('is-visible', y > 120);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const drawer   = document.getElementById('navDrawer');
    const toggle   = document.getElementById('navMenuToggle');
    const closeBtn = document.getElementById('navDrawerClose');
    const backdrop = document.getElementById('navDrawerBackdrop');
    const btmMenu  = document.getElementById('mobileMenuToggleBottom');
    const openDrawer  = () => { drawer?.classList.add('is-open'); drawer?.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; };
    const closeDrawer = () => { drawer?.classList.remove('is-open'); drawer?.setAttribute('aria-hidden','true'); document.body.style.overflow=''; };
    toggle?.addEventListener('click', openDrawer);
    btmMenu?.addEventListener('click', openDrawer);
    closeBtn?.addEventListener('click', closeDrawer);
    backdrop?.addEventListener('click', closeDrawer);
    const onKey = (e: KeyboardEvent) => { if (e.key==='Escape') { closeDrawer(); closeSearch(); } };
    document.addEventListener('keydown', onKey);
    document.querySelectorAll<HTMLButtonElement>('.submenu-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded')==='true';
        btn.setAttribute('aria-expanded', String(!open));
        (btn.nextElementSibling as HTMLElement)?.classList.toggle('is-open', !open);
      });
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('keydown', onKey);
    };
  }, [location]);

  useEffect(() => {
    const drawer = document.getElementById('navDrawer');
    drawer?.classList.remove('is-open');
    drawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.scrollTo({ top: 0 });
    closeSearch();
  }, [location]);

  return (
    <>
      {/* Search Overlay */}
      {searchOpen && (
        <div className="search-overlay is-open" aria-hidden="false" role="dialog" aria-label="Search" onClick={e => { if (e.target === e.currentTarget) closeSearch(); }}>
          <div className="search-overlay__inner">
            <LiveSearch onClose={closeSearch} />
          </div>
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <nav className="mobile-bottom-bar" id="mobileBottomBar" aria-label="Mobile navigation">
        <Link href="/" className="mobile-bottom-bar__item">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <span>Home</span>
        </Link>
        <button className="mobile-bottom-bar__item" id="mobileSearchToggle" aria-label="Search" onClick={openSearch}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>Search</span>
        </button>
        <button className="mobile-bottom-bar__item" id="mobileMenuToggleBottom" aria-label="Menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          <span>Menu</span>
        </button>
        <button className="mobile-bottom-bar__item" aria-label="Cart" onClick={openCart}>
          <span style={{ position: 'relative', display: 'inline-flex' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {totalItems > 0 && <span className="cart-badge" style={{ top: -6, right: -8 }}>{totalItems}</span>}
          </span>
          <span>Cart</span>
        </button>
      </nav>

      {/* Announcement Bar */}
      <div className="announcement-bar" role="complementary" aria-label="Announcement">
        <div className="announcement-bar__inner">
          <span className="announcement-bar__item"><span className="sparkle-text">Free shipping on orders over $120</span></span>
          <span className="announcement-bar__sep" aria-hidden="true">|</span>
          <span className="announcement-bar__item">New sales available</span>
          <span className="announcement-bar__sep" aria-hidden="true">|</span>
          <span className="announcement-bar__item"><Link href="/collections/all" className="announcement-bar__sale-link">Shop The Sale</Link></span>
        </div>
      </div>

      {/* Header */}
      <header className="site-header" id="siteHeader" role="banner">
        <div className="site-header__inner">
          <Link href="/" className="site-header__logo" aria-label="Universal Jackets">
            <span className="site-header__logo-text">UNIVERSAL JACKETS</span>
          </Link>
          <div className="site-header__search desktop-only">
            <form className="header-search-form" role="search" onSubmit={e=>e.preventDefault()}>
              <input type="search" name="q" placeholder="Search jackets, styles, sizes…" className="header-search-form__input" aria-label="Search" autoComplete="off"
                onFocus={openSearch} readOnly />
              <button type="button" className="header-search-form__btn" aria-label="Search" onClick={openSearch}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
            </form>
          </div>
          <div className="site-header__actions">
            <button className="site-header__icon mobile-only" aria-label="Search" onClick={openSearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </button>
            <button className="site-header__menu-dots" id="navMenuToggle" aria-label="Menu" aria-expanded="false" aria-controls="navDrawer">
              <span className="menu-dots__dot"/><span className="menu-dots__dot"/><span className="menu-dots__dot"/>
            </button>
            <button className="site-header__icon site-header__cart" aria-label="Cart" onClick={openCart}>
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Nav Drawer */}
      <div className="nav-drawer" id="navDrawer" aria-hidden="true" role="dialog" aria-label="Navigation menu">
        <div className="nav-drawer__backdrop" id="navDrawerBackdrop" />
        <nav className="nav-drawer__panel">
          <div className="nav-drawer__header">
            <span className="nav-drawer__title">Menu</span>
            <button className="nav-drawer__close" id="navDrawerClose" aria-label="Close menu">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
          <ul className="nav-drawer__links">
            {NAV_LINKS.map(l => (
              <li key={l.href}>
                <Link href={l.href} className={location === l.href ? 'active' : ''}>{l.label}</Link>
              </li>
            ))}
            <li className="has-submenu">
              <button className="submenu-toggle" aria-expanded="false">
                Categories
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <ul className="nav-submenu">
                {CATEGORIES.map(({ label, slug }) => (
                  <li key={slug}><Link href={`/collections/${slug}`}>{label}</Link></li>
                ))}
              </ul>
            </li>
            <li className="nav-drawer__divider" />
            <li><Link href="/account/login">Sign In</Link></li>
            <li><Link href="/account/register">Create Account</Link></li>
          </ul>
        </nav>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Page Content */}
      <main id="MainContent">
        {children}
      </main>

      {/* Trust Bar */}
      <div className="footer-trust-bar">
        <div className="container">
          <div className="trust-bar__grid">
            {([
              { svg: <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>, title:'FREE DELIVERY', sub:'on all orders over $120' },
              { svg: <><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></>, title:'7 DAYS RETURN', sub:'If goods have problems' },
              { svg: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></>, title:'SECURE PAYMENT', sub:'100% secure payment' },
              { svg: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>, title:'24/7 SUPPORT', sub:'Dedicated support' },
            ] as const).map(item => (
              <div key={item.title} className="trust-bar__item">
                <div className="trust-bar__icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">{item.svg}</svg>
                </div>
                <div className="trust-bar__text"><strong>{item.title}</strong><span>{item.sub}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="site-footer" role="contentinfo">
        <div className="container">
          <div className="site-footer__top">
            <div className="site-footer__brand">
              <span className="footer-logo-text">UNIVERSAL JACKETS</span>
              <p className="footer-tagline">Premium outerwear, made to be worn.</p>
              <address className="footer-contact">
                <p><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>120 Mercer St, New York, NY 10012</p>
                <p><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.27 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.59a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>+1 (212) 555-0142</p>
                <p><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>hello@universaljackets.com</p>
              </address>
              <div className="footer-social">
                {['Instagram','Facebook','TikTok','Pinterest'].map(s=>(
                  <a key={s} href="#" aria-label={s} className="footer-social__link">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                  </a>
                ))}
              </div>
            </div>
            <div className="site-footer__links-col">
              <h3 className="footer-col__title">Customer Support</h3>
              <ul className="footer-links">
                {FOOTER_LINKS.support.map(l=><li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              </ul>
            </div>
            <div className="site-footer__links-col">
              <h3 className="footer-col__title">Quick Links</h3>
              <ul className="footer-links">
                {FOOTER_LINKS.shop.map(l=><li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              </ul>
            </div>
            <div className="site-footer__links-col">
              <h3 className="footer-col__title">Company</h3>
              <ul className="footer-links">
                {FOOTER_LINKS.company.map(l=><li key={l.href}><Link href={l.href}>{l.label}</Link></li>)}
              </ul>
            </div>
          </div>
          <div className="site-footer__bottom">
            <p className="footer-copy">© 2025 Universal Jackets. All rights reserved.</p>
            <div className="footer-legal">
              {FOOTER_LINKS.legal.map(l=><Link key={l.href} href={l.href}>{l.label}</Link>)}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
