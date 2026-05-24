'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const LOCALITIES = ['Whitefield','Koramangala','Indiranagar','HSR Layout','Jayanagar','Marathahalli','Electronic City','Sarjapur Road','Bannerghatta Road','Hebbal','Yelahanka','JP Nagar','Malleshwaram','Rajajinagar','Basavanagudi','BTM Layout','Bellandur','Bommanahalli','Kanakapura Road','Thanisandra'];

const SERVICES = [
  { id:'full_home', emoji:'🏠', label:'Full Home' },
  { id:'kitchen', emoji:'🍳', label:'Kitchen' },
  { id:'wardrobe', emoji:'👔', label:'Wardrobe' },
  { id:'ceiling', emoji:'💡', label:'Ceiling' },
  { id:'painting', emoji:'🎨', label:'Painting' },
  { id:'bathroom', emoji:'🚿', label:'Bathroom' },
  { id:'commercial', emoji:'🏢', label:'Commercial' },
  { id:'furniture', emoji:'🪑', label:'Furniture' },
  { id:'vastu', emoji:'🙏', label:'Vastu' },
];

const STYLES = ['Modern','Contemporary','Minimalist','Traditional','Scandinavian','Industrial'];

const SAMPLE_PHOTOS = [
  { tag:'Full Home', bg:'linear-gradient(135deg,#E8D5B7,#C4A77D)', emoji:'🛋️', caption:'3BHK Modern Apartment, Whitefield' },
  { tag:'Kitchen', bg:'linear-gradient(135deg,#D4C5A9,#A89968)', emoji:'🍳', caption:'L-Shaped Modular Kitchen' },
  { tag:'Bedroom', bg:'linear-gradient(135deg,#B5C7D3,#8BA3B9)', emoji:'🛏️', caption:'Master Bedroom Suite, HSR Layout' },
  { tag:'Living Room', bg:'linear-gradient(135deg,#C7D5C0,#97B089)', emoji:'🪴', caption:'Open Plan Living, Sarjapur' },
  { tag:'Full Home', bg:'linear-gradient(135deg,#D5BFD5,#B391B3)', emoji:'✨', caption:'Luxury 4BHK Villa' },
  { tag:'Bathroom', bg:'linear-gradient(135deg,#C4D4E0,#8EAEC4)', emoji:'🚿', caption:'Spa Bathroom, JP Nagar' },
  { tag:'Wardrobe', bg:'linear-gradient(135deg,#E3D8C8,#C7B89A)', emoji:'👔', caption:'Walk-in Wardrobe, Koramangala' },
  { tag:'Kitchen', bg:'linear-gradient(135deg,#F0DAD2,#D4A898)', emoji:'🍳', caption:'U-Shaped Kitchen, Indiranagar' },
];

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export default function RegisterBrandPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [showPw, setShowPw] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [photosAdded, setPhotosAdded] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'pro'>('pro');
  const [selectedWallet, setSelectedWallet] = useState(5000);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const locRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    companyName: '', contactPerson: '', email: '', phone: '', password: '',
    description: '', yearsInBusiness: '', teamSize: '', gstNumber: '', website: '', instagram: '',
  });
  const [selectedServices, setSelectedServices] = useState(new Set(['full_home','kitchen','wardrobe']));
  const [selectedLocalities, setSelectedLocalities] = useState(new Set(['Koramangala','Indiranagar','HSR Layout','Whitefield','Jayanagar']));
  const [selectedStyles, setSelectedStyles] = useState(new Set(['Modern','Contemporary']));
  const [budgetMin, setBudgetMin] = useState(3);
  const [budgetMax, setBudgetMax] = useState(50);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  function toggleSet<T>(s: Set<T>, item: T): Set<T> {
    const next = new Set(s);
    next.has(item) ? next.delete(item) : next.add(item);
    return next;
  }

  const slugify = (name: string) =>
    name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    const supabase = createClient();
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: { role: 'brand' },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (authError) throw new Error(authError.message);

      const slug = slugify(form.companyName) || `brand-${Date.now()}`;
      const initials = form.companyName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

      await supabase.from('brands').insert({
        slug,
        name: form.companyName.trim(),
        location: selectedLocalities.size > 0 ? [...selectedLocalities][0] + ', Bangalore' : 'Bangalore',
        city: 'Bangalore',
        rating: 0,
        review_count: 0,
        is_verified: false,
        logo_initials: initials,
        tags: [...selectedServices].map(s => SERVICES.find(sv => sv.id === s)?.label ?? s),
        areas_served: [...selectedLocalities],
        recommend_pct: 0,
        description: form.description.trim(),
        phone: form.phone.trim() ? `+91 ${form.phone.trim()}` : null,
        email: form.email.trim(),
        contact_person: form.contactPerson.trim(),
        gst_number: form.gstNumber.trim() || null,
        website: form.website.trim() || null,
        instagram: form.instagram.trim() || null,
        design_styles: [...selectedStyles],
        budget_min: budgetMin,
        budget_max: budgetMax,
        plan_type: selectedPlan,
        wallet_balance: selectedWallet,
        status: 'pending_review',
        auth_user_id: authData.user?.id ?? null,
        service_types: [...selectedServices],
        years_in_business: form.yearsInBusiness ? parseInt(form.yearsInBusiness.split('–')[0]) || null : null,
        team_size: form.teamSize ? parseInt(form.teamSize.split('–')[0]) || null : null,
      });

      setStep(7);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const STEPS = ['Account', 'Company', 'Services', 'Portfolio', 'Plan', 'Review'];

  const ChevronRight = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
  );
  const ChevronLeft = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
  );

  return (
    <div className="reg-page">
      <nav className="navbar">
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <Link href="/" className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="logo-text">Inzario</span>
          </Link>
          <Link href="/login" style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Need help?
          </Link>
        </div>
      </nav>

      <div className="reg-wizard">

        {/* Progress bar */}
        {step < 7 && (
          <div className="reg-progress-wrap">
            <div className="reg-progress-steps">
              {STEPS.map((label, idx) => {
                const n = idx + 1;
                const isActive = n === step;
                const isDone = n < step;
                return (
                  <>
                    <div key={n} className={`rp-step${isActive ? ' active' : isDone ? ' done' : ''}`}>
                      <div className="rp-dot">{isDone ? '✓' : n}</div>
                      <div className="rp-label">{label}</div>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="rp-line" key={`line-${n}`}>
                        <div className="rp-line-fill" style={{ width: isDone ? '100%' : '0%' }}></div>
                      </div>
                    )}
                  </>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 1: Account ── */}
        <div className={`reg-step${step === 1 ? ' active' : ''}`}>
          <div className="reg-step-header">
            <div className="reg-step-num">Step 1 of 6</div>
            <div className="reg-step-title">Create your account</div>
            <div className="reg-step-desc">Basic details to get your brand registered on Inzario.</div>
          </div>
          <div className="reg-form-card">
            <div className="reg-form-row full">
              <div className="reg-form-group">
                <label className="reg-form-label">Company Name <span className="req">*</span></label>
                <input className="reg-form-input" type="text" placeholder="e.g., Artisan Interiors Pvt Ltd" value={form.companyName} onChange={set('companyName')} />
              </div>
            </div>
            <div className="reg-form-row">
              <div className="reg-form-group">
                <label className="reg-form-label">Contact Person <span className="req">*</span></label>
                <input className="reg-form-input" type="text" placeholder="Full name" value={form.contactPerson} onChange={set('contactPerson')} />
              </div>
              <div className="reg-form-group">
                <label className="reg-form-label">Email <span className="req">*</span></label>
                <input className="reg-form-input" type="email" placeholder="you@company.com" value={form.email} onChange={set('email')} />
              </div>
            </div>
            <div className="reg-form-row full">
              <div className="reg-form-group">
                <label className="reg-form-label">Phone Number <span className="req">*</span></label>
                <div className="reg-phone-row">
                  <div className="reg-phone-prefix">🇮🇳 +91</div>
                  <input className="reg-form-input" type="tel" placeholder="10-digit number" maxLength={10} value={form.phone} onChange={set('phone')} />
                </div>
              </div>
            </div>
            <div className="reg-form-row full">
              <div className="reg-form-group">
                <label className="reg-form-label">Password <span className="req">*</span></label>
                <div className="reg-pw-wrap">
                  <input className="reg-form-input" type={showPw ? 'text' : 'password'} placeholder="Min 8 characters" value={form.password} onChange={set('password')} />
                  <button className="reg-pw-toggle" type="button" onClick={() => setShowPw(v => !v)}>{showPw ? 'Hide' : 'Show'}</button>
                </div>
              </div>
            </div>
          </div>
          <div className="reg-step-nav">
            <div></div>
            <button className="reg-btn-next" onClick={() => setStep(2)} disabled={!form.companyName || !form.contactPerson || !form.email || !form.phone || form.password.length < 8}>
              Continue <ChevronRight />
            </button>
          </div>
        </div>

        {/* ── STEP 2: Company ── */}
        <div className={`reg-step${step === 2 ? ' active' : ''}`}>
          <div className="reg-step-header">
            <div className="reg-step-num">Step 2 of 6</div>
            <div className="reg-step-title">Tell us about your company</div>
            <div className="reg-step-desc">Help homeowners learn about your brand before they book.</div>
          </div>
          <div className="reg-form-card">
            <div className="reg-form-row full">
              <div className="reg-form-group">
                <label className="reg-form-label">Company Description <span className="req">*</span></label>
                <textarea className="reg-form-input" placeholder="Describe your company, specializations, and what makes you different..." value={form.description} onChange={set('description')} />
                <div className="reg-char-count" style={{ color: form.description.length >= 100 ? 'var(--green)' : 'var(--ink-4)' }}>
                  {form.description.length} / 100 min characters
                </div>
              </div>
            </div>
            <div className="reg-tip">💡 A detailed description helps homeowners understand your expertise. Mention your specialties, experience, and what sets you apart.</div>
            <div className="reg-form-row" style={{ marginTop: 20 }}>
              <div className="reg-form-group">
                <label className="reg-form-label">Years in Business <span className="req">*</span></label>
                <select className="reg-form-input" value={form.yearsInBusiness} onChange={set('yearsInBusiness')}>
                  <option value="">Select</option>
                  <option>Less than 1 year</option>
                  <option>1–2 years</option>
                  <option>3–5 years</option>
                  <option>5–10 years</option>
                  <option>10+ years</option>
                </select>
              </div>
              <div className="reg-form-group">
                <label className="reg-form-label">Team Size <span className="req">*</span></label>
                <select className="reg-form-input" value={form.teamSize} onChange={set('teamSize')}>
                  <option value="">Select</option>
                  <option>1–3 people</option>
                  <option>4–8 people</option>
                  <option>9–15 people</option>
                  <option>16–30 people</option>
                  <option>30+ people</option>
                </select>
              </div>
            </div>
            <div className="reg-form-row">
              <div className="reg-form-group">
                <label className="reg-form-label">GST Number <span className="opt">(optional)</span></label>
                <input className="reg-form-input" type="text" placeholder="e.g., 29ABCDE1234F1Z5" value={form.gstNumber} onChange={set('gstNumber')} />
              </div>
              <div className="reg-form-group">
                <label className="reg-form-label">Website <span className="opt">(optional)</span></label>
                <input className="reg-form-input" type="url" placeholder="https://" value={form.website} onChange={set('website')} />
              </div>
            </div>
            <div className="reg-form-row full">
              <div className="reg-form-group">
                <label className="reg-form-label">Instagram <span className="opt">(optional)</span></label>
                <input className="reg-form-input" type="text" placeholder="@yourbrand" value={form.instagram} onChange={set('instagram')} />
              </div>
            </div>
          </div>
          <div className="reg-step-nav">
            <button className="reg-btn-back" onClick={() => setStep(1)}><ChevronLeft /> Back</button>
            <button className="reg-btn-next" onClick={() => setStep(3)} disabled={form.description.length < 100 || !form.yearsInBusiness || !form.teamSize}>
              Continue <ChevronRight />
            </button>
          </div>
        </div>

        {/* ── STEP 3: Services ── */}
        <div className={`reg-step${step === 3 ? ' active' : ''}`}>
          <div className="reg-step-header">
            <div className="reg-step-num">Step 3 of 6</div>
            <div className="reg-step-title">Your services & coverage</div>
            <div className="reg-step-desc">What you offer, where you operate, and your budget range.</div>
          </div>

          <div className="reg-form-card">
            <label className="reg-form-label" style={{ marginBottom: 12 }}>Service Types <span className="req">*</span></label>
            <div className="reg-check-grid">
              {SERVICES.map(s => (
                <div key={s.id} className={`reg-check-card${selectedServices.has(s.id) ? ' active' : ''}`} onClick={() => setSelectedServices(prev => toggleSet(prev, s.id))}>
                  <div className="reg-check-box">{selectedServices.has(s.id) ? '✓' : ''}</div>
                  <span style={{ fontSize: 18 }}>{s.emoji}</span>
                  <span className="reg-check-card-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reg-form-card">
            <label className="reg-form-label" style={{ marginBottom: 12 }}>Localities Served <span className="req">*</span></label>
            <div className="reg-loc-wrap" ref={locRef}>
              <div className="reg-loc-trigger" onClick={() => setLocOpen(v => !v)}>
                <span>{selectedLocalities.size > 0 ? `${selectedLocalities.size} localities selected` : 'Select localities…'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ transform: locOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              {locOpen && (
                <div className="reg-loc-panel">
                  {LOCALITIES.map(loc => (
                    <div key={loc} className={`reg-loc-item${selectedLocalities.has(loc) ? ' selected' : ''}`} onClick={() => setSelectedLocalities(prev => toggleSet(prev, loc))}>
                      <div className="reg-loc-check">{selectedLocalities.has(loc) ? '✓' : ''}</div>
                      {loc}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {selectedLocalities.size > 0 && (
              <div className="reg-selected-locs">
                {[...selectedLocalities].map(loc => (
                  <span key={loc} className="reg-loc-tag">
                    {loc}
                    <span style={{ cursor: 'pointer', opacity: 0.6 }} onClick={() => setSelectedLocalities(prev => toggleSet(prev, loc))}>✕</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="reg-form-card">
            <label className="reg-form-label" style={{ marginBottom: 8 }}>Budget Range You Handle <span className="req">*</span></label>
            <div className="reg-budget-wrap">
              <div className="reg-budget-labels">
                <span className="reg-budget-val">₹{budgetMin}L</span>
                <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>to</span>
                <span className="reg-budget-val">{budgetMax >= 100 ? '₹1Cr+' : `₹${budgetMax}L`}</span>
              </div>
              <div className="reg-budget-track">
                <div className="reg-budget-fill" style={{ left: `${((budgetMin - 3) / 97) * 100}%`, width: `${((budgetMax - budgetMin) / 97) * 100}%` }}></div>
                <input type="range" className="reg-dual-range" min={3} max={100} value={budgetMin} onChange={e => setBudgetMin(Math.min(+e.target.value, budgetMax - 1))} />
                <input type="range" className="reg-dual-range" min={3} max={100} value={budgetMax} onChange={e => setBudgetMax(Math.max(+e.target.value, budgetMin + 1))} />
              </div>
            </div>
          </div>

          <div className="reg-form-card">
            <label className="reg-form-label" style={{ marginBottom: 12 }}>Design Styles <span className="opt">(optional)</span></label>
            <div className="reg-check-grid">
              {STYLES.map(s => (
                <div key={s} className={`reg-check-card${selectedStyles.has(s) ? ' active' : ''}`} onClick={() => setSelectedStyles(prev => toggleSet(prev, s))}>
                  <div className="reg-check-box">{selectedStyles.has(s) ? '✓' : ''}</div>
                  <span className="reg-check-card-label">{s}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reg-step-nav">
            <button className="reg-btn-back" onClick={() => setStep(2)}><ChevronLeft /> Back</button>
            <button className="reg-btn-next" onClick={() => setStep(4)} disabled={selectedServices.size === 0 || selectedLocalities.size === 0}>
              Continue <ChevronRight />
            </button>
          </div>
        </div>

        {/* ── STEP 4: Portfolio ── */}
        <div className={`reg-step${step === 4 ? ' active' : ''}`}>
          <div className="reg-step-header">
            <div className="reg-step-num">Step 4 of 6</div>
            <div className="reg-step-title">Showcase your work</div>
            <div className="reg-step-desc">Upload your best project photos. This is what homeowners see first.</div>
          </div>
          <div className="reg-form-card">
            {!photosAdded ? (
              <div className="reg-upload-area" onClick={() => setPhotosAdded(true)}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>📸</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 4 }}>Click to upload or drag and drop</div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>JPG, PNG up to 5MB each · Min 6, max 20 images</div>
              </div>
            ) : (
              <div className="reg-photo-grid">
                {SAMPLE_PHOTOS.map((p, i) => (
                  <div key={i} className={`reg-photo-card${i === 0 ? ' cover' : ''}`}>
                    <div className="reg-photo-placeholder" style={{ background: p.bg }}>{p.emoji}</div>
                    {i === 0 && <span className="reg-photo-badge cover">★ Cover</span>}
                    <span className="reg-photo-badge type">{p.tag}</span>
                  </div>
                ))}
              </div>
            )}
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 16, textAlign: 'center' }}>
              Uploaded: <strong style={{ color: 'var(--accent)' }}>{photosAdded ? 8 : 0}</strong> / 20 images (min 6 required)
            </div>
            <div className="reg-tip" style={{ marginTop: 16 }}>💡 Quality photos are the #1 factor homeowners look at when choosing a brand. Show completed projects, not 3D renders.</div>
          </div>
          <div className="reg-step-nav">
            <button className="reg-btn-back" onClick={() => setStep(3)}><ChevronLeft /> Back</button>
            <button className="reg-btn-next" onClick={() => setStep(5)}>Continue <ChevronRight /></button>
          </div>
        </div>

        {/* ── STEP 5: Plan ── */}
        <div className={`reg-step${step === 5 ? ' active' : ''}`}>
          <div className="reg-step-header">
            <div className="reg-step-num">Step 5 of 6</div>
            <div className="reg-step-title">Choose your plan</div>
            <div className="reg-step-desc">Start free or go Pro for maximum visibility and lower meeting costs.</div>
          </div>
          <div className="reg-plan-grid">
            <div className={`reg-plan-card${selectedPlan === 'free' ? ' active' : ''}`} onClick={() => setSelectedPlan('free')}>
              <div className="reg-plan-name">Free</div>
              <div className="reg-plan-price"><strong>₹0</strong>/month</div>
              <ul className="reg-plan-features">
                <li>Basic brand profile</li>
                <li>Up to 5 portfolio images</li>
                <li>Appear in search results</li>
                <li>Pay-per-meeting at MRP rates</li>
              </ul>
              <button className="reg-plan-btn reg-plan-btn-free">Start Free</button>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Meeting Rates (MRP)</div>
                {[['📹 Video Call', '₹4,000'], ['🏠 Site Visit', '₹5,000'], ['🏢 Experience Center', '₹7,000']].map(([t, p]) => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-3)' }}>{t}</span><span style={{ fontWeight: 700 }}>{p}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className={`reg-plan-card pro-card${selectedPlan === 'pro' ? ' active' : ''}`} onClick={() => setSelectedPlan('pro')}>
              <div className="reg-plan-name">Pro</div>
              <div className="reg-plan-price"><strong>₹10,000</strong>/month</div>
              <ul className="reg-plan-features">
                <li>Unlimited portfolio images</li>
                <li>✓ Verified badge on profile</li>
                <li>Featured placement in search</li>
                <li>Analytics dashboard</li>
                <li>2 free meetings/month included</li>
                <li>50% off on all meeting rates</li>
              </ul>
              <button className="reg-plan-btn reg-plan-btn-pro">Start Pro</button>
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Meeting Rates (50% Off)</div>
                {[['📹 Video Call', '₹2,000', '₹4K'], ['🏠 Site Visit', '₹2,500', '₹5K'], ['🏢 Experience Center', '₹3,500', '₹7K']].map(([t, p, old]) => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-3)' }}>{t}</span>
                    <span style={{ fontWeight: 700 }}>{p} <s style={{ color: 'var(--ink-4)', fontWeight: 400, fontSize: 11 }}>{old}</s></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="reg-wallet">
            <div className="reg-wallet-title">💳 Wallet Recharge</div>
            <div className="reg-wallet-desc">Minimum ₹5,000 to start receiving consultations. Meetings are auto-deducted from your wallet balance.</div>
            <div className="reg-wallet-amounts">
              {[5000, 10000, 20000, 50000].map(amt => (
                <button key={amt} className={`reg-wallet-amount${selectedWallet === amt ? ' active' : ''}`} onClick={() => setSelectedWallet(amt)}>
                  ₹{(amt / 1000).toFixed(0)}K
                </button>
              ))}
            </div>
            <div className="reg-wallet-btns">
              <button className="reg-wallet-pay" onClick={() => alert('Razorpay checkout would open here.')}>Pay via Razorpay</button>
              <button className="reg-wallet-skip" onClick={() => setStep(6)}>Skip for now</button>
            </div>
          </div>

          <div className="reg-step-nav">
            <button className="reg-btn-back" onClick={() => setStep(4)}><ChevronLeft /> Back</button>
            <button className="reg-btn-next" onClick={() => setStep(6)}>Review &amp; Submit <ChevronRight /></button>
          </div>
        </div>

        {/* ── STEP 6: Review ── */}
        <div className={`reg-step${step === 6 ? ' active' : ''}`}>
          <div className="reg-step-header">
            <div className="reg-step-num">Step 6 of 6</div>
            <div className="reg-step-title">Review & submit</div>
            <div className="reg-step-desc">Double-check everything before submitting for verification.</div>
          </div>

          {submitError && (
            <div style={{ background: '#FEF2F2', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#DC2626', marginBottom: 16 }}>
              {submitError}
            </div>
          )}

          <div className="reg-review-section">
            <div className="reg-review-header">
              <span className="reg-review-title">🏢 Account & Company</span>
              <button className="reg-review-edit" onClick={() => setStep(1)}>Edit →</button>
            </div>
            <div className="reg-review-row"><span className="reg-review-label">Company</span><span className="reg-review-val">{form.companyName || '—'}</span></div>
            <div className="reg-review-row"><span className="reg-review-label">Contact</span><span className="reg-review-val">{form.contactPerson || '—'}</span></div>
            <div className="reg-review-row"><span className="reg-review-label">Email</span><span className="reg-review-val">{form.email || '—'}</span></div>
            <div className="reg-review-row"><span className="reg-review-label">Phone</span><span className="reg-review-val">+91 {form.phone || '—'}</span></div>
            <div className="reg-review-row"><span className="reg-review-label">Experience</span><span className="reg-review-val">{form.yearsInBusiness} · {form.teamSize}</span></div>
          </div>

          <div className="reg-review-section">
            <div className="reg-review-header">
              <span className="reg-review-title">🛠️ Services & Coverage</span>
              <button className="reg-review-edit" onClick={() => setStep(3)}>Edit →</button>
            </div>
            <div className="reg-review-row">
              <span className="reg-review-label">Services</span>
              <span className="reg-review-val">
                <div className="reg-review-tags">{[...selectedServices].map(s => <span key={s} className="reg-review-tag">{SERVICES.find(sv => sv.id === s)?.label}</span>)}</div>
              </span>
            </div>
            <div className="reg-review-row">
              <span className="reg-review-label">Localities</span>
              <span className="reg-review-val">
                <div className="reg-review-tags">{[...selectedLocalities].slice(0, 4).map(l => <span key={l} className="reg-review-tag">{l}</span>)}{selectedLocalities.size > 4 && <span className="reg-review-tag">+{selectedLocalities.size - 4} more</span>}</div>
              </span>
            </div>
            <div className="reg-review-row"><span className="reg-review-label">Budget Range</span><span className="reg-review-val">₹{budgetMin}L – {budgetMax >= 100 ? '₹1Cr+' : `₹${budgetMax}L`}</span></div>
          </div>

          <div className="reg-review-section">
            <div className="reg-review-header">
              <span className="reg-review-title">📸 Portfolio</span>
              <button className="reg-review-edit" onClick={() => setStep(4)}>Edit →</button>
            </div>
            <div className="reg-review-row"><span className="reg-review-label">Images</span><span className="reg-review-val">{photosAdded ? '8 uploaded (1 cover)' : '0 uploaded'}</span></div>
          </div>

          <div className="reg-review-section">
            <div className="reg-review-header">
              <span className="reg-review-title">💳 Plan & Wallet</span>
              <button className="reg-review-edit" onClick={() => setStep(5)}>Edit →</button>
            </div>
            <div className="reg-review-row"><span className="reg-review-label">Plan</span><span className="reg-review-val" style={{ color: 'var(--accent)', fontWeight: 700 }}>{selectedPlan === 'pro' ? 'Pro — ₹10,000/mo' : 'Free'}</span></div>
            <div className="reg-review-row"><span className="reg-review-label">Wallet</span><span className="reg-review-val">₹{selectedWallet.toLocaleString('en-IN')} recharge</span></div>
          </div>

          <div className="reg-step-nav">
            <button className="reg-btn-back" onClick={() => setStep(5)}><ChevronLeft /> Back</button>
            <button className="reg-btn-next" style={{ padding: '14px 36px', fontSize: 15 }} onClick={handleSubmit} disabled={submitting}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              {submitting ? 'Submitting…' : 'Submit for Verification'}
            </button>
          </div>
        </div>

        {/* ── STEP 7: Success ── */}
        <div className={`reg-step${step === 7 ? ' active' : ''}`}>
          <div className="reg-success">
            <div className="reg-success-check">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="reg-success-title">Registration submitted!</div>
            <div className="reg-success-sub">Our team will review your profile and verify your brand within 24–48 hours. We'll notify you via email.</div>
            <div className="reg-success-badge">⏳ Under Review — 24 to 48 hours</div>
            <div style={{ marginTop: 28 }}>
              <Link href="/brand/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--accent)', color: 'white', borderRadius: 12, padding: '14px 32px', fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' }}>
                Go to Your Dashboard <ChevronRight />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
