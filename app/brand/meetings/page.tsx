'use client';

import { useEffect, useState } from 'react';
import BrandNav from '@/components/BrandNav';
import { createClient } from '@/lib/supabase';

type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
type ModalType = 'complete' | 'noshow' | 'fake' | 'cancel' | null;

type Booking = {
  id: string;
  meeting_type: string;
  status: BookingStatus;
  preferred_date: string | null;
  preferred_time: string | null;
  homeowner_name: string;
  project_type: string | null;
  budget_range: string | null;
  created_at: string;
};

const MEETING_LABELS: Record<string, string> = {
  video_call: '📹 Video Call',
  site_visit: '🏠 Site Visit',
  experience_center: '🏢 Experience Center',
};

const TYPE_CLASS: Record<string, string> = {
  video_call: 'vc',
  site_visit: 'sv',
  experience_center: 'ec',
};

const PRO_FEES: Record<string, number> = { video_call: 2000, site_visit: 2500, experience_center: 3500 };
const FREE_FEES: Record<string, number> = { video_call: 4000, site_visit: 5000, experience_center: 7000 };

function getInitials(name: string): string {
  return name.trim().split(/\s+/).slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '??';
}

function fmtFee(meetingType: string, planType: string): string {
  const fees = planType === 'pro' ? PRO_FEES : FREE_FEES;
  const amt = fees[meetingType];
  return amt ? `₹${amt.toLocaleString('en-IN')}` : 'Free';
}

function getCountdown(dateStr: string | null): string {
  if (!dateStr) return 'Date TBD';
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'Past';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

function fmtDateTime(dateStr: string | null, time: string | null): string {
  if (!dateStr) return 'Date to be confirmed';
  const d = new Date(dateStr);
  const formatted = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return time ? `${formatted} · ${time}` : formatted;
}

function fmtShortDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getTimer(dateStr: string | null, timeStr: string | null): string {
  if (!dateStr) return '';
  const meetingDate = new Date(`${dateStr}T${timeStr || '12:00:00'}`);
  const deadline = meetingDate.getTime() + 48 * 3600 * 1000;
  const remaining = deadline - Date.now();
  if (remaining <= 0) return 'Auto-completing soon';
  const hours = Math.floor(remaining / 3600000);
  if (hours >= 24) return `${Math.ceil(hours / 24)} days`;
  const mins = Math.floor((remaining % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

function filterByDate(bookings: Booking[], filter: string): Booking[] {
  if (filter === 'All Dates') return bookings;
  const now = Date.now();
  const msAgo = (days: number) => new Date(now - days * 86400000).toISOString();
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const lastMonthStart = new Date(monthStart); lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  const lastMonthEnd = new Date(monthStart.getTime() - 1);
  if (filter === 'Last 7 days') return bookings.filter(b => (b.preferred_date || b.created_at) >= msAgo(7));
  if (filter === 'Last 30 days') return bookings.filter(b => (b.preferred_date || b.created_at) >= msAgo(30));
  if (filter === 'This month') return bookings.filter(b => (b.preferred_date || b.created_at) >= monthStart.toISOString());
  if (filter === 'Last month') {
    return bookings.filter(b => {
      const d = b.preferred_date || b.created_at;
      return d >= lastMonthStart.toISOString() && d <= lastMonthEnd.toISOString();
    });
  }
  return bookings;
}

function filterByType(bookings: Booking[], filter: string): Booking[] {
  if (filter === 'All Types') return bookings;
  const map: Record<string, string> = { 'Video Call': 'video_call', 'Site Visit': 'site_visit', 'Experience Center': 'experience_center' };
  const t = map[filter];
  return t ? bookings.filter(b => b.meeting_type === t) : bookings;
}

const StarFull = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#F59E0B">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const StarEmpty = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="#E5E7EB">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

export default function BrandMeetingsPage() {
  const [planType, setPlanType] = useState('free');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<'upcoming' | 'pending' | 'completed'>('upcoming');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalType>(null);
  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [fakeReason, setFakeReason] = useState('');
  const [fakeDetails, setFakeDetails] = useState('');
  const [updating, setUpdating] = useState(false);
  const [dateFilter, setDateFilter] = useState('All Dates');
  const [typeFilter, setTypeFilter] = useState('All Types');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }

      const { data: brand } = await supabase
        .from('brands')
        .select('id, plan_type')
        .eq('auth_user_id', session.user.id)
        .single();

      if (!brand) { setLoading(false); return; }
      setPlanType(brand.plan_type ?? 'free');

      const { data: bookingData } = await supabase
        .from('bookings')
        .select('id, meeting_type, status, preferred_date, preferred_time, homeowner_name, project_type, budget_range, created_at')
        .eq('brand_id', brand.id)
        .order('preferred_date', { ascending: false });

      setBookings((bookingData ?? []) as unknown as Booking[]);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b =>
    ['pending', 'confirmed'].includes(b.status) && b.preferred_date && b.preferred_date >= today
  ).sort((a, b) => (a.preferred_date ?? '') < (b.preferred_date ?? '') ? -1 : 1);

  const pendingCompletion = bookings.filter(b =>
    ['pending', 'confirmed'].includes(b.status) && (!b.preferred_date || b.preferred_date < today)
  );

  const completedAll = bookings.filter(b => ['completed', 'cancelled', 'no_show'].includes(b.status));
  const completedFiltered = filterByType(filterByDate(completedAll, dateFilter), typeFilter);

  const totalCount = bookings.length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const noShowCount = bookings.filter(b => b.status === 'no_show').length;
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openModal(type: ModalType, bookingId: string) {
    setModal(type);
    setActiveBookingId(bookingId);
    setModalSuccess(false);
    setCancelReason('');
    setFakeReason('');
    setFakeDetails('');
  }

  function closeModal() {
    setModal(null);
    setActiveBookingId(null);
    setModalSuccess(false);
  }

  async function handleComplete() {
    if (!activeBookingId) return;
    setUpdating(true);
    const supabase = createClient();
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', activeBookingId);
    setBookings(prev => prev.map(b => b.id === activeBookingId ? { ...b, status: 'completed' as BookingStatus } : b));
    setUpdating(false);
    setModalSuccess(true);
  }

  async function handleNoShow() {
    if (!activeBookingId) return;
    setUpdating(true);
    const supabase = createClient();
    await supabase.from('bookings').update({ status: 'no_show' }).eq('id', activeBookingId);
    setBookings(prev => prev.map(b => b.id === activeBookingId ? { ...b, status: 'no_show' as BookingStatus } : b));
    setUpdating(false);
    setModalSuccess(true);
  }

  async function handleCancel() {
    if (!activeBookingId || !cancelReason) return;
    const supabase = createClient();
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', activeBookingId);
    setBookings(prev => prev.map(b => b.id === activeBookingId ? { ...b, status: 'cancelled' as BookingStatus } : b));
    closeModal();
  }

  function ReqsSection({ id, booking }: { id: string; booking: Booking }) {
    const reqs: [string, string][] = [];
    if (booking.project_type) reqs.push(['Project', booking.project_type]);
    if (booking.budget_range) reqs.push(['Budget', booking.budget_range]);
    if (reqs.length === 0) return null;
    const isOpen = expanded.has(id);
    return (
      <>
        <div className={`bm-expand-toggle${isOpen ? ' open' : ''}`} onClick={() => toggleExpand(id)}>
          <span>📋 View Requirements</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        {isOpen && (
          <div className="bm-expand-body open">
            <div className="bm-req-grid">
              {reqs.map(([label, val]) => (
                <>
                  <span key={`l-${label}`} className="bm-req-label">{label}</span>
                  <span key={`v-${label}`} className="bm-req-val">{val}</span>
                </>
              ))}
            </div>
          </div>
        )}
      </>
    );
  }

  if (loading) return (
    <div className="bm-page">
      <BrandNav />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading meetings…</div>
      </div>
    </div>
  );

  return (
    <div className="bm-page">
      <BrandNav />

      <div className="bm-container">
        {/* Header */}
        <div className="bm-page-header">
          <div>
            <h1>Meetings</h1>
            <div className="bm-ph-sub">Manage all your customer consultations</div>
          </div>
          <button className="bm-ph-btn" onClick={() => alert('Export CSV')}>📥 Export</button>
        </div>

        {/* Stats Bar */}
        <div className="bm-stats-bar">
          {[
            { num: totalCount, label: 'Total', cls: 'total' },
            { num: completedCount, label: 'Completed', cls: 'completed' },
            { num: noShowCount, label: 'No-Shows', cls: 'noshow' },
            { num: cancelledCount, label: 'Cancelled', cls: 'fake' },
            { num: pendingCompletion.length, label: 'Pending', cls: 'pending' },
          ].map(s => (
            <div key={s.cls} className={`bm-stat ${s.cls}`}>
              <div className="bm-stat-num">{s.num}</div>
              <div className="bm-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bm-tabs">
          {[
            { id: 'upcoming', label: 'Upcoming', count: upcoming.length, urgent: false },
            { id: 'pending', label: 'Pending Completion', count: pendingCompletion.length, urgent: pendingCompletion.length > 0 },
            { id: 'completed', label: 'Completed', count: completedAll.length, urgent: false },
          ].map(t => (
            <button
              key={t.id}
              className={`bm-tab-btn${activeTab === t.id ? ' active' : ''}`}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
            >
              {t.label}
              <span className={`bm-tab-count${t.urgent ? ' urgent' : ''}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* ── UPCOMING ── */}
        <div className={`bm-tab-panel${activeTab === 'upcoming' ? ' active' : ''}`}>
          {upcoming.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 14 }}>
              No upcoming meetings scheduled.
            </div>
          ) : upcoming.map(m => (
            <div key={m.id} className="bm-card">
              <div className="bm-top">
                <div className="bm-customer">
                  <div className={`bm-avatar ${TYPE_CLASS[m.meeting_type] ?? 'vc'}`}>{getInitials(m.homeowner_name)}</div>
                  <div>
                    <div className="bm-name">{m.homeowner_name}</div>
                    <div className="bm-meta">
                      <span className={`bm-type-badge ${TYPE_CLASS[m.meeting_type] ?? 'vc'}`}>{MEETING_LABELS[m.meeting_type]}</span>
                      {m.project_type && <span>{m.project_type}</span>}
                    </div>
                  </div>
                </div>
                <div className="bm-right">
                  <div className="bm-countdown">
                    <span className="pulse-dot"></span> {getCountdown(m.preferred_date)}
                  </div>
                  <div className="bm-fee">{fmtFee(m.meeting_type, planType)}</div>
                </div>
              </div>
              <div className="bm-info">
                <span>{fmtDateTime(m.preferred_date, m.preferred_time)}</span>
              </div>
              <div className="bm-actions">
                <button className="bm-btn bm-btn-outline" onClick={() => alert('Reschedule picker')}>📅 Reschedule</button>
                <button className="bm-btn bm-btn-outline danger" onClick={() => openModal('cancel', m.id)}>Cancel</button>
              </div>
              <ReqsSection id={m.id} booking={m} />
            </div>
          ))}
        </div>

        {/* ── PENDING COMPLETION ── */}
        <div className={`bm-tab-panel${activeTab === 'pending' ? ' active' : ''}`}>
          {pendingCompletion.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 14 }}>
              No meetings pending completion.
            </div>
          ) : pendingCompletion.map(m => (
            <div key={m.id} className="bm-card pending-card">
              <div className="bm-timer-bar">
                <div className="bm-timer">⏰ {getTimer(m.preferred_date, m.preferred_time)} remaining</div>
                <div className="bm-timer-warn">Auto-completes after 48 hours</div>
              </div>
              <div className="bm-top">
                <div className="bm-customer">
                  <div className={`bm-avatar ${TYPE_CLASS[m.meeting_type] ?? 'vc'}`}>{getInitials(m.homeowner_name)}</div>
                  <div>
                    <div className="bm-name">{m.homeowner_name}</div>
                    <div className="bm-meta">
                      <span className={`bm-type-badge ${TYPE_CLASS[m.meeting_type] ?? 'vc'}`}>{MEETING_LABELS[m.meeting_type]}</span>
                      {m.project_type && <span>{m.project_type}</span>}
                    </div>
                  </div>
                </div>
                <div className="bm-right">
                  <div className="bm-fee">{fmtFee(m.meeting_type, planType)}</div>
                </div>
              </div>
              <div className="bm-info">
                <span>{fmtDateTime(m.preferred_date, m.preferred_time)}</span>
              </div>
              <div className="bm-actions">
                <button className="bm-btn bm-btn-green" onClick={() => openModal('complete', m.id)}>✓ Mark Completed</button>
                <button className="bm-btn bm-btn-amber" onClick={() => openModal('noshow', m.id)}>👤 Customer No-Show</button>
                <div className="bm-actions-spacer"></div>
                <button className="bm-btn bm-btn-red" onClick={() => openModal('fake', m.id)}>🚩 Report Fake Lead</button>
              </div>
              <ReqsSection id={m.id} booking={m} />
            </div>
          ))}
        </div>

        {/* ── COMPLETED ── */}
        <div className={`bm-tab-panel${activeTab === 'completed' ? ' active' : ''}`}>
          <div className="bm-filters-row">
            <select className="bm-filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              {['All Dates', 'Last 7 days', 'Last 30 days', 'This month', 'Last month'].map(o => <option key={o}>{o}</option>)}
            </select>
            <select className="bm-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {['All Types', 'Video Call', 'Site Visit', 'Experience Center'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          {completedFiltered.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '40px 24px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 14 }}>
              No completed meetings yet.
            </div>
          ) : completedFiltered.map(m => (
            <div key={m.id} className="bm-card">
              <div className="bm-top">
                <div className="bm-customer">
                  <div className={`bm-avatar ${TYPE_CLASS[m.meeting_type] ?? 'vc'}`}>{getInitials(m.homeowner_name)}</div>
                  <div>
                    <div className="bm-name">{m.homeowner_name}</div>
                    <div className="bm-meta">
                      <span className={`bm-type-badge ${TYPE_CLASS[m.meeting_type] ?? 'vc'}`}>{MEETING_LABELS[m.meeting_type]}</span>
                      <span>{fmtShortDate(m.preferred_date)}</span>
                    </div>
                  </div>
                </div>
                <div className="bm-right">
                  <div className={`bm-fee${m.status === 'no_show' ? ' refunded' : ''}`}>
                    {fmtFee(m.meeting_type, planType)}{m.status === 'no_show' ? ' refunded' : ''}
                  </div>
                </div>
              </div>
              <div className="bm-completed-bar">
                {m.status === 'no_show' ? (
                  <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>
                    👤 Customer no-show — fee refunded to wallet
                  </div>
                ) : m.status === 'cancelled' ? (
                  <div style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>
                    ❌ Cancelled
                  </div>
                ) : (
                  <div className="bm-no-rating">Awaiting customer review</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MODALS ── */}

      {/* Complete */}
      {modal === 'complete' && (
        <div className="bm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bm-modal">
            {!modalSuccess ? (
              <>
                <div className="bm-modal-title">Mark as completed?</div>
                <div className="bm-modal-desc">Confirm this consultation happened and the fee will be finalized.</div>
                <div className="bm-modal-btns">
                  <button className="bm-modal-btn bm-modal-btn-cancel" onClick={closeModal}>Cancel</button>
                  <button className="bm-modal-btn bm-modal-btn-green" disabled={updating} onClick={handleComplete}>
                    {updating ? 'Saving…' : '✓ Mark Completed'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Meeting marked as completed</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>The customer can now leave a review.</div>
                <button className="bm-modal-btn bm-modal-btn-cancel" style={{ width: '100%' }} onClick={closeModal}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No-Show */}
      {modal === 'noshow' && (
        <div className="bm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bm-modal">
            {!modalSuccess ? (
              <>
                <div className="bm-modal-title">Report customer no-show?</div>
                <div className="bm-modal-desc">The meeting fee will be refunded to your wallet and the customer will be notified.</div>
                <div className="bm-modal-warn">⚠️ No-show reports are reviewed by Inzario. Patterns of no-shows may result in customer restrictions.</div>
                <div className="bm-modal-btns">
                  <button className="bm-modal-btn bm-modal-btn-cancel" onClick={closeModal}>Cancel</button>
                  <button className="bm-modal-btn bm-modal-btn-amber" disabled={updating} onClick={handleNoShow}>
                    {updating ? 'Saving…' : '👤 Report No-Show'}
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>💰</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>No-show reported</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>The fee has been refunded to your wallet.</div>
                <button className="bm-modal-btn bm-modal-btn-cancel" style={{ width: '100%' }} onClick={closeModal}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Fake Lead */}
      {modal === 'fake' && (
        <div className="bm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bm-modal">
            {!modalSuccess ? (
              <>
                <div className="bm-modal-title">Report fake lead?</div>
                <div className="bm-modal-desc">This will be escalated to the Inzario admin team for investigation.</div>
                <div className="bm-modal-field">
                  <label className="bm-modal-label">Reason</label>
                  <select className="bm-modal-input" style={{ cursor: 'pointer' }} value={fakeReason} onChange={e => setFakeReason(e.target.value)}>
                    <option value="">Select reason...</option>
                    <option>Wrong / fake phone number</option>
                    <option>Non-serious inquiry / spam</option>
                    <option>Abusive or inappropriate behavior</option>
                    <option>Already contacted directly (bypassing platform)</option>
                    <option>Duplicate lead</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="bm-modal-field">
                  <label className="bm-modal-label">Additional details <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(optional)</span></label>
                  <textarea className="bm-modal-input" rows={3} placeholder="Any specifics the admin should know..." value={fakeDetails} onChange={e => setFakeDetails(e.target.value)} style={{ resize: 'none' }} />
                </div>
                <div className="bm-modal-danger">🚩 Fake lead reports are taken seriously. If verified, the customer will be suspended and your fee refunded. False reports may affect your account.</div>
                <div className="bm-modal-btns">
                  <button className="bm-modal-btn bm-modal-btn-cancel" onClick={closeModal}>Cancel</button>
                  <button className="bm-modal-btn bm-modal-btn-red" disabled={!fakeReason} onClick={() => setModalSuccess(true)}>🚩 Submit Report</button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>Report submitted</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>Our team will review within 24 hours. You'll be notified of the outcome via email.</div>
                <button className="bm-modal-btn bm-modal-btn-cancel" style={{ width: '100%' }} onClick={closeModal}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel */}
      {modal === 'cancel' && (
        <div className="bm-modal-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="bm-modal">
            <div className="bm-modal-title">Cancel this meeting?</div>
            <div className="bm-modal-desc">The customer will be notified and the meeting fee refunded to your wallet.</div>
            <div className="bm-modal-field">
              <label className="bm-modal-label">Reason</label>
              <select className="bm-modal-input" style={{ cursor: 'pointer' }} value={cancelReason} onChange={e => setCancelReason(e.target.value)}>
                <option value="">Select reason...</option>
                <option>Schedule conflict</option>
                <option>Team unavailability</option>
                <option>Customer requested via call</option>
                <option>Other</option>
              </select>
            </div>
            <div className="bm-modal-btns">
              <button className="bm-modal-btn bm-modal-btn-cancel" onClick={closeModal}>Keep Meeting</button>
              <button className="bm-modal-btn bm-modal-btn-red" disabled={!cancelReason} onClick={handleCancel}>
                Cancel Meeting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
