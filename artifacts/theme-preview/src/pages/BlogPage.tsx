import { Link, useParams } from '../router';
import { BLOG_POSTS } from '../data/products';

function ArticlePage({ slug }: { slug: string }) {
  const post = BLOG_POSTS.find(p => p.slug === slug) ?? BLOG_POSTS[0];
  return (
    <article style={{ maxWidth: 780, margin: '0 auto', padding: '64px var(--container-pad)' }}>
      <nav style={{ fontSize:12, opacity:.6, marginBottom:32 }}>
        <Link href="/">Home</Link> <span style={{ margin:'0 8px' }}>/</span>
        <Link href="/blogs/journal">Journal</Link> <span style={{ margin:'0 8px' }}>/</span>
        <span>{post.title}</span>
      </nav>
      <p className="section-label" style={{ marginBottom:12 }}>Journal · {post.date}</p>
      <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(28px,4vw,48px)', fontWeight:400, lineHeight:1.2, marginBottom:20 }}>{post.title}</h1>
      <p style={{ fontSize:14, color:'var(--clr-muted)', marginBottom:40 }}>{post.readTime} read</p>
      <div style={{ height:320, background:'linear-gradient(160deg,#0a0a0a,#1a1208)', borderRadius:8, marginBottom:48 }} />
      <div className="rte" style={{ fontSize:16, lineHeight:1.8, color:'var(--clr-mid)' }}>
        <p><em>{post.excerpt}</em></p>
        <p>At Universal Jackets, we believe that great outerwear is more than just a garment — it's an expression of who you are. Every stitch, every seam, every choice of material is deliberate. This piece explores how that philosophy plays out in real life, from the drawing board to the streets.</p>
        <h2>The Craft Behind It</h2>
        <p>Our designers spend months refining each silhouette before it ever reaches production. We source premium materials from mills in Japan, Italy, and the UK, and every jacket undergoes rigorous quality checks before it leaves our facility.</p>
        <p>The result? Pieces that look better and wear better with every passing season.</p>
        <h2>How to Make It Yours</h2>
        <p>Whether you're pairing a bomber with tailored trousers for a smart-casual look, or throwing a leather jacket over a hoodie for weekend ease, the key is confidence. Our jackets are designed to be the centrepiece of an outfit — let them do the talking.</p>
        <blockquote style={{ borderLeft:'3px solid var(--clr-gold)', paddingLeft:24, fontStyle:'italic', margin:'32px 0' }}>
          "A great jacket is the one piece in your wardrobe that never lets you down."
        </blockquote>
        <p>Explore our full collection and find the piece that speaks to you. And if you can't find exactly what you're looking for, remember — we offer <Link href="/pages/custom-design" style={{ color:'var(--clr-gold)', textDecoration:'underline' }}>custom design services</Link> for truly bespoke pieces.</p>
      </div>
      <div style={{ marginTop:64, paddingTop:48, borderTop:'1px solid var(--clr-light-border)' }}>
        <h3 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:400, marginBottom:32 }}>More From the Journal</h3>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:24 }}>
          {BLOG_POSTS.filter(p=>p.slug!==slug).slice(0,3).map(p=>(
            <Link key={p.slug} href={`/blogs/journal/${p.slug}`} style={{ display:'block', textDecoration:'none' }}>
              <div style={{ height:160, background:'linear-gradient(160deg,#111,#1a1208)', borderRadius:6, marginBottom:16 }} />
              <p style={{ fontSize:11, color:'var(--clr-muted)', marginBottom:6 }}>{p.date}</p>
              <h4 style={{ fontFamily:'var(--font-serif)', fontSize:18, fontWeight:400, lineHeight:1.3 }}>{p.title}</h4>
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}

function BlogListingPage() {
  return (
    <div style={{ padding:'64px 0' }}>
      <div className="container">
        <nav style={{ fontSize:12, opacity:.6, marginBottom:32 }}>
          <Link href="/">Home</Link> <span style={{ margin:'0 8px' }}>/</span> <span>Journal</span>
        </nav>
        <div className="section-header">
          <p className="section-label">Stories &amp; Style</p>
          <h1 className="section-title">Journal</h1>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:40, marginTop:48 }}>
          {BLOG_POSTS.map(post => (
            <article key={post.slug}>
              <Link href={`/blogs/journal/${post.slug}`}>
                <div style={{ height:220, background:'linear-gradient(160deg,#0a0a0a,#1a1208)', borderRadius:8, marginBottom:24 }} />
              </Link>
              <p style={{ fontSize:12, color:'var(--clr-muted)', marginBottom:8 }}>{post.date} · {post.readTime} read</p>
              <h2 style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:400, lineHeight:1.3, marginBottom:12 }}>
                <Link href={`/blogs/journal/${post.slug}`}>{post.title}</Link>
              </h2>
              <p style={{ fontSize:14, color:'var(--clr-mid)', lineHeight:1.7, marginBottom:16 }}>{post.excerpt}</p>
              <Link href={`/blogs/journal/${post.slug}`} className="blog-card__link">
                Read More <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  const params = useParams<{ slug?: string }>();
  return params.slug ? <ArticlePage slug={params.slug} /> : <BlogListingPage />;
}
