'use client';

import { useEffect, useState } from "react";

export default function Designers() {
  const [localityOpen, setLocalityOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    const searchHeader = document.getElementById('searchHeader');
    const handleScroll = () => {
      if (searchHeader) {
        searchHeader.classList.toggle('shadowed', window.scrollY > 10);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const CheckIcon = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );

  const PinIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  );

  const StarIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );

  const VerifiedIcon = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );

  const CloseIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );

  const brands = [
    { name: 'DesignCraft Studio', rating: '4.9', reviews: '127', location: 'Koramangala', tags: ['Contemporary', 'Full Home', 'Modular Kitchen'], bg: 'linear-gradient(135deg,#E8D5B7,#C4A77D)', emoji: '🏠', pro: true, snippet: 'Award-winning studio specializing in contemporary full-home interiors. 200+ completed projects across Bangalore with end-to-end design and execution.', meeting: ['📹 Video Call', '🏠 Site Visit'] },
    { name: 'Livora Interiors', rating: '4.8', reviews: '94', location: 'Whitefield', tags: ['Modern', 'Luxury', 'Villa'], bg: 'linear-gradient(135deg,#B5C7D3,#8BA3B9)', emoji: '🛋️', pro: true, snippet: 'Premium interiors for luxury villas and large apartments. Known for bespoke furniture design and imported material sourcing across Whitefield and East Bangalore.', meeting: ['📹 Video Call', '🏢 Studio Visit'] },
    { name: 'Atelier Home Design', rating: '4.7', reviews: '68', location: 'Indiranagar', tags: ['Scandinavian', 'Compact', '2/3 BHK'], bg: 'linear-gradient(135deg,#D4C5A9,#A89968)', emoji: '✨', pro: false, snippet: 'Scandinavian-inspired design studio focused on compact urban apartments. Expert at maximizing space in 2BHK and 3BHK flats with clean, functional aesthetics.', meeting: ['📹 Video Call', '🏠 Site Visit'] },
    { name: 'SpaceWell Interiors', rating: '4.8', reviews: '112', location: 'HSR Layout', tags: ['Modular Kitchen', 'Wardrobe', 'Budget-Friendly'], bg: 'linear-gradient(135deg,#C7D5C0,#97B089)', emoji: '🍃', pro: false, snippet: 'Modular kitchen and wardrobe specialists offering factory-finished solutions. Fast delivery timelines with a 10-year warranty on all installations.', meeting: ['📹 Video Call', '🏢 Studio Visit'] },
    { name: 'Nirmana Design Lab', rating: '4.6', reviews: '53', location: 'Jayanagar', tags: ['Traditional', 'Pooja Room', 'Custom Woodwork'], bg: 'linear-gradient(135deg,#D5BFD5,#B391B3)', emoji: '🪔', pro: false, snippet: 'Traditional Indian design studio blending heritage aesthetics with modern functionality. Specialists in pooja rooms, custom woodwork, and south Indian inspired interiors.', meeting: ['🏠 Site Visit', '🏢 Studio Visit'] },
    { name: 'UrbanNest Studio', rating: '4.9', reviews: '86', location: 'Sarjapur Road', tags: ['Industrial', 'Full Home', 'Premium'], bg: 'linear-gradient(135deg,#C4D4E0,#8EAEC4)', emoji: '🏗️', pro: true, snippet: 'Industrial-chic design studio delivering bold, raw-finish interiors for urban professionals. Strong portfolio of loft-style apartments and tech-forward smart homes.', meeting: ['📹 Video Call', '🏠 Site Visit', '🏢 Studio'] },
    { name: 'HomeCanvas Designs', rating: '4.7', reviews: '71', location: 'Electronic City', tags: ['Modern', 'Apartment', 'Affordable'], bg: 'linear-gradient(135deg,#E0D2C3,#C4A98A)', emoji: '🎨', pro: false, snippet: 'Affordable modern interiors for tech-park-adjacent apartments. Quick turnaround with standardized modular packages for 1BHK to 3BHK homes.', meeting: ['📹 Video Call', '🏠 Site Visit'] },
    { name: 'Vastu Living Interiors', rating: '4.5', reviews: '39', location: 'Bannerghatta Rd', tags: ['Vastu', 'Traditional', 'Full Home'], bg: 'linear-gradient(135deg,#F2E0D0,#D4B896)', emoji: '🪑', pro: false, snippet: 'Vastu-compliant interior design combining traditional principles with modern aesthetics. In-house Vastu consultant available for every project.', meeting: ['📹 Video Call', '🏠 Site Visit'] },
    { name: 'Zenith Décor Studio', rating: '4.4', reviews: '46', location: 'Marathahalli', tags: ['Minimalist', 'Bedroom', 'Living Room'], bg: 'linear-gradient(135deg,#DCD6E8,#B5A8CC)', emoji: '💡', pro: false, snippet: 'Minimalist design studio creating clutter-free, calming interiors. Known for clever storage solutions and lighting design in urban apartments.', meeting: ['📹 Video Call'] },
    { name: 'Cornerstone Interiors', rating: '4.3', reviews: '32', location: 'Hebbal', tags: ['Contemporary', 'Office', 'Commercial'], bg: 'linear-gradient(135deg,#D0E4D0,#8FBD8F)', emoji: '🏢', pro: false, snippet: 'Commercial and residential interiors with a contemporary edge. Specialists in co-working spaces, home offices, and modern apartment fit-outs in North Bangalore.', meeting: ['📹 Video Call', '🏠 Site Visit'] },
    { name: 'KitchenKraft India', rating: '4.8', reviews: '104', location: 'JP Nagar', tags: ['Modular Kitchen', 'Bathroom', 'Modern'], bg: 'linear-gradient(135deg,#F0DAD2,#D4A898)', emoji: '🍳', pro: false, snippet: 'Kitchen and bathroom renovation specialists with 500+ completed kitchens in Bangalore. German hardware, factory finish, and 45-day guaranteed delivery.', meeting: ['📹 Video Call', '🏢 Studio Visit'] },
    { name: 'Terra Studio Bangalore', rating: '4.6', reviews: '57', location: 'Malleshwaram', tags: ['Eco-Friendly', 'Minimalist', 'Sustainable'], bg: 'linear-gradient(135deg,#E3D8C8,#C7B89A)', emoji: '🌿', pro: false, snippet: 'Eco-conscious design studio using sustainable materials and zero-VOC finishes. Experts in biophilic design bringing nature indoors for healthier living spaces.', meeting: ['📹 Video Call', '🏠 Site Visit'] },
  ];

  const localities = ['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Jayanagar', 'Marathahalli', 'Electronic City', 'Sarjapur Road', 'Bannerghatta Road', 'Hebbal', 'Yelahanka', 'JP Nagar', 'Malleshwaram', 'Rajajinagar', 'Basavanagudi'];

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="filter-section">
      <div className="filter-title">{title}</div>
      {children}
    </div>
  );

  const CheckFilter = ({ label, count, defaultChecked = false }: { label: string; count?: number; defaultChecked?: boolean }) => (
    <label className="filter-check">
      <input type="checkbox" defaultChecked={defaultChecked} />
      <span className="check-box"><CheckIcon /></span>
      <span className="check-label">{label}</span>
      {count && <span className="check-count">{count}</span>}
    </label>
  );

  const RadioFilter = ({ label, name, defaultChecked = false }: { label: string; name: string; defaultChecked?: boolean }) => (
    <label className="filter-radio">
      <input type="radio" name={name} defaultChecked={defaultChecked} />
      <span className="radio-dot"></span>
      <span className="check-label">{label}</span>
    </label>
  );

  const SidebarContent = () => (
    <>
      <FilterSection title="Budget Range">
        <CheckFilter label="₹3L – ₹5L" count={18} />
        <CheckFilter label="₹5L – ₹8L" count={31} />
        <CheckFilter label="₹8L – ₹12L" count={24} defaultChecked />
        <CheckFilter label="₹12L – ₹20L" count={19} defaultChecked />
        <CheckFilter label="₹20L – ₹35L" count={12} />
        <CheckFilter label="₹35L – ₹50L" count={7} />
        <CheckFilter label="₹50L+" count={4} />
      </FilterSection>

      <FilterSection title="City">
        <RadioFilter label="Bangalore" name="city" defaultChecked />
        <RadioFilter label="Delhi" name="city" />
        <RadioFilter label="Mumbai" name="city" />
        <RadioFilter label="Hyderabad" name="city" />
        <RadioFilter label="Kolkata" name="city" />
        <RadioFilter label="Noida" name="city" />
        <RadioFilter label="Gurgaon" name="city" />
      </FilterSection>

      <FilterSection title="Locality">
        <div className={`locality-dropdown${localityOpen ? ' open' : ''}`}>
          <div className="locality-trigger" onClick={() => setLocalityOpen(!localityOpen)}>
            <span>Select localities…</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
          </div>
          {localityOpen && (
            <div className="locality-panel">
              {localities.map(loc => (
                <label className="filter-check" key={loc}>
                  <input type="checkbox" />
                  <span className="check-box"><CheckIcon /></span>
                  <span className="check-label">{loc}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </FilterSection>

      <FilterSection title="Style">
        <CheckFilter label="Modern" count={28} />
        <CheckFilter label="Traditional" count={15} />
        <CheckFilter label="Minimalist" count={22} />
        <CheckFilter label="Contemporary" count={34} />
        <CheckFilter label="Scandinavian" count={11} />
        <CheckFilter label="Industrial" count={9} />
      </FilterSection>

      <FilterSection title="Project Type">
        <CheckFilter label="Full Home" count={38} defaultChecked />
        <CheckFilter label="Modular Kitchen" count={42} />
        <CheckFilter label="Bedroom" count={35} />
        <CheckFilter label="Living Room" count={30} />
        <CheckFilter label="Bathroom" count={18} />
        <CheckFilter label="Office" count={14} />
      </FilterSection>

      <FilterSection title="Rating">
        <RadioFilter label="★ 4+ Stars" name="rating" />
        <RadioFilter label="★ 3+ Stars" name="rating" />
        <RadioFilter label="All Ratings" name="rating" defaultChecked />
      </FilterSection>

      <button className="clear-filters-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        Clear All Filters
      </button>
    </>
  );

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar" style={{borderBottom: '1px solid var(--border)'}}>
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
            <li><a href="#">How It Works</a></li>
            <li><a href="#">Budget Estimator</a></li>
            <li><a href="#" className="nav-brand-btn">For Brands</a></li>
          </ul>
        </div>
      </nav>

      {/* SEARCH HEADER */}
      <div className="search-header" id="searchHeader">
        <div className="search-header-inner">
          <div className="sh-bar">
            <div className="sh-city">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
              <select>
                <option>Bangalore</option>
                <option>Delhi</option>
                <option>Mumbai</option>
                <option>Hyderabad</option>
              </select>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Search by brand, style, or locality..." />
          </div>
          <div className="sh-sort">
            <label>Sort:</label>
            <select>
              <option>Relevance</option>
              <option>Highest Rated</option>
              <option>Most Reviewed</option>
              <option>Newest</option>
            </select>
          </div>
          <button className="mobile-filter-btn" onClick={() => setFilterSheetOpen(true)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="20" y2="12"/><line x1="12" y1="18" x2="20" y2="18"/>
            </svg>
            Filters
          </button>
        </div>
        <div className="active-chips-bar">
          <span className="active-chip">Bangalore <CloseIcon /></span>
          <span className="active-chip">Full Home <CloseIcon /></span>
          <span className="active-chip">₹10L – ₹20L <CloseIcon /></span>
          <span className="active-chip clear-all-chip">Clear all</span>
        </div>
      </div>

      {/* PAGE BODY */}
      <div className="page-body">

        {/* SIDEBAR */}
        <aside className="sidebar">
          <SidebarContent />
        </aside>

        {/* MAIN */}
        <div className="main-content">
          <div className="results-meta">
            <div className="results-count">Showing <strong>47</strong> interior brands in <strong>Bangalore</strong></div>
            <div className="results-view-toggle">
              <button className="view-btn active">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
              <button className="view-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="brand-list">
            {brands.map(brand => (
              <div className={`bc-card${brand.pro ? ' pro' : ''}`} key={brand.name}>
                <div className="bc-photo">
                  <div className="bc-photo-placeholder" style={{background: brand.bg}}>{brand.emoji}</div>
                  {brand.pro && <span className="bc-pro-badge">Pro Brand</span>}
                </div>
                <div className="bc-info">
                  <div className="bc-header">
                    <a href="/designers/artisan-interiors" style={{textDecoration:'none', color:'inherit'}}><span className="bc-name">{brand.name}</span></a>
                    <span className="bc-verified"><VerifiedIcon /> Verified</span>
                  </div>
                  <div className="bc-rating-row">
                    <div className="bc-stars">
                      {[1,2,3,4,5].map(i => <StarIcon key={i} />)}
                      <span className="bc-rating-num">{brand.rating}</span>
                    </div>
                    <span className="bc-reviews">{brand.reviews} reviews</span>
                    <span className="bc-location"><PinIcon /> {brand.location}</span>
                  </div>
                  <div className="bc-tags">
                    {brand.tags.map(tag => <span className="bc-tag" key={tag}>{tag}</span>)}
                  </div>
                  <p className="bc-snippet">{brand.snippet}</p>
                </div>
                <div className="bc-cta">
                  <button className="bc-cta-btn" onClick={() => window.location.href='/designers/artisan-interiors'}>Book Free Consultation</button>
                  <div className="bc-meeting-types">
                    {brand.meeting.map(m => <span className="bc-mt" key={m}>{m}</span>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="load-more-wrap">
            <button className="load-more-btn">Load More Brands</button>
            <p className="load-more-info">Showing 12 of 47 brands</p>
          </div>
        </div>
      </div>

      {/* MOBILE FILTER SHEET */}
      {filterSheetOpen && (
        <>
          <div className="filter-overlay active" onClick={() => setFilterSheetOpen(false)}></div>
          <div className="filter-sheet active">
            <div className="sheet-handle-bar"></div>
            <div className="sheet-header">
              <span className="sheet-title">Filters</span>
              <button className="sheet-close" onClick={() => setFilterSheetOpen(false)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="sheet-body">
              <SidebarContent />
            </div>
            <div className="sheet-footer">
              <button className="btn-clear" onClick={() => setFilterSheetOpen(false)}>Clear All</button>
              <button className="btn-apply" onClick={() => setFilterSheetOpen(false)}>Show 47 Brands</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}