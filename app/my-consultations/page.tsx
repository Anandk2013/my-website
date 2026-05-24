'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import NavAuth from '@/components/NavAuth';

type Booking = {
  id: string;
  meeting_type: string;
  status: string;
  preferred_date: string | null;
  preferred_time: string | null;
  project_type: string | null;
  budget_range: string | null;
  notes: string | null;
  homeowner_name: string;
  review_rating: number | null;
  reviewed_at: string | null;
  created_at: string;
  brands: {
    name: string;
    slug: string;
    logo_initials: string | null;
    location: string;
    rating: number;
    cover_gradient: string | null;
    address: string | null;
  } | null;
};

const MEETING_LABELS: Record<string, string> = {
  video_call: '📹 Video Call',
  site_visit: '🏠 Site Visit',
  experience_center: '🏢 Experience Center',
};

function daysUntil(dateStr: string | null): string {
  if (!dateStr) return 'Date to be confirmed';
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'Past';
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
}

function formatDate(dateStr: string | null, time: string | null): string {
  if (!dateStr) return 'Date to be confirmed';
  const d = new Date(dateStr);
  const formatted = d.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
  return time ? `${formatted} · ${time}` : formatted;
}

export default function MyConsultationsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [expandedReqs, setExpandedReqs] = useState<Set<string>>(new Set());

  const [reviewModal, setReviewModal] = useState<{ open: boolean; bookingId: string; brandName: string }>({ open: false, bookingId: '', brandName: '' });
  const [reviewStars, setReviewStars] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [recommend, setRecommend] = useState<'yes' | 'no' | null>(null);
  const [reviewDone, setReviewDone] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  const [cancelModal, setCancelModal] = useState<{ open: boolean; bookingId: string }>({ open: false, bookingId: '' });
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.replace('/login?returnTo=/my-consultations'); return; }
      const { data } = await supabase
        .from('bookings')
        .select('id, meeting_type, status, preferred_date, preferred_time, project_type, budget_range, notes, homeowner_name, review_rating, reviewed_at, created_at, brands(name, slug, logo_initials, location, rating, cover_gradient, address)')
        .or(`homeowner_id.eq.${session.user.id},homeowner_email.eq.${session.user.email}`)
        .order('created_at', { ascending: false });
      const rows = (data as unknown as Booking[]) ?? [];
      setBookings(rows);
      setReviewedIds(new Set(rows.filter(b => b.reviewed_at).map(b => b.id)));
      setLoading(false);
    });
  }, []);

  const upcoming = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed');
  const completed = bookings.filter(b => b.status === 'completed');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  function toggleReqs(id: string) {
    setExpandedReqs(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCancel() {
    if (!cancelReason) return;
    const supabase = createClient();
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', cancelModal.bookingId);
    setBookings(prev => prev.map(b => b.id === cancelModal.bookingId ? { ...b, status: 'cancelled' } : b));
    setCancelModal({ open: false, bookingId: '' });
    setCancelReason('');
    setActiveTab('cancelled');
  }

  function openReview(bookingId: string, brandName: string) {
    setReviewModal({ open: true, bookingId, brandName });
    setReviewStars(0);
    setReviewText('');
    setRecommend(null);
    setReviewDone(false);
  }

  async function handleReviewSubmit() {
    const supabase = createClient();
    await supabase
      .from('bookings')
      .update({
        review_rating: reviewStars,
        review_text: reviewText,
        recommend: recommend === 'yes',
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', reviewModal.bookingId);
    setReviewDone(true);
    setReviewedIds(prev => new Set(prev).add(reviewModal.bookingId));
  }

  const reviewReady = reviewStars > 0 && reviewText.length >= 20 && recommend !== null;

  const logoStyle = (b: Booking) => ({
    background: b.brands?.cover_gradient ?? 'var(--accent)',
  });

  function renderUpcomingCard(b: Booking) {
    const days = daysUntil(b.preferred_date);
    const isPast = days === 'Past';
    const isToday = days === 'Today';
    const expanded = expandedReqs.has(b.id);

    return (
      <div className="consult-card" key={b.id}>
        <div className="cc-top">
          <div className="cc-brand">
            <div className="cc-logo" style={logoStyle(b)}>{b.brands?.logo_initials ?? '?'}</div>
            <div>
              <div className="cc-brand-name">
                {b.brands?.name ?? 'Unknown Brand'}
                {' '}<span className="cc-verified">✓ Verified</span>
              </div>
              <div className="cc-brand-meta">
                ⭐ {b.brands?.rating} · {b.brands?.location}
              </div>
            </div>
          </div>
          {!isPast && (
            <div className="cc-status">
              <div className="cc-countdown">
                <span className="pulse-dot"></span>
                {days}
              </div>
              {(isToday || days === 'Tomorrow') && (
                <span className="cc-reminder">⏰ Reminder set</span>
              )}
            </div>
          )}
        </div>

        <div className="cc-meeting">
          <span className="cc-meet-type">{MEETING_LABELS[b.meeting_type] ?? b.meeting_type}</span>
          <span className="cc-meet-dot"></span>
          <span className="cc-meet-datetime">{formatDate(b.preferred_date, b.preferred_time)}</span>
        </div>

        <div className="cc-action-bar">
          <div className="cc-location">
            {b.meeting_type === 'video_call' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 10l5 5-5 5"/><path d="M4 4v7a4 4 0 004 4h12"/></svg>
                Google Meet link will be sent 15 min before
              </>
            ) : b.meeting_type === 'site_visit' ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Designer will visit your location
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {b.brands?.address ?? 'Address will be confirmed'}
              </>
            )}
          </div>
          {b.meeting_type === 'video_call' && (
            <button className={`join-btn${isToday ? '' : ' soon'}`} disabled={!isToday}>
              {isToday ? 'Join Call' : 'Join Call (opens on the day)'}
            </button>
          )}
        </div>

        <div className="cc-action-bar" style={{ paddingTop: 10, paddingBottom: 10 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="cc-action-btn">📅 Reschedule</button>
            <button className="cc-action-btn danger" onClick={() => setCancelModal({ open: true, bookingId: b.id })}>
              Cancel
            </button>
          </div>
        </div>

        {(b.project_type || b.budget_range || b.notes) && (
          <>
            <div
              className={`cc-reqs-toggle${expanded ? ' open' : ''}`}
              onClick={() => toggleReqs(b.id)}
            >
              <span>📋 View Requirements</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {expanded && (
              <div className="cc-reqs-body">
                {b.project_type && <div className="cc-req-row"><span className="cc-req-label">Project Type</span><span className="cc-req-val">{b.project_type}</span></div>}
                {b.budget_range && <div className="cc-req-row"><span className="cc-req-label">Budget</span><span className="cc-req-val">{b.budget_range}</span></div>}
                {b.notes && <div className="cc-req-row"><span className="cc-req-label">Notes</span><span className="cc-req-val" style={{ maxWidth: '70%' }}>{b.notes}</span></div>}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  function renderCompletedCard(b: Booking) {
    const hasReview = reviewedIds.has(b.id);
    return (
      <div className="consult-card" key={b.id}>
        <div className="cc-top">
          <div className="cc-brand">
            <div className="cc-logo" style={logoStyle(b)}>{b.brands?.logo_initials ?? '?'}</div>
            <div>
              <div className="cc-brand-name">{b.brands?.name ?? 'Unknown Brand'}</div>
              <div className="cc-brand-meta">
                {MEETING_LABELS[b.meeting_type]} · {b.preferred_date ? new Date(b.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
              </div>
            </div>
          </div>
          <Link href={`/designers/${b.brands?.slug ?? ''}`} className="book-again-btn">
            Book Again
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
        {hasReview ? (
          <div className="cc-rated">
            <div className="cc-rated-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
              Review submitted — thank you!
            </div>
          </div>
        ) : (
          <div className="cc-rating-prompt">
            <button className="rate-btn" onClick={() => openReview(b.id, b.brands?.name ?? 'this brand')}>
              ⭐ Rate Your Experience
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderCancelledCard(b: Booking) {
    return (
      <div className="consult-card" key={b.id}>
        <div className="cc-top">
          <div className="cc-brand">
            <div className="cc-logo" style={logoStyle(b)}>{b.brands?.logo_initials ?? '?'}</div>
            <div>
              <div className="cc-brand-name">{b.brands?.name ?? 'Unknown Brand'}</div>
              <div className="cc-brand-meta">
                {MEETING_LABELS[b.meeting_type]} · {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
        <div className="cc-cancel-info">
          <div>
            <span className="cancel-by-you">Cancelled</span>
          </div>
          <Link href={`/designers/${b.brands?.slug ?? ''}`}>
            <button className="rebook-btn">Rebook</button>
          </Link>
        </div>
      </div>
    );
  }

  const emptyState = (tab: string) => (
    <div className="mc-empty">
      <div className="mc-empty-icon">{tab === 'upcoming' ? '📅' : tab === 'completed' ? '✅' : '❌'}</div>
      <div className="mc-empty-title">
        {tab === 'upcoming' ? 'No upcoming consultations' : tab === 'completed' ? 'No completed consultations yet' : 'No cancelled consultations'}
      </div>
      <p className="mc-empty-desc">
        {tab === 'upcoming'
          ? "You haven't booked any consultations yet. Browse top-rated designers and book a free meeting."
          : tab === 'completed'
          ? 'Once your consultations are confirmed and completed, they will appear here.'
          : 'No consultations have been cancelled.'}
      </p>
      {tab === 'upcoming' && (
        <Link href="/designers" className="mc-empty-btn">Browse Designers →</Link>
      )}
    </div>
  );

  return (
    <>
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="logo-text">Inzario</span>
          </Link>
          <ul className="nav-links">
            <li><Link href="/designers">Find Brands</Link></li>
            <li><Link href="/budget-estimator">Budget Estimator</Link></li>
            <li><NavAuth /></li>
          </ul>
        </div>
      </nav>

      <div className="mc-page">
        <div className="mc-container">
          <div className="mc-header">
            <div>
              <h1>My Consultations</h1>
              <div className="mc-ph-counts">
                <strong>{upcoming.length}</strong> upcoming · <strong>{completed.length}</strong> completed
              </div>
            </div>
            <Link href="/designers" className="mc-ph-link">
              Find More Brands
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </Link>
          </div>

          <div className="mc-tabs">
            {(['upcoming', 'completed', 'cancelled'] as const).map(tab => {
              const count = tab === 'upcoming' ? upcoming.length : tab === 'completed' ? completed.length : cancelled.length;
              return (
                <button
                  key={tab}
                  className={`mc-tab-btn${activeTab === tab ? ' active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  <span className="mc-tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-4)' }}>Loading…</div>
          ) : (
            <>
              <div className={`mc-tab-panel${activeTab === 'upcoming' ? ' active' : ''}`}>
                {upcoming.length === 0 ? emptyState('upcoming') : upcoming.map(renderUpcomingCard)}
              </div>
              <div className={`mc-tab-panel${activeTab === 'completed' ? ' active' : ''}`}>
                {completed.length === 0 ? emptyState('completed') : completed.map(renderCompletedCard)}
              </div>
              <div className={`mc-tab-panel${activeTab === 'cancelled' ? ' active' : ''}`}>
                {cancelled.length === 0 ? emptyState('cancelled') : cancelled.map(renderCancelledCard)}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── REVIEW MODAL ── */}
      {reviewModal.open && (
        <div className="mc-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setReviewModal(m => ({ ...m, open: false })); }}>
          <div className="review-modal">
            {reviewDone ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>Thanks for your review!</div>
                <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 24 }}>It's been submitted and will appear on the brand's profile shortly.</div>
                <button className="rm-submit-btn" onClick={() => setReviewModal(m => ({ ...m, open: false }))}>Close</button>
              </div>
            ) : (
              <>
                <button className="rm-close" onClick={() => setReviewModal(m => ({ ...m, open: false }))}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
                <div className="rm-title">Rate Your Experience</div>
                <div className="rm-sub">How was your consultation with <strong>{reviewModal.brandName}</strong>?</div>
                <div className="star-picker">
                  {[1,2,3,4,5].map(n => (
                    <button key={n} className={`star-pick${reviewStars >= n ? ' active' : ''}`} onClick={() => setReviewStars(n)}>⭐</button>
                  ))}
                </div>
                <textarea
                  className="rm-textarea"
                  placeholder="Tell us about your experience (min 20 characters)…"
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                />
                <div className="rm-charcount" style={{ color: reviewText.length >= 20 ? 'var(--green)' : 'var(--ink-4)' }}>
                  {reviewText.length} / 20 min
                </div>
                <div className="recommend-row">
                  <button className={`rec-btn yes${recommend === 'yes' ? ' active' : ''}`} onClick={() => setRecommend('yes')}>👍 Would Recommend</button>
                  <button className={`rec-btn no${recommend === 'no' ? ' active' : ''}`} onClick={() => setRecommend('no')}>👎 Would Not</button>
                </div>
                <button className="rm-submit-btn" disabled={!reviewReady} onClick={handleReviewSubmit}>
                  Submit Review
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── CANCEL MODAL ── */}
      {cancelModal.open && (
        <div className="mc-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setCancelModal({ open: false, bookingId: '' }); }}>
          <div className="cancel-modal">
            <div className="cm-title">Cancel this consultation?</div>
            <div className="cm-sub">Please let us know the reason so we can improve.</div>
            <select className="cm-select" value={cancelReason} onChange={e => setCancelReason(e.target.value)}>
              <option value="">Select a reason…</option>
              <option>Found another designer</option>
              <option>Schedule conflict</option>
              <option>Project postponed</option>
              <option>Budget changed</option>
              <option>Other reason</option>
            </select>
            <div className="cm-btns">
              <button className="cm-btn-keep" onClick={() => setCancelModal({ open: false, bookingId: '' })}>Keep Booking</button>
              <button className="cm-btn-confirm" disabled={!cancelReason} onClick={handleCancel}>Yes, Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
