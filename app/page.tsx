'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeChips, setActiveChips] = useState<string[]>([]);

  useEffect(() => {
    const navbar = document.getElementById('navbar');
    const handleScroll = () => {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
      }
    };
    window.addEventListener('scroll', handleScroll);

    const observerOptions = {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.step-card, .brand-card, .trust-card, .testimonial-card, .budget-banner, .brands-cta-box').forEach((el, i) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(24px)';
      htmlEl.style.transition = `opacity 0.6s ease ${i * 0.08}s, transform 0.6s ease ${i * 0.08}s`;
      observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  const toggleChip = (chip: string) => {
    setActiveChips(prev =>
      prev.includes(chip) ? prev.filter(c => c !== chip) : [...prev, chip]
    );
  };

  const chips = ['🍳 Modular Kitchen', '🛋️ Full Home', '✨ Contemporary', '🧱 Minimalist', '📐 3BHK'];

  const brands = [
    { name: 'DesignCraft Studio', rating: '4.9', reviews: '127', location: 'Koramangala', tags: ['Contemporary', 'Full Home', 'Modular Kitchen'], bg: 'linear-gradient(135deg,#E8D5B7,#C4A77D)' },
    { name: 'Livora Interiors', rating: '4.8', reviews: '94', location: 'Whitefield', tags: ['Modern', 'Luxury', 'Villa'], bg: 'linear-gradient(135deg,#B5C7D3,#8BA3B9)' },
    { name: 'Atelier Home Design', rating: '4.7', reviews: '68', location: 'Indiranagar', tags: ['Scandinavian', 'Compact', '2/3 BHK'], bg: 'linear-gradient(135deg,#D4C5A9,#A89968)' },
    { name: 'SpaceWell Interiors', rating: '4.8', reviews: '112', location: 'HSR Layout', tags: ['Modular Kitchen', 'Wardrobe', 'Budget'], bg: 'linear-gradient(135deg,#C7D5C0,#97B089)' },
    { name: 'Nirmana Design Lab', rating: '4.6', reviews: '53', location: 'Jayanagar', tags: ['Traditional', 'Pooja Room', 'Custom'], bg: 'linear-gradient(135deg,#D5BFD5,#B391B3)' },
    { name: 'UrbanNest Studio', rating: '4.9', reviews: '86', location: 'Sarjapur Road', tags: ['Industrial', 'Full Home', 'Premium'], bg: 'linear-gradient(135deg,#C4D4E0,#8EAEC4)' },
    { name: 'HomeCanvas Designs', rating: '4.7', reviews: '71', location: 'Electronic City', tags: ['Modern', 'Apartment', 'Affordable'], bg: 'linear-gradient(135deg,#E0D2C3,#C4A98A)' },
  ];

  const testimonials = [
    { quote: 'Found an amazing designer through Inzario for our 3BHK in Whitefield. No spam calls, just a great consultation.', name: 'Priya S.', loc: 'Whitefield, Bangalore', initials: 'PS' },
    { quote: 'After getting bombarded with calls on other platforms, Inzario was a breath of fresh air. Compared three designers side-by-side and booked a video call within minutes.', name: 'Rahul K.', loc: 'HSR Layout, Bangalore', initials: 'RK' },
    { quote: 'The Budget Estimator alone saved us weeks of back-and-forth. Highly recommend Inzario to anyone doing up their home.', name: 'Anita M.', loc: 'Sarjapur Road, Bangalore', initials: 'AM' },
  ];

  const ArrowIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  );

  const StarIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );

  const VerifiedIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );

  const PinIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar" id="navbar">
        <div className="container navbar-inner">
          <a href="#" className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="logo-text">Inzario</span>
          </a>
          <ul className="nav-links">
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="#brands">Top Brands</a></li>
            <li><a href="#why-inzario">Why Inzario</a></li>
            <li><a href="#budget-estimator">Budget Estimator</a></li>
            <li><a href="#for-brands" className="nav-cta">For Brands</a></li>
          </ul>
          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu${mobileMenuOpen ? ' active' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setMobileMenuOpen(false); }}>
        <div className="mobile-menu-panel">
          <button className="mobile-menu-close" onClick={() => setMobileMenuOpen(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
          <ul className="mobile-menu-links">
            <li><a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</a></li>
            <li><a href="#brands" onClick={() => setMobileMenuOpen(false)}>Top Brands</a></li>
            <li><a href="#why-inzario" onClick={() => setMobileMenuOpen(false)}>Why Inzario</a></li>
            <li><a href="#budget-estimator" onClick={() => setMobileMenuOpen(false)}>Budget Estimator</a></li>
            <li><a href="#for-brands" className="mm-cta" onClick={() => setMobileMenuOpen(false)}>For Brands</a></li>
          </ul>
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-pattern"></div>
        <div className="hero-deco-1"></div>
        <div className="hero-deco-2"></div>
        <div className="hero-content">
          <h1 className="anim-fade-up anim-delay-1">Find the perfect<br/><em>interior designer</em></h1>
          <p className="hero-sub anim-fade-up anim-delay-2">Discover verified design studios, compare portfolios, and book consultations — all in one place. No spam, no hidden costs.</p>

          <div className="hero-search-panel anim-fade-up anim-delay-3">
            <div className="hsp-row">
              <div className="hsp-field">
                <span className="hsp-field-icon">📍</span>
                <select className="hsp-select">
                  <option>Bangalore</option>
                  <option disabled>Mumbai — coming soon</option>
                  <option disabled>Delhi — coming soon</option>
                </select>
              </div>
              <div className="hsp-field hsp-field-grow">
                <span className="hsp-field-icon">🏠</span>
                <select className="hsp-select">
                  <option value="" disabled>What do you need?</option>
                  <option>Full Home Interior</option>
                  <option>Modular Kitchen</option>
                  <option>Living Room</option>
                  <option>Bedroom &amp; Wardrobe</option>
                  <option>Bathroom Renovation</option>
                  <option>Commercial / Office</option>
                </select>
              </div>
              <div className="hsp-field">
                <span className="hsp-field-icon">💰</span>
                <select className="hsp-select">
                  <option value="" disabled>Budget range</option>
                  <option>Under ₹5L</option>
                  <option>₹5L – ₹10L</option>
                  <option>₹10L – ₹20L</option>
                  <option>₹20L – ₹40L</option>
                  <option>₹40L+</option>
                </select>
              </div>
              <button className="hsp-go-btn" onClick={() => router.push('/designers')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>
            <div className="hsp-chips">
              <span className="hsp-chip-label">Popular:</span>
              {chips.map(chip => (
                <button key={chip} className={`hsp-chip${activeChips.includes(chip) ? ' active' : ''}`} onClick={() => toggleChip(chip)}>
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="hero-stats anim-fade-up anim-delay-4">
            <div className="hero-stat">
              <div className="hero-stat-icon">✓</div>
              <div><div className="hero-stat-num">240+</div><div className="hero-stat-label">Verified Brands</div></div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-icon">📅</div>
              <div><div className="hero-stat-num">4,800+</div><div className="hero-stat-label">Meetings Facilitated</div></div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-icon">⭐</div>
              <div><div className="hero-stat-num">4.7</div><div className="hero-stat-label">Avg Brand Rating</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-label">Simple &amp; Transparent</div>
          <div className="section-title" style={{marginLeft:'auto',marginRight:'auto'}}>How Inzario Works</div>
          <p className="section-subtitle" style={{marginLeft:'auto',marginRight:'auto'}}>From discovery to consultation in three easy steps — completely free for homeowners.</p>
          <div className="steps-grid">
            {[
              { num: 1, title: 'Search', desc: 'Browse verified interior brands by style, budget, locality, and specialization.' },
              { num: 2, title: 'Compare', desc: 'View portfolios, read genuine reviews, and check completed projects side-by-side.' },
              { num: 3, title: 'Book Free Consultation', desc: 'Schedule a video call, site visit, or experience center visit — entirely free.' },
            ].map(step => (
              <div className="step-card" key={step.num}>
                <div className="step-num">{step.num}</div>
                <div className="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {step.num === 1 && <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></>}
                    {step.num === 2 && <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>}
                    {step.num === 3 && <><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>}
                  </svg>
                </div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED BRANDS */}
      <section className="featured-brands" id="brands">
        <div className="container">
          <div className="featured-header">
            <div>
              <div className="section-label">Curated For You</div>
              <div className="section-title">Top-Rated Interior Brands in Bangalore</div>
            </div>
            <a href="/designers" className="view-all">View All Brands <ArrowIcon /></a>
          </div>
          <div className="brands-scroll">
            {brands.map(brand => (
              <div className="brand-card" key={brand.name}>
                <div className="brand-cover" style={{background: brand.bg}}>
                  <div className="brand-cover-gradient"></div>
                  <div className="brand-verified"><VerifiedIcon /> Verified</div>
                </div>
                <div className="brand-info">
                  <div className="brand-name">{brand.name}</div>
                  <div className="brand-meta">
                    <span className="brand-rating"><StarIcon size={14} /> {brand.rating}</span>
                    <span className="brand-reviews">{brand.reviews} reviews</span>
                  </div>
                  <div className="brand-location"><PinIcon /> {brand.location}</div>
                  <div className="brand-tags">{brand.tags.map(tag => <span className="brand-tag" key={tag}>{tag}</span>)}</div>
                  <a href="/designers" className="brand-book-link">Book Free Consultation <ArrowIcon /></a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY INZARIO */}
      <section className="why-inzario" id="why-inzario">
        <div className="container">
          <div className="section-label">Built on Trust</div>
          <div className="section-title" style={{marginLeft:'auto',marginRight:'auto'}}>Why Homeowners Choose Inzario</div>
          <p className="section-subtitle" style={{marginLeft:'auto',marginRight:'auto'}}>We built the platform we wished existed — no spam, no hidden costs, just genuine connections with great designers.</p>
          <div className="trust-grid">
            {[
              { title: 'Verified Brands Only', desc: 'Every brand is vetted and portfolio-verified before they appear on the platform.', color: '#1E3A5F', bg: '#EFF4FB', icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>, extra: <polyline points="9 12 11 14 15 10"/> },
              { title: 'No Spam, Ever', desc: 'We never share your phone number. Zero unwanted calls, guaranteed.', color: '#DC2626', bg: '#FEF2F2', icon: <><path d="M18.36 6.64a9 9 0 01.17 12.55m-2.83-2.83a5 5 0 00.09-6.98"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M8.53 8.53A5 5 0 007 12c0 1.38.56 2.63 1.46 3.54m-2.83 2.83A9 9 0 015 12c0-2.49 1.01-4.74 2.64-6.36"/></>, extra: null },
              { title: 'Free for Homeowners', desc: 'Browse, compare, and book consultations at absolutely zero cost to you.', color: '#059669', bg: '#ECFDF5', icon: <><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 000 4h4a2 2 0 010 4H8"/><line x1="12" y1="6" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="18"/></>, extra: null },
              { title: 'Genuine Reviews', desc: 'Real reviews from real homeowners — only after a verified meeting has taken place.', color: '#B45309', bg: '#FBF6E9', icon: <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>, extra: null },
            ].map(card => (
              <div className="trust-card" key={card.title}>
                <div className="trust-icon" style={{background: card.bg}}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {card.icon}{card.extra}
                  </svg>
                </div>
                <div><h3>{card.title}</h3><p>{card.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUDGET ESTIMATOR */}
      <section className="budget-teaser" id="budget-estimator">
        <div className="container">
          <div className="budget-banner">
            <div className="budget-content">
              <div className="budget-badge">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                Free Tool
              </div>
              <h2>Not sure about your interior budget?</h2>
              <p>Use our free Budget Estimator to get a detailed room-by-room cost breakdown for your home — no signup needed.</p>
            </div>
            <div className="budget-cta">
              <a href="#">Estimate Your Budget <ArrowIcon /></a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-label">Real Stories</div>
          <div className="section-title" style={{marginLeft:'auto',marginRight:'auto'}}>What Homeowners Are Saying</div>
          <div className="testimonial-grid">
            {testimonials.map(t => (
              <div className="testimonial-card" key={t.name}>
                <div className="testimonial-stars">
                  {[1,2,3,4,5].map(i => <StarIcon key={i} size={16} />)}
                </div>
                <p className="testimonial-quote">{t.quote}</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-loc">{t.loc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOR BRANDS CTA */}
      <section className="brands-cta" id="for-brands">
        <div className="container">
          <div className="brands-cta-box">
            <div className="brands-cta-content">
              <div className="section-label">For Interior Design Brands</div>
              <h2>Are you an interior design brand?</h2>
              <p>Join 100+ verified brands on Inzario and connect with serious homeowners ready for their interior journey.</p>
              <a href="#" className="btn-brand-register">Register Your Brand <ArrowIcon /></a>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">Inzario</div>
              <p>Where Your Interior Journey Begins. Discover verified interior designers, compare portfolios, and book free consultations — without the spam.</p>
              <div className="footer-social">
                <a href="#" aria-label="Instagram">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4>Platform</h4>
              <ul>
                <li><a href="#">How It Works</a></li>
                <li><a href="#">Budget Estimator</a></li>
                <li><a href="/designers">Top Brands</a></li>
                <li><a href="#">For Brands</a></li>
              </ul>
            </div>
            <div>
              <h4>Company</h4>
              <ul>
                <li><a href="#">About Inzario</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Inzario. All rights reserved.</p>
            <div className="footer-bottom-links">
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}