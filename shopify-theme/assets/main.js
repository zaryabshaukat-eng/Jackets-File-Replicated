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
const off = (el, ev, fn) => el && el.removeEventListener(ev, fn);

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
let lastScroll = 0;
const header = $('#siteHeader');
const mobileBottomBar = $('#mobileBottomBar');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const isMobile = window.innerWidth < 768;

  // Header shadow on scroll
  if (header) header.classList.toggle('scrolled', y > 10);

  // Mobile bottom bar: show after scrolling past header
  if (mobileBottomBar && isMobile) {
    mobileBottomBar.classList.toggle('is-visible', y > 120);
  }

  lastScroll = y;
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

  // Pause on hover
  const carousel = track.closest('.hero-carousel');
  on(carousel, 'mouseenter', () => clearInterval(timer));
  on(carousel, 'mouseleave', () => startTimer());

  // Pause when tab hidden
  on(document, 'visibilitychange', () => { document.hidden ? clearInterval(timer) : startTimer(); });

  if (slides.length > 1) startTimer();
})();

/* ============================================================
   RECOMMENDED PRODUCTS SLIDER
   ============================================================ */
(function initRecSlider() {
  const track = $('#recTrack');
  if (!track) return;

  const CARD_W = () => track.querySelector('.product-card')?.offsetWidth + 20 || 280;
  const progressBar = $('#recProgressBar');

  function updateProgress() {
    if (!progressBar) return;
    const max = track.scrollWidth - track.clientWidth;
    const pct = max > 0 ? (track.scrollLeft / max) * 80 + 10 : 10;
    progressBar.style.width = pct + '%';
  }

  on($('#recPrev'), 'click', () => { track.scrollBy({ left: -CARD_W() * 2, behavior: 'smooth' }); });
  on($('#recNext'), 'click', () => { track.scrollBy({ left: CARD_W() * 2, behavior: 'smooth' }); });
  on(track, 'scroll', updateProgress, { passive: true });

  // Auto-scroll every 10s
  let recTimer = setInterval(() => {
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
      track.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      track.scrollBy({ left: CARD_W() * 2, behavior: 'smooth' });
    }
  }, 10000);

  on(track.closest('.recommended-products__wrapper'), 'mouseenter', () => clearInterval(recTimer));
})();

/* ============================================================
   NAV DRAWER (hamburger menu dots)
   ============================================================ */
(function initNavDrawer() {
  const drawer   = $('#navDrawer');
  const toggle   = $('#navMenuToggle');
  const close    = $('#navDrawerClose');
  const backdrop = $('#navDrawerBackdrop');
  const bottomToggle = $('#mobileMenuToggleBottom');

  function open() {
    drawer.classList.add('is-open');
    toggle?.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    trapFocus(drawer.querySelector('.nav-drawer__panel'));
    setTimeout(() => drawer.querySelector('.nav-drawer__close')?.focus(), 50);
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    toggle?.focus();
  }

  on(toggle, 'click', open);
  on(bottomToggle, 'click', open);
  on(close, 'click', closeDrawer);
  on(backdrop, 'click', closeDrawer);
  on(document, 'keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // Submenu toggles
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
  const input     = $('#searchInput');
  const closeBtn  = $('#searchClose');
  const results   = $('#searchResults');
  const mTrigger  = $('#mobileSearchToggle');
  const hTrigger  = $('#headerSearchToggle');

  function openOverlay() {
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 80);
  }
  function closeOverlay() {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  on(mTrigger, 'click', openOverlay);
  on(hTrigger, 'click', openOverlay);
  on(closeBtn, 'click', closeOverlay);
  on(overlay, 'click', e => { if (e.target === overlay) closeOverlay(); });
  on(document, 'keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay(); });

  // Autocomplete live search
  async function liveSearch(query) {
    if (!query || query.length < 2) { if (results) results.innerHTML = ''; return; }
    try {
      const res = await fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=5`);
      if (!res.ok) return;
      const data = await res.json();
      const products = data.resources?.results?.products || [];
      if (!results) return;
      if (!products.length) {
        results.innerHTML = `<p style="padding:16px;text-align:center;color:#888;font-size:13px;">No results for "${query}"</p>`;
        return;
      }
      results.innerHTML = products.map(p => `
        <a href="${p.url}" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid #e8e8e8;text-decoration:none;color:#0a0a0a;transition:background .15s;">
          ${p.featured_image?.url ? `<img src="${p.featured_image.url}" style="width:48px;height:60px;object-fit:cover;border-radius:4px;flex-shrink:0;" alt="${p.title}">` : '<div style="width:48px;height:60px;background:#f0ece6;border-radius:4px;flex-shrink:0;"></div>'}
          <div>
            <p style="font-size:13px;font-weight:600;margin-bottom:2px;">${p.title}</p>
            <p style="font-size:12px;color:#888;">${p.price ? ('$' + (p.price / 100).toFixed(2)) : ''}</p>
          </div>
        </a>
      `).join('');
    } catch {}
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
          <a href="${p.url}" style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid #e8e8e8;text-decoration:none;color:#0a0a0a;">
            ${p.featured_image?.url ? `<img src="${p.featured_image.url}" style="width:36px;height:44px;object-fit:cover;border-radius:3px;flex-shrink:0;" alt="${p.title}">` : ''}
            <div>
              <p style="font-size:13px;font-weight:500;">${p.title}</p>
              <p style="font-size:11px;color:#888;">${p.price ? ('$' + (p.price / 100).toFixed(2)) : ''}</p>
            </div>
          </a>
        `).join('');
        desktopResults.hidden = false;
      } catch {}
    }, 350));

    on(document, 'click', e => {
      if (!desktopInput.contains(e.target) && !desktopResults.contains(e.target)) {
        desktopResults.hidden = true;
      }
    });
  }
})();

/* ============================================================
   PRODUCT GALLERY — FILTERS + LOAD MORE
   ============================================================ */
(function initFilters() {
  const grid = $('#productsGrid');
  if (!grid) return;

  const allCards = $('.product-card', grid);
  const INITIAL  = 25;   // products shown on first load
  const STEP     = 10;   // products revealed per "Load More" click

  let priceMin    = 0;
  let priceMax    = 500;
  let activeColor = '';
  let activeSize  = '';
  let visibleCount = INITIAL;

  /* ── Compute filtered set ── */
  function getFiltered() {
    return allCards.filter(card => {
      const price  = parseFloat(card.dataset.price  || '9999');
      const colors = (card.dataset.colors || '').toLowerCase();
      const sizes  = (card.dataset.sizes  || '').toLowerCase();
      return price  >= priceMin && price <= priceMax
          && (!activeColor || colors.includes(activeColor.toLowerCase()))
          && (!activeSize  || sizes.includes(activeSize.toLowerCase()));
    });
  }

  /* ── Apply current filters + visible count ── */
  function applyFilters() {
    const filtered = getFiltered();

    // Hide everything first
    allCards.forEach(c => { c.style.display = 'none'; });

    // Show the first `visibleCount` of the filtered set
    filtered.slice(0, visibleCount).forEach(c => { c.style.display = ''; });

    // Gallery count label
    const countEl = $('#galleryCount');
    if (countEl) {
      countEl.textContent = filtered.length + ' product' + (filtered.length !== 1 ? 's' : '');
    }

    // Load more button
    const lmWrapper = $('#loadMoreWrapper');
    const lmBtn     = $('#loadMoreBtn');
    const lmCount   = $('#loadMoreCount');
    if (lmWrapper) {
      const hasMore = visibleCount < filtered.length;
      lmWrapper.style.display = '';
      if (lmBtn)   { lmBtn.style.display   = hasMore ? '' : 'none'; }
      if (lmCount) {
        lmCount.textContent = hasMore
          ? 'Showing ' + Math.min(visibleCount, filtered.length) + ' of ' + filtered.length + ' products'
          : 'All ' + filtered.length + ' products shown';
      }
    }
  }

  /* ── Price range (desktop only; mobile uses same sidebar) ── */
  function initPriceRange(minEl, maxEl, minValEl, maxValEl, fillEl) {
    if (!minEl) return;
    function update() {
      const lo = parseInt(minEl.value), hi = parseInt(maxEl.value);
      if (lo > hi) minEl.value = hi;
      const min = parseInt(minEl.value), max = parseInt(maxEl.value);
      if (minValEl) minValEl.textContent = '

/* ============================================================
   PRODUCT PAGE
   ============================================================ */
(function initProductPage() {
  const form = $('#AddToCartForm');
  if (!form) return;

  // Variant selection
  const variantInput = $('#selectedVariantId');
  const optionBtns   = $$('[data-option]');

  // Build variant map from Shopify's product JSON (if available via script tag)
  let variants = [];
  const variantScript = $('[data-product-variants]');
  if (variantScript) {
    try { variants = JSON.parse(variantScript.textContent); } catch {}
  }

  const selectedOptions = {};

  function findAndSetVariant() {
    if (!variants.length || !variantInput) return;
    const match = variants.find(v =>
      Object.entries(selectedOptions).every(([i, val]) => v.options[parseInt(i)] === val)
    );
    if (match) variantInput.value = match.id;
  }

  // Button-style options (Color, Size)
  optionBtns.filter(el => el.tagName === 'BUTTON').forEach(btn => {
    on(btn, 'click', () => {
      const optionIdx = btn.dataset.option;
      const val       = btn.dataset.value;

      $(`[data-option="${optionIdx}"]`).forEach(b => {
        b.classList.remove('is-selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
      selectedOptions[optionIdx] = val;

      // Update displayed label
      const labelSpan = btn.closest('.product-option')?.querySelector('.product-option__selected');
      if (labelSpan) labelSpan.textContent = val;

      findAndSetVariant();
    });
  });

  // Select-based options (any other option type)
  $('.product-option__select').forEach(select => {
    const optionIdx = select.dataset.option;
    // Seed initial value
    selectedOptions[optionIdx] = select.value;
    on(select, 'change', () => {
      selectedOptions[optionIdx] = select.value;
      // Update label span if present
      const labelSpan = select.closest('.product-option')?.querySelector('.product-option__selected');
      if (labelSpan) labelSpan.textContent = select.value;
      findAndSetVariant();
    });
  });

  // Quantity
  const qtyInput = $('#productQty');
  on($('#qtyMinus'), 'click', () => { if (qtyInput && parseInt(qtyInput.value) > 1) qtyInput.value--; });
  on($('#qtyPlus'),  'click', () => { if (qtyInput && parseInt(qtyInput.value) < 10) qtyInput.value++; });

  // Add to cart
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
      if (!res.ok) throw new Error();

      if (cartMsg) { cartMsg.hidden = false; setTimeout(() => cartMsg.hidden = true, 4000); }

      // Update cart count badges
      const cartRes = await fetch('/cart.js');
      if (cartRes.ok) {
        const cart = await cartRes.json();
        $$('.cart-badge, .cart-count').forEach(el => {
          el.textContent = cart.item_count;
          el.hidden = cart.item_count === 0;
        });
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      addBtn.disabled = false;
      if (btnText)   btnText.hidden   = false;
      if (btnLoader) btnLoader.hidden = true;
    }
  });

  // Gallery
  const mainGallery = $('#productGalleryMain');
  const thumbs      = $$('.product-gallery-thumb');
  const mainItems   = $$('.product-gallery-main__item');

  function showSlide(idx) {
    mainItems.forEach((item, i) => item.classList.toggle('is-active', i === idx));
    thumbs.forEach((t, i) => t.classList.toggle('is-active', i === idx));
  }

  thumbs.forEach((thumb, i) => on(thumb, 'click', () => showSlide(i)));

  let gIdx = 0;
  on($('#galleryPrev'), 'click', () => { gIdx = (gIdx - 1 + mainItems.length) % mainItems.length; showSlide(gIdx); });
  on($('#galleryNext'), 'click', () => { gIdx = (gIdx + 1) % mainItems.length; showSlide(gIdx); });

  // Accordion
  $$('.accordion__trigger').forEach(trigger => {
    on(trigger, 'click', () => {
      const body     = trigger.nextElementSibling;
      const isOpen   = trigger.classList.contains('is-open');
      const expanded = !isOpen;
      trigger.classList.toggle('is-open', expanded);
      trigger.setAttribute('aria-expanded', expanded);
      if (body) body.hidden = !expanded;
    });
  });

  // Password show/hide
  const togglePwd = $('#togglePassword');
  const pwdInput  = $('#CustomerPassword, #CreatePassword');
  on(togglePwd, 'click', () => {
    if (!pwdInput) return;
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
  });
})();

/* ============================================================
   ADD TO CART (from product cards — quick add)
   ============================================================ */
document.addEventListener('click', async e => {
  const btn = e.target.closest('.product-card__cart-btn');
  if (!btn) return;
  if (btn.disabled) return;

  const hasOptions = btn.dataset.hasOptions === 'true';
  if (hasOptions) {
    // Redirect to product page for variant selection
    const url = btn.dataset.productUrl;
    if (url) window.location.href = url;
    return;
  }

  const variantId = btn.dataset.variantId;
  if (!variantId) return;

  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span class="spinner" style="border-color:rgba(255,255,255,.3);border-top-color:#fff;"></span>';

  try {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    });
    if (!res.ok) throw new Error();

    btn.innerHTML = '✓ Added!';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled = false;
    }, 1800);

    // Refresh cart count
    const cartRes = await fetch('/cart.js');
    if (cartRes.ok) {
      const cart = await cartRes.json();
      $$('.cart-badge, .cart-count').forEach(el => {
        el.textContent = cart.item_count;
        el.hidden = cart.item_count === 0;
      });
    }
  } catch {
    btn.innerHTML = 'Error!';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1800);
  }
});

/* ============================================================
   SCROLL-TRIGGERED ANIMATIONS (AOS-lite)
   ============================================================ */
(function initAOS() {
  const elements = $$('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
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
   FILE UPLOAD PREVIEW
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

  // Drag & drop
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
})();

/* ============================================================
   PASSWORD SHOW/HIDE (auth pages)
   ============================================================ */
(function initPasswordToggle() {
  $$('.form-input-toggle').forEach(toggle => {
    const input = toggle.closest('.form-input-group')?.querySelector('input[type="password"], input[type="text"]');
    on(toggle, 'click', () => {
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
})();

/* ============================================================
   MARQUEE — pause on hover (already via CSS, but also touch)
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
  style.textContent = `*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }`;
  document.head.appendChild(style);
}
 + min;
      if (maxValEl) maxValEl.textContent = '

/* ============================================================
   PRODUCT PAGE
   ============================================================ */
(function initProductPage() {
  const form = $('#AddToCartForm');
  if (!form) return;

  // Variant selection
  const variantInput = $('#selectedVariantId');
  const optionBtns   = $$('[data-option]');

  // Build variant map from Shopify's product JSON (if available via script tag)
  let variants = [];
  const variantScript = $('[data-product-variants]');
  if (variantScript) {
    try { variants = JSON.parse(variantScript.textContent); } catch {}
  }

  const selectedOptions = {};

  function findAndSetVariant() {
    if (!variants.length || !variantInput) return;
    const match = variants.find(v =>
      Object.entries(selectedOptions).every(([i, val]) => v.options[parseInt(i)] === val)
    );
    if (match) variantInput.value = match.id;
  }

  // Button-style options (Color, Size)
  optionBtns.filter(el => el.tagName === 'BUTTON').forEach(btn => {
    on(btn, 'click', () => {
      const optionIdx = btn.dataset.option;
      const val       = btn.dataset.value;

      $(`[data-option="${optionIdx}"]`).forEach(b => {
        b.classList.remove('is-selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
      selectedOptions[optionIdx] = val;

      // Update displayed label
      const labelSpan = btn.closest('.product-option')?.querySelector('.product-option__selected');
      if (labelSpan) labelSpan.textContent = val;

      findAndSetVariant();
    });
  });

  // Select-based options (any other option type)
  $('.product-option__select').forEach(select => {
    const optionIdx = select.dataset.option;
    // Seed initial value
    selectedOptions[optionIdx] = select.value;
    on(select, 'change', () => {
      selectedOptions[optionIdx] = select.value;
      // Update label span if present
      const labelSpan = select.closest('.product-option')?.querySelector('.product-option__selected');
      if (labelSpan) labelSpan.textContent = select.value;
      findAndSetVariant();
    });
  });

  // Quantity
  const qtyInput = $('#productQty');
  on($('#qtyMinus'), 'click', () => { if (qtyInput && parseInt(qtyInput.value) > 1) qtyInput.value--; });
  on($('#qtyPlus'),  'click', () => { if (qtyInput && parseInt(qtyInput.value) < 10) qtyInput.value++; });

  // Add to cart
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
      if (!res.ok) throw new Error();

      if (cartMsg) { cartMsg.hidden = false; setTimeout(() => cartMsg.hidden = true, 4000); }

      // Update cart count badges
      const cartRes = await fetch('/cart.js');
      if (cartRes.ok) {
        const cart = await cartRes.json();
        $$('.cart-badge, .cart-count').forEach(el => {
          el.textContent = cart.item_count;
          el.hidden = cart.item_count === 0;
        });
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      addBtn.disabled = false;
      if (btnText)   btnText.hidden   = false;
      if (btnLoader) btnLoader.hidden = true;
    }
  });

  // Gallery
  const mainGallery = $('#productGalleryMain');
  const thumbs      = $$('.product-gallery-thumb');
  const mainItems   = $$('.product-gallery-main__item');

  function showSlide(idx) {
    mainItems.forEach((item, i) => item.classList.toggle('is-active', i === idx));
    thumbs.forEach((t, i) => t.classList.toggle('is-active', i === idx));
  }

  thumbs.forEach((thumb, i) => on(thumb, 'click', () => showSlide(i)));

  let gIdx = 0;
  on($('#galleryPrev'), 'click', () => { gIdx = (gIdx - 1 + mainItems.length) % mainItems.length; showSlide(gIdx); });
  on($('#galleryNext'), 'click', () => { gIdx = (gIdx + 1) % mainItems.length; showSlide(gIdx); });

  // Accordion
  $$('.accordion__trigger').forEach(trigger => {
    on(trigger, 'click', () => {
      const body     = trigger.nextElementSibling;
      const isOpen   = trigger.classList.contains('is-open');
      const expanded = !isOpen;
      trigger.classList.toggle('is-open', expanded);
      trigger.setAttribute('aria-expanded', expanded);
      if (body) body.hidden = !expanded;
    });
  });

  // Password show/hide
  const togglePwd = $('#togglePassword');
  const pwdInput  = $('#CustomerPassword, #CreatePassword');
  on(togglePwd, 'click', () => {
    if (!pwdInput) return;
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
  });
})();

/* ============================================================
   ADD TO CART (from product cards — quick add)
   ============================================================ */
document.addEventListener('click', async e => {
  const btn = e.target.closest('.product-card__cart-btn');
  if (!btn) return;
  if (btn.disabled) return;

  const hasOptions = btn.dataset.hasOptions === 'true';
  if (hasOptions) {
    // Redirect to product page for variant selection
    const url = btn.dataset.productUrl;
    if (url) window.location.href = url;
    return;
  }

  const variantId = btn.dataset.variantId;
  if (!variantId) return;

  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span class="spinner" style="border-color:rgba(255,255,255,.3);border-top-color:#fff;"></span>';

  try {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    });
    if (!res.ok) throw new Error();

    btn.innerHTML = '✓ Added!';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled = false;
    }, 1800);

    // Refresh cart count
    const cartRes = await fetch('/cart.js');
    if (cartRes.ok) {
      const cart = await cartRes.json();
      $$('.cart-badge, .cart-count').forEach(el => {
        el.textContent = cart.item_count;
        el.hidden = cart.item_count === 0;
      });
    }
  } catch {
    btn.innerHTML = 'Error!';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1800);
  }
});

/* ============================================================
   SCROLL-TRIGGERED ANIMATIONS (AOS-lite)
   ============================================================ */
(function initAOS() {
  const elements = $$('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
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
   FILE UPLOAD PREVIEW
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

  // Drag & drop
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
})();

/* ============================================================
   PASSWORD SHOW/HIDE (auth pages)
   ============================================================ */
(function initPasswordToggle() {
  $$('.form-input-toggle').forEach(toggle => {
    const input = toggle.closest('.form-input-group')?.querySelector('input[type="password"], input[type="text"]');
    on(toggle, 'click', () => {
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
})();

/* ============================================================
   MARQUEE — pause on hover (already via CSS, but also touch)
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
  style.textContent = `*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }`;
  document.head.appendChild(style);
}
 + max;
      if (fillEl) {
        const range = parseInt(maxEl.max) - parseInt(minEl.min);
        fillEl.style.left  = (min / range * 100) + '%';
        fillEl.style.right = ((parseInt(maxEl.max) - max) / range * 100) + '%';
      }
      priceMin = min;
      priceMax = max;
      visibleCount = INITIAL; // reset pagination on filter change
      applyFilters();
    }
    on(minEl, 'input', update);
    on(maxEl, 'input', update);
  }
  initPriceRange($('#priceMin'), $('#priceMax'), $('#priceMinVal'), $('#priceMaxVal'), $('#priceRangeFill'));

  /* ── Color swatches ── */
  function initColorSwatches(container) {
    if (!container) return;
    $('.color-swatch', container).forEach(btn => {
      on(btn, 'click', () => {
        $('.color-swatch').forEach(b => b.classList.remove('color-swatch--active'));
        btn.classList.add('color-swatch--active');
        // Sync the mirror swatch with same data-color
        const col = btn.dataset.color || '';
        $('.color-swatch').forEach(b => {
          b.classList.toggle('color-swatch--active', (b.dataset.color || '') === col);
        });
        activeColor  = col;
        visibleCount = INITIAL;
        applyFilters();
      });
    });
  }
  initColorSwatches($('#filterColors'));
  initColorSwatches($('#mFilterColors'));

  /* ── Size buttons ── */
  function initSizeButtons(container) {
    if (!container) return;
    $('.size-btn', container).forEach(btn => {
      on(btn, 'click', () => {
        const sz = btn.dataset.size || '';
        $('.size-btn').forEach(b => b.classList.toggle('size-btn--active', (b.dataset.size || '') === sz));
        activeSize   = sz;
        visibleCount = INITIAL;
        applyFilters();
      });
    });
  }
  initSizeButtons($('#filterSizes'));
  initSizeButtons($('#mFilterSizes'));

  /* ── Clear all filters ── */
  function clearAll() {
    priceMin     = 0;
    priceMax     = 500;
    activeColor  = '';
    activeSize   = '';
    visibleCount = INITIAL;
    $('.color-swatch').forEach(b => b.classList.toggle('color-swatch--active', !(b.dataset.color)));
    $('.size-btn').forEach(b => b.classList.toggle('size-btn--active', !(b.dataset.size)));
    $('.price-range-slider__input--min').forEach(el => { el.value = 0; el.dispatchEvent(new Event('input')); });
    $('.price-range-slider__input--max').forEach(el => { el.value = 500; el.dispatchEvent(new Event('input')); });
    applyFilters();
  }
  on($('#clearFiltersDesktop'), 'click', clearAll);
  on($('#clearFiltersMobile'),  'click', clearAll);

  /* ── View toggle (grid / list) ── */
  $('.view-toggle-btn').forEach(btn => {
    on(btn, 'click', () => {
      $('.view-toggle-btn').forEach(b => b.classList.remove('view-toggle-btn--active'));
      btn.classList.add('view-toggle-btn--active');
      const view = btn.dataset.view;
      $('.products-grid').forEach(g => { g.dataset.view = view; });
    });
  });

  /* ── Load More ── */
  on($('#loadMoreBtn'), 'click', () => {
    const filtered = getFiltered();
    visibleCount = Math.min(visibleCount + STEP, filtered.length);
    applyFilters();
    // Smooth-scroll slightly to reveal new cards
    const lastVisible = $('.product-card:not([style*="display: none"])', grid).slice(-3)[0];
    lastVisible?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  /* ── Initial render ── */
  applyFilters();
})();

/* ============================================================
   PRODUCT PAGE
   ============================================================ */
(function initProductPage() {
  const form = $('#AddToCartForm');
  if (!form) return;

  // Variant selection
  const variantInput = $('#selectedVariantId');
  const optionBtns   = $$('[data-option]');

  // Build variant map from Shopify's product JSON (if available via script tag)
  let variants = [];
  const variantScript = $('[data-product-variants]');
  if (variantScript) {
    try { variants = JSON.parse(variantScript.textContent); } catch {}
  }

  const selectedOptions = {};

  function findAndSetVariant() {
    if (!variants.length || !variantInput) return;
    const match = variants.find(v =>
      Object.entries(selectedOptions).every(([i, val]) => v.options[parseInt(i)] === val)
    );
    if (match) variantInput.value = match.id;
  }

  // Button-style options (Color, Size)
  optionBtns.filter(el => el.tagName === 'BUTTON').forEach(btn => {
    on(btn, 'click', () => {
      const optionIdx = btn.dataset.option;
      const val       = btn.dataset.value;

      $(`[data-option="${optionIdx}"]`).forEach(b => {
        b.classList.remove('is-selected');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-selected');
      btn.setAttribute('aria-pressed', 'true');
      selectedOptions[optionIdx] = val;

      // Update displayed label
      const labelSpan = btn.closest('.product-option')?.querySelector('.product-option__selected');
      if (labelSpan) labelSpan.textContent = val;

      findAndSetVariant();
    });
  });

  // Select-based options (any other option type)
  $('.product-option__select').forEach(select => {
    const optionIdx = select.dataset.option;
    // Seed initial value
    selectedOptions[optionIdx] = select.value;
    on(select, 'change', () => {
      selectedOptions[optionIdx] = select.value;
      // Update label span if present
      const labelSpan = select.closest('.product-option')?.querySelector('.product-option__selected');
      if (labelSpan) labelSpan.textContent = select.value;
      findAndSetVariant();
    });
  });

  // Quantity
  const qtyInput = $('#productQty');
  on($('#qtyMinus'), 'click', () => { if (qtyInput && parseInt(qtyInput.value) > 1) qtyInput.value--; });
  on($('#qtyPlus'),  'click', () => { if (qtyInput && parseInt(qtyInput.value) < 10) qtyInput.value++; });

  // Add to cart
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
      if (!res.ok) throw new Error();

      if (cartMsg) { cartMsg.hidden = false; setTimeout(() => cartMsg.hidden = true, 4000); }

      // Update cart count badges
      const cartRes = await fetch('/cart.js');
      if (cartRes.ok) {
        const cart = await cartRes.json();
        $$('.cart-badge, .cart-count').forEach(el => {
          el.textContent = cart.item_count;
          el.hidden = cart.item_count === 0;
        });
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      addBtn.disabled = false;
      if (btnText)   btnText.hidden   = false;
      if (btnLoader) btnLoader.hidden = true;
    }
  });

  // Gallery
  const mainGallery = $('#productGalleryMain');
  const thumbs      = $$('.product-gallery-thumb');
  const mainItems   = $$('.product-gallery-main__item');

  function showSlide(idx) {
    mainItems.forEach((item, i) => item.classList.toggle('is-active', i === idx));
    thumbs.forEach((t, i) => t.classList.toggle('is-active', i === idx));
  }

  thumbs.forEach((thumb, i) => on(thumb, 'click', () => showSlide(i)));

  let gIdx = 0;
  on($('#galleryPrev'), 'click', () => { gIdx = (gIdx - 1 + mainItems.length) % mainItems.length; showSlide(gIdx); });
  on($('#galleryNext'), 'click', () => { gIdx = (gIdx + 1) % mainItems.length; showSlide(gIdx); });

  // Accordion
  $$('.accordion__trigger').forEach(trigger => {
    on(trigger, 'click', () => {
      const body     = trigger.nextElementSibling;
      const isOpen   = trigger.classList.contains('is-open');
      const expanded = !isOpen;
      trigger.classList.toggle('is-open', expanded);
      trigger.setAttribute('aria-expanded', expanded);
      if (body) body.hidden = !expanded;
    });
  });

  // Password show/hide
  const togglePwd = $('#togglePassword');
  const pwdInput  = $('#CustomerPassword, #CreatePassword');
  on(togglePwd, 'click', () => {
    if (!pwdInput) return;
    pwdInput.type = pwdInput.type === 'password' ? 'text' : 'password';
  });
})();

/* ============================================================
   ADD TO CART (from product cards — quick add)
   ============================================================ */
document.addEventListener('click', async e => {
  const btn = e.target.closest('.product-card__cart-btn');
  if (!btn) return;
  if (btn.disabled) return;

  const hasOptions = btn.dataset.hasOptions === 'true';
  if (hasOptions) {
    // Redirect to product page for variant selection
    const url = btn.dataset.productUrl;
    if (url) window.location.href = url;
    return;
  }

  const variantId = btn.dataset.variantId;
  if (!variantId) return;

  btn.disabled = true;
  const orig = btn.innerHTML;
  btn.innerHTML = '<span class="spinner" style="border-color:rgba(255,255,255,.3);border-top-color:#fff;"></span>';

  try {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    });
    if (!res.ok) throw new Error();

    btn.innerHTML = '✓ Added!';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled = false;
    }, 1800);

    // Refresh cart count
    const cartRes = await fetch('/cart.js');
    if (cartRes.ok) {
      const cart = await cartRes.json();
      $$('.cart-badge, .cart-count').forEach(el => {
        el.textContent = cart.item_count;
        el.hidden = cart.item_count === 0;
      });
    }
  } catch {
    btn.innerHTML = 'Error!';
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1800);
  }
});

/* ============================================================
   SCROLL-TRIGGERED ANIMATIONS (AOS-lite)
   ============================================================ */
(function initAOS() {
  const elements = $$('[data-aos]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
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
   FILE UPLOAD PREVIEW
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

  // Drag & drop
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
})();

/* ============================================================
   PASSWORD SHOW/HIDE (auth pages)
   ============================================================ */
(function initPasswordToggle() {
  $$('.form-input-toggle').forEach(toggle => {
    const input = toggle.closest('.form-input-group')?.querySelector('input[type="password"], input[type="text"]');
    on(toggle, 'click', () => {
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
})();

/* ============================================================
   MARQUEE — pause on hover (already via CSS, but also touch)
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
  style.textContent = `*, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }`;
  document.head.appendChild(style);
}
