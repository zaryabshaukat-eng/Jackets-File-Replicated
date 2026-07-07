import { Link, useParams } from '../router';
import { useBlogPost, useBlogPosts } from '../hooks/useShopify';

function ArticlePage({ slug }: { slug: string }) {
  const { post, posts, loading } = useBlogPost('journal', slug);

  if (loading) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid #e0e0e0', borderTopColor: 'var(--clr-gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{ padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 36, fontWeight: 400, marginBottom: 16 }}>Article Not Found</h1>
          <Link href="/blogs/journal" className="btn btn-outline">Back to Journal</Link>
        </div>
      </div>
    );
  }

  const related = posts.filter(p => p.slug !== slug).slice(0, 3);

  return (
    <article style={{ maxWidth: 780, margin: '0 auto', padding: '64px var(--container-pad)' }}>
      <nav style={{ fontSize:12, opacity:.6, marginBottom:32 }}>
        <Link href="/">Home</Link> <span style={{ margin:'0 8px' }}>/</span>
        <Link href="/blogs/journal">Journal</Link> <span style={{ margin:'0 8px' }}>/</span>
        <span>{post.title}</span>
      </nav>
      <p className="section-label" style={{ marginBottom:12 }}>Journal · {post.date}</p>
      <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(28px,4vw,48px)', fontWeight:400, lineHeight:1.2, marginBottom:20 }}>{post.title}</h1>
      <p style={{ fontSize:14, color:'var(--clr-muted)', marginBottom:40 }}>
        {post.author && `By ${post.author} · `}{post.readTime} read
      </p>

      {/* Featured image or gradient placeholder */}
      {post.imageUrl ? (
        <img src={post.imageUrl} alt={post.title} style={{ width: '100%', height: 320, objectFit: 'cover', borderRadius: 8, marginBottom: 48 }} />
      ) : (
        <div style={{ height:320, background:'linear-gradient(160deg,#0a0a0a,#1a1208)', borderRadius:8, marginBottom:48 }} />
      )}

      {/* Article content */}
      <div className="rte" style={{ fontSize:16, lineHeight:1.8, color:'var(--clr-mid)' }}>
        {post.contentHtml ? (
          <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        ) : (
          <>
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
          </>
        )}
      </div>

      {related.length > 0 && (
        <div style={{ marginTop:64, paddingTop:48, borderTop:'1px solid var(--clr-light-border)' }}>
          <h3 style={{ fontFamily:'var(--font-serif)', fontSize:28, fontWeight:400, marginBottom:32 }}>More From the Journal</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:24 }}>
            {related.map(p=>(
              <Link key={p.slug} href={`/blogs/journal/${p.slug}`} style={{ display:'block', textDecoration:'none' }}>
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.title} style={{ width:'100%', height:160, objectFit:'cover', borderRadius:6, marginBottom:16 }} />
                ) : (
                  <div style={{ height:160, background:'linear-gradient(160deg,#111,#1a1208)', borderRadius:6, marginBottom:16 }} />
                )}
                <p style={{ fontSize:11, color:'var(--clr-muted)', marginBottom:6 }}>{p.date}</p>
                <h4 style={{ fontFamily:'var(--font-serif)', fontSize:18, fontWeight:400, lineHeight:1.3 }}>{p.title}</h4>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function BlogListingPage() {
  const { posts, loading } = useBlogPosts('journal');

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1208 100%)',
        padding: '64px var(--container-pad) 48px',
        color: '#fff',
        borderBottom: '1px solid rgba(200,169,110,.2)',
      }}>
        <div className="container">
          <nav style={{ fontSize:12, opacity:.6, marginBottom:20 }}>
            <Link href="/">Home</Link><span style={{ margin:'0 8px' }}>/</span><span>Journal</span>
          </nav>
          <p className="section-label" style={{ color:'var(--clr-gold)', marginBottom:8 }}>Stories &amp; Guides</p>
          <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(36px,5vw,60px)', fontWeight:400 }}>The Journal</h1>
        </div>
      </div>

      <section className="section-spacing">
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ display: 'inline-block', width: 40, height: 40, border: '3px solid #e0e0e0', borderTopColor: 'var(--clr-gold)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:40 }}>
              {posts.map(post => (
                <article key={post.slug}>
                  <Link href={`/blogs/journal/${post.slug}`} style={{ display:'block', textDecoration:'none' }}>
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt={post.title} style={{ width:'100%', height:220, objectFit:'cover', borderRadius:8, marginBottom:20 }} />
                    ) : (
                      <div style={{ height:220, background:'linear-gradient(160deg,#0a0a0a,#1a1208)', borderRadius:8, marginBottom:20 }} />
                    )}
                  </Link>
                  <p style={{ fontSize:12, color:'var(--clr-muted)', marginBottom:8 }}>{post.date} · {post.readTime} read</p>
                  <h2 style={{ fontFamily:'var(--font-serif)', fontSize:24, fontWeight:400, lineHeight:1.3, marginBottom:12 }}>
                    <Link href={`/blogs/journal/${post.slug}`} style={{ textDecoration:'none', color:'inherit' }}>{post.title}</Link>
                  </h2>
                  <p style={{ fontSize:14, color:'var(--clr-mid)', lineHeight:1.6, marginBottom:16 }}>{post.excerpt}</p>
                  <Link href={`/blogs/journal/${post.slug}`} className="blog-card__link">
                    Read More <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

export default function BlogPage() {
  const { slug } = useParams<{ slug?: string }>();
  return slug ? <ArticlePage slug={slug} /> : <BlogListingPage />;
}
