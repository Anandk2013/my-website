'use client';

import { useState } from 'react';
import AdminNav from '@/components/AdminNav';

type TabType = 'customers' | 'brands' | 'flagged';
type DrawerType = 'customer' | 'brand' | null;

const CUSTOMERS = [
  { id: 'c1', initials: 'PS', name: 'Priya Sharma', email: 'priya.s@gmail.com', phone: '+91 98765 43210', city: 'Bengaluru', bookings: 8, reviews: 5, flags: 0, status: 'active' },
  { id: 'c2', initials: 'RK', name: 'Rahul Krishnan', email: 'rahul.k@outlook.com', phone: '+91 87654 32109', city: 'Bengaluru', bookings: 4, reviews: 2, flags: 0, status: 'active' },
  { id: 'c3', initials: 'SG', name: 'Sneha Gupta', email: 'sneha.g@yahoo.com', phone: '+91 76543 21098', city: 'Bengaluru', bookings: 3, reviews: 1, flags: 0, status: 'active' },
  { id: 'c4', initials: 'DM', name: 'Deepak Menon', email: 'deepak.m@gmail.com', phone: '+91 65432 10987', city: 'Bengaluru', bookings: 6, reviews: 3, flags: 1, status: 'active' },
  { id: 'c5', initials: 'AR', name: 'Ajay Rawat', email: 'ajay.r@gmail.com', phone: '+91 54321 09876', city: 'Delhi NCR', bookings: 5, reviews: 0, flags: 3, status: 'suspended' },
];

const BRANDS = [
  { id: 'b1', initials: 'AI', name: 'Artisan Interiors', sub: 'Koramangala · Since Jan 2026', tier: 'Pro', wallet: '₹12,500', meetings: 24, revenue: '₹1,62,000', rating: '4.8', status: 'active' },
  { id: 'b2', initials: 'DC', name: 'DesignCraft Studio', sub: 'Koramangala · Since Dec 2025', tier: 'Pro', wallet: '₹28,000', meetings: 31, revenue: '₹2,14,000', rating: '4.9', status: 'active' },
  { id: 'b3', initials: 'SW', name: 'SpaceWell Interiors', sub: 'HSR Layout · Since Feb 2026', tier: 'Pro', wallet: '₹5,200', meetings: 18, revenue: '₹98,000', rating: '4.8', status: 'active' },
  { id: 'b4', initials: 'ND', name: 'Nirmana Design Lab', sub: 'Jayanagar · Since Mar 2026', tier: 'Free', wallet: '₹8,000', meetings: 9, revenue: '₹41,000', rating: '4.6', status: 'paused' },
];

const FLAGGED = [
  { id: 'f1', initials: 'AR', name: 'Ajay Rawat', email: 'ajay.r@gmail.com · Delhi NCR', phone: '+91 54321 09876', bookings: 5, reports: 3, brands: 'DesignCraft, Livora, UrbanNest', firstFlagged: 'Apr 5, 2026' },
  { id: 'f2', initials: 'KP', name: 'Karan Puri', email: 'karan.p@yahoo.com · Bengaluru', phone: '+91 43210 98765', bookings: 7, reports: 4, brands: 'Artisan, SpaceWell, KitchenKraft, Atelier', firstFlagged: 'Mar 28, 2026' },
  { id: 'f3', initials: 'SM', name: 'Suresh M.', email: 'suresh.m@hotmail.com · Hyderabad', phone: '+91 32109 87654', bookings: 3, reports: 3, brands: 'Vastu Design, NovusHome, GreenLeaf', firstFlagged: 'Apr 10, 2026' },
];

export default function AdminBrandsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('customers');
  const [search, setSearch] = useState('');
  const [drawer, setDrawer] = useState<DrawerType>(null);
  const [modal, setModal] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [toast, setToast] = useState({ show: false, color: 'green', msg: '' });
  const [customerStatuses, setCustomerStatuses] = useState<Record<string, string>>(
    Object.fromEntries(CUSTOMERS.map(c => [c.id, c.status]))
  );

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
            { id: 'customers', label: 'Customers', count: '2,847', danger: false },
            { id: 'brands', label: 'Brands', count: '48', danger: false },
            { id: 'flagged', label: 'Flagged', count: '6', danger: true },
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
                <span style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 500, marginLeft: 4 }}>2,847 total</span>
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
                  {CUSTOMERS.map(c => {
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
                <span style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 500, marginLeft: 4 }}>48 total</span>
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
                    <th>Meetings</th><th>Revenue</th><th>Rating</th>
                    <th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {BRANDS.map(b => (
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
                      <td style={{ fontWeight: 700, color: 'var(--green)' }}>{b.revenue}</td>
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
