'use client';

import { useState, useCallback } from "react";

const ITEMS = [
  { id: 'kitchen', emoji: '🍳', name: 'Modular Kitchen', base: 3.5, mq: 1 },
  { id: 'wardrobes', emoji: '👔', name: 'Wardrobes', base: 1.8, mq: 5 },
  { id: 'tvunit', emoji: '📺', name: 'TV Unit & Entertainment', base: 0.8, mq: 2 },
  { id: 'ceiling', emoji: '🎨', name: 'False Ceiling', base: 1.2, mq: 1 },
  { id: 'lighting', emoji: '💡', name: 'Lighting Design', base: 0.7, mq: 1 },
  { id: 'living', emoji: '🛋️', name: 'Living Room', base: 2.2, mq: 1 },
  { id: 'master', emoji: '🛏️', name: 'Master Bedroom', base: 1.5, mq: 1 },
  { id: 'guest', emoji: '🛌', name: 'Guest Bedroom', base: 1.2, mq: 2 },
  { id: 'bathroom', emoji: '🚿', name: 'Bathroom Renovation', base: 1.8, mq: 4 },
  { id: 'dining', emoji: '🍽️', name: 'Dining Area', base: 1.0, mq: 1 },
  { id: 'study', emoji: '📚', name: 'Study / Home Office', base: 1.2, mq: 1 },
  { id: 'kids', emoji: '🧒', name: 'Kids Room', base: 1.4, mq: 3 },
  { id: 'pooja', emoji: '🙏', name: 'Pooja Room', base: 0.6, mq: 1 },
  { id: 'curtains', emoji: '🪟', name: 'Curtains & Blinds', base: 0.4, mq: 1 },
  { id: 'foyer', emoji: '🚪', name: 'Foyer / Entrance', base: 0.5, mq: 1 },
  { id: 'painting', emoji: '🖌️', name: 'Painting & Wall Finish', base: 0.9, mq: 1 },
  { id: 'balcony', emoji: '🌿', name: 'Balcony / Utility', base: 0.4, mq: 2 },
];

const BHK_SCALE: Record<number, number> = { 1: 0.65, 2: 0.85, 3: 1, 4: 1.3 };
const BHK_AREA: Record<number, number> = { 1: 550, 2: 950, 3: 1400, 4: 2500 };

function fL(v: number): string {
  if (v >= 1) return (v % 1 < 0.05 || v % 1 > 0.95) ? Math.round(v) + 'L' : v.toFixed(1) + 'L';
  return (v * 100).toFixed(0) + 'K';
}

export default function BudgetEstimator() {
  const [bhk, setBhk] = useState(3);
  const [area, setArea] = useState(1400);
  const [city, setCity] = useState({ name: 'Bengaluru', m: 1.0 });
  const [mat, setMat] = useState({ name: 'HDHMR', m: 1.0 });
  const [fin, setFin] = useState({ name: 'Matt', m: 1.0 });
  const [tier, setTier] = useState({ name: 'Premium', m: 1.0 });
  const [selected, setSelected] = useState<Set<string>>(new Set(['kitchen', 'wardrobes', 'ceiling']));
  const [qty, setQty] = useState<Record<string, number>>({ kitchen: 1, wardrobes: 2, ceiling: 1 });
  const [sheetOpen, setSheetOpen] = useState(false);

  const itemCost = useCallback((item: typeof ITEMS[0]) => {
    return item.base * (BHK_SCALE[bhk] || 1) * city.m * mat.m * fin.m * tier.m * Math.max(0.7, Math.min(1.5, area / (BHK_AREA[bhk] || 1400)));
  }, [bhk, area, city.m, mat.m, fin.m, tier.m]);

  const calcTotal = useCallback(() => {
    let t = 0;
    const rows: { item: typeof ITEMS[0]; cost: number; q: number }[] = [];
    ITEMS.forEach(item => {
      if (selected.has(item.id)) {
        const q = qty[item.id] || 1;
        const c = itemCost(item) * q;
        t += c;
        rows.push({ item, cost: c, q });
      }
    });
    rows.sort((a, b) => b.cost - a.cost);
    return { t, rows };
  }, [selected, qty, itemCost]);

  const { t, rows } = calcTotal();
  const lo = t * 0.8, hi = t * 1.2;
  const ps = area > 0 ? Math.round(t * 100000 / area) : 0;
  const totalItems = Array.from(selected).reduce((s, id) => s + (qty[id] || 1), 0);
  const gaugeLeft = Math.max(2, Math.min(98, (t / 50) * 100));

  const toggleItem = (id: string) => {
    const ns = new Set(selected);
    const nq = { ...qty };
    if (ns.has(id)) { ns.delete(id); delete nq[id]; }
    else { ns.add(id); nq[id] = 1; }
    setSelected(ns);
    setQty(nq);
  };

  const changeQty = (id: string, d: number) => {
    const item = ITEMS.find(x => x.id === id);
    if (!item) return;
    setQty(q => ({ ...q, [id]: Math.max(1, Math.min(item.mq, (q[id] || 1) + d)) }));
  };

  const selectBhk = (b: number) => { setBhk(b); setArea(BHK_AREA[b]); };

  const EstimatePanel = () => (
    <div className="be-estimate-panel">
      <div className="be-ep-header">
        <div className="be-ep-title">Your Estimate</div>
        <div className="be-ep-sub">Updates in real-time</div>
      </div>
      <div className="be-ep-total-wrap">
        <div className="be-ep-total">₹{fL(t)}</div>
        <div className="be-ep-range">Range: ₹{fL(lo)} – ₹{fL(hi)}</div>
      </div>
      <div className="be-ep-gauge">
        <div className="be-gauge-bar">
          <div className="be-gauge-marker" style={{ left: `${gaugeLeft}%` }}></div>
        </div>
        <div className="be-gauge-labels"><span>Budget</span><span>Mid-Range</span><span>Premium</span><span>Luxury</span></div>
      </div>
      <div className="be-ep-summary">
        <div className="be-ep-row"><span className="be-ep-row-label">🏠 Property</span><span className="be-ep-row-val">{bhk} BHK · {area.toLocaleString('en-IN')} sqft</span></div>
        <div className="be-ep-row"><span className="be-ep-row-label">📍 City</span><span className="be-ep-row-val">{city.name}</span></div>
        <div className="be-ep-row"><span className="be-ep-row-label">🪵 Material</span><span className="be-ep-row-val">{mat.name} · {fin.name}</span></div>
        <div className="be-ep-row"><span className="be-ep-row-label">✨ Quality</span><span className="be-ep-row-val">{tier.name}</span></div>
        <div className="be-ep-row"><span className="be-ep-row-label">🛋️ Items</span><span className="be-ep-row-val accent">{totalItems} item{totalItems !== 1 ? 's' : ''}</span></div>
      </div>
      <div className="be-ep-divider"></div>
      <div className="be-ep-breakdown">
        <div className="be-ep-breakdown-title">Cost Breakdown</div>
        {rows.length ? rows.map(r => (
          <div className="be-ep-item" key={r.item.id}>
            <span className="be-ep-item-name">{r.item.emoji} {r.item.name}{r.q > 1 && <span style={{opacity:0.5, fontSize:'11px'}}> ×{r.q}</span>}</span>
            <span className="be-ep-item-cost">₹{fL(r.cost)}</span>
          </div>
        )) : <div className="be-ep-empty">Select items to see breakdown</div>}
      </div>
      <div className="be-ep-sqft"><span className="be-ep-sqft-label">Per sqft cost</span><span className="be-ep-sqft-val">₹{ps.toLocaleString('en-IN')}</span></div>
      <div className="be-ep-actions">
        <button className="be-ep-btn be-ep-btn-book">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          Book a Free Consultation
        </button>
        <button className="be-ep-btn be-ep-btn-cta" onClick={() => window.location.href = '/designers'}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          Find Brands in This Budget
        </button>
        <div className="be-ep-btn-row">
          <button className="be-ep-btn be-ep-btn-ghost">📤 Share</button>
          <button className="be-ep-btn be-ep-btn-ghost">📄 Download</button>
        </div>
      </div>
      <div className="be-ep-disclaimer">⚠️ Indicative estimate. Actual costs vary by design, materials, and vendor.</div>
    </div>
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
            <li><a href="#how-it-works">How It Works</a></li>
            <li><a href="/designers">Find Brands</a></li>
            <li><a href="/budget-estimator" style={{color:'var(--accent)'}}>Budget Estimator</a></li>
            <li><a href="#" className="nav-cta">For Brands</a></li>
          </ul>
        </div>
      </nav>

      {/* PAGE HEADER */}
      <div className="be-page-header">
        <div className="be-page-header-inner">
          <h1 className="be-ph-title">How much will your interiors cost?</h1>
          <p className="be-ph-desc">Configure your property below and see a real-time estimate based on pricing data from 240+ verified brands.</p>
        </div>
      </div>

      {/* LAYOUT */}
      <div className="be-layout">
        <div className="be-config-col">

          {/* 1. PROPERTY */}
          <div className="be-cfg-section">
            <div className="be-cfg-header">
              <div className="be-cfg-icon" style={{background:'#EFF4FB'}}>🏠</div>
              <div><div className="be-cfg-title">Property Configuration</div><div className="be-cfg-subtitle">Tell us about your space</div></div>
            </div>
            <div className="be-bhk-grid">
              {[{b:1,emoji:'🚪',label:'1 BHK',sub:'450–650 sqft'},{b:2,emoji:'🏠',label:'2 BHK',sub:'800–1100 sqft'},{b:3,emoji:'🏡',label:'3 BHK',sub:'1200–1800 sqft'},{b:4,emoji:'🏰',label:'4+ BHK',sub:'2000–3500 sqft'}].map(x => (
                <div key={x.b} className={`be-bhk-card${bhk === x.b ? ' active' : ''}`} onClick={() => selectBhk(x.b)}>
                  <div className="be-bhk-emoji">{x.emoji}</div>
                  <div className="be-bhk-label">{x.label}</div>
                  <div className="be-bhk-sub">{x.sub}</div>
                </div>
              ))}
            </div>
            <div className="be-field-label">Carpet Area</div>
            <div className="be-slider-display">
              <span className="be-slider-num">{area.toLocaleString('en-IN')}</span>
              <span className="be-slider-unit">sq ft</span>
            </div>
            <div className="be-range-track">
              <div className="be-range-fill" style={{width: `${((area - 400) / 3600) * 100}%`}}></div>
              <input type="range" className="be-range-slider" min={400} max={4000} step={50} value={area} onChange={e => setArea(+e.target.value)} />
            </div>
            <div className="be-slider-labels"><span>400 sqft</span><span>4,000 sqft</span></div>
            <div className="be-field-label" style={{marginTop:'20px'}}>City</div>
            <div className="be-chip-row">
              {[{n:'Bengaluru',m:1.0},{n:'Mumbai',m:1.25},{n:'Delhi NCR',m:1.15},{n:'Hyderabad',m:0.9},{n:'Pune',m:0.95},{n:'Chennai',m:0.92}].map(c => (
                <span key={c.n} className={`be-chip${city.name === c.n ? ' active' : ''}`} onClick={() => setCity({name:c.n, m:c.m})}>{c.n}</span>
              ))}
            </div>
          </div>

          {/* 2. SCOPE */}
          <div className="be-cfg-section">
            <div className="be-cfg-header">
              <div className="be-cfg-icon" style={{background:'#E8F6F6'}}>🛋️</div>
              <div><div className="be-cfg-title">What Do You Need?</div><div className="be-cfg-subtitle">Select all rooms and areas for your project</div></div>
            </div>
            <div className="be-field-label">
              Scope Items
              <span className="be-count-badge">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
            </div>
            <div className="be-scope-grid">
              {ITEMS.map(item => {
                const s = selected.has(item.id);
                const q = qty[item.id] || 1;
                const u = itemCost(item);
                const hasQty = item.mq > 1;
                return (
                  <div key={item.id} className={`be-scope-card${s ? ' selected' : ''}${hasQty ? ' has-qty' : ''}`}>
                    <div className="be-scope-check" onClick={() => toggleItem(item.id)}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <div onClick={() => toggleItem(item.id)}>
                      <div className="be-scope-emoji">{item.emoji}</div>
                      <div className="be-scope-name">{item.name}</div>
                    </div>
                    <div className="be-scope-cost">₹{fL(s ? u * q : u)}{s && q > 1 ? ` (×${q})` : ''}</div>
                    {hasQty && (
                      <div className="be-scope-qty">
                        <button className="be-qty-btn" onClick={e => { e.stopPropagation(); changeQty(item.id, -1); }}>−</button>
                        <span className="be-qty-val">{q}</span>
                        <button className="be-qty-btn" onClick={e => { e.stopPropagation(); changeQty(item.id, 1); }}>+</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. MATERIAL */}
          <div className="be-cfg-section">
            <div className="be-cfg-header">
              <div className="be-cfg-icon" style={{background:'#FBF6E9'}}>🪵</div>
              <div><div className="be-cfg-title">Material &amp; Finish</div><div className="be-cfg-subtitle">Core material and surface finish for all woodwork</div></div>
            </div>
            <div className="be-field-label">Core Material</div>
            <div className="be-chip-row">
              {[{n:'Particle Board',m:0.7},{n:'MDF',m:0.85},{n:'HDHMR',m:1.0},{n:'Commercial Plywood',m:1.05},{n:'BWP Plywood',m:1.2}].map(m => (
                <span key={m.n} className={`be-chip${mat.name === m.n ? ' active' : ''}`} onClick={() => setMat({name:m.n, m:m.m})}>{m.n}</span>
              ))}
            </div>
            <div className="be-field-label" style={{marginTop:'20px'}}>Surface Finish</div>
            <div className="be-chip-row">
              {[{n:'Laminate',m:0.8},{n:'Matt',m:1.0},{n:'Acrylic',m:1.15},{n:'PU Finish',m:1.25},{n:'Veneer',m:1.3},{n:'Lacquer / Glass',m:1.45}].map(f => (
                <span key={f.n} className={`be-chip${fin.name === f.n ? ' active' : ''}`} onClick={() => setFin({name:f.n, m:f.m})}>{f.n}</span>
              ))}
            </div>
          </div>

          {/* 4. TIER */}
          <div className="be-cfg-section">
            <div className="be-cfg-header">
              <div className="be-cfg-icon" style={{background:'#F3E8FF'}}>✨</div>
              <div><div className="be-cfg-title">Overall Quality Tier</div><div className="be-cfg-subtitle">Hardware, fittings, and overall project grade</div></div>
            </div>
            <div className="be-tier-grid">
              {[
                {n:'Essential',m:0.85,badge:'Budget-Friendly',emoji:'🌱',desc:'Standard hardware (Ebco), basic fittings, standard lighting. Clean and functional for budget-conscious projects.'},
                {n:'Premium',m:1.0,badge:'Best Value',emoji:'✨',desc:'Branded hardware (Hettich/Hafele), designer fittings, solid wood accents, curated lighting.'},
                {n:'Luxury',m:1.5,badge:'Top-End',emoji:'💎',desc:'Blum/Grass soft-close, imported fixtures, Italian marble, smart home integration.'},
              ].map(t => (
                <div key={t.n} className={`be-tier-card${tier.name === t.n ? ' active' : ''}`} onClick={() => setTier({name:t.n, m:t.m})}>
                  <div className="be-tier-badge">{t.badge}</div>
                  <div className="be-tier-emoji">{t.emoji}</div>
                  <div className="be-tier-name">{t.n}</div>
                  <div className="be-tier-desc">{t.desc}</div>
                </div>
              ))}
            </div>
            <div className="be-tier-note"><strong>💡 Pro tip:</strong> For a 3BHK, the difference between Essential and Luxury can be ₹10–15L+. Most homeowners choose Premium — the sweet spot of quality and value.</div>
          </div>

        </div>

        {/* STICKY ESTIMATE */}
        <div className="be-estimate-col">
          <EstimatePanel />
        </div>
      </div>

      {/* CTA */}
      <div className="be-cta-section">
        <div className="be-cta-box">
          <h2>Ready to bring your estimate to life?</h2>
          <p>Book a free consultation with a verified interior designer who can visit your property and give you a detailed, personalized quote.</p>
          <button className="be-cta-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Book a Free Consultation
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">Inzario</div>
              <p>Where Your Interior Journey Begins. Discover verified interior designers, compare portfolios, and book free consultations — without the spam.</p>
            </div>
            <div><h4>Platform</h4><ul><li><a href="/">How It Works</a></li><li><a href="/budget-estimator">Budget Estimator</a></li><li><a href="/designers">Top Brands</a></li><li><a href="#">For Brands</a></li></ul></div>
            <div><h4>Company</h4><ul><li><a href="#">About Inzario</a></li><li><a href="#">Blog</a></li><li><a href="#">Contact Us</a></li><li><a href="#">FAQ</a></li></ul></div>
            <div><h4>Legal</h4><ul><li><a href="#">Terms of Service</a></li><li><a href="#">Privacy Policy</a></li><li><a href="#">Refund Policy</a></li></ul></div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Inzario. All rights reserved.</p>
            <div className="footer-bottom-links"><a href="#">Terms</a><a href="#">Privacy</a></div>
          </div>
        </div>
      </footer>

      {/* MOBILE BAR */}
      <div className="be-mobile-bar">
        <div className="be-mb-row">
          <div>
            <div className="be-mb-total-label">Estimated Budget</div>
            <div className="be-mb-total">₹{fL(t)}</div>
            <div className="be-mb-range">₹{fL(lo)} – ₹{fL(hi)}</div>
          </div>
          <button className="be-mb-expand" onClick={() => setSheetOpen(true)}>See Breakdown</button>
        </div>
      </div>

      {/* MOBILE SHEET */}
      {sheetOpen && (
        <>
          <div className="be-sheet-overlay active" onClick={() => setSheetOpen(false)}></div>
          <div className="be-sheet active">
            <div className="be-sheet-handle"></div>
            <div className="be-sheet-header">
              <span className="be-sheet-title">Budget Breakdown</span>
              <button className="be-sheet-close" onClick={() => setSheetOpen(false)}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="be-sheet-body">
              <div style={{textAlign:'center', padding:'8px 0 20px'}}>
                <div style={{fontFamily:"'Playfair Display',serif", fontSize:'40px', fontWeight:700}}>₹{fL(t)}</div>
                <div style={{fontSize:'13px', opacity:0.5, marginTop:'4px'}}>Range: ₹{fL(lo)} – ₹{fL(hi)}</div>
                <div style={{fontSize:'12px', opacity:0.35, marginTop:'8px'}}>{bhk} BHK · {area.toLocaleString('en-IN')} sqft · {city.name} · {mat.name} · {fin.name} · {tier.name}</div>
              </div>
              {rows.length > 0 && (
                <>
                  <div style={{fontSize:'10px', fontWeight:700, letterSpacing:'1px', textTransform:'uppercase', opacity:0.3, marginBottom:'10px'}}>Breakdown</div>
                  {rows.map(r => (
                    <div key={r.item.id} style={{display:'flex', justifyContent:'space-between', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,0.06)', fontSize:'14px'}}>
                      <span style={{opacity:0.8}}>{r.item.emoji} {r.item.name}{r.q > 1 && <span style={{opacity:0.5, fontSize:'11px'}}> ×{r.q}</span>}</span>
                      <span style={{fontWeight:700}}>₹{fL(r.cost)}</span>
                    </div>
                  ))}
                  <div style={{display:'flex', justifyContent:'space-between', padding:'14px 0 0', fontSize:'13px'}}>
                    <span style={{opacity:0.4}}>Per sqft</span>
                    <span style={{fontWeight:700}}>₹{ps.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}
              <div style={{marginTop:'20px', display:'flex', flexDirection:'column', gap:'8px'}}>
                <button style={{width:'100%', background:'var(--accent)', color:'white', border:'none', borderRadius:'10px', padding:'14px', fontSize:'14px', fontWeight:700, fontFamily:'inherit', cursor:'pointer'}}>Book a Free Consultation</button>
                <button style={{width:'100%', background:'white', color:'var(--primary)', border:'none', borderRadius:'10px', padding:'13px', fontSize:'13px', fontWeight:700, fontFamily:'inherit', cursor:'pointer'}} onClick={() => { setSheetOpen(false); window.location.href='/designers'; }}>Find Brands in This Budget</button>
              </div>
              <div style={{textAlign:'center', fontSize:'10px', opacity:0.2, marginTop:'16px'}}>⚠️ Indicative estimate. Actual costs vary.</div>
            </div>
          </div>
        </>
      )}
    </>
  );
}