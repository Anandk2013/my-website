'use client';

import { useEffect, useState } from 'react';
import AdminNav from '@/components/AdminNav';
import { createClient } from '@/lib/supabase';

type AppStatus = 'pending' | 'approved' | 'rejected';
type ModalType = 'rejectApp' | 'rejectEdit' | null;

type BrandApp = {
  id: string;
  initials: string;
  bg: string;
  name: string;
  contact: string;
  city: string;
  portfolio: number;
  plan: string;
  applied: string;
  services: string[];
  localities: string[];
  styles: string[];
  desc: string | null;
  email: string | null;
  phone: string | null;
  status: AppStatus;
};

const GRADIENTS = [
  'linear-gradient(135deg,#D4C5A9,#A89968)',
  'linear-gradient(135deg,#B5C7D3,#8BA3B9)',
  'linear-gradient(135deg,#C7D5C0,#97B089)',
  'linear-gradient(135deg,#D5BFD5,#B391B3)',
  'linear-gradient(135deg,#F0DAD2,#D4A898)',
  'linear-gradient(135deg,#C4D4E0,#8EAEC4)',
];

const EDITS = [
  {
    id: 'e1', initials: 'AI', bg: 'linear-gradient(135deg,#E8D5B7,#C4A77D)',
    name: 'Artisan Interiors', sub: 'Pro · Koramangala',
    field: 'desc', fieldLabel: 'Description', submitted: '3 hours ago',
    old: '...With a team of 12 experienced designers...',
    new: '...With a team of 15 experienced designers, including 2 certified Vastu consultants...',
  },
];

export default function AdminVerificationPage() {
  const [applications, setApplications] = useState<BrandApp[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AppStatus>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalType>(null);
  const [rejectTargetId, setRejectTargetId] = useState<string>('');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectEditReason, setRejectEditReason] = useState('');
  const [toast, setToast] = useState<{ show: boolean; color: 'green' | 'red'; msg: string }>({ show: false, color: 'green', msg: '' });

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('brands')
      .select('id, name, logo_initials, cover_gradient, location, city, plan_type, email, phone, description, service_types, areas_served, design_styles, is_verified, status, created_at')
      .eq('is_verified', false)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const apps: BrandApp[] = (data ?? []).map((b, i) => ({
          id: b.id,
          initials: b.logo_initials ?? b.name.slice(0, 2).toUpperCase(),
          bg: b.cover_gradient ?? GRADIENTS[i % GRADIENTS.length],
          name: b.name,
          contact: [b.email, b.phone].filter(Boolean).join(' · ') || 'No contact provided',
          city: b.city ?? b.location ?? 'Unknown',
          portfolio: 0,
          plan: b.plan_type === 'pro' ? 'Pro' : 'Free',
          applied: new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          services: b.service_types ?? [],
          localities: b.areas_served ?? [],
          styles: b.design_styles ?? [],
          desc: b.description,
          email: b.email,
          phone: b.phone,
          status: b.status === 'rejected' ? 'rejected' : 'pending',
        }));
        setApplications(apps);
        setStatuses(Object.fromEntries(apps.map(a => [a.id, a.status])));
        setLoading(false);
      });
  }, []);

  function showToast(color: 'green' | 'red', msg: string) {
    setToast({ show: true, color, msg });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  }

  async function approveApp(id: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('brands')
      .update({ is_verified: true, status: 'active' })
      .eq('id', id);
    if (error) { showToast('red', 'Error approving brand'); return; }
    setStatuses(s => ({ ...s, [id]: 'approved' }));
    setExpanded(e => { const n = new Set(e); n.delete(`exp_${id}`); return n; });
    setSelected(s => { const n = new Set(s); n.delete(id); return n; });
    showToast('green', '✓ Brand approved and published');
  }

  async function submitRejectApp() {
    if (!rejectTargetId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from('brands')
      .update({ status: 'rejected' })
      .eq('id', rejectTargetId);
    setModal(null);
    if (error) { showToast('red', 'Error rejecting brand'); return; }
    setStatuses(s => ({ ...s, [rejectTargetId]: 'rejected' }));
    showToast('red', '✕ Application rejected — brand notified');
  }

  async function approveSelected() {
    const ids = Array.from(selected);
    await Promise.all(ids.map(id => approveApp(id)));
    setSelected(new Set());
    showToast('green', `✓ ${ids.length} brand(s) approved`);
  }

  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function selectAll(checked: boolean) {
    setSelected(checked ? new Set(applications.filter(a => statuses[a.id] === 'pending').map(a => a.id)) : new Set());
  }

  function openRejectModal(id: string) {
    setRejectTargetId(id);
    setRejectReason('');
    setRejectNotes('');
    setModal('rejectApp');
  }

  function submitRejectEdit() {
    setModal(null);
    showToast('red', '✕ Edit rejected — brand notified');
  }

  const pendingApps = applications.filter(a => statuses[a.id] === 'pending');

  if (loading) return (
    <div className="adm-page">
      <AdminNav />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)', fontSize: 14 }}>
        Loading applications…
      </div>
    </div>
  );

  return (
    <div className="adm-page">
      <AdminNav />
      <div className={`adm-toast ${toast.color}${toast.show ? ' show' : ''}`}>{toast.msg}</div>

      <div className="adm-container">
        <div className="adm-page-header">
          <h1>Brand Verification</h1>
          <div className="adm-ph-sub">Review new applications and profile edit requests</div>
        </div>

        <div className="adm-stats-bar">
          {[
            { num: pendingApps.length, label: 'Pending Applications', fill: `${Math.min(pendingApps.length * 10, 100)}%`, color: 'var(--gold)' },
            { num: EDITS.length, label: 'Pending Profile Edits', fill: '30%', color: '#3B82F6' },
            { num: applications.filter(a => statuses[a.id] === 'approved').length, label: 'Approved', fill: '80%', color: 'var(--green)' },
            { num: applications.filter(a => statuses[a.id] === 'rejected').length, label: 'Rejected', fill: '20%', color: '#DC2626' },
          ].map(s => (
            <div key={s.label} className="adm-stat-card">
              <div className="adm-stat-num">{s.num}</div>
              <div className="adm-stat-label">{s.label}</div>
              <div className="adm-stat-bar"><div className="adm-stat-bar-fill" style={{ width: s.fill, background: s.color }}></div></div>
            </div>
          ))}
        </div>

        {/* New Applications */}
        <div className="adm-section">
          <div className="adm-section-header">
            <div className="adm-section-title">
              📋 New Brand Applications
              <span className="adm-section-count">{pendingApps.length} pending</span>
            </div>
            <div className="adm-section-actions">
              <button className="adm-as-btn" onClick={() => alert('Export CSV')}>📥 Export</button>
            </div>
          </div>

          {selected.size > 0 && (
            <div className="adm-bulk-bar show">
              <span style={{ fontWeight: 700 }}>{selected.size}</span> selected
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                <button className="adm-bulk-btn approve" onClick={approveSelected}>✓ Approve All</button>
                <button className="adm-bulk-btn reject" onClick={() => setModal('rejectApp')}>✕ Reject All</button>
                <button className="adm-bulk-btn clear" onClick={() => setSelected(new Set())}>Clear</button>
              </div>
            </div>
          )}

          {applications.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 14 }}>
              No applications pending review.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th style={{ width: 36 }}>
                      <input type="checkbox" className="adm-tbl-check" onChange={e => selectAll(e.target.checked)} />
                    </th>
                    <th>Brand</th>
                    <th>City</th>
                    <th>Plan</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => {
                    const status = statuses[app.id];
                    const isDone = status !== 'pending';
                    const expId = `exp_${app.id}`;
                    const isExpanded = expanded.has(expId);
                    return (
                      <>
                        <tr key={app.id} className={isExpanded ? 'expanded-row' : ''} style={isDone ? { opacity: 0.6 } : {}}>
                          <td>
                            <input type="checkbox" className="adm-tbl-check" checked={selected.has(app.id)} disabled={isDone} onChange={() => toggleSelect(app.id)} />
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
                          <td><span style={{ fontSize: 12, fontWeight: 600, color: app.plan === 'Pro' ? 'var(--accent)' : 'var(--ink-4)' }}>{app.plan}</span></td>
                          <td style={{ fontSize: 12, color: 'var(--ink-4)' }}>{app.applied}</td>
                          <td><span className={`adm-status-pill ${status}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            {isDone ? (
                              <span style={{ fontSize: 12, color: status === 'approved' ? 'var(--green)' : '#DC2626', fontWeight: 600 }}>
                                {status === 'approved' ? '✓ Approved' : '✕ Rejected'}
                              </span>
                            ) : (
                              <div className="adm-action-btns">
                                <button className="adm-act-btn view" onClick={() => toggleExpand(expId)}>👁️ Review</button>
                                <button className="adm-act-btn approve" onClick={() => approveApp(app.id)}>✓</button>
                                <button className="adm-act-btn reject" onClick={() => openRejectModal(app.id)}>✕</button>
                              </div>
                            )}
                          </td>
                        </tr>
                        <tr key={`${app.id}-exp`} className={`adm-expand-row${isExpanded ? ' open' : ''}`}>
                          <td colSpan={7} className="adm-expand-cell">
                            <div className="adm-expand-inner">
                              <div className="adm-preview-grid">
                                <div className="adm-preview-section">
                                  <div className="adm-preview-section-title">Company Details</div>
                                  {[
                                    ['Name', app.name],
                                    ['Email', app.email ?? '—'],
                                    ['Phone', app.phone ?? '—'],
                                    ['City', app.city],
                                    ['Plan', app.plan],
                                  ].map(([k, v]) => (
                                    <div key={k} className="adm-preview-row">
                                      <span className="adm-preview-label">{k}</span>
                                      <span className="adm-preview-val">{v}</span>
                                    </div>
                                  ))}
                                  {app.desc && <div className="adm-preview-desc"><strong>Description:</strong> {app.desc}</div>}
                                </div>
                                <div className="adm-preview-section">
                                  <div className="adm-preview-section-title">Services &amp; Coverage</div>
                                  {app.services.length > 0 && (
                                    <div className="adm-preview-row">
                                      <span className="adm-preview-label">Services</span>
                                      <div className="adm-preview-tags">{app.services.map(s => <span key={s} className="adm-preview-tag">{s}</span>)}</div>
                                    </div>
                                  )}
                                  {app.localities.length > 0 && (
                                    <div className="adm-preview-row">
                                      <span className="adm-preview-label">Areas</span>
                                      <div className="adm-preview-tags">{app.localities.map(l => <span key={l} className="adm-preview-tag">{l}</span>)}</div>
                                    </div>
                                  )}
                                  {app.styles.length > 0 && (
                                    <div className="adm-preview-row">
                                      <span className="adm-preview-label">Styles</span>
                                      <div className="adm-preview-tags">{app.styles.map(s => <span key={s} className="adm-preview-tag">{s}</span>)}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="adm-preview-actions">
                                <button className="adm-preview-btn approve" onClick={() => { approveApp(app.id); toggleExpand(expId); }}>✓ Approve Brand</button>
                                <button className="adm-preview-btn reject" onClick={() => openRejectModal(app.id)}>✕ Reject — Add Reason</button>
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
          )}
        </div>

        {/* Profile Edit Approvals */}
        <div className="adm-section">
          <div className="adm-section-header">
            <div className="adm-section-title">
              ✏️ Profile Edit Approvals
              <span className="adm-section-count">{EDITS.length} pending</span>
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
                      <div className="adm-diff-cell">
                        <span className="adm-diff-old">{edit.old}</span>
                        <span className="adm-diff-arrow">↓</span>
                        <span className="adm-diff-new">{edit.new}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--ink-4)' }}>{edit.submitted}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="adm-action-btns">
                        <button className="adm-act-btn approve" onClick={() => showToast('green', `✓ ${edit.fieldLabel} change approved`)}>✓ Approve</button>
                        <button className="adm-act-btn reject" onClick={() => { setRejectEditReason(''); setModal('rejectEdit'); }}>✕ Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
              <label className="adm-modal-label">Additional Notes <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(sent to brand)</span></label>
              <textarea className="adm-modal-input" rows={3} placeholder="Specific feedback…" value={rejectNotes} onChange={e => setRejectNotes(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div className="adm-modal-btns">
              <button className="adm-modal-btn adm-modal-btn-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button className="adm-modal-btn adm-modal-btn-red" onClick={submitRejectApp}>Reject Application</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'rejectEdit' && (
        <div className="adm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setModal(null); }}>
          <div className="adm-modal">
            <div className="adm-modal-title">Reject Profile Edit</div>
            <div className="adm-modal-desc">The brand will see this reason and can re-submit.</div>
            <div className="adm-modal-field">
              <label className="adm-modal-label">Rejection Reason</label>
              <textarea className="adm-modal-input" rows={3} placeholder="e.g., Images appear to be stock photos, not actual projects." value={rejectEditReason} onChange={e => setRejectEditReason(e.target.value)} style={{ resize: 'vertical' }} />
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
