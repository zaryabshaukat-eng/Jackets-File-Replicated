import { Link, useParams, useLocation } from '../router';

/* ── Shared helpers ── */
function PageShell({ breadcrumb, label, title, children }: { breadcrumb?: string; label?: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: '64px 0', minHeight: '60vh' }}>
      <div className="container" style={{ maxWidth: 900 }}>
        {breadcrumb && (
          <nav style={{ fontSize:12, opacity:.6, marginBottom:32 }}>
            <Link href="/">Home</Link> <span style={{ margin:'0 8px' }}>/</span> <span>{breadcrumb}</span>
          </nav>
        )}
        {label && <p className="section-label" style={{ marginBottom:12 }}>{label}</p>}
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:'clamp(32px,4vw,52px)', fontWeight:400, marginBottom:40, lineHeight:1.2 }}>{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Prose({ children }: { children: React.ReactNode }) {
  return <div className="rte" style={{ fontSize:15, lineHeight:1.8, color:'var(--clr-mid)', maxWidth:720 }}>{children}</div>;
}

/* ── Individual Page Components ── */

function AboutPage() {
  return (
    <PageShell breadcrumb="About" label="Our Story" title="About Universal Jackets">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'start' }}>
        <div style={{ height:400, background:'linear-gradient(160deg,#0a0a0a,#1a1208)', borderRadius:8 }} />
        <Prose>
          <p>Founded in New York in 2015, Universal Jackets was born from a single belief: <strong>great outerwear should be universal</strong> — accessible, timeless, and built to last.</p>
          <p>We design every jacket with two questions in mind: <em>Does it look exceptional?</em> and <em>Will it still look exceptional in ten years?</em></p>
          <p>Our team of designers travels globally, sourcing the finest materials — premium leather from Argentinian tanneries, Japanese selvedge denim, Merino wool from New Zealand — and works with master craftspeople to produce garments worthy of those materials.</p>
          <h3>Our Values</h3>
          <ul>
            <li><strong>Quality over quantity</strong> — we release fewer styles each season, but each one is exceptional.</li>
            <li><strong>Sustainable practices</strong> — we partner with suppliers who share our commitment to ethical production.</li>
            <li><strong>Radical transparency</strong> — we believe you deserve to know how and where your jacket was made.</li>
          </ul>
        </Prose>
      </div>
      <div style={{ marginTop:80, paddingTop:64, borderTop:'1px solid var(--clr-light-border)' }}>
        <p className="section-label" style={{ marginBottom:16 }}>By The Numbers</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:32 }}>
          {[['2015','Founded in NYC'],['50+','Jacket Styles'],['42','Countries Shipped'],['10K+','Happy Customers']].map(([n,l])=>(
            <div key={n} style={{ textAlign:'center' }}>
              <p style={{ fontFamily:'var(--font-serif)', fontSize:52, fontWeight:300, color:'var(--clr-gold)', lineHeight:1 }}>{n}</p>
              <p style={{ fontSize:13, color:'var(--clr-muted)', marginTop:8 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function ContactPage() {
  return (
    <PageShell breadcrumb="Contact" label="Get In Touch" title="Contact Us">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
        <div>
          <Prose>
            <p>We'd love to hear from you. Whether it's a question about sizing, a custom order enquiry, or just a jacket-related chat — our team is here.</p>
            <p><strong>Response time:</strong> We aim to respond within 24 hours on business days.</p>
          </Prose>
          <div style={{ marginTop:40, display:'flex', flexDirection:'column', gap:20 }}>
            {[
              { icon:'📍', label:'Address', val:'120 Mercer St, New York, NY 10012' },
              { icon:'📞', label:'Phone',   val:'+1 (212) 555-0142' },
              { icon:'✉️', label:'Email',   val:'hello@universaljackets.com' },
              { icon:'🕐', label:'Hours',   val:'Mon–Fri 9am–6pm EST' },
            ].map(r=>(
              <div key={r.label} style={{ display:'flex', gap:16 }}>
                <span style={{ fontSize:20 }}>{r.icon}</span>
                <div><p style={{ fontSize:11, textTransform:'uppercase', letterSpacing:'.1em', color:'var(--clr-muted)', marginBottom:2 }}>{r.label}</p><p style={{ fontWeight:500 }}>{r.val}</p></div>
              </div>
            ))}
          </div>
        </div>
        <form onSubmit={e=>{e.preventDefault();alert('Message sent! We\'ll reply within 24 hours.');}} style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="form-field"><label htmlFor="c-name" className="form-label">Name *</label><input id="c-name" type="text" required className="form-input" placeholder="Your name" /></div>
          <div className="form-field"><label htmlFor="c-email" className="form-label">Email *</label><input id="c-email" type="email" required className="form-input" placeholder="you@email.com" /></div>
          <div className="form-field"><label htmlFor="c-subject" className="form-label">Subject</label><input id="c-subject" type="text" className="form-input" placeholder="Order enquiry, custom design…" /></div>
          <div className="form-field"><label htmlFor="c-msg" className="form-label">Message *</label><textarea id="c-msg" required className="form-textarea" rows={5} placeholder="How can we help?" /></div>
          <button type="submit" className="btn btn-primary">Send Message</button>
        </form>
      </div>
    </PageShell>
  );
}

function ShippingPage() {
  return (
    <PageShell breadcrumb="Shipping" label="Delivery Information" title="Shipping & Delivery">
      <Prose>
        <h3>Standard Shipping</h3>
        <p>Free standard shipping on all orders over $120. Orders under $120 ship for a flat rate of $12. Standard delivery takes 5–8 business days within the United States.</p>
        <h3>Express Shipping</h3>
        <p>Express shipping (2–3 business days) is available for $25. Overnight shipping is available for $45 in select areas.</p>
        <h3>International Shipping</h3>
        <p>We ship to 42 countries worldwide. International shipping rates and times vary by destination. Duties and taxes may apply and are the responsibility of the recipient.</p>
        <h3>Order Processing</h3>
        <p>Orders are processed within 1–2 business days. You'll receive a shipping confirmation email with a tracking number once your order is dispatched.</p>
        <h3>Custom Orders</h3>
        <p>Custom design orders take 3–4 weeks to produce and are then shipped using our standard rates.</p>
      </Prose>
    </PageShell>
  );
}

function ReturnsPage() {
  return (
    <PageShell breadcrumb="Returns" label="Return Policy" title="Returns & Refunds">
      <Prose>
        <h3>7-Day Return Window</h3>
        <p>We accept returns within 7 days of delivery. Items must be unworn, unwashed, with original tags attached. Sale items are final sale and cannot be returned.</p>
        <h3>How to Start a Return</h3>
        <ol>
          <li>Email us at <a href="mailto:returns@universaljackets.com">returns@universaljackets.com</a> with your order number.</li>
          <li>We'll send you a prepaid return label within 24 hours.</li>
          <li>Pack the item securely and drop it off at any UPS location.</li>
          <li>Refunds are processed within 5–7 business days of receiving the return.</li>
        </ol>
        <h3>Exchanges</h3>
        <p>We're happy to exchange for a different size. If the new size costs more, we'll charge the difference. If it costs less, we'll refund the difference.</p>
        <h3>Damaged or Defective Items</h3>
        <p>If you receive a damaged or defective item, please contact us within 48 hours of delivery. We'll arrange a free return and send a replacement immediately.</p>
      </Prose>
    </PageShell>
  );
}

function FAQPage() {
  const faqs = [
    { q:'What sizes do you offer?', a:'We offer XS through XXL in most styles, with some styles available up to 3XL. See our Size Guide for detailed measurements.' },
    { q:'Do you ship internationally?', a:'Yes! We ship to 42 countries. International orders typically take 10–14 business days. Duties and taxes may apply.' },
    { q:'How do I care for my leather jacket?', a:'Apply a leather conditioner every 3–6 months, avoid prolonged exposure to rain, and store in a cool, dry place in a breathable bag. See our full care guide in the Journal.' },
    { q:'Can I customise a jacket?', a:'Absolutely. Visit our Custom Design page to submit a request. We can add patches, embroidery, custom colour combinations, and more.' },
    { q:'What\'s your return policy?', a:'We accept returns within 7 days of delivery. Items must be unworn with tags attached. Visit our Returns page for full details.' },
    { q:'How do I track my order?', a:'You\'ll receive a tracking number by email once your order ships. You can also log into your account to see order status.' },
    { q:'Are your jackets true to size?', a:'Generally yes, but it varies by style. Leather jackets tend to run slightly slim; we recommend sizing up if between sizes. Each product page has a detailed size chart.' },
    { q:'Do you offer wholesale?', a:'Yes, we work with select retailers. Contact us at wholesale@universaljackets.com for information.' },
  ];
  return (
    <PageShell breadcrumb="FAQ" label="Help Centre" title="Frequently Asked Questions">
      <div style={{ display:'flex', flexDirection:'column', gap:0, maxWidth:720 }}>
        {faqs.map((f,i) => (
          <details key={i} style={{ borderBottom:'1px solid var(--clr-light-border)', padding:'20px 0' }}>
            <summary style={{ fontWeight:600, cursor:'pointer', listStyle:'none', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              {f.q} <span style={{ fontSize:20, opacity:.5 }}>+</span>
            </summary>
            <p style={{ marginTop:12, fontSize:14, lineHeight:1.7, color:'var(--clr-mid)' }}>{f.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}

function SizeGuidePage() {
  return (
    <PageShell breadcrumb="Size Guide" label="Fit Guide" title="Size Guide">
      <Prose>
        <p>All measurements are in inches. For the best fit, take your measurements and compare to the chart below. If you're between sizes, we generally recommend sizing up for a relaxed fit or sizing down for a slim fit.</p>
      </Prose>
      <div style={{ overflowX:'auto', marginTop:32 }}>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
          <thead>
            <tr style={{ background:'var(--clr-black)', color:'#fff' }}>
              {['Size','Chest','Shoulder','Sleeve','Length','Waist'].map(h=>(
                <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontWeight:600, letterSpacing:'.06em', fontSize:11, textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[['XS','34–36','16.5','32','27','28–30'],['S','36–38','17','32.5','27.5','30–32'],['M','38–40','17.5','33','28','32–34'],['L','40–42','18','33.5','28.5','34–36'],['XL','42–44','18.5','34','29','36–38'],['XXL','44–46','19','34.5','29.5','38–40']].map((row,i)=>(
              <tr key={row[0]} style={{ background: i%2===0 ? 'var(--clr-bg-soft)' : '#fff', borderBottom:'1px solid var(--clr-light-border)' }}>
                {row.map((cell,j) => <td key={j} style={{ padding:'12px 16px', fontWeight:j===0?700:400 }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Prose>
        <p style={{ marginTop:32 }}><strong>Note:</strong> Leather jackets tend to run slim. If you're between sizes, size up. Puffer coats have a relaxed, oversized fit by design.</p>
      </Prose>
    </PageShell>
  );
}

function LookbookPage() {
  const items = Array.from({length:9},(_,i)=>i);
  return (
    <PageShell breadcrumb="Lookbook" label="Seasonal Editorial" title="Lookbook — Autumn / Winter 2025">
      <Prose>
        <p>Our latest editorial explores the intersection of urban grit and refined craftsmanship. Shot across New York, London, and Tokyo.</p>
      </Prose>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginTop:40 }}>
        {items.map(i => (
          <div key={i} style={{
            height: i===0||i===4||i===8 ? 480 : 260,
            gridRow: i===0||i===4||i===8 ? 'span 2' : 'span 1',
            background:`linear-gradient(160deg,hsl(${i*40},20%,8%),hsl(${i*40+20},30%,15%))`,
            borderRadius:6,
          }} />
        ))}
      </div>
      <div style={{ textAlign:'center', marginTop:64 }}>
        <Link href="/collections/all" className="btn btn-primary" style={{ display:'inline-flex' }}>Shop the Collection</Link>
      </div>
    </PageShell>
  );
}

function CustomDesignPage() {
  return (
    <PageShell breadcrumb="Custom Design" label="Made For You" title="Design Your Own Jacket">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64 }}>
        <div>
          <Prose>
            <p>Create a truly one-of-a-kind jacket. Our bespoke service lets you choose every detail — from the material and colour to the hardware, lining, patches, and embroidery.</p>
            <h3>What You Can Customise</h3>
            <ul>
              <li>Jacket style (bomber, moto, trench, puffer, etc.)</li>
              <li>Material and colour</li>
              <li>Hardware finish (gold, silver, antique brass)</li>
              <li>Lining pattern and colour</li>
              <li>Custom embroidery (text, logos, motifs)</li>
              <li>Patches and appliqués</li>
              <li>Custom sizing</li>
            </ul>
            <h3>Turnaround Time</h3>
            <p>Custom orders take 3–4 weeks to produce. Rush orders may be available — contact us for details.</p>
          </Prose>
        </div>
        <form onSubmit={e=>{e.preventDefault();alert('Design request submitted! We\'ll be in touch within 2 business days.');}} style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <div className="form-field"><label htmlFor="cdc-name" className="form-label">Name *</label><input id="cdc-name" type="text" required className="form-input" /></div>
          <div className="form-field"><label htmlFor="cdc-email" className="form-label">Email *</label><input id="cdc-email" type="email" required className="form-input" /></div>
          <div className="form-field">
            <label htmlFor="cdc-style" className="form-label">Jacket Style *</label>
            <select id="cdc-style" required className="form-select">
              <option value="">Select style…</option>
              {['Bomber','Moto Leather','Puffer','Trench Coat','Denim','Windbreaker','Sherpa Fleece','Other'].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-field"><label htmlFor="cdc-details" className="form-label">Design Details *</label><textarea id="cdc-details" required className="form-textarea" rows={6} placeholder="Describe your dream jacket in as much detail as possible…" /></div>
          <div className="form-field">
            <label className="form-label">Upload Reference Image</label>
            <div className="file-upload-area" style={{ cursor:'pointer' }} onClick={()=>(document.getElementById('cdc-file') as HTMLInputElement)?.click()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
              <p>Click to browse or drag & drop</p>
              <input type="file" id="cdc-file" accept="image/*,.pdf" className="file-upload-input" />
            </div>
          </div>
          <button type="submit" className="btn btn-primary">Submit Request</button>
        </form>
      </div>
    </PageShell>
  );
}

function WholesalePage() {
  return (
    <PageShell breadcrumb="Wholesale" label="Trade Enquiries" title="Wholesale & Trade">
      <Prose>
        <p>We partner with select independent retailers and boutiques worldwide. If you're interested in carrying Universal Jackets, we'd love to hear from you.</p>
        <h3>Minimum Order</h3>
        <p>Minimum initial order of 10 units. Subsequent orders can be as small as 5 units.</p>
        <h3>How to Apply</h3>
        <p>Email us at <a href="mailto:wholesale@universaljackets.com">wholesale@universaljackets.com</a> with your store name, website, location, and a brief description of your business. We'll respond within 3 business days.</p>
      </Prose>
    </PageShell>
  );
}

function PrivacyPage() {
  return (
    <PageShell breadcrumb="Privacy Policy" label="Legal" title="Privacy Policy">
      <Prose>
        <p>Last updated: July 2025</p>
        <h3>Information We Collect</h3>
        <p>We collect information you provide directly (name, email, shipping address, payment details), as well as information automatically collected when you use our website (browsing data, device information, cookies).</p>
        <h3>How We Use Your Information</h3>
        <p>We use your information to process orders, communicate with you, improve our services, and (with your consent) send marketing communications.</p>
        <h3>Data Sharing</h3>
        <p>We do not sell your personal data. We share data only with service providers necessary to fulfil your orders (payment processors, shipping carriers, etc.).</p>
        <h3>Your Rights</h3>
        <p>You have the right to access, correct, or delete your personal data. Contact us at privacy@universaljackets.com to exercise these rights.</p>
      </Prose>
    </PageShell>
  );
}

function TermsPage() {
  return (
    <PageShell breadcrumb="Terms of Service" label="Legal" title="Terms of Service">
      <Prose>
        <p>Last updated: July 2025</p>
        <h3>Use of Our Website</h3>
        <p>By using this website, you agree to these terms. You must be at least 18 years old to make a purchase.</p>
        <h3>Products and Pricing</h3>
        <p>All prices are in USD and exclude applicable taxes. We reserve the right to change prices at any time. We are not responsible for typographical errors in pricing.</p>
        <h3>Intellectual Property</h3>
        <p>All content on this website — including images, text, and design — is the property of Universal Jackets and may not be reproduced without permission.</p>
        <h3>Limitation of Liability</h3>
        <p>Universal Jackets is not liable for any indirect, incidental, or consequential damages arising from your use of our products or website.</p>
      </Prose>
    </PageShell>
  );
}

function CartPage() {
  return (
    <PageShell breadcrumb="Cart" label="" title="Your Cart">
      <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:48, alignItems:'start' }}>
        <div>
          {[
            { name:'Classic Bomber Jacket', size:'M', color:'Black', price:189, bg:'linear-gradient(160deg,#1a1a2e,#0d0d1a)' },
            { name:'Leather Moto Jacket',    size:'L', color:'Brown', price:299, bg:'linear-gradient(160deg,#2d1b0e,#1a0e06)' },
          ].map(item=>(
            <div key={item.name} style={{ display:'flex', gap:24, padding:'24px 0', borderBottom:'1px solid var(--clr-light-border)', alignItems:'start' }}>
              <div style={{ width:100, height:120, background:item.bg, borderRadius:6, flexShrink:0 }} />
              <div style={{ flex:1 }}>
                <h3 style={{ fontFamily:'var(--font-serif)', fontSize:20, fontWeight:400, marginBottom:6 }}>{item.name}</h3>
                <p style={{ fontSize:13, color:'var(--clr-muted)', marginBottom:12 }}>Size: {item.size} · Color: {item.color}</p>
                <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                  <div style={{ display:'flex', alignItems:'center', border:'1px solid var(--clr-light-border)', borderRadius:4 }}>
                    <button style={{ padding:'6px 12px', border:'none', background:'none', cursor:'pointer', fontSize:18 }}>−</button>
                    <span style={{ padding:'6px 16px', borderLeft:'1px solid var(--clr-light-border)', borderRight:'1px solid var(--clr-light-border)', fontSize:14 }}>1</span>
                    <button style={{ padding:'6px 12px', border:'none', background:'none', cursor:'pointer', fontSize:18 }}>+</button>
                  </div>
                  <button style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--clr-muted)', textDecoration:'underline' }}>Remove</button>
                </div>
              </div>
              <p style={{ fontWeight:600, fontFamily:'var(--font-serif)', fontSize:18 }}>${item.price}.00</p>
            </div>
          ))}
          <div style={{ marginTop:32 }}>
            <Link href="/collections/all" className="btn btn-outline">Continue Shopping</Link>
          </div>
        </div>
        <div style={{ background:'var(--clr-bg-soft)', padding:32, borderRadius:8, position:'sticky', top:'calc(var(--announcement-h) + var(--header-h) + 24px)' }}>
          <h2 style={{ fontFamily:'var(--font-serif)', fontSize:22, fontWeight:400, marginBottom:24 }}>Order Summary</h2>
          {[['Subtotal','$488.00'],['Shipping','Free'],['Tax (est.)','$39.04']].map(([l,v])=>(
            <div key={l} style={{ display:'flex', justifyContent:'space-between', marginBottom:12, fontSize:14 }}>
              <span style={{ color:'var(--clr-muted)' }}>{l}</span><span style={{ fontWeight:500 }}>{v}</span>
            </div>
          ))}
          <div style={{ borderTop:'2px solid var(--clr-black)', marginTop:16, paddingTop:16, display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:16 }}>
            <span>Total</span><span>$527.04</span>
          </div>
          <button className="btn btn-primary btn-full" style={{ marginTop:24 }}>Proceed to Checkout</button>
          <div style={{ marginTop:16, textAlign:'center', fontSize:12, color:'var(--clr-muted)' }}>🔒 Secure checkout — SSL encrypted</div>
        </div>
      </div>
    </PageShell>
  );
}

function AccountPage() {
  return (
    <div style={{ minHeight:'70vh', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
      <div style={{ width:'100%', maxWidth:440 }}>
        <h1 style={{ fontFamily:'var(--font-serif)', fontSize:36, fontWeight:400, marginBottom:8, textAlign:'center' }}>My Account</h1>
        <p style={{ textAlign:'center', color:'var(--clr-muted)', marginBottom:40 }}>Manage your orders, wishlist, and profile.</p>
        <div style={{ background:'var(--clr-bg-soft)', padding:32, borderRadius:8 }}>
          <p style={{ textAlign:'center', color:'var(--clr-muted)', fontSize:14 }}>Sign in to view your account</p>
          <Link href="/account/login" className="btn btn-primary btn-full" style={{ marginTop:20, display:'flex', justifyContent:'center' }}>Sign In</Link>
          <p style={{ textAlign:'center', marginTop:16, fontSize:13, color:'var(--clr-muted)' }}>Don't have an account? <Link href="/account/register" style={{ color:'var(--clr-gold)' }}>Create one</Link></p>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  return (
    <div className="auth-page">
      <div className="auth-page__split">
        <div className="auth-page__image-panel" style={{ background:'linear-gradient(160deg,#0a0a0a,#1a1208)' }} />
        <div className="auth-page__form-panel">
          <div className="auth-page__form-inner">
            <Link href="/" className="auth-page__back">← Back to store</Link>
            <h1 className="auth-page__title">Sign In</h1>
            <p className="auth-page__sub">Welcome back to Universal Jackets.</p>
            <form onSubmit={e=>{e.preventDefault();alert('Signed in! (Preview only)');}} style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div className="form-field"><label htmlFor="l-email" className="form-label">Email</label><input id="l-email" type="email" required className="form-input" placeholder="you@email.com" /></div>
              <div className="form-field"><label htmlFor="l-pass" className="form-label">Password</label><input id="l-pass" type="password" required className="form-input" placeholder="••••••••" /></div>
              <div style={{ textAlign:'right', fontSize:13 }}><Link href="/pages/privacy" style={{ color:'var(--clr-gold)' }}>Forgot password?</Link></div>
              <button type="submit" className="btn btn-primary btn-full">Sign In</button>
            </form>
            <p style={{ textAlign:'center', marginTop:24, fontSize:13, color:'var(--clr-muted)' }}>Don't have an account? <Link href="/account/register" style={{ color:'var(--clr-gold)' }}>Create one</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage() {
  return (
    <div className="auth-page">
      <div className="auth-page__split">
        <div className="auth-page__image-panel" style={{ background:'linear-gradient(160deg,#0d1a2a,#0a0a0a)' }} />
        <div className="auth-page__form-panel">
          <div className="auth-page__form-inner">
            <Link href="/" className="auth-page__back">← Back to store</Link>
            <h1 className="auth-page__title">Create Account</h1>
            <p className="auth-page__sub">Join Universal Jackets for exclusive access.</p>
            <form onSubmit={e=>{e.preventDefault();alert('Account created! (Preview only)');}} style={{ display:'flex', flexDirection:'column', gap:20 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="form-field"><label htmlFor="r-first" className="form-label">First Name</label><input id="r-first" type="text" required className="form-input" /></div>
                <div className="form-field"><label htmlFor="r-last" className="form-label">Last Name</label><input id="r-last" type="text" required className="form-input" /></div>
              </div>
              <div className="form-field"><label htmlFor="r-email" className="form-label">Email</label><input id="r-email" type="email" required className="form-input" /></div>
              <div className="form-field"><label htmlFor="r-pass" className="form-label">Password</label><input id="r-pass" type="password" required className="form-input" placeholder="Min 8 characters" /></div>
              <button type="submit" className="btn btn-primary btn-full">Create Account</button>
            </form>
            <p style={{ textAlign:'center', marginTop:24, fontSize:13, color:'var(--clr-muted)' }}>Already have an account? <Link href="/account/login" style={{ color:'var(--clr-gold)' }}>Sign in</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div style={{ textAlign:'center', padding:'120px 20px' }}>
      <p style={{ fontSize:80, fontFamily:'var(--font-serif)', fontWeight:300, color:'var(--clr-light-border)', lineHeight:1, marginBottom:24 }}>404</p>
      <h1 style={{ fontFamily:'var(--font-serif)', fontSize:32, fontWeight:400, marginBottom:16 }}>Page Not Found</h1>
      <p style={{ color:'var(--clr-muted)', marginBottom:40 }}>The page you're looking for doesn't exist or has moved.</p>
      <Link href="/" className="btn btn-primary" style={{ display:'inline-flex' }}>Back to Home</Link>
    </div>
  );
}

/* ── Router ── */
export default function ContentPages() {
  const params  = useParams<{ slug?: string }>();
  const [location] = useLocation();
  const slug = params.slug ?? '';

  if (location === '/cart')             return <CartPage />;
  if (location === '/account')          return <AccountPage />;
  if (location === '/account/login')    return <LoginPage />;
  if (location === '/account/register') return <RegisterPage />;
  if (location.startsWith('/products')) return <NotFoundPage />;

  switch (slug) {
    case 'about':          return <AboutPage />;
    case 'contact':        return <ContactPage />;
    case 'shipping':       return <ShippingPage />;
    case 'returns':        return <ReturnsPage />;
    case 'faq':            return <FAQPage />;
    case 'size-guide':     return <SizeGuidePage />;
    case 'lookbook':       return <LookbookPage />;
    case 'custom-design':  return <CustomDesignPage />;
    case 'wholesale':      return <WholesalePage />;
    case 'privacy':        return <PrivacyPage />;
    case 'terms':          return <TermsPage />;
    default:               return <NotFoundPage />;
  }
}
