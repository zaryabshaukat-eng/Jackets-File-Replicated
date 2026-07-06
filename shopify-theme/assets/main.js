/**
 * UNIVERSAL JACKETS — Main JavaScript
 * Vanilla JS only. No dependencies.
 */

'use strict';

/* ============================================================
   UTILITY HELPERS
   ============================================================ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

function debounce(fn, ms = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function trapFocus(el) {
  const focusable = $$('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])', el);
  const first = focusable[0], last = focusable[focusable.length - 1];
  on(el, 'keydown', e => {
    if (e.key !== 'Tab') return;
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault();
      (e.shiftKey ? last : first).focus();
    }
  });
}

/* ============================================================
   SCROLL BEHAVIOR
   ============================================================ */
const header = $('#siteHeader');
const mobileBottomBar = $('#mobileBottomBar');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (header) header.classList.toggle('scrolled', y > 10);
  if (mobileBottomBar && window.innerWidth < 768) {
    mobileBottomBar.classList.toggle('is-visible', y > 120);
  }
}, { passive: true });

/* ============================================================
   HERO CAROUSEL
   ============================================================ */
(function initHeroCarousel() {
  const track = $('#heroTrack');
  if (!track) return;

  const slides = $$('.hero-carousel__slide', track);
  const dots   = $$('.hero-carousel__dot');
  let current  = 0;
  let timer    = null;
  const DURATION = 5500;

  function goTo(idx) {
    slides[current].classList.remove('is-active');
    dots[current]?.classList.remove('is-active');
    dots[current]?.setAttribute('aria-selected', 'false');
    current = (idx + slides.length) % slides.length;
    slides[current].classList.add('is-active');
    dots[current]?.classList.add('is-active');
    dots[current]?.setAttribute('aria-selected', 'true');
  }

  function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), DURATION);
  }

  on($('#heroNext'), 'click', () => { goTo(current + 1); startTimer(); });
  on($('#heroPrev'), 'click', () => { goTo(current - 1); startTimer(); });
  dots.forEach((dot, i) => on(dot, 'click', () => { goTo(i); startTimer(); }));

  // Touch swipe
  let touchStartX = 0;
  on(track, 'touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  on(track, 'touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { goTo(current + (dx < 0 ? 1 : -1)); startTimer(); }
  });

  const carousel = track.closest('.hero-carousel');
  on(carousel, 'mouseenter', () => clearInterval(timer));
  on(carousel, 'mouseleave', () => startTimer());
  on(document, 'visibilitychange', () => { document.hidden ? clearInterval(timer) : startTimer(); });

  if (slides.length > 1) startTimer();
})();

/* ============================================================
   RECOMMENDED PRODUCTS SLIDER
   ============================================================ */
(function initRecSlider() {
  const track = $('#recTrack');
  if (!track) return;

  const CARD_W = () => (track.querySelector('.product-card')?.offsetWidth || 260) + 20;
  const progressBar = $('#recProgressBar');

  function updateProgress() {
    if (!progressBar) return;
    const max = track.scrollWidth - track.clientWidth;
    progressBar.style.width = (max > 0 ? (track.scrollLeft / max) * 80 + 10 : 10) + '%';
  }

  on($('#recPrev'), 'click', () => { track.scrollBy({ left: -CARD_W() * 2, behavior: 'smooth' }); });
  on($('#recNext'), 'click', () => { track.scrollBy({ left: CARD_W() * 2, behavior: 'smooth' }); });
  on(track, 'scroll', updateProgress, { passive: true });

  let recTimer = setInterval(() => {
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: CARD_W() * 2, behavior: 'smooth' });
    }
  }, 10000);

  const wrapper = track.closest('.recommended-products__wrapper');
  if (wrapper) on(wrapper, 'mouseenter', () => clearInterval(recTimer));
})();

/* ============================================================
   NAV DRAWER
   ============================================================ */
(function initNavDrawer() {
  const drawer       = $('#navDrawer');
  if (!drawer) return;
  const toggle       = $('#navMenuToggle');
  const closeBtn     = $('#navDrawerClose');
  const backdrop     = $('#navDrawerBackdrop');
  const bottomToggle = $('#mobileMenuToggleBottom');

  function openDrawer() {
    drawer.classList.add('is-open');
    toggle?.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const panel = drawer.querySelector('.nav-drawer__panel');
    if (panel) trapFocus(panel);
    setTimeout(() => drawer.querySelector('.nav-drawer__close')?.focus(), 50);
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    toggle?.focus();
  }

  on(toggle, 'click', openDrawer);
  on(bottomToggle, 'click', openDrawer);
  on(closeBtn, 'click', closeDrawer);
  on(backdrop, 'click', closeDrawer);
  on(document, 'keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer(); });

  $$('.submenu-toggle').forEach(btn => {
    on(btn, 'click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.nextElementSibling?.classList.toggle('is-open', !expanded);
    });
  });
})();

/* ============================================================
   SEARCH OVERLAY
   ============================================================ */
(function initSearch() {
  const overlay   = $('#searchOverlay');
  if (!overlay) return;
  const input     = $('#searchInput');
  const closeBtn  = $('#searchClose');
  const results   = $('#searchResults');
  const mTrigger  = $('#mobileSearchToggle');
  const hTrigger  = $('#headerSearchToggle');

  function openOverlay() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 80);
  }
  function closeOverlay() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (results) results.innerHTML = '';
  }

  on(mTrigger, 'click', openOverlay);
  on(hTrigger, 'click', openOverlay);
  on(closeBtn, 'click', closeOverlay);
  on(overlay, 'click', e => { if (e.target === overlay || e.target.id === 'searchOverlay') closeOverlay(); });
  on(document, 'keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay(); });

  async function liveSearch(query) {
    if (!query || query.length < 2) { if (results) results.innerHTML = ''; return; }
    try {
      const res = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=6`);
      if (!res.ok) return;
      const data = await res.json();
      const products = data.resources?.results?.products || [];
      if (!results) return;
      if (!products.length) {
        results.innerHTML = `<p style="padding:16px;text-align:center;color:#888;font-size:13px;">No results for &ldquo;${query}&rdquo;</p>`;
        return;
      }
      results.innerHTML = products.map(p => `
        <a href="${p.url}" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #e8e8e8;text-decoration:none;color:#0a0a0a;transition:background .15s;" onmouseenter="this.style.background='#f9f9f7'" onmouseleave="this.style.background=''">
          ${p.featured_image?.url ? `<img src="${p.featured_image.url}&width=96" style="width:48px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0;" alt="">` : '<div style="width:48px;height:60px;background:#f0ece6;border-radius:4px;flex-shrink:0;"></div>'}
          <div>
            <p style="font-size:13px;font-weight:600;margin-bottom:2px;">${p.title}</p>
            <p style="font-size:12px;color:#888;">${p.price ? ('$' + (p.price / 100).toFixed(2)) : ''}</p>
          </div>
        </a>
      `).join('');
    } catch (err) {}
  }

  on(input, 'input', debounce(() => liveSearch(input.value.trim()), 350));

  // Desktop search autocomplete
  const desktopInput = $('#desktopSearchInput');
  const desktopResults = $('#desktopSearchResults');
  if (desktopInput && desktopResults) {
    on(desktopInput, 'input', debounce(async () => {
      const q = desktopInput.value.trim();
      if (!q || q.length < 2) { desktopResults.innerHTML = ''; desktopResults.hidden = true; return; }
      try {
        const res = await fetch(`/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=5`);
        if (!res.ok) return;
        const data = await res.json();
        const products = data.resources?.results?.products || [];
        if (!products.length) { desktopResults.hidden = true; return; }
        desktopResults.innerHTML = products.map(p => `
          <a href="${p.url}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #e8e8e8;text-decoration:none;color:#0a0a0a;transition:background .15s;" onmouseenter="this.style.background='#f9f9f7'" onmouseleave="this.style.background=''">
            ${p.featured_image?.url ? `<img src="${p.featured_image.url}&width=72" style="width:36px;height:44px;object-fit:cover;border-radius:3px;flex-shrink:0;" alt="">` : ''}
            <div>
              <p style="font-size:13px;font-weight:500;">${p.title}</p>
              <p style="font-size:11px;color:#888;">${p.price ? ('$' + (p.price / 100).toFixed(2)) : ''}</p>
            </div>
          </a>
        `).join('');
        desktopResults.hidden = false;
      } catch (err) {}
    }, 350));

    on(document, 'click', e => {
      if (!desktopInput.contains(e.target) && !desktopResults.contains(e.target)) {
        desktopResults.hidden = true;
      }
    });
  }
})();

/* ============================================================
   CART DRAWER
   ============================================================ */
(function initCartDrawer() {
  const drawer    = $('#CartDrawer');
  if (!drawer) return;

  const overlay   = $('#CartDrawerOverlay');
  const closeBtn  = $('#CartDrawerClose');
  const itemsEl   = $('#CartDrawerItems');
  const totalEl   = $('#CartDrawerTotal');
  const emptyEl   = $('#CartDrawerEmpty');
  const footerEl  = $('#CartDrawerFooter');
  let busy = false;

  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    loadCartIntoDrawer();
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  on(closeBtn,  'click', closeDrawer);
  on(overlay,   'click', closeDrawer);
  on(document,  'keydown', e => { if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer(); });

  /* Wire ALL cart-trigger elements in the page */
  function wireCartTriggers() {
    $$('.js-cart-trigger, [data-cart-trigger], .site-header__cart, .mobile-bottom-bar__cart-btn').forEach(el => {
      el.addEventListener('click', e => { e.preventDefault(); openDrawer(); });
    });
  }
  wireCartTriggers();
  /* Expose globally so sections can re-wire after DOM changes */
  window.openCartDrawer = openDrawer;

  /* Format cents → $X.XX */
  function fmt(cents) { return '$' + (cents / 100).toFixed(2); }

  function syncBadges(count) {
    $$('.cart-badge, .cart-count').forEach(el => {
      el.textContent = count;
      el.hidden = count === 0;
    });
  }

  function renderItems(cart) {
    if (!itemsEl) return;
    if (cart.item_count === 0) {
      itemsEl.innerHTML = '';
      if (emptyEl)  emptyEl.hidden  = false;
      if (footerEl) footerEl.hidden = true;
      if (totalEl)  totalEl.textContent = '$0.00';
      return;
    }
    if (emptyEl)  emptyEl.hidden  = true;
    if (footerEl) footerEl.hidden = false;

    itemsEl.innerHTML = cart.items.map(item => `
      <div class="cart-drawer-item" data-key="${item.key}">
        <div class="cart-drawer-item__img">
          ${item.featured_image?.url
            ? `<img src="${item.featured_image.url}&width=160" alt="${item.title | escape}" loading="lazy">`
            : `<div class="cart-drawer-item__img-placeholder"></div>`}
        </div>
        <div class="cart-drawer-item__body">
          <a href="${item.url}" class="cart-drawer-item__title">${item.product_title}</a>
          ${item.variant_title && item.variant_title !== 'Default Title'
            ? `<p class="cart-drawer-item__variant">${item.variant_title}</p>` : ''}
          <p class="cart-drawer-item__price">${fmt(item.final_line_price)}</p>
          <div class="cart-drawer-item__controls">
            <div class="cart-drawer-qty">
              <button class="cart-drawer-qty__btn js-qty-minus"
                data-key="${item.key}" data-qty="${item.quantity - 1}" aria-label="Decrease">−</button>
              <span class="cart-drawer-qty__num">${item.quantity}</span>
              <button class="cart-drawer-qty__btn js-qty-plus"
                data-key="${item.key}" data-qty="${item.quantity + 1}" aria-label="Increase">+</button>
            </div>
            <button class="cart-drawer-remove js-remove-item"
              data-key="${item.key}" aria-label="Remove item">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              Remove
            </button>
          </div>
        </div>
      </div>
    `).join('');

    if (totalEl) totalEl.textContent = fmt(cart.total_price);
  }

  async function loadCartIntoDrawer() {
    try {
      const res = await fetch('/cart.js');
      if (!res.ok) return;
      const cart = await res.json();
      renderItems(cart);
      syncBadges(cart.item_count);
    } catch (e) {}
  }

  async function changeItem(key, qty) {
    if (busy) return;
    busy = true;
    try {
      const res = await fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ id: key, quantity: qty })
      });
      if (!res.ok) throw new Error();
      const cart = await res.json();
      renderItems(cart);
      syncBadges(cart.item_count);
    } catch (e) {
    } finally { busy = false; }
  }

  /* Delegate qty/remove clicks inside the drawer */
  on(drawer, 'click', async e => {
    const minus  = e.target.closest('.js-qty-minus');
    const plus   = e.target.closest('.js-qty-plus');
    const remove = e.target.closest('.js-remove-item');
    if (minus)  await changeItem(minus.dataset.key,  Math.max(0, parseInt(minus.dataset.qty, 10)));
    if (plus)   await changeItem(plus.dataset.key,   parseInt(plus.dataset.qty, 10));
    if (remove) await changeItem(remove.dataset.key, 0);
  });
})();

/* ============================================================
   PRODUCT GALLERY — FILTERS + LOAD MORE
   ============================================================ */
(function initFilters() {
  const grid = $('#productsGrid');
  if (!grid) return;

  const allCards   = $$('.product-card', grid);
  const INITIAL    = 25;
  const STEP       = 10;

  let priceMin     = 0;
  let priceMax     = 500;
  let activeColor  = '';
  let activeSize   = '';
  let visibleCount = INITIAL;

  function getFiltered() {
    return allCards.filter(card => {
      const price  = parseFloat(card.dataset.price || '9999');
      const colors = (card.dataset.colors || '').toLowerCase();
      const sizes  = (card.dataset.sizes || '').toLowerCase();
      return price >= priceMin && price <= priceMax
          && (!activeColor || colors.includes(activeColor.toLowerCase()))
          && (!activeSize  || sizes.includes(activeSize.toLowerCase()));
    });
  }

  function applyFilters() {
    const filtered = getFiltered();
    allCards.forEach(c => { c.style.display = 'none'; });
    filtered.slice(0, visibleCount).forEach(c => { c.style.display = ''; });

    const countEl = $('#galleryCount');
    if (countEl) countEl.textContent = filtered.length + ' product' + (filtered.length !== 1 ? 's' : '');

    const lmWrapper = $('#loadMoreWrapper');
    const lmBtn     = $('#loadMoreBtn');
    const lmCount   = $('#loadMoreCount');
    if (lmWrapper) {
      const hasMore = visibleCount < filtered.length;
      lmWrapper.style.display = '';
      if (lmBtn) lmBtn.style.display = hasMore ? '' : 'none';
      if (lmCount) {
        lmCount.textContent = hasMore
          ? 'Showing ' + Math.min(visibleCount, filtered.length) + ' of ' + filtered.length + ' products'
          : 'All ' + filtered.length + ' products shown';
      }
    }
  }

  function initPriceRange(minEl, maxEl, minValEl, maxValEl, fillEl) {
    if (!minEl) return;
    function update() {
      let lo = parseInt(minEl.value), hi = parseInt(maxEl.value);
      if (lo > hi) minEl.value = lo = hi;
      const min = lo, max = hi;
      if (minValEl) minValEl.textContent = '$' + min;
      if (maxValEl) maxValEl.textContent = '$' + max;
      if (fillEl) {
        const range = parseInt(maxEl.max) - parseInt(minEl.min);
        fillEl.style.left  = (min / range * 100) + '%';
        fillEl.style.right = ((parseInt(maxEl.max) - max) / range * 100) + '%';
      }
      priceMin     = min;
      priceMax     = max;
      visibleCount = INITIAL;
      applyFilters();
    }
    on(minEl, 'input', update);
    on(maxEl, 'input', update);
  }
  initPriceRange($('#priceMin'), $('#priceMax'), $('#priceMinVal'), $('#priceMaxVal'), $('#priceRangeFill'));

  function initColorSwatches(container) {
    if (!container) return;
    $$('.color-swatch', container).forEach(btn => {
      on(btn, 'click', () => {
        const col = btn.dataset.color || '';
        $$('.color-swatch').forEach(b => b.classList.toggle('color-swatch--active', (b.dataset.color || '') === col));
        activeColor  = col;
        visibleCount = INITIAL;
        applyFilters();
      });
    });
  }
  initColorSwatches($('#filterColors'));
  initColorSwatches($('#mFilterColors'));

  function initSizeButtons(container) {
    if (!container) return;
    $$('.size-btn', container).forEach(btn => {
      on(btn, 'click', () => {
        const sz = btn.dataset.size || '';
        $$('.size-btn').forEach(b => b.classList.toggle('size-btn--active', (b.dataset.size || '') === sz));
        activeSize   = sz;
        visibleCount = INITIAL;
        applyFilters();
      });
    });
  }
  initSizeButtons($('#filterSizes'));
  initSizeButtons($('#mFilterSizes'));

  function clearAll() {
    priceMin = 0; priceMax = 500; activeColor = ''; activeSize = ''; visibleCount = INITIAL;
    $$('.color-swatch').forEach(b => b.classList.toggle('color-swatch--active', !(b.dataset.color)));
    $$('.size-btn').forEach(b => b.classList.toggle('size-btn--active', !(b.dataset.size)));
    $$('.price-range-slider__input--min').forEach(el => { el.value = 0; el.dispatchEvent(new Event('input')); });
    $$('.price-range-slider__input--max').forEach(el => { el.value = 500; el.dispatchEvent(new Event('input')); });
    applyFilters();
  }
  on($('#clearFiltersDesktop'), 'click', clearAll);
  on($('#clearFiltersMobile'),  'click', clearAll);

  $$('.view-toggle-btn').forEach(btn => {
    on(btn, 'click', () => {
      $$('.view-toggle-btn').forEach(b => b.classList.remove('view-toggle-btn--active'));
      btn.classList.add('view-toggle-btn--active');
      $$('.products-grid').forEach(g => { g.dataset.view = btn.dataset.view; });
    });
  });

  on($('#loadMoreBtn'), 'click', () => {
    const filtered = getFiltered();
    visibleCount = Math.min(visibleCount + STEP, filtered.length);
    applyFilters();
    const lastVisible = $$('.product-card:not([style*="display: none"])', grid).slice(-3)[0];
    lastVisible?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  // Mobile filter drawer
  const filterDrawer = $('#mobileFilterDrawer');
  const filterBackdrop = $('#mobileFilterBackdrop');
  on($('#mobileFilterOpen'), 'click', () => {
    filterDrawer?.classList.add('is-open');
    filterDrawer?.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
  function closeFilterDrawer() {
    filterDrawer?.classList.remove('is-open');
    filterDrawer?.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  on($('#mobileFilterClose'), 'click', closeFilterDrawer);
  on(filterBackdrop, 'click', closeFilterDrawer);
  on($('#applyFiltersMobile'), 'click', () => { applyFilters(); closeFilterDrawer(); });

  applyFilters();
})();

/* ============================================================
   PRODUCT PAGE
   ============================================================ */
(function initProductPage() {
  const form = $('#AddToCartForm');
  if (!form) return;

  const variantInput = $('#selectedVariantId');
  const optionBtns   = $$('[data-option]');

  // Load variants JSON from embedded script tag
  let variants = [];
  const variantScript = $('[data-product-variants]');
  if (variantScript) {
    try { variants = JSON.parse(variantScript.textContent); } catch (e) {}
  }

  const selectedOptions = {};

  // Seed selected options from currently-selected buttons/selects
  $$('.color-btn.is-selected, .size-opt-btn.is-selected').forEach(btn => {
    selectedOptions[btn.dataset.option] = btn.dataset.value;
  });
  $$('.product-option__select').forEach(sel => {
    selectedOptions[sel.dataset.option] = sel.value;
  });

  function findAndSetVariant() {
    if (!variants.length || !variantInput) return;
    const match = variants.find(v =>
      Object.entries(selectedOptions).every(([i, val]) => v.options[parseInt(i)] === val)
    );
    if (match) {
      variantInput.value = match.id;
      // Update availability display
      const addBtn = $('#addToCartBtn');
      const btnText = addBtn?.querySelector('.btn-addtocart__text');
      if (addBtn) {
        addBtn.disabled = !match.available;
        addBtn.setAttribute('aria-disabled', String(!match.available));
      }
      if (btnText) btnText.textContent = match.available ? 'Add to Cart' : 'Sold Out';
    }
  }

  // Button-style options (Color, Size)
  optionBtns.filter(el => el.tagName === 'BUTTON').forEach(btn => {
    on(btn, 'click', () => {
      const optionIdx = btn.dataset.option;
      const val       = btn.dataset.value;
      $$(`[data-option="${optionIdx}"]`).forEach(b => {
        b.classList.remove('is-selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
      selectedOptions[optionIdx] = val;
      const labelSpan = btn.closest('.product-option')?.querySelector('.product-option__selected');
      if (labelSpan) labelSpan.textContent = val;
      findAndSetVariant();
    });
  });

  // Select-based options
  $$('.product-option__select').forEach(select => {
    const optionIdx = select.dataset.option;
    selectedOptions[optionIdx] = select.value;
    on(select, 'change', () => {
      selectedOptions[optionIdx] = select.value;
      const labelSpan = select.closest('.product-option')?.querySelector('.product-option__selected');
      if (labelSpan) labelSpan.textContent = select.value;
      findAndSetVariant();
    });
  });

  // Quantity
  const qtyInput = $('#productQty');
  on($('#qtyMinus'), 'click', () => { if (qtyInput && parseInt(qtyInput.value) > 1) qtyInput.value--; });
  on($('#qtyPlus'),  'click', () => { if (qtyInput && parseInt(qtyInput.value) < 10) qtyInput.value++; });

  // Add to cart (AJAX)
  const addBtn    = $('#addToCartBtn');
  const btnText   = $('.btn-addtocart__text', form);
  const btnLoader = $('.btn-addtocart__loading', form);
  const cartMsg   = $('#cartSuccess');

  on(form, 'submit', async e => {
    e.preventDefault();
    if (!addBtn || addBtn.disabled) return;

    const formData = new FormData(form);
    addBtn.disabled = true;
    if (btnText)   btnText.hidden   = true;
    if (btnLoader) btnLoader.hidden = false;

    try {
      const res = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.description || 'There was an error adding to cart. Please try again.');
        throw new Error();
      }
      if (cartMsg) { cartMsg.hidden = false; setTimeout(() => { cartMsg.hidden = true; }, 4500); }
      await refreshCartCount();
      if (typeof window.openCartDrawer === 'function') window.openCartDrawer();
    } catch (err) {
    } finally {
      addBtn.disabled = false;
      if (btnText)   btnText.hidden   = false;
      if (btnLoader) btnLoader.hidden = true;
    }
  });

  // Gallery
  const thumbs    = $$('.product-gallery-thumb');
  const mainItems = $$('.product-gallery-main__item');
  let gIdx = 0;

  function showSlide(idx) {
    gIdx = idx;
    mainItems.forEach((item, i) => item.classList.toggle('is-active', i === idx));
    thumbs.forEach((t, i) => t.classList.toggle('is-active', i === idx));
  }

  thumbs.forEach((thumb, i) => on(thumb, 'click', () => showSlide(i)));
  on($('#galleryPrev'), 'click', () => showSlide((gIdx - 1 + mainItems.length) % mainItems.length));
  on($('#galleryNext'), 'click', () => showSlide((gIdx + 1) % mainItems.length));

  // Touch swipe on gallery
  let galleryTouchX = 0;
  const galleryMain = $('#productGalleryMain');
  on(galleryMain, 'touchstart', e => { galleryTouchX = e.changedTouches[0].clientX; }, { passive: true });
  on(galleryMain, 'touchend', e => {
    const dx = e.changedTouches[0].clientX - galleryTouchX;
    if (Math.abs(dx) > 40) showSlide((gIdx + (dx < 0 ? 1 : -1) + mainItems.length) % mainItems.length);
  });
})();

/* ============================================================
   ACCORDION
   ============================================================ */
document.addEventListener('click', e => {
  const trigger = e.target.closest('.accordion__trigger');
  if (!trigger) return;
  const body   = trigger.nextElementSibling;
  const isOpen = trigger.classList.contains('is-open');
  trigger.classList.toggle('is-open', !isOpen);
  trigger.setAttribute('aria-expanded', String(!isOpen));
  if (body) body.hidden = isOpen;
});

/* ============================================================
   ADD TO CART — Quick add from product cards
   ============================================================ */
async function refreshCartCount() {
  try {
    const res = await fetch('/cart.js');
    if (!res.ok) return;
    const cart = await res.json();
    $$('.cart-badge, .cart-count').forEach(el => {
      el.textContent = cart.item_count;
      el.hidden = cart.item_count === 0;
    });
  } catch (e) {}
}

document.addEventListener('click', async e => {
  const btn = e.target.closest('.product-card__cart-btn');
  if (!btn || btn.disabled) return;

  const hasOptions = btn.dataset.hasOptions === 'true';
  if (hasOptions) {
    const url = btn.dataset.productUrl;
    if (url) window.location.href = url;
    return;
  }

  const variantId = btn.dataset.variantId;
  if (!variantId) return;

  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span class="spinner" style="border-color:rgba(255,255,255,.3);border-top-color:#fff;width:14px;height:14px;display:inline-block;border-width:2px;border-style:solid;border-radius:50%;animation:spin .7s linear infinite;"></span>';

  try {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    });
    if (!res.ok) throw new Error();
    btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg> Added!';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1800);
    await refreshCartCount();
    if (typeof window.openCartDrawer === 'function') window.openCartDrawer();
  } catch (err) {
    btn.innerHTML = '&#x26a0; Error';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1800);
  }
});

/* ============================================================
   SCROLL-TRIGGERED ANIMATIONS
   ============================================================ */
(function initAOS() {
  const elements = $$('[data-aos]');
  if (!elements.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('aos-animate');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   FILE UPLOAD PREVIEW (custom design page)
   ============================================================ */
(function initFileUpload() {
  const input   = $('#cd-file');
  const preview = $('#fileUploadPreview');
  const area    = $('#fileUploadArea');
  if (!input) return;

  on(input, 'change', () => {
    const file = input.files[0];
    if (!file || !preview) return;
    preview.hidden = false;
    preview.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  });

  if (area) {
    on(area, 'dragover', e => { e.preventDefault(); area.style.borderColor = 'var(--clr-gold)'; });
    on(area, 'dragleave', () => { area.style.borderColor = ''; });
    on(area, 'drop', e => {
      e.preventDefault();
      area.style.borderColor = '';
      if (e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  }
})();

/* ============================================================
   PASSWORD SHOW/HIDE (auth pages)
   ============================================================ */
(function initPasswordToggle() {
  $$('.form-input-toggle').forEach(toggle => {
    const input = toggle.closest('.form-input-group')?.querySelector('input');
    on(toggle, 'click', () => {
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
})();

/* ============================================================
   MARQUEE — pause on touch
   ============================================================ */
(function initMarquee() {
  $$('.marquee-track').forEach(track => {
    on(track, 'touchstart', () => { track.style.animationPlayState = 'paused'; }, { passive: true });
    on(track, 'touchend',   () => { track.style.animationPlayState = ''; });
  });
})();

/* ============================================================
   REDUCED MOTION
   ============================================================ */
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const style = document.createElement('style');
  style.textContent = '*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }';
  document.head.appendChild(style);
}

/* ============================================================
   SPINNER KEYFRAME (injected if needed)
   ============================================================ */
(function ensureSpinnerKeyframe() {
  if (document.querySelector('#uj-spinner-kf')) return;
  const s = document.createElement('style');
  s.id = 'uj-spinner-kf';
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
})();
