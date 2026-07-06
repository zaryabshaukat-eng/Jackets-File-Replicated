import { Link, useParams } from '../router';
import ProductGallerySection from '../components/ProductGallerySection';

const COLLECTION_META: Record<string, { title: string; label: string; badge?: string }> = {
  all:         { title: 'All Products',      label: 'Collections' },
  'new-in':    { title: 'New In',            label: 'Latest Arrivals', badge: 'new' },
  bestsellers: { title: 'Bestsellers',       label: 'Top Picks' },
  bomber:      { title: 'Bomber Jackets',    label: 'Categories' },
  leather:     { title: 'Leather Jackets',   label: 'Categories' },
  puffer:      { title: 'Puffer Jackets',    label: 'Categories' },
  denim:       { title: 'Denim Jackets',     label: 'Categories' },
  trench:      { title: 'Trench Coats',      label: 'Categories' },
  wind:        { title: 'Windbreakers',      label: 'Categories' },
  fleece:      { title: 'Fleece & Sherpa',   label: 'Categories' },
};

const CATEGORY_SLUGS = new Set(['bomber','leather','puffer','denim','trench','wind','fleece']);

export default function CollectionPage() {
  const params = useParams<{ slug: string }>();
  const slug   = params.slug ?? 'all';
  const meta   = COLLECTION_META[slug] ?? { title: 'Collection', label: 'Shop' };

  // Determine filter props
  const isCategory = CATEGORY_SLUGS.has(slug);
  const isBadge    = slug === 'new-in';

  return (
    <>
      {/* Collection Hero Banner */}
      <div style={{
        background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1208 100%)',
        padding: '64px var(--container-pad) 48px',
        color: '#fff',
        borderBottom: '1px solid rgba(200,169,110,.2)',
      }}>
        <div className="container">
          <nav className="breadcrumb" aria-label="Breadcrumb" style={{ marginBottom: 20, fontSize: 12, opacity: .6 }}>
            <Link href="/">Home</Link>
            <span style={{ margin:'0 8px' }}>/</span>
            <span>{meta.title}</span>
          </nav>
          <p className="section-label" style={{ color: 'var(--clr-gold)', marginBottom: 8 }}>{meta.label}</p>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(36px,5vw,60px)', fontWeight:400, letterSpacing:'.02em' }}>{meta.title}</h1>
        </div>
      </div>

      <ProductGallerySection
        title={meta.title}
        label={meta.label}
        category={isCategory ? slug : undefined}
        badge={isBadge ? 'new' : undefined}
        initialCount={25}
        loadMoreStep={10}
      />
    </>
  );
}
