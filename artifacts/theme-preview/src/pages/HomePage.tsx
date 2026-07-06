import { useEffect } from 'react';
import { Link } from '../router';
import ProductCard from '../components/ProductCard';
import ProductGallerySection from '../components/ProductGallerySection';
import { ALL_PRODUCTS, BLOG_POSTS } from '../data/products';

const HERO_SLIDES = [
  { heading: 'New Season. New Edge.',    sub: 'Premium jackets crafted for the bold.',         cta: 'Explore Collection', href: '/collections/all',        bg: 'linear-gradient(135deg,#0a0a0a 0%,#1a0a00 60%,#0d0706 100%)' },
  { heading: 'Built to Last.',           sub: 'From street to summit — outerwear that moves.', cta: 'Shop Now',           href: '/collections/bestsellers', bg: 'linear-gradient(135deg,#0d1a2a 0%,#071020 60%,#000508 100%)' },
  { heading: 'Design Your Jacket.',      sub: 'Create a one-of-a-kind statement piece.',       cta: 'Design Yours',       href: '/pages/custom-design',    bg: 'linear-gradient(135deg,#1a1a0a 0%,#100e00 60%,#080600 100%)' },
];

const FEATURED = ALL_PRODUCTS.slice(0, 8);

export default function HomePage() {
  useEffect(() => {
    /* Hero Carousel */
    const track = document.getElementById('heroTrack');
    let heroTimer: ReturnType<typeof setInterval>;
    if (track) {
      const slides = Array.from(track.querySelectorAll<HTMLElement>('.hero-carousel__slide'));
      const dots   = Array.from(document.querySelectorAll<HTMLElement>('.hero-carousel__dot'));
      let cur = 0;
      const goTo = (i: number) => {
        slides[cur].classList.remove('is-active'); dots[cur]?.classList.remove('is-active');
        cur = ((i % slides.length) + slides.length) % slides.length;
        slides[cur].classList.add('is-active'); dots[cur]?.classList.add('is-active');
      };
      const start = () => { clearInterval(heroTimer); heroTimer = setInterval(() => goTo(cur+1), 5500); };
      document.getElementById('heroNext')?.addEventListener('click', () => { goTo(cur+1); start(); });
      document.getElementById('heroPrev')?.addEventListener('click', () => { goTo(cur-1); start(); });
      dots.forEach((d,i) => d.addEventListener('click', () => { goTo(i); start(); }));
      let tx = 0;
      track.addEventListener('touchstart', (e) => { tx = e.changedTouches[0].clientX; }, { passive:true });
      track.addEventListener('touchend',   (e) => { const dx=e.changedTouches[0].clientX-tx; if(Math.abs(dx)>50){goTo(cur+(dx<0?1:-1));start();} });
      track.closest('.hero-carousel')?.addEventListener('mouseenter', () => clearInterval(heroTimer));
      track.closest('.hero-carousel')?.addEventListener('mouseleave', start);
      if (slides.length > 1) start();
    }

    /* Recommended Slider */
    const recTrack = document.getElementById('recTrack');
    let recTimer: ReturnType<typeof setInterval>;
    if (recTrack) {
      const cw  = () => (recTrack.querySelector<HTMLElement>('.product-card')?.offsetWidth ?? 260) + 20;
      const bar = document.getElementById('recProgressBar');
      const upd = () => { if (bar) { const m=recTrack.scrollWidth-recTrack.clientWidth; bar.style.width=(m>0?recTrack.scrollLeft/m*80+10:10)+'%'; } };
      document.getElementById('recPrev')?.addEventListener('click', () => recTrack.scrollBy({left:-cw()*2,behavior:'smooth'}));
      document.getElementById('recNext')?.addEventListener('click', () => recTrack.scrollBy({left: cw()*2,behavior:'smooth'}));
      recTrack.addEventListener('scroll', upd, { passive:true });
      recTimer = setInterval(() => {
        recTrack.scrollLeft+recTrack.clientWidth>=recTrack.scrollWidth-10
          ? recTrack.scrollTo({left:0,behavior:'smooth'})
          : recTrack.scrollBy({left:cw()*2,behavior:'smooth'});
      }, 10000);
      document.querySelector('.recommended-products__wrapper')?.addEventListener('mouseenter', ()=>clearInterval(recTimer));
    }

    /* Marquee pause */
    document.querySelectorAll<HTMLElement>('.marquee-wrapper').forEach(w => {
      w.addEventListener('mouseenter', ()=>w.querySelectorAll<HTMLElement>('.marquee-track').forEach(t=>{t.style.animationPlayState='paused';}));
      w.addEventListener('mouseleave', ()=>w.querySelectorAll<HTMLElement>('.marquee-track').forEach(t=>{t.style.animationPlayState='running';}));
    });

    /* File upload */
    const drop  = document.getElementById('fileUploadArea');
    const file  = document.getElementById('cd-file') as HTMLInputElement|null;
    const prev  = document.getElementById('fileUploadPreview');
    if (drop && file) {
      drop.addEventListener('click', () => file.click());
      ['dragenter','dragover'].forEach(e=>drop.addEventListener(e,(ev)=>{ev.preventDefault();drop.classList.add('drag-over');}));
      ['dragleave','drop'].forEach(e=>drop.addEventListener(e,(ev)=>{ev.preventDefault();drop.classList.remove('drag-over');}));
      drop.addEventListener('drop',(e:DragEvent)=>{const f=e.dataTransfer?.files[0];if(f&&prev){prev.textContent=f.name;prev.hidden=false;}});
      file.addEventListener('change',()=>{const f=file.files?.[0];if(f&&prev){prev.textContent=f.name;prev.hidden=false;}});
    }

    return () => {
      clearInterval(heroTimer);
      clearInterval(recTimer);
    };
  }, []);

  return (
    <>
      {/* ── Hero Carousel ── */}
      <section className="hero-carousel" aria-label="Featured collection">
        <div className="hero-carousel__track" id="heroTrack">
          {HERO_SLIDES.map((slide, i) => (
            <div key={i} className={`hero-carousel__slide${i===0?' is-active':''}`}>
              <div className="hero-carousel__bg">
                <div className="hero-carousel__placeholder" style={{ background: slide.bg, position:'absolute', inset:0 }} />
                <div className="hero-carousel__overlay" />
              </div>
              <div className="hero-carousel__content text-light">
                <p className="hero-carousel__eyebrow reveal-text">Universal Jackets</p>
                <h1 className="hero-carousel__heading reveal-text">{slide.heading}</h1>
                <p className="hero-carousel__sub reveal-text">{slide.sub}</p>
                <Link href={slide.href} className="hero-carousel__cta reveal-text">
                  {slide.cta}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
        <button className="hero-carousel__arrow hero-carousel__arrow--prev" id="heroPrev" aria-label="Previous slide">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button className="hero-carousel__arrow hero-carousel__arrow--next" id="heroNext" aria-label="Next slide">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
        <div className="hero-carousel__dots" role="tablist">
          {HERO_SLIDES.map((_,i) => <button key={i} className={`hero-carousel__dot${i===0?' is-active':''}`} aria-label={`Slide ${i+1}`} />)}
        </div>
      </section>

      {/* ── Recommended Products ── */}
      <section className="recommended-products section-spacing">
        <div className="container">
          <div className="section-header">
            <p className="section-label">Curated Picks</p>
            <h2 className="section-title">Recommended For You</h2>
          </div>
          <div className="recommended-products__wrapper">
            <button className="slider-arrow slider-arrow--prev" id="recPrev" aria-label="Previous">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="recommended-products__track" id="recTrack">
              {FEATURED.map(p => <ProductCard key={p.id} product={p} className="recommended-card" />)}
            </div>
            <button className="slider-arrow slider-arrow--next" id="recNext" aria-label="Next">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
          <div className="slider-progress"><div className="slider-progress__bar" id="recProgressBar" /></div>
        </div>
      </section>

      {/* ── Product Gallery + Filters ── */}
      <ProductGallerySection title="All Products" label="Collections" initialCount={25} loadMoreStep={10} />

      {/* ── Marquee ── */}
      <section className="marquee-section section-spacing">
        <div className="container">
          <div className="section-header"><p className="section-label">Featured Products</p><h2 className="section-title">Shop The Look</h2></div>
        </div>
        <div className="marquee-wrapper">
          <div className="marquee-track marquee-track--ltr">
            {[...ALL_PRODUCTS, ...ALL_PRODUCTS].map((p,i) => <ProductCard key={i} product={p} className="marquee-card" />)}
          </div>
        </div>
        <div className="container" style={{ marginTop: 64 }}>
          <div className="section-header"><p className="section-label">New Arrivals</p><h2 className="section-title">Just Dropped</h2></div>
        </div>
        <div className="marquee-wrapper">
          <div className="marquee-track marquee-track--rtl">
            {[...ALL_PRODUCTS.slice(10),...ALL_PRODUCTS.slice(0,10),...ALL_PRODUCTS.slice(10),...ALL_PRODUCTS.slice(0,10)].map((p,i) => <ProductCard key={i} product={p} className="marquee-card" />)}
          </div>
        </div>
      </section>

      {/* ── Custom Design ── */}
      <section className="custom-design section-spacing">
        <div className="container">
          <div className="custom-design__inner">
            <div className="custom-design__text">
              <p className="section-label">Made For You</p>
              <h2 className="section-title">Design Your Own Jacket</h2>
              <p className="custom-design__desc">Submit your custom design and we'll bring it to life. Tell us your vision — colors, patches, embroidery, and more.</p>
              <ul className="custom-design__features">
                {['Premium material selection','Custom embroidery & patches','Any colour, any size','Ships in 3–4 weeks'].map(f=>(
                  <li key={f}><span className="feature-icon">✦</span>{f}</li>
                ))}
              </ul>
            </div>
            <div className="custom-design__form-wrap">
              <form id="CustomDesignForm" onSubmit={e=>{e.preventDefault();alert('Design request submitted! We\'ll be in touch shortly.');}}>
                <div className="form-row form-row--2col">
                  <div className="form-field">
                    <label htmlFor="cd-name" className="form-label">Your Name *</label>
                    <input type="text" id="cd-name" required className="form-input" placeholder="John Doe" />
                  </div>
                  <div className="form-field">
                    <label htmlFor="cd-email" className="form-label">Email *</label>
                    <input type="email" id="cd-email" required className="form-input" placeholder="you@email.com" />
                  </div>
                </div>
                <div className="form-row form-row--2col">
                  <div className="form-field">
                    <label htmlFor="cd-color" className="form-label">Jacket Color *</label>
                    <select id="cd-color" required className="form-select">
                      <option value="">Select a color…</option>
                      {['Black','Brown','Navy Blue','Olive Green','Grey','Camel','Burgundy','White','Custom'].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="cd-size" className="form-label">Size *</label>
                    <select id="cd-size" required className="form-select">
                      <option value="">Select a size…</option>
                      {['XS','S','M','L','XL','XXL','Custom'].map(s=><option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="cd-design" className="form-label">Design Details *</label>
                  <textarea id="cd-design" required className="form-textarea" rows={4} placeholder="Describe your design — type of jacket, colours, patches, embroidery, materials…" />
                </div>
                <div className="form-field">
                  <label className="form-label">Upload Design / Reference Image</label>
                  <div className="file-upload-area" id="fileUploadArea">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                    <p>Drag &amp; drop or <span className="upload-link">browse file</span></p>
                    <p className="upload-hint">PNG, JPG, PDF — max 10MB</p>
                    <input type="file" id="cd-file" accept="image/*,.pdf" className="file-upload-input" />
                  </div>
                  <div className="file-upload-preview" id="fileUploadPreview" hidden />
                </div>
                <button type="submit" className="btn btn-primary btn-full">
                  Submit Custom Request
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Blog Preview ── */}
      <section className="blog-preview section-spacing">
        <div className="container">
          <div className="blog-preview__inner">
            <div className="blog-preview__image-col">
              <div className="blog-preview__img-placeholder" />
            </div>
            <div className="blog-preview__content-col">
              <p className="section-label">Journal</p>
              <h2 className="section-title">From Our Journal</h2>
              <p className="blog-preview__sub">Style guides, care tips, and stories from behind the seams.</p>
              <div className="blog-preview__articles">
                {BLOG_POSTS.slice(0,3).map(post => (
                  <article key={post.slug} className="blog-card">
                    <div className="blog-card__body">
                      <p className="blog-card__meta">{post.date} · {post.readTime} read</p>
                      <h3 className="blog-card__title"><Link href={`/blogs/journal/${post.slug}`}>{post.title}</Link></h3>
                      <p className="blog-card__excerpt">{post.excerpt}</p>
                      <Link href={`/blogs/journal/${post.slug}`} className="blog-card__link">
                        Read More <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
              <Link href="/blogs/journal" className="btn btn-outline">
                View All Articles <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
