'use client';

import { useState, useEffect } from "react";

export default function ArtisanInteriors() {
  const [activeTab, setActiveTab] = useState('portfolio');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const projects = [
    { emoji: '🛋️', bg: 'linear-gradient(135deg,#E8D5B7,#C4A77D)', title: '3BHK Modern Apartment', desc: 'Full home interior — Whitefield · ₹18L budget · 1,400 sqft', tag: 'Full Home' },
    { emoji: '🍳', bg: 'linear-gradient(135deg,#D4C5A9,#A89968)', title: 'L-Shaped Island Kitchen', desc: 'Modular kitchen — Koramangala · German hardware · Quartz counter', tag: 'Modular Kitchen' },
    { emoji: '🛏️', bg: 'linear-gradient(135deg,#B5C7D3,#8BA3B9)', title: 'Master Bedroom Suite', desc: 'Bedroom — HSR Layout · Walnut veneer · King-size custom bed', tag: 'Bedroom' },
    { emoji: '🪴', bg: 'linear-gradient(135deg,#C7D5C0,#97B089)', title: 'Open-Plan Living Area', desc: 'Living room — Sarjapur Rd · Contemporary · TV unit + bookshelf', tag: 'Living Room' },
    { emoji: '✨', bg: 'linear-gradient(135deg,#D5BFD5,#B391B3)', title: 'Luxury 4BHK Villa', desc: 'Full home — Whitefield · ₹35L budget · 2,800 sqft', tag: 'Full Home' },
    { emoji: '🚿', bg: 'linear-gradient(135deg,#C4D4E0,#8EAEC4)', title: 'Spa-Style Bathroom', desc: 'Bathroom — JP Nagar · Italian tiles · Rain shower', tag: 'Bathroom' },
    { emoji: '💡', bg: 'linear-gradient(135deg,#F2E0D0,#D4B896)', title: 'False Ceiling & Cove Lighting', desc: 'Lighting — Indiranagar · Ambient cove + spot lights', tag: 'Lighting' },
    { emoji: '🗄️', bg: 'linear-gradient(135deg,#E3D8C8,#C7B89A)', title: 'Walk-in Wardrobe', desc: 'Wardrobe — Koramangala · Sliding doors · Internal LED', tag: 'Wardrobe' },
    { emoji: '🏢', bg: 'linear-gradient(135deg,#DCD6E8,#B5A8CC)', title: 'Home Office Setup', desc: 'Office — HSR Layout · Ergonomic desk · Cable management', tag: 'Office' },
    { emoji: '🪑', bg: 'linear-gradient(135deg,#D0E4D0,#8FBD8F)', title: '6-Seater Dining Area', desc: 'Dining — Jayanagar · Custom solid wood table', tag: 'Dining' },
  ];

  const services = [
    { icon: '🏠', bg: '#EFF4FB', name: 'Full Home Interiors', desc: 'Complete end-to-end interior design and execution for apartments and villas. Includes space planning, 3D visualization, material selection, and project management.', tags: ['2BHK', '3BHK', '4BHK', 'Villa'] },
    { icon: '🍳', bg: '#FBF6E9', name: 'Modular Kitchen', desc: 'Custom-designed modular kitchens with factory-finished cabinets, premium hardware, and smart storage solutions. L-shaped, U-shaped, island, and parallel configurations.', tags: ['German Hardware', 'Soft-Close', '10-Year Warranty'] },
    { icon: '🗄️', bg: '#ECFDF5', name: 'Wardrobe & Storage', desc: 'Sliding, hinged, and walk-in wardrobe solutions with customized internal layouts. Includes shoe racks, accessory drawers, and loft storage.', tags: ['Sliding', 'Walk-in', 'Loft'] },
    { icon: '💡', bg: '#FEF2F2', name: 'False Ceiling & Lighting', desc: 'Gypsum, POP, and wooden false ceiling designs with integrated ambient, task, and accent lighting. Cove lighting, downlights, and decorative fixtures included.', tags: ['Cove Lighting', 'Gypsum', 'POP'] },
    { icon: '🎨', bg: '#F5F3FF', name: 'Painting & Wallpaper', desc: 'Premium painting services with texture finishes, accent walls, and designer wallpaper installation. Asian Paints, Berger, and imported wallpaper brands available.', tags: ['Texture', 'Wallpaper', 'Accent Walls'] },
    { icon: '🚿', bg: '#E8F6F6', name: 'Bathroom Renovation', desc: 'Complete bathroom makeovers including tile work, vanity units, glass partitions, and premium fittings. Spa-style and compact bathroom designs for all budgets.', tags: ['Tiles', 'Vanity', 'Fittings'] },
  ];

  const reviews = [
    { initials: 'PS', name: 'Priya S.', loc: 'Whitefield, Bangalore', date: 'Feb 2026', rating: 5, text: 'Absolutely thrilled with our 3BHK transformation! The Artisan Interiors team was professional from the first video call through to the final walkthrough. They stayed within our budget, delivered on time, and the modular kitchen is better than we imagined.', recommend: true },
    { initials: 'RK', name: 'Rahul K.', loc: 'HSR Layout, Bangalore', date: 'Jan 2026', rating: 5, text: 'Got our entire 2BHK done by Artisan. The site visit was extremely helpful — the designer took measurements on the spot and had preliminary designs ready within a week. Only minor delay of 5 days on the wardrobe delivery, but overall excellent experience.', recommend: true },
    { initials: 'AM', name: 'Anita M.', loc: 'Sarjapur Road, Bangalore', date: 'Dec 2025', rating: 4, text: 'We hired Artisan for our living room and master bedroom renovation. The design concepts were fresh and exactly what we showed on our Pinterest board. Good material quality, especially the veneer work.', recommend: true },
    { initials: 'VN', name: 'Vikram N.', loc: 'Koramangala, Bangalore', date: 'Nov 2025', rating: 3, text: 'Design was good but there were some communication gaps during execution. The project manager changed midway which caused confusion on the paint finishes. They corrected it, but it added about 10 days. The final result looks nice though.', recommend: false },
    { initials: 'SG', name: 'Sneha G.', loc: 'Indiranagar, Bangalore', date: 'Oct 2025', rating: 5, text: 'Booked through Inzario and got a site visit within 3 days. The designer spent over an hour understanding our needs. They nailed the Scandinavian-modern mix we wanted for our flat. Kitchen is magazine-worthy!', recommend: true },
  ];

  const ratingBars = [
    { label: '5 star', pct: 65, color: '#059669' },
    { label: '4 star', pct: 21, color: '#0D7377' },
    { label: '3 star', pct: 9, color: '#D97706' },
    { label: '2 star', pct: 4, color: '#F59E0B' },
    { label: '1 star', pct: 1, color: '#DC2626' },
  ];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') setLightboxIdx(i => (i - 1 + projects.length) % projects.length);
      if (e.key === 'ArrowRight') setLightboxIdx(i => (i + 1) % projects.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen]);

  const StarIcon = ({ filled = true }: { filled?: boolean }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? '#F59E0B' : '#E5E7EB'}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="navbar-inner">
          <a href="/" className="logo">
            <div className="logo-mark">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="logo-text">Inzario</span>
          </a>
          <ul className="nav-links">
            <li>
              <a href="/designers" className="nav-back">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                Back to Search
              </a>
            </li>
            <li><a href="#">How It Works</a></li>
            <li><a href="#" className="nav-brand-btn">For Brands</a></li>
          </ul>
        </div>
      </nav>

      {/* BRAND HERO */}
      <section className="brand-hero">
        <div className="bp-container">
          <div className="bh-cover">
            <div className="bh-cover-placeholder">
              <div className="bh-cover-pattern"></div>
              <div className="bh-cover-fade"></div>
            </div>
          </div>
          <div className="bh-card">
            <div className="bh-main">
              <div className="bh-logo-wrap">
                <div className="bh-logo">
                  <div className="bh-logo-placeholder">AI</div>
                </div>
              </div>
              <div className="bh-info">
                <div className="bh-name-row">
                  <h1 className="bh-name">Artisan Interiors</h1>
                  <span className="bh-verified">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    Verified
                  </span>
                </div>
                <div className="bh-rating-row">
                  <div className="bh-stars">
                    {[1,2,3,4].map(i => <StarIcon key={i} filled={true} />)}
                    <StarIcon filled={false} />
                    <span className="bh-rating-num">4.8</span>
                  </div>
                  <button className="bh-reviews-link" onClick={() => setActiveTab('reviews')}>47 reviews</button>
                </div>
                <div className="bh-meta">
                  <span className="bh-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Koramangala, Bangalore
                  </span>
                  <span className="bh-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg>
                    8 years in business
                  </span>
                  <span className="bh-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    12-person team
                  </span>
                </div>
                <div className="bh-cta-area">
                  <button className="bh-cta-btn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    Book a Free Consultation
                  </button>
                  <div className="bh-meeting-types">
                    <span className="bh-mt">📹 Video Call</span>
                    <span className="bh-mt">🏠 Site Visit</span>
                    <span className="bh-mt">🏢 Experience Center</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TABS */}
      <div className="bp-tabs-bar">
        <div className="bp-tabs-inner">
          {[
            { id: 'portfolio', label: 'Portfolio', count: 10 },
            { id: 'services', label: 'Services', count: 6 },
            { id: 'reviews', label: 'Reviews', count: 47 },
            { id: 'about', label: 'About', count: null },
          ].map(tab => (
            <button key={tab.id} className={`bp-tab-btn${activeTab === tab.id ? ' active' : ''}`} onClick={() => setActiveTab(tab.id)}>
              {tab.label}
              {tab.count && <span className="bp-tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="bp-content-layout">
        <div className="bp-content-main">

          {/* PORTFOLIO */}
          <div className={`bp-tab-panel${activeTab === 'portfolio' ? ' active' : ''}`}>
            <div className="bp-portfolio-grid">
              {projects.map((p, i) => (
                <div className="bp-portfolio-item" key={i} onClick={() => { setLightboxIdx(i); setLightboxOpen(true); }}>
                  <div className="bp-portfolio-placeholder" style={{background: p.bg}}>{p.emoji}</div>
                  <span className="bp-portfolio-tag">{p.tag}</span>
                  <div className="bp-portfolio-overlay">
                    <span className="bp-portfolio-title">{p.title}</span>
                    <span className="bp-portfolio-desc">{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SERVICES */}
          <div className={`bp-tab-panel${activeTab === 'services' ? ' active' : ''}`}>
            <div className="bp-services-list">
              {services.map(s => (
                <div className="bp-service-card" key={s.name}>
                  <div className="bp-service-icon" style={{background: s.bg}}>{s.icon}</div>
                  <div>
                    <div className="bp-service-name">{s.name}</div>
                    <div className="bp-service-desc">{s.desc}</div>
                    <div className="bp-service-tags">{s.tags.map(t => <span className="bp-service-tag" key={t}>{t}</span>)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* REVIEWS */}
          <div className={`bp-tab-panel${activeTab === 'reviews' ? ' active' : ''}`}>
            <div className="bp-reviews-summary">
              <div className="bp-reviews-score">
                <div className="bp-reviews-big-num">4.8</div>
                <div className="bp-reviews-big-stars">
                  {[1,2,3,4].map(i => <svg key={i} width="18" height="18" viewBox="0 0 24 24" fill="#F59E0B"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>)}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="#E5E7EB"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div className="bp-reviews-total">47 reviews</div>
              </div>
              <div className="bp-reviews-bars">
                {ratingBars.map(bar => (
                  <div className="bp-review-bar-row" key={bar.label}>
                    <span className="bp-review-bar-label">{bar.label}</span>
                    <div className="bp-review-bar-track">
                      <div className="bp-review-bar-fill" style={{width: `${bar.pct}%`, background: bar.color}}></div>
                    </div>
                    <span className="bp-review-bar-pct">{bar.pct}%</span>
                  </div>
                ))}
                <div className="bp-reviews-recommend">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                  94% of homeowners would recommend
                </div>
              </div>
            </div>
            <div className="bp-reviews-list">
              {reviews.map(r => (
                <div className="bp-review-card" key={r.name}>
                  <div className="bp-review-header">
                    <div className="bp-review-author">
                      <div className="bp-review-avatar">{r.initials}</div>
                      <div>
                        <div className="bp-review-author-name">{r.name}</div>
                        <div className="bp-review-author-loc">{r.loc}</div>
                      </div>
                    </div>
                    <span className="bp-review-date">{r.date}</span>
                  </div>
                  <div className="bp-review-stars">
                    {[1,2,3,4,5].map(i => <StarIcon key={i} filled={i <= r.rating} />)}
                  </div>
                  <p className="bp-review-text">{r.text}</p>
                  <span className={`bp-review-recommend ${r.recommend ? 'yes' : 'no'}`}>
                    {r.recommend ? (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg> Would recommend</>
                    ) : (
                      <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Would not recommend</>
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ABOUT */}
          <div className={`bp-tab-panel${activeTab === 'about' ? ' active' : ''}`}>
            <div className="bp-about-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                About Artisan Interiors
              </h3>
              <p className="bp-about-text">
                Artisan Interiors is a Bangalore-based interior design studio founded in 2018, specializing in modern and contemporary residential interiors. With a team of 12 experienced designers, project managers, and execution specialists, we&apos;ve completed over 200 projects across Bangalore.
                <br/><br/>
                Our approach combines 3D visualization, transparent pricing, and hands-on project management to deliver homes that reflect each client&apos;s personality. Every project starts with a detailed consultation — either a video call, site visit, or a visit to our experience center in Koramangala.
              </p>
            </div>
            <div className="bp-about-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Quick Stats
              </h3>
              <div className="bp-about-highlights">
                {[{val:'200+',label:'Projects Completed'},{val:'8',label:'Years in Business'},{val:'12',label:'Team Members'},{val:'94%',label:'Would Recommend'}].map(h => (
                  <div className="bp-about-hl" key={h.label}>
                    <div className="bp-about-hl-val">{h.val}</div>
                    <div className="bp-about-hl-label">{h.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bp-about-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Areas Served
              </h3>
              <div className="bp-about-tags">
                {['Koramangala','Indiranagar','Whitefield','HSR Layout','Sarjapur Road','Jayanagar','JP Nagar','Electronic City','Marathahalli','Bannerghatta Road'].map(a => (
                  <span className="bp-about-tag" key={a}>{a}</span>
                ))}
              </div>
            </div>
            <div className="bp-about-section">
              <h3>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Certifications &amp; Awards
              </h3>
              {[
                { icon: '🏆', text: 'Best Residential Design Studio — Bangalore Design Awards 2024', sub: 'Recognized for excellence in contemporary apartment interiors' },
                { icon: '✅', text: 'IIID Member — Institute of Indian Interior Designers', sub: 'Professional membership since 2019' },
                { icon: '🌿', text: 'Green Interiors Certified', sub: 'Uses low-VOC paints and sustainably sourced materials' },
              ].map(c => (
                <div className="bp-about-cert" key={c.text}>
                  <div className="bp-about-cert-icon">{c.icon}</div>
                  <div>
                    <div className="bp-about-cert-text">{c.text}</div>
                    <div className="bp-about-cert-sub">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* SIDEBAR */}
        <aside className="bp-content-sidebar">
          <div className="bp-sidebar-cta">
            <h4>Interested in Artisan Interiors?</h4>
            <p>Book a free consultation to discuss your project, budget, and timeline.</p>
            <button className="bp-sidebar-cta-btn">Book a Free Consultation</button>
            <div className="bp-sidebar-mt-list">
              <span className="bp-sidebar-mt">📹 Video</span>
              <span className="bp-sidebar-mt">🏠 Site Visit</span>
              <span className="bp-sidebar-mt">🏢 Studio</span>
            </div>
          </div>
          <div className="bp-sidebar-info">
            <h4>Brand Snapshot</h4>
            {[
              { label: 'Rating', val: '⭐ 4.8 / 5' },
              { label: 'Reviews', val: '47' },
              { label: 'Projects Done', val: '200+' },
              { label: 'Established', val: '2018' },
              { label: 'Team Size', val: '12' },
              { label: 'Response Time', val: '~4 hrs' },
            ].map(s => (
              <div className="bp-stat-row" key={s.label}>
                <span className="bp-stat-label">{s.label}</span>
                <span className="bp-stat-val">{s.val}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>

      {/* MOBILE CTA */}
      <div className="bp-mobile-cta">
        <button>Book a Free Consultation</button>
      </div>

      {/* LIGHTBOX */}
      {lightboxOpen && (
        <div className="bp-lightbox active" onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false); }}>
          <button className="bp-lightbox-close" onClick={() => setLightboxOpen(false)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <button className="bp-lightbox-nav bp-lightbox-prev" onClick={() => setLightboxIdx(i => (i - 1 + projects.length) % projects.length)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="bp-lightbox-nav bp-lightbox-next" onClick={() => setLightboxIdx(i => (i + 1) % projects.length)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <div className="bp-lightbox-body">
            <div className="bp-lightbox-img" style={{background: projects[lightboxIdx].bg}}>
              {projects[lightboxIdx].emoji}
            </div>
            <div className="bp-lightbox-caption">
              <h4>{projects[lightboxIdx].title}</h4>
              <p>{projects[lightboxIdx].desc}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}