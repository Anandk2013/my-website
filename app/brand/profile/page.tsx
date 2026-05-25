'use client';

import { useEffect, useState } from 'react';
import BrandNav from '@/components/BrandNav';
import { createClient } from '@/lib/supabase';

type BrandProfile = {
  id: string;
  name: string;
  gst_number: string | null;
  description: string | null;
  years_in_business: number | null;
  team_size: number | null;
  website: string | null;
  instagram: string | null;
  service_types: string[] | null;
  areas_served: string[] | null;
  budget_min: number | null;
  budget_max: number | null;
  design_styles: string[] | null;
  meeting_types: string[] | null;
  plan_type: string;
  slug: string | null;
};

const MEETING_TYPE_OPTIONS = [
  { value: 'video_call', emoji: '📹', label: 'Video Call', desc: 'Customer meets you online — no travel required' },
  { value: 'site_visit', emoji: '🏠', label: 'Site Visit', desc: 'You visit the customer at their home or project site' },
  { value: 'experience_center', emoji: '🏢', label: 'Experience Center', desc: 'Customer visits your office or studio' },
];

const SERVICES = [
  { id: 'full_home', emoji: '🏠', label: 'Full Home' },
  { id: 'kitchen', emoji: '🍳', label: 'Kitchen' },
  { id: 'wardrobe', emoji: '👔', label: 'Wardrobe' },
  { id: 'ceiling', emoji: '💡', label: 'Ceiling' },
  { id: 'painting', emoji: '🎨', label: 'Painting' },
  { id: 'bathroom', emoji: '🚿', label: 'Bathroom' },
  { id: 'commercial', emoji: '🏢', label: 'Commercial' },
  { id: 'furniture', emoji: '🪑', label: 'Furniture' },
  { id: 'vastu', emoji: '🙏', label: 'Vastu' },
];

const STYLES = ['Modern', 'Contemporary', 'Minimalist', 'Traditional', 'Scandinavian', 'Industrial'];

const DEFAULT_BUDGET_MIN = 3;
const DEFAULT_BUDGET_MAX = 50;

export default function BrandProfilePage() {
  const [brandId, setBrandId] = useState<string | null>(null);
  const [brandName, setBrandName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [planType, setPlanType] = useState('free');
  const [slug, setSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Editable fields
  const [description, setDescription] = useState('');
  const [years, setYears] = useState('');
  const [team, setTeam] = useState('');
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [localities, setLocalities] = useState<string[]>([]);
  const [newLoc, setNewLoc] = useState('');
  const [addingLoc, setAddingLoc] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<Set<string>>(new Set());
  const [budgetMin, setBudgetMin] = useState(DEFAULT_BUDGET_MIN);
  const [budgetMax, setBudgetMax] = useState(DEFAULT_BUDGET_MAX);
  const [selectedMeetingTypes, setSelectedMeetingTypes] = useState<Set<string>>(
    new Set(['video_call', 'site_visit', 'experience_center'])
  );

  // Snapshot for discard
  const [snapshot, setSnapshot] = useState<Partial<BrandProfile>>({});

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }

      const { data: b } = await supabase
        .from('brands')
        .select('id, name, gst_number, description, years_in_business, team_size, website, instagram, service_types, areas_served, budget_min, budget_max, design_styles, meeting_types, plan_type, slug')
        .eq('auth_user_id', session.user.id)
        .single();

      if (!b) { setLoading(false); return; }

      applyBrand(b as unknown as BrandProfile);
      setLoading(false);
    });
  }, []);

  function numToYears(n: number | null): string {
    if (n === null) return '';
    if (n < 1) return 'Less than 1 year';
    if (n <= 2) return '1–2 years';
    if (n <= 5) return '3–5 years';
    if (n <= 10) return '5–10 years';
    return '10+ years';
  }

  function numToTeam(n: number | null): string {
    if (n === null) return '';
    if (n <= 3) return '1–3 people';
    if (n <= 8) return '4–8 people';
    if (n <= 15) return '9–15 people';
    if (n <= 30) return '16–30 people';
    return '30+ people';
  }

  function applyBrand(b: BrandProfile) {
    setBrandId(b.id);
    setBrandName(b.name ?? '');
    setGstNumber(b.gst_number ?? '');
    setPlanType(b.plan_type ?? 'free');
    setSlug(b.slug ?? null);
    setDescription(b.description ?? '');
    setYears(numToYears(b.years_in_business));
    setTeam(numToTeam(b.team_size));
    setWebsite(b.website ?? '');
    setInstagram(b.instagram ?? '');
    setSelectedServices(new Set(b.service_types ?? []));
    setLocalities(b.areas_served ?? []);
    setSelectedStyles(new Set(b.design_styles ?? []));
    setBudgetMin(b.budget_min ?? DEFAULT_BUDGET_MIN);
    setBudgetMax(b.budget_max ?? DEFAULT_BUDGET_MAX);
    setSelectedMeetingTypes(new Set(b.meeting_types ?? ['video_call', 'site_visit', 'experience_center']));
    setSnapshot(b);
    setIsDirty(false);
  }

  function markDirty() { setIsDirty(true); }

  function toggleService(id: string) {
    setSelectedServices(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    markDirty();
  }

  function toggleMeetingType(value: string) {
    setSelectedMeetingTypes(prev => {
      if (prev.has(value) && prev.size === 1) return prev;
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
    markDirty();
  }

  function toggleStyle(s: string) {
    setSelectedStyles(prev => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
    markDirty();
  }

  function removeLocality(loc: string) {
    setLocalities(prev => prev.filter(l => l !== loc));
    markDirty();
  }

  function addLocality() {
    const trimmed = newLoc.trim();
    if (!trimmed) return;
    setLocalities(prev => [...prev, trimmed]);
    setNewLoc('');
    setAddingLoc(false);
    markDirty();
  }

  async function saveChanges() {
    if (!brandId) return;
    setSaving(true);
    const supabase = createClient();
    const yearsMap: Record<string, number> = { 'Less than 1 year': 0, '1–2 years': 1, '3–5 years': 3, '5–10 years': 5, '10+ years': 10 };
    const teamMap: Record<string, number> = { '1–3 people': 1, '4–8 people': 4, '9–15 people': 9, '16–30 people': 16, '30+ people': 30 };
    await supabase.from('brands').update({
      description,
      years_in_business: yearsMap[years] ?? null,
      team_size: teamMap[team] ?? null,
      website,
      instagram,
      service_types: Array.from(selectedServices),
      areas_served: localities,
      budget_min: budgetMin,
      budget_max: budgetMax,
      design_styles: Array.from(selectedStyles),
      meeting_types: Array.from(selectedMeetingTypes),
    }).eq('id', brandId);
    setSaving(false);
    setIsDirty(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
  }

  function discardChanges() {
    if (!snapshot) return;
    applyBrand(snapshot as BrandProfile);
    setIsDirty(false);
  }

  const budgetFillLeft = ((budgetMin - DEFAULT_BUDGET_MIN) / (100 - DEFAULT_BUDGET_MIN)) * 100;
  const budgetFillWidth = ((budgetMax - budgetMin) / (100 - DEFAULT_BUDGET_MIN)) * 100;

  if (loading) return (
    <div className="profile-page">
      <BrandNav />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading profile…</div>
      </div>
    </div>
  );

  if (!brandId) return (
    <div className="profile-page">
      <BrandNav />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>Brand profile not found.</div>
      </div>
    </div>
  );

  return (
    <div className="profile-page">
      <BrandNav />

      {/* Toast */}
      <div className={`pe-toast${showToast ? ' show' : ''}`}>
        ✅ Changes submitted for review. 24–48 hours.
      </div>

      <div className="profile-container">
        {/* Approval Banner */}
        <div className="approval-banner">
          <span className="approval-banner-icon">🔒</span>
          <div className="approval-banner-text">
            <strong>All profile changes are reviewed before going live.</strong>{' '}
            Edits typically take 24–48 hours to approve. Your current live profile remains visible until changes are approved.
          </div>
        </div>

        {/* Header */}
        <div className="profile-header">
          <div>
            <h1>Edit Profile</h1>
            <div className="profile-ph-sub">{brandName} · {planType === 'pro' ? 'Pro Plan' : 'Free Plan'}</div>
          </div>
          <div className="profile-ph-actions">
            {slug && (
              <a href={`/designers/${slug}`} target="_blank" rel="noreferrer">
                <button className="profile-ph-btn profile-ph-btn-preview">👁️ Preview Profile</button>
              </a>
            )}
            <button className="profile-ph-btn profile-ph-btn-save" onClick={saveChanges} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* ── Section 1: Company Details ── */}
        <div className="edit-section">
          <div className="es-header">
            <div className="es-title"><span>🏢</span> Company Details</div>
            <span className="status-badge live">Live</span>
          </div>
          <div className="es-body">
            <div className="pe-form-row">
              <div className="pe-form-group">
                <label className="pe-form-label">Company Name 🔒</label>
                <input type="text" className="pe-form-input disabled" value={brandName} disabled />
                <div className="pe-locked-note">🔒 Contact support to change your company name</div>
              </div>
              <div className="pe-form-group">
                <label className="pe-form-label">GST Number 🔒</label>
                <input type="text" className="pe-form-input disabled" value={gstNumber || '—'} disabled />
                <div className="pe-locked-note">🔒 Contact support to update GST</div>
              </div>
            </div>
            <div className="pe-form-row full">
              <div className="pe-form-group">
                <label className="pe-form-label">Company Description</label>
                <textarea
                  className="pe-form-input"
                  value={description}
                  onChange={e => { setDescription(e.target.value); markDirty(); }}
                />
                <div className="pe-char-count" style={{ color: description.length >= 100 ? 'var(--green)' : 'var(--ink-4)' }}>
                  {description.length} / 100 min
                </div>
              </div>
            </div>
            <div className="pe-form-row">
              <div className="pe-form-group">
                <label className="pe-form-label">Years in Business</label>
                <select className="pe-form-input" value={years} onChange={e => { setYears(e.target.value); markDirty(); }}>
                  <option value="">Select…</option>
                  {['Less than 1 year', '1–2 years', '3–5 years', '5–10 years', '10+ years'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div className="pe-form-group">
                <label className="pe-form-label">Team Size</label>
                <select className="pe-form-input" value={team} onChange={e => { setTeam(e.target.value); markDirty(); }}>
                  <option value="">Select…</option>
                  {['1–3 people', '4–8 people', '9–15 people', '16–30 people', '30+ people'].map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div className="pe-form-row">
              <div className="pe-form-group">
                <label className="pe-form-label">Website <span className="opt">(optional)</span></label>
                <input type="url" className="pe-form-input" value={website} onChange={e => { setWebsite(e.target.value); markDirty(); }} />
              </div>
              <div className="pe-form-group">
                <label className="pe-form-label">Instagram <span className="opt">(optional)</span></label>
                <input type="text" className="pe-form-input" value={instagram} onChange={e => { setInstagram(e.target.value); markDirty(); }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 2: Services & Coverage ── */}
        <div className="edit-section">
          <div className="es-header">
            <div className="es-title"><span>🛠️</span> Services &amp; Coverage</div>
            <span className="status-badge live">Live</span>
          </div>
          <div className="es-body">
            <label className="pe-form-label" style={{ marginBottom: 10, display: 'block' }}>Service Types</label>
            <div className="reg-check-grid" style={{ marginBottom: 20 }}>
              {SERVICES.map(s => (
                <div key={s.id} className={`reg-check-card${selectedServices.has(s.id) ? ' active' : ''}`} onClick={() => toggleService(s.id)}>
                  <div className="reg-check-box">{selectedServices.has(s.id) ? '✓' : ''}</div>
                  <span style={{ fontSize: 17 }}>{s.emoji}</span>
                  <span className="reg-check-card-label">{s.label}</span>
                </div>
              ))}
            </div>

            <label className="pe-form-label" style={{ marginBottom: 10, display: 'block' }}>Localities Served</label>
            <div className="inline-loc-tags">
              {localities.map(loc => (
                <span key={loc} className="inline-loc-tag">
                  {loc}
                  <span className="remove" onClick={() => removeLocality(loc)}>✕</span>
                </span>
              ))}
              {addingLoc ? (
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    className="pe-form-input"
                    style={{ width: 160, padding: '6px 12px', fontSize: 12 }}
                    placeholder="Locality name"
                    value={newLoc}
                    onChange={e => setNewLoc(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addLocality()}
                    autoFocus
                  />
                  <button className="add-loc-btn" onClick={addLocality}>Add</button>
                  <button className="add-loc-btn" onClick={() => { setAddingLoc(false); setNewLoc(''); }}>Cancel</button>
                </div>
              ) : (
                <button className="add-loc-btn" onClick={() => setAddingLoc(true)}>+ Add Locality</button>
              )}
            </div>

            <label className="pe-form-label" style={{ marginBottom: 8, marginTop: 20, display: 'block' }}>Budget Range</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>₹{budgetMin}L</span>
              <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>to</span>
              <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{budgetMax >= 100 ? '₹1Cr+' : `₹${budgetMax}L`}</span>
            </div>
            <div className="reg-budget-track">
              <div className="reg-budget-fill" style={{ left: `${budgetFillLeft}%`, width: `${budgetFillWidth}%` }}></div>
              <input type="range" className="reg-dual-range" min={DEFAULT_BUDGET_MIN} max={100} value={budgetMin} onChange={e => { setBudgetMin(Math.min(+e.target.value, budgetMax - 1)); markDirty(); }} />
              <input type="range" className="reg-dual-range" min={DEFAULT_BUDGET_MIN} max={100} value={budgetMax} onChange={e => { setBudgetMax(Math.max(+e.target.value, budgetMin + 1)); markDirty(); }} />
            </div>

            <label className="pe-form-label" style={{ marginBottom: 10, marginTop: 24, display: 'block' }}>Design Styles</label>
            <div className="reg-check-grid">
              {STYLES.map(s => (
                <div key={s} className={`reg-check-card${selectedStyles.has(s) ? ' active' : ''}`} onClick={() => toggleStyle(s)}>
                  <div className="reg-check-box">{selectedStyles.has(s) ? '✓' : ''}</div>
                  <span className="reg-check-card-label">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Section 3: Meeting Options ── */}
        <div className="edit-section">
          <div className="es-header">
            <div className="es-title"><span>📅</span> Meeting Options</div>
            <span className="status-badge live">Live</span>
          </div>
          <div className="es-body">
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.6 }}>
              Choose which consultation types customers can book with you. Disable any type you don&apos;t offer or charge separately for.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MEETING_TYPE_OPTIONS.map(m => {
                const enabled = selectedMeetingTypes.has(m.value);
                const isLast = selectedMeetingTypes.size === 1 && enabled;
                return (
                  <div key={m.value} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: 10,
                    background: enabled ? 'var(--accent-soft)' : 'var(--surface-2)',
                    border: `1px solid ${enabled ? 'var(--accent)' : 'var(--border)'}`,
                    transition: 'all 0.15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 22 }}>{m.emoji}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: enabled ? 'var(--accent)' : 'var(--ink)' }}>{m.label}</div>
                        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{m.desc}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMeetingType(m.value)}
                      title={isLast ? 'At least one meeting type must be enabled' : ''}
                      style={{
                        width: 44, height: 24, borderRadius: 12, border: 'none',
                        cursor: isLast ? 'not-allowed' : 'pointer',
                        background: enabled ? 'var(--accent)' : '#D1D5DB',
                        position: 'relative', transition: 'background 0.2s', flexShrink: 0,
                        opacity: isLast ? 0.5 : 1,
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: 2,
                        left: enabled ? 22 : 2,
                        width: 20, height: 20, background: 'white',
                        borderRadius: 10, transition: 'left 0.2s', display: 'block',
                      }} />
                    </button>
                  </div>
                );
              })}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 10 }}>
              At least one meeting type must remain enabled. Changes take effect immediately after saving.
            </div>
          </div>
        </div>

        {/* ── Section 4: Portfolio ── */}
        <div className="edit-section">
          <div className="es-header">
            <div className="es-title"><span>📸</span> Portfolio</div>
            <span className="status-badge live">Live</span>
          </div>
          <div className="es-body">
            <div className="portfolio-header">
              <div className="portfolio-count">
                Photo management coming soon
              </div>
              <button className="upload-btn" onClick={() => alert('Photo upload via Supabase Storage — coming soon')}>📤 Upload New</button>
            </div>
            <div style={{ padding: '24px', background: 'var(--surface-2)', borderRadius: 10, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
              Portfolio photo management will be available in the next update.
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Save Bar */}
      <div className={`save-bar${isDirty ? ' visible' : ''}`}>
        <div className="save-bar-inner">
          <div className="save-bar-text">You have <strong>unsaved changes</strong></div>
          <div className="save-bar-btns">
            <button className="sb-btn sb-discard" onClick={discardChanges}>Discard</button>
            <button className="sb-btn sb-save" onClick={saveChanges} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
