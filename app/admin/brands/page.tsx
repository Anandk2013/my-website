'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { createClient } from '@/lib/supabase';

type TabType = 'customers' | 'brands' | 'flagged';
type DrawerType = 'customer' | 'brand' | null;

type RealCustomer = {
  id: string; initials: string; name: string; email: string;
  phone: string; bookings: number; reviews: number; flags: number; status: string;
};
type RealBrand = {
  id: string; initials: string; name: string; sub: string;
  tier: string; wallet: string; meetings: number; rating: string; status: string;
};

export default function AdminBrandsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('customers');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<DrawerType>(null);
  const [modal, setModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [toast, setToast] = useState({ show: false, color: 'green', msg: '' });
  const [customers, setCustomers] = useState<RealCustomer[]>([]);
  const [brands, setBrands] = useState<RealBrand[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [customerStatuses, setCustomerStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('brands').select('id, name, logo_initials, location, plan_type, wallet_balance, rating, review_count, status, is_verified, created_at').order('created_at', { ascending: false }),
      supabase.from('bookings').select('id, homeowner_name, homeowner_email, homeowner_phone, status, reviewed_at, brand_id').order('created_at', { ascending: false }),
    ]).then(([{ data: brandsData }, { data: bookingsData }]) => {
      // Build brands list with meeting counts
      const bookingsByBrand: Record<string, number> = {};
      (bookingsData ?? []).forEach(b => {
        bookingsByBrand[b.brand_id] = (bookingsByBrand[b.brand_id] ?? 0) + 1;
      });
      setBrands((brandsData ?? []).map(b => ({
        id: b.id,
        initials: b.logo_initials ?? b.name.slice(0, 2).toUpperCase(),
        name: b.name,
        sub: `${b.location} · Since ${new Date(b.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`,
        tier: b.plan_type === 'pro' ? 'Pro' : 'Free',
        wallet: `₹${(b.wallet_balance ?? 0).toLocaleString('en-IN')}`,
        meetings: bookingsByBrand[b.id] ?? 0,
        rating: b.rating?.toString() ?? '—',
        status: b.status ?? 'active',
      })));

      // Build customers from unique emails in bookings
      const emailMap: Record<string, RealCustomer> = {};
      (bookingsData ?? []).forEach((b, i) => {
        if (!b.homeowner_email) return;
        if (!emailMap[b.homeowner_email]) {
          const name = b.homeowner_name ?? b.homeowner_email.split('@')[0];
          emailMap[b.homeowner_email] = {
            id: b.homeowner_email,
            initials: name.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase(),
            name,
            email: b.homeowner_email,
            phone: b.homeowner_phone ?? '—',
            bookings: 0,
            reviews: 0,
            flags: 0,
            status: 'active',
          };
        }
        emailMap[b.homeowner_email].bookings++;
        if (b.reviewed_at) emailMap[b.homeowner_email].reviews++;
      });
      const custList = Object.values(emailMap).sort((a, b) => b.bookings - a.bookings);
      setCustomers(custList);
      setCustomerStatuses(Object.fromEntries(custList.map(c => [c.id, c.status])));
      setLoadingData(false);
    });
  }, []);

  function showToast(color: string, msg: string) {
    setToast({ show: true, color, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }

  function openDrawer(type: DrawerType) {
    setDrawer(type);
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    setDrawer(null);
    document.body.style.overflow = '';
  }

  function handleSuspend() {
    setModal(false);
    setSuspendReason('');
    setAdminNotes('');
    document.body.style.overflow = '';
    showToast('red', '🚫 User suspended');
  }

  return (
    <div className="adm-page">
      <AdminNav />

      {/* Toast */}
      <div className={`adm-toast ${toast.color}${toast.show ? ' show' : ''}`}>{toast.msg}</div>

      <div className="adm-container">
        <div className="adm-page-header">
          <h1>User Management</h1>
          <div className="adm-ph-sub">Search, review, and manage customers and brands</div>
        </div>

        {/* Search */}
        <div className="adm-search-bar">
          <div className="adm-search-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              className="adm-search-input"
              placeholder="Search by name, phone number, or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select className="adm-search-type-select">
            <option>All Users</option>
            <option>Customers Only</option>
            <option>Brands Only</option>
          </select>
          <button className="adm-search-btn">Search</button>
        </div>

        {/* Tabs */}
        <div className="adm-um-tabs">
          {[
            { id: 'customers', label: 'Customers', count: loadingData ? '…' : customers.length.toString(), danger: false },
            { id: 'brands', label: 'Brands', count: loadingData ? '…' : brands.length.toString(), danger: false },
            { id: 'flagged', label: 'Flagged', count: '0', danger: false },
          ].map(t => (
            <button
              key={t.id}
              className={`adm-um-tab-btn${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id as TabType)}
            >
              {t.label}
              <span className={`adm-um-tab-count${t.danger ? ' danger' : ''}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── CUSTOMERS ── */}
        <div className={`adm-um-tab-panel${activeTab === 'customers' ? ' active' : ''}`}>
          <div className="adm-data-card">
            <div className="adm-dc-header">
              <div className="adm-dc-title">
                👤 Customers
                <span style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 500, marginLeft: 4 }}>{customers.length} total</span>
              </div>
              <button className="adm-dc-btn" onClick={() => alert('Export CSV')}>📥 Export</button>
            </div>
            <div className="adm-filter-row">
              {[['All Status', 'Active', 'Suspended'], ['All Cities', 'Bengaluru', 'Mumbai', 'Delhi NCR', 'Hyderabad'], ['Sort: Recent', 'Most Bookings', 'Most Flags', 'Name A–Z']].map((opts, i) => (
                <select key={i} className="adm-filter-sel">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-tbl">
                <thead>
                  <tr>
                    <th>Customer</th><th>Phone</th><th>City</th>
                    <th>Bookings</th><th>Reviews</th><th>Flags</th>
                    <th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(search ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())) : customers).map(c => {
                    const status = customerStatuses[c.id] ?? c.status;
                    const isSuspended = status === 'suspended';
                    return (
                      <tr key={c.id} style={isSuspended ? { background: 'var(--red-soft)' } : {}}>
                        <td>
                          <div className="adm-user-cell">
                            <div className={`adm-u-avatar ${isSuspended ? 'flagged' : 'customer'}`}>{c.initials}</div>
                            <div>
                              <div className="adm-u-name">{c.name}</div>
                              <div className="adm-u-contact">{c.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontSize: 13, color: 'var(--ink-3)' }}>{c.phone}</td>
                        <td>{c.city}</td>
                        <td><strong>{c.bookings}</strong></td>
                        <td>{c.reviews}</td>
                        <td>
                          {c.flags > 0
                            ? <span style={{ color: c.flags >= 3 ? 'var(--red)' : 'var(--gold)', fontWeight: 700 }}>{c.flags}</span>
                            : 0}
                        </td>
                        <td><span className={`adm-pill ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                            <button className="adm-act-btn view" onClick={() => openDrawer('customer')}>👁️ View</button>
                            {isSuspended ? (
                              <button className="adm-act-btn unsuspend" onClick={() => { setCustomerStatuses(s => ({ ...s, [c.id]: 'active' })); showToast('green', '✓ User unsuspended'); }}>Unsuspend</button>
                            ) : c.flags > 0 ? (
                              <button className="adm-act-btn warn" onClick={() => { setModal(true); document.body.style.overflow = 'hidden'; }}>⚠️</button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── BRANDS ── */}
        <div className={`adm-um-tab-panel${activeTab === 'brands' ? ' active' : ''}`}>
          <div className="adm-data-card">
            <div className="adm-dc-header">
              <div className="adm-dc-title">
                🏢 Brands
                <span style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 500, marginLeft: 4 }}>{brands.length} total</span>
              </div>
              <button className="adm-dc-btn" onClick={() => alert('Export CSV')}>📥 Export</button>
            </div>
            <div className="adm-filter-row">
              {[['All Tiers', 'Pro', 'Free'], ['All Status', 'Active', 'Paused', 'Suspended'], ['Sort: Revenue', 'Most Meetings', 'Highest Rated', 'Name A–Z', 'Newest']].map((opts, i) => (
                <select key={i} className="adm-filter-sel">
                  {opts.map(o => <option key={o}>{o}</option>)}
                </select>
              ))}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-tbl">
                <thead>
                  <tr>
                    <th>Brand</th><th>Tier</th><th>Wallet</th>
                    <th>Meetings</th><th>Rating</th>
                    <th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(search ? brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase())) : brands).map(b => (
                    <tr key={b.id}>
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-u-avatar brand">{b.initials}</div>
                          <div>
                            <div className="adm-u-name">{b.name}</div>
                            <div className="adm-u-contact">{b.sub}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`adm-pill ${b.tier.toLowerCase()}`}>{b.tier}</span></td>
                      <td><strong>{b.wallet}</strong></td>
                      <td>{b.meetings}</td>
                      <td>⭐ {b.rating}</td>
                      <td><span className={`adm-pill ${b.status}`}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <button className="adm-act-btn view" onClick={() => openDrawer('brand')}>👁️ View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── FLAGGED ── */}
        <div className={`adm-um-tab-panel${activeTab === 'flagged' ? ' active' : ''}`}>
          <div style={{ background: 'var(--red-soft)', border: '1px solid rgba(220,38,38,.12)', borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#991B1B' }}>
            <span style={{ fontSize: 18 }}>🚩</span>
            <div><strong>6 users with 3+ fake lead reports.</strong> Review and take action — patterns of abuse need suspension to protect brand trust.</div>
          </div>
          <div className="adm-data-card">
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-tbl">
                <thead>
                  <tr>
                    <th>Customer</th><th>Phone</th><th>Total Bookings</th>
                    <th>Fake Reports</th><th>Reporting Brands</th>
                    <th>First Flagged</th><th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {FLAGGED.map(f => (
                    <tr key={f.id} style={{ background: 'rgba(220,38,38,.03)' }}>
                      <td>
                        <div className="adm-user-cell">
                          <div className="adm-u-avatar flagged">{f.initials}</div>
                          <div>
                            <div className="adm-u-name">{f.name}</div>
                            <div className="adm-u-contact">{f.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--ink-3)' }}>{f.phone}</td>
                      <td>{f.bookings}</td>
                      <td><span className="adm-pill flag">{f.reports} reports</span></td>
                      <td style={{ fontSize: 12, color: 'var(--ink-3)' }}>{f.brands}</td>
                      <td style={{ fontSize: 12, color: 'var(--ink-4)' }}>{f.firstFlagged}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 5, justifyContent: 'flex-end' }}>
                          <button className="adm-act-btn view" onClick={() => openDrawer('customer')}>👁️ Review</button>
                          <button className="adm-act-btn suspend" onClick={() => { setModal(true); document.body.style.overflow = 'hidden'; }}>🚫 Suspend</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── CUSTOMER DRAWER ── */}
      <div className={`adm-drawer-overlay${drawer === 'customer' ? ' active' : ''}`} onClick={closeDrawer} />
      <div className={`adm-drawer${drawer === 'customer' ? ' active' : ''}`}>
        <div className="adm-drawer-header">
          <span className="adm-drawer-title">Customer Profile</span>
          <button className="adm-drawer-close" onClick={closeDrawer}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="adm-drawer-body">
          <div className="adm-dp-header">
            <div className="adm-dp-avatar" style={{ background: '#EFF6FF', color: '#3B82F6' }}>PS</div>
            <div>
              <div className="adm-dp-name">Priya Sharma</div>
              <div className="adm-dp-meta">+91 98765 43210 · priya.s@gmail.com · Bengaluru</div>
              <div className="adm-dp-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                Joined: Jan 15, 2026 · <span className="adm-pill active">Active</span>
              </div>
            </div>
          </div>

          <div className="adm-dp-stats">
            {[{ num: '8', label: 'Total Bookings' }, { num: '5', label: 'Reviews Given' }, { num: '0', label: 'Flags' }].map(s => (
              <div key={s.label} className="adm-dp-stat">
                <div className="adm-dp-stat-num">{s.num}</div>
                <div className="adm-dp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="adm-dp-section">
            <div className="adm-dp-section-title">📅 All Bookings</div>
            {[
              { brand: 'Artisan Interiors', detail: '📹 Video Call · Apr 17, 2026', status: 'Upcoming', color: 'var(--green-soft)', text: 'var(--green)' },
              { brand: 'SpaceWell Interiors', detail: '🏠 Site Visit · Apr 20, 2026', status: 'Upcoming', color: 'var(--green-soft)', text: 'var(--green)' },
              { brand: 'Livora Interiors', detail: '📹 Video Call · Apr 8, 2026', status: 'Completed', color: 'var(--green-soft)', text: 'var(--green)' },
              { brand: 'KitchenKraft India', detail: '🏢 Experience Center · Mar 25', status: 'Completed', color: 'var(--green-soft)', text: 'var(--green)' },
            ].map(b => (
              <div key={b.brand} className="adm-dp-list-item">
                <div>
                  <strong>{b.brand}</strong>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{b.detail}</div>
                </div>
                <span className="adm-pill" style={{ background: b.color, color: b.text, fontSize: 10 }}>{b.status}</span>
              </div>
            ))}
          </div>

          <div className="adm-dp-section">
            <div className="adm-dp-section-title">⭐ Reviews Written</div>
            {[
              { brand: 'Livora Interiors', stars: '⭐⭐⭐⭐⭐', snippet: '"Excellent video consultation. The designer showed 3D renders…"', date: 'Apr 9' },
              { brand: 'KitchenKraft India', stars: '⭐⭐⭐⭐', snippet: '"Great experience center. The modular kitchen layouts…"', date: 'Mar 26' },
            ].map(r => (
              <div key={r.brand} className="adm-dp-list-item">
                <div>
                  <strong>{r.brand}</strong> — {r.stars}
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{r.snippet}</div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}>{r.date}</span>
              </div>
            ))}
          </div>

          <div className="adm-dp-section">
            <div className="adm-dp-section-title">🚩 Fake Lead Reports</div>
            <div style={{ fontSize: 13, color: 'var(--ink-4)', padding: '12px 0', textAlign: 'center' }}>
              No reports filed against this customer ✓
            </div>
          </div>

          <div className="adm-dp-actions">
            <button className="adm-dp-btn adm-dp-btn-amber" onClick={() => { setModal(true); document.body.style.overflow = 'hidden'; }}>⚠️ Send Warning</button>
            <button className="adm-dp-btn adm-dp-btn-red" onClick={() => { setModal(true); document.body.style.overflow = 'hidden'; }}>🚫 Suspend Customer</button>
            <button className="adm-dp-btn adm-dp-btn-outline" onClick={() => alert('Reset account limits')}>🔄 Reset Account Limits</button>
          </div>
        </div>
      </div>

      {/* ── BRAND DRAWER ── */}
      <div className={`adm-drawer-overlay${drawer === 'brand' ? ' active' : ''}`} onClick={closeDrawer} />
      <div className={`adm-drawer${drawer === 'brand' ? ' active' : ''}`}>
        <div className="adm-drawer-header">
          <span className="adm-drawer-title">Brand Profile</span>
          <button className="adm-drawer-close" onClick={closeDrawer}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="adm-drawer-body">
          <div className="adm-dp-header">
            <div className="adm-dp-avatar" style={{ background: 'var(--gold-light)', color: '#92400E' }}>AI</div>
            <div>
              <div className="adm-dp-name">Artisan Interiors</div>
              <div className="adm-dp-meta">Rajesh Kumar · rajesh@artisaninteriors.in · Koramangala</div>
              <div className="adm-dp-meta" style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                <span className="adm-pill pro">Pro</span>
                <span className="adm-pill active">Active</span>
                · ID: INZ-B-0042
              </div>
            </div>
          </div>

          <div className="adm-dp-stats">
            {[{ num: '₹12.5K', label: 'Wallet Balance' }, { num: '24', label: 'Total Meetings' }, { num: '₹1.62L', label: 'Total Revenue' }].map(s => (
              <div key={s.label} className="adm-dp-stat">
                <div className="adm-dp-stat-num">{s.num}</div>
                <div className="adm-dp-stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="adm-dp-section">
            <div className="adm-dp-section-title">💰 Revenue Breakdown</div>
            {[
              { label: 'Subscription Revenue', val: '₹40,000 (4 months)', style: {} },
              { label: 'Meeting Fees Collected', val: '₹1,22,000', style: {} },
              { label: 'Refunds Given', val: '−₹4,500', style: { color: 'var(--red)' } },
              { label: 'Net Revenue', val: '₹1,57,500', style: { color: 'var(--green)', fontWeight: 700 } },
            ].map(r => (
              <div key={r.label} className="adm-dp-row">
                <span className="adm-dp-row-label">{r.label}</span>
                <span className="adm-dp-row-val" style={r.style}>{r.val}</span>
              </div>
            ))}
          </div>

          <div className="adm-dp-section">
            <div className="adm-dp-section-title">📅 Meeting Summary</div>
            {[['Completed', '18'], ['Upcoming', '4'], ['No-shows', '3'], ['Cancelled', '2'], ['Avg Rating', '⭐ 4.8 (47 reviews)']].map(([l, v]) => (
              <div key={l} className="adm-dp-row">
                <span className="adm-dp-row-label">{l}</span>
                <span className="adm-dp-row-val">{v}</span>
              </div>
            ))}
          </div>

          <div className="adm-dp-section">
            <div className="adm-dp-section-title">📋 Subscription</div>
            {[['Plan', 'Pro — ₹10,000/mo', { color: 'var(--accent)' }], ['Since', 'Jan 1, 2026', {}], ['Renewal', 'May 1, 2026', {}], ['Free Meetings', '1 of 2 remaining', {}]].map(([l, v, s]) => (
              <div key={l as string} className="adm-dp-row">
                <span className="adm-dp-row-label">{l as string}</span>
                <span className="adm-dp-row-val" style={s as React.CSSProperties}>{v as string}</span>
              </div>
            ))}
          </div>

          <div className="adm-dp-section">
            <div className="adm-dp-section-title">🚩 Fake Lead Reports Filed</div>
            <div className="adm-dp-list-item">
              <div>
                <strong>Reported: Deepak Rao</strong>
                <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Reason: Non-serious inquiry · Apr 11</div>
              </div>
              <span className="adm-pill" style={{ background: 'var(--green-soft)', color: 'var(--green)', fontSize: 10 }}>Verified</span>
            </div>
          </div>

          <div className="adm-dp-actions">
            <button className="adm-dp-btn adm-dp-btn-outline" onClick={() => alert('Navigate to brand profile page')}>👁️ View Public Profile</button>
            <button className="adm-dp-btn adm-dp-btn-outline" onClick={() => alert('Navigate to brand edit page')}>✏️ Edit Brand Profile</button>
            <button className="adm-dp-btn adm-dp-btn-amber" onClick={() => alert('Force pause this brand')}>⏸ Force Pause</button>
            <button className="adm-dp-btn adm-dp-btn-red" onClick={() => { setModal(true); document.body.style.overflow = 'hidden'; }}>🚫 Suspend Brand</button>
          </div>
        </div>
      </div>

      {/* ── SUSPEND MODAL ── */}
      {modal && (
        <div className="adm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) { setModal(false); document.body.style.overflow = ''; } }}>
          <div className="adm-modal">
            <div className="adm-modal-title">Suspend this user?</div>
            <div className="adm-modal-desc">The user will lose access and be notified. This can be reversed later.</div>
            <div className="adm-modal-field">
              <label className="adm-modal-label">Reason</label>
              <select className="adm-modal-input" style={{ cursor: 'pointer' }} value={suspendReason} onChange={e => setSuspendReason(e.target.value)}>
                <option value="">Select reason...</option>
                <option>Multiple fake lead reports (3+)</option>
                <option>Abusive behavior towards brands</option>
                <option>Spam / fraudulent bookings</option>
                <option>Violation of Terms of Service</option>
                <option>Other</option>
              </select>
            </div>
            <div className="adm-modal-field">
              <label className="adm-modal-label">
                Admin Notes <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(internal)</span>
              </label>
              <textarea className="adm-modal-input" rows={3} placeholder="Additional context for the admin team..." value={adminNotes} onChange={e => setAdminNotes(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ background: 'var(--red-soft)', border: '1px solid rgba(220,38,38,.1)', borderRadius: 10, padding: '12px 16px', fontSize: 12, color: '#991B1B', marginBottom: 20, lineHeight: 1.5 }}>
              🚫 Suspended users cannot book consultations, leave reviews, or access their dashboard. Existing upcoming meetings will be auto-cancelled.
            </div>
            <div className="adm-modal-btns">
              <button className="adm-modal-btn adm-modal-btn-cancel" onClick={() => { setModal(false); document.body.style.overflow = ''; }}>Cancel</button>
              <button className="adm-modal-btn adm-modal-btn-red" disabled={!suspendReason} onClick={handleSuspend}>Suspend User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
