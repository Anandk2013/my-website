'use client';

import { useState } from 'react';
import AdminNav from '@/components/AdminNav';

type AppStatus = 'pending' | 'approved' | 'rejected';
type ModalType = 'rejectApp' | 'rejectEdit' | null;

const APPLICATIONS = [
  {
    id: 'app1', initials: 'NH', bg: 'linear-gradient(135deg,#D4C5A9,#A89968)',
    name: 'NovusHome Interiors', contact: 'Arun Menon · arun@novushome.in',
    city: 'Bengaluru', portfolio: 8, plan: 'Pro', applied: 'Apr 16, 2026', ago: '2 hours ago',
    details: {
      Name: 'NovusHome Interiors Pvt Ltd', Contact: 'Arun Menon · +91 98456 12345',
      Email: 'arun@novushome.in', Experience: '3–5 years · 4–8 people',
      GST: '29NOVUS5678G1Z3', Website: 'novushome.in',
    },
    services: ['Full Home', 'Kitchen', 'Wardrobe', 'Ceiling'],
    localities: ['Koramangala', 'HSR Layout', 'BTM Layout', 'JP Nagar'],
    budget: '₹5L – ₹20L',
    styles: ['Scandinavian', 'Minimalist'],
    desc: 'Modern interior design studio specializing in compact urban apartments. We focus on space optimization for 1BHK and 2BHK homes with clean, functional Scandinavian-inspired aesthetics.',
    photos: [
      { bg: 'linear-gradient(135deg,#E8D5B7,#C4A77D)', e: '🛋️' },
      { bg: 'linear-gradient(135deg,#B5C7D3,#8BA3B9)', e: '🍳' },
      { bg: 'linear-gradient(135deg,#C7D5C0,#97B089)', e: '🛏️' },
      { bg: 'linear-gradient(135deg,#D5BFD5,#B391B3)', e: '🪴' },
      { bg: 'linear-gradient(135deg,#C4D4E0,#8EAEC4)', e: '💡' },
      { bg: 'linear-gradient(135deg,#F0DAD2,#D4A898)', e: '👔' },
    ],
  },
  {
    id: 'app2', initials: 'GI', bg: 'linear-gradient(135deg,#C7D5C0,#97B089)',
    name: 'GreenLeaf Interiors', contact: 'Meera Patel · meera@greenleaf.co',
    city: 'Bengaluru', portfolio: 12, plan: 'Free', applied: 'Apr 15, 2026', ago: '1 day ago',
  },
  {
    id: 'app3', initials: 'VD', bg: 'linear-gradient(135deg,#F0DAD2,#D4A898)',
    name: 'Vastu Design Studio', contact: 'Kiran Rao · kiran@vastudesign.in',
    city: 'Hyderabad', portfolio: 6, plan: 'Pro', applied: 'Apr 14, 2026', ago: '2 days ago',
  },
  {
    id: 'app4', initials: 'SM', bg: 'linear-gradient(135deg,#B5C7D3,#8BA3B9)',
    name: 'Studio Minimale', contact: 'Anjali K · anjali@studiominimale.in',
    city: 'Bengaluru', portfolio: 10, plan: 'Pro', applied: 'Apr 12, 2026', ago: '',
    initialStatus: 'approved' as AppStatus,
  },
];

const EDITS = [
  {
    id: 'e1', initials: 'AI', bg: 'linear-gradient(135deg,#E8D5B7,#C4A77D)',
    name: 'Artisan Interiors', sub: 'Pro · Koramangala',
    field: 'desc', fieldLabel: 'Description', submitted: '3 hours ago',
    old: '...With a team of 12 experienced designers...',
    new: '...With a team of 15 experienced designers, including 2 certified Vastu consultants...',
  },
  {
    id: 'e2', initials: 'SW', bg: 'linear-gradient(135deg,#C7D5C0,#97B089)',
    name: 'SpaceWell Interiors', sub: 'Pro · HSR Layout',
    field: 'portfolio', fieldLabel: 'Portfolio', submitted: 'Yesterday',
    addedPhotos: [
      { bg: 'linear-gradient(135deg,#D4C5A9,#A89968)', e: '🍳' },
      { bg: 'linear-gradient(135deg,#B5C7D3,#8BA3B9)', e: '🛏️' },
      { bg: 'linear-gradient(135deg,#E3D8C8,#C7B89A)', e: '👔' },
    ],
  },
  {
    id: 'e3', initials: 'ND', bg: 'linear-gradient(135deg,#D5BFD5,#B391B3)',
    name: 'Nirmana Design Lab', sub: 'Free · Jayanagar',
    field: 'locality', fieldLabel: 'Localities', submitted: '2 days ago',
    old: 'Jayanagar, Basavanagudi, JP Nagar',
    new: 'Jayanagar, Basavanagudi, JP Nagar, Malleshwaram, Rajajinagar',
  },
];

export default function AdminVerificationPage() {
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>(
    Object.fromEntries(APPLICATIONS.map(a => [a.id, (a as { initialStatus?: AppStatus }).initialStatus ?? 'pending']))
  );
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalType>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectEditReason, setRejectEditReason] = useState('');
  const [toast, setToast] = useState<{ show: boolean; color: 'green' | 'red'; msg: string }>({ show: false, color: 'green', msg: '' });

  function showToast(color: 'green' | 'red', msg: string) {
    setToast({ show: true, color, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }

  function approveApp(id: string) {
    setStatuses(s => ({ ...s, [id]: 'approved' }));
    setExpanded(e => { const n = new Set(e); n.delete(`exp_${id}`); return n; });
    setSelected(s => { const n = new Set(s); n.delete(id); return n; });
    showToast('green', '✓ Brand approved successfully');
  }

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  function selectAll(checked: boolean) {
    setSelected(checked ? new Set(APPLICATIONS.filter(a => statuses[a.id] === 'pending').map(a => a.id)) : new Set());
  }

  function approveSelected() {
    selected.forEach(id => setStatuses(s => ({ ...s, [id]: 'approved' })));
    setSelected(new Set());
    showToast('green', `✓ ${selected.size} brand(s) approved`);
  }

  function openModal(type: ModalType) {
    setModal(type);
    setRejectReason('');
    setRejectNotes('');
    setRejectEditReason('');
  }

  function submitRejectApp() {
    setModal(null);
    showToast('red', '✕ Application rejected — brand notified');
  }

  function submitRejectEdit() {
    setModal(null);
    showToast('red', '✕ Edit rejected — brand notified');
  }

  const pendingApps = APPLICATIONS.filter(a => statuses[a.id] === 'pending');

  return (
    <div className="adm-page">
      <AdminNav />

      {/* Toast */}
      <div className={`adm-toast ${toast.color}${toast.show ? ' show' : ''}`}>{toast.msg}</div>

      <div className="adm-container">
        <div className="adm-page-header">
          <h1>Brand Verification</h1>
          <div className="adm-ph-sub">Review new applications and profile edit requests</div>
        </div>

        {/* Stats */}
        <div className="adm-stats-bar">
          {[
            { num: pendingApps.length, label: 'Pending Applications', fill: '40%', color: 'var(--gold)' },
            { num: EDITS.length, label: 'Pending Profile Edits', fill: '30%', color: '#3B82F6' },
            { num: 12, label: 'Approved This Week', fill: '80%', color: 'var(--green)' },
            { num: '6h', label: 'Avg Approval Time', fill: '25%', color: 'var(--accent)' },
          ].map(s => (
            <div key={s.label} className="adm-stat-card">
              <div className="adm-stat-num">{s.num}</div>
              <div className="adm-stat-label">{s.label}</div>
              <div className="adm-stat-bar"><div className="adm-stat-bar-fill" style={{ width: s.fill, background: s.color }}></div></div>
            </div>
          ))}
        </div>

        {/* ── Section 1: New Applications ── */}
        <div className="adm-section">
          <div className="adm-section-header">
            <div className="adm-section-title">
              📋 New Brand Applications
              <span className="adm-section-count">{pendingApps.length} pending</span>
            </div>
            <div className="adm-section-actions">
              <select className="adm-filter-select">
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>
              <button className="adm-as-btn" onClick={() => alert('Export CSV')}>📥 Export</button>
            </div>
          </div>

          {/* Bulk bar */}
          {selected.size > 0 && (
            <div className="adm-bulk-bar show">
              <span style={{ fontWeight: 700 }}>{selected.size}</span> selected
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="adm-bulk-btn approve" onClick={approveSelected}>✓ Approve All</button>
                <button className="adm-bulk-btn reject" onClick={() => openModal('rejectApp')}>✕ Reject All</button>
                <button className="adm-bulk-btn clear" onClick={() => setSelected(new Set())}>Clear</button>
              </div>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>
                    <input type="checkbox" className="adm-tbl-check" onChange={e => selectAll(e.target.checked)} />
                  </th>
                  <th>Brand</th>
                  <th>City</th>
                  <th>Portfolio</th>
                  <th>Plan</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {APPLICATIONS.map(app => {
                  const status = statuses[app.id];
                  const isApproved = status !== 'pending';
                  const expId = `exp_${app.id}`;
                  const isExpanded = expanded.has(expId);

                  return (
                    <>
                      <tr key={app.id} className={isExpanded ? 'expanded-row' : ''} style={isApproved ? { opacity: 0.6 } : {}}>
                        <td>
                          <input
                            type="checkbox"
                            className="adm-tbl-check"
                            checked={selected.has(app.id)}
                            disabled={isApproved}
                            onChange={() => toggleSelect(app.id)}
                          />
                        </td>
                        <td>
                          <div className="adm-brand-cell">
                            <div className="adm-bc-logo" style={{ background: app.bg }}>{app.initials}</div>
                            <div>
                              <div className="adm-bc-name">{app.name}</div>
                              <div className="adm-bc-contact">{app.contact}</div>
                            </div>
                          </div>
                        </td>
                        <td><span className="adm-city-pill">{app.city}</span></td>
                        <td style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{app.portfolio} images</td>
                        <td>
                          <span style={{ fontSize: 12, fontWeight: 600, color: app.plan === 'Pro' ? 'var(--accent)' : 'var(--ink-4)' }}>
                            {app.plan}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--ink-4)' }}>
                          {app.applied}{app.ago && <><br />{app.ago}</>}
                        </td>
                        <td><span className={`adm-status-pill ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                        <td style={{ textAlign: 'right' }}>
                          {isApproved ? (
                            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>✓ Approved</span>
                          ) : (
                            <div className="adm-action-btns">
                              <button className="adm-act-btn view" onClick={() => toggleExpand(expId)}>👁️ Review</button>
                              <button className="adm-act-btn approve" onClick={() => approveApp(app.id)}>✓</button>
                              <button className="adm-act-btn reject" onClick={() => openModal('rejectApp')}>✕</button>
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expandable preview */}
                      <tr key={`${app.id}-exp`} className={`adm-expand-row${isExpanded ? ' open' : ''}`}>
                        <td colSpan={8} className="adm-expand-cell">
                          <div className="adm-expand-inner">
                            {'details' in app && app.details ? (
                              <div className="adm-preview-grid">
                                <div className="adm-preview-section">
                                  <div className="adm-preview-section-title">Company Details</div>
                                  {Object.entries(app.details).map(([k, v]) => (
                                    <div key={k} className="adm-preview-row">
                                      <span className="adm-preview-label">{k}</span>
                                      <span className="adm-preview-val">{v}</span>
                                    </div>
                                  ))}
                                  <div className="adm-preview-desc"><strong>Description:</strong> {app.desc}</div>
                                </div>
                                <div className="adm-preview-section">
                                  <div className="adm-preview-section-title">Services & Coverage</div>
                                  <div className="adm-preview-row">
                                    <span className="adm-preview-label">Services</span>
                                    <div className="adm-preview-tags">{app.services?.map(s => <span key={s} className="adm-preview-tag">{s}</span>)}</div>
                                  </div>
                                  <div className="adm-preview-row">
                                    <span className="adm-preview-label">Localities</span>
                                    <div className="adm-preview-tags">{app.localities?.map(l => <span key={l} className="adm-preview-tag">{l}</span>)}</div>
                                  </div>
                                  <div className="adm-preview-row">
                                    <span className="adm-preview-label">Budget</span>
                                    <span className="adm-preview-val">{app.budget}</span>
                                  </div>
                                  <div className="adm-preview-row">
                                    <span className="adm-preview-label">Styles</span>
                                    <div className="adm-preview-tags">{app.styles?.map(s => <span key={s} className="adm-preview-tag">{s}</span>)}</div>
                                  </div>
                                  <div className="adm-preview-section-title" style={{ marginTop: 16 }}>Portfolio ({app.portfolio} images)</div>
                                  <div className="adm-preview-photos">
                                    {app.photos?.map((p, i) => (
                                      <div key={i} className="adm-preview-photo" style={{ background: p.bg }}>{p.e}</div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div style={{ textAlign: 'center', padding: 20, color: 'var(--ink-4)' }}>Full preview available for first entry — same format applies</div>
                            )}
                            <div className="adm-preview-actions">
                              <button className="adm-preview-btn approve" onClick={() => { approveApp(app.id); toggleExpand(expId); }}>
                                ✓ Approve Brand
                              </button>
                              <button className="adm-preview-btn reject" onClick={() => openModal('rejectApp')}>
                                ✕ Reject — Add Reason
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Section 2: Profile Edit Approvals ── */}
        <div className="adm-section">
          <div className="adm-section-header">
            <div className="adm-section-title">
              ✏️ Profile Edit Approvals
              <span className="adm-section-count">{EDITS.length} pending</span>
            </div>
            <div className="adm-section-actions">
              <select className="adm-filter-select">
                <option>All Fields</option>
                <option>Description</option>
                <option>Services</option>
                <option>Portfolio</option>
                <option>Localities</option>
              </select>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Brand</th>
                  <th>Field Changed</th>
                  <th>Change Detail</th>
                  <th>Submitted</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {EDITS.map(edit => (
                  <tr key={edit.id}>
                    <td>
                      <div className="adm-brand-cell">
                        <div className="adm-bc-logo" style={{ background: edit.bg }}>{edit.initials}</div>
                        <div>
                          <div className="adm-bc-name">{edit.name}</div>
                          <div className="adm-bc-contact">{edit.sub}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`adm-field-badge ${edit.field}`}>{edit.fieldLabel}</span></td>
                    <td>
                      {edit.field === 'portfolio' && edit.addedPhotos ? (
                        <div className="adm-diff-cell">
                          <span className="adm-diff-new">+{edit.addedPhotos.length} new images added (Kitchen, Bedroom, Wardrobe)</span>
                          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                            {edit.addedPhotos.map((p, i) => (
                              <div key={i} style={{ width: 48, height: 36, borderRadius: 6, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: '1px solid var(--border)' }}>{p.e}</div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="adm-diff-cell">
                          <span className="adm-diff-old">{edit.old}</span>
                          <span className="adm-diff-arrow">↓</span>
                          <span className="adm-diff-new">{edit.new}</span>
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ink-4)' }}>{edit.submitted}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="adm-action-btns">
                        <button className="adm-act-btn approve" onClick={() => showToast('green', `✓ ${edit.fieldLabel} change approved`)}>✓ Approve</button>
                        <button className="adm-act-btn reject" onClick={() => openModal('rejectEdit')}>✕ Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Reject Application Modal ── */}
      {modal === 'rejectApp' && (
        <div className="adm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <div className="adm-modal-title">Reject Brand Application</div>
            <div className="adm-modal-desc">Provide a reason so the brand can fix issues and reapply.</div>
            <div className="adm-modal-field">
              <label className="adm-modal-label">Reason Category</label>
              <select className="adm-modal-input" style={{ cursor: 'pointer' }} value={rejectReason} onChange={e => setRejectReason(e.target.value)}>
                <option value="">Select reason...</option>
                <option>Incomplete portfolio (less than 6 quality images)</option>
                <option>Description too vague / not enough detail</option>
                <option>Suspected fake / duplicate brand</option>
                <option>Portfolio contains 3D renders, not real projects</option>
                <option>Missing or invalid GST / business details</option>
                <option>Content policy violation</option>
                <option>Other</option>
              </select>
            </div>
            <div className="adm-modal-field">
              <label className="adm-modal-label">
                Additional Notes <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(sent to brand)</span>
              </label>
              <textarea className="adm-modal-input" rows={3} placeholder="Specific feedback to help them improve their application..." value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div className="adm-modal-btns">
              <button className="adm-modal-btn adm-modal-btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-modal-btn adm-modal-btn-red" onClick={submitRejectApp}>Reject Application</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Reject Edit Modal ── */}
      {modal === 'rejectEdit' && (
        <div className="adm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <div className="adm-modal-title">Reject Profile Edit</div>
            <div className="adm-modal-desc">The brand will see this reason and can re-submit.</div>
            <div className="adm-modal-field">
              <label className="adm-modal-label">Rejection Reason</label>
              <textarea className="adm-modal-input" rows={3} placeholder="e.g., The new images appear to be stock photos, not your actual projects." value={rejectEditReason} onChange={e => setRejectEditReason(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div className="adm-modal-btns">
              <button className="adm-modal-btn adm-modal-btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-modal-btn adm-modal-btn-red" onClick={submitRejectEdit}>Reject Edit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
