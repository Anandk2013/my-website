'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import BrandNav from '@/components/BrandNav';
import { createClient } from '@/lib/supabase';

type BrandData = {
  id: string;
  name: string;
  logo_initials: string | null;
  plan_type: string;
  is_verified: boolean;
  wallet_balance: number;
  rating: number;
  review_count: number;
  status: string;
};

type Booking = {
  id: string;
  meeting_type: string;
  status: string;
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

function fmtFee(meetingType: string, planType: string): string {
  const fees = planType === 'pro' ? PRO_FEES : FREE_FEES;
  return `₹${(fees[meetingType] ?? 0).toLocaleString('en-IN')}`;
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

function fmtRelative(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function BrandDashboardPage() {
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [recent, setRecent] = useState<Booking[]>([]);
  const [thisMonthCount, setThisMonthCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const [pauseModal, setPauseModal] = useState(false);
  const [pauseDate, setPauseDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [pauseUntil, setPauseUntil] = useState('');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) return;

      const { data: b } = await supabase
        .from('brands')
        .select('id, name, logo_initials, plan_type, is_verified, wallet_balance, rating, review_count, status')
        .eq('auth_user_id', session.user.id)
        .single();

      if (!b) { setLoading(false); return; }
      setBrand(b as unknown as BrandData);
      setPaused(false);

      const today = new Date().toISOString().split('T')[0];

      // Upcoming bookings (future date, pending or confirmed)
      const { data: upcomingData } = await supabase
        .from('bookings')
        .select('id, meeting_type, status, preferred_date, preferred_time, homeowner_name, project_type, budget_range, created_at')
        .eq('brand_id', b.id)
        .in('status', ['pending', 'confirmed'])
        .gte('preferred_date', today)
        .order('preferred_date', { ascending: true })
        .limit(5);
      setUpcoming(upcomingData ?? []);

      // Recent bookings for activity feed
      const { data: recentData } = await supabase
        .from('bookings')
        .select('id, meeting_type, status, preferred_date, preferred_time, homeowner_name, project_type, budget_range, created_at')
        .eq('brand_id', b.id)
        .order('created_at', { ascending: false })
        .limit(8);
      setRecent(recentData ?? []);

      // Meetings this month
      const monthStart = new Date();
      monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('brand_id', b.id)
        .gte('created_at', monthStart.toISOString());
      setThisMonthCount(count ?? 0);

      setLoading(false);
    });
  }, []);

  async function confirmPause() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('brands').update({ status: 'paused' }).eq('auth_user_id', session.user.id);
    setPaused(true);
    const d = new Date(pauseDate);
    setPauseUntil('Paused until ' + d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    setPauseModal(false);
  }

  async function handleUnpause() {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await supabase.from('brands').update({ status: 'active' }).eq('auth_user_id', session.user.id);
    setPaused(false);
    setPauseUntil('');
  }

  const ChevronRight = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
  );

  if (loading) return (
    <div className="dash-page">
      <BrandNav />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading dashboard…</div>
      </div>
    </div>
  );

  if (!brand) return (
    <div className="dash-page">
      <BrandNav />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>Brand profile not found. Please complete registration first.</div>
      </div>
    </div>
  );

  const isPro = brand.plan_type === 'pro';
  const walletBalance = brand.wallet_balance ?? 0;
  const fmtBalance = `₹${walletBalance.toLocaleString('en-IN')}`;
  const meetingsRemaining = Math.floor(walletBalance / (isPro ? 2000 : 4000));
  const isLowBalance = walletBalance < 5000;

  return (
    <div className="dash-page">
      <BrandNav />

      <div className="dash-container">

        {/* Pending approval banner */}
        {brand.status === 'pending_review' && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 20 }}>⏳</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: '#92400E' }}>Your profile is under review</div>
              <div style={{ fontSize: 13, color: '#B45309', marginTop: 2 }}>Our team will verify your brand within 24–48 hours. You&apos;ll appear in search once approved.</div>
            </div>
          </div>
        )}

        {/* Brand Header */}
        <div className="dash-brand-header">
          <div className="dash-bh-left">
            <div className="dash-bh-logo" style={{ background: 'linear-gradient(135deg,#E8D5B7,#C4A77D)' }}>
              {brand.logo_initials ?? '??'}
            </div>
            <div>
              <div className="dash-bh-name">{brand.name}</div>
              <div className="dash-bh-meta">
                {isPro && <span className="dash-bh-tier-pro">Pro</span>}
                {brand.is_verified && (
                  <span className="dash-bh-verified">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="dash-pause-toggle" onClick={() => paused ? handleUnpause() : setPauseModal(true)}>
            <span className="dash-pause-label">{paused ? (pauseUntil || 'Paused') : 'Pause Incoming Leads'}</span>
            <div className={`dash-toggle-track${paused ? ' on' : ''}`} onClick={e => { e.stopPropagation(); paused ? handleUnpause() : setPauseModal(true); }}>
              <div className="dash-toggle-thumb"></div>
            </div>
          </div>
        </div>

        {/* Low balance alert */}
        {isLowBalance && (
          <div className="dash-alerts">
            <div className="dash-alert warn">
              <span className="dash-alert-icon">⚠️</span>
              <div className="dash-alert-content">
                <div className="dash-alert-title">Low wallet balance</div>
                <div className="dash-alert-desc">{fmtBalance} remaining — ~{meetingsRemaining} meeting{meetingsRemaining !== 1 ? 's' : ''} left. Recharge to keep accepting bookings.</div>
              </div>
              <Link href="/brand/wallet"><button className="dash-alert-btn">Recharge Now</button></Link>
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="dash-metrics-grid">
          {[
            { label: '💰 Wallet Balance', val: fmtBalance, sub: `~${meetingsRemaining} meetings remaining`, barW: `${Math.min((walletBalance / 25000) * 100, 100)}%`, barColor: 'var(--gold)', action: 'Recharge' },
            { label: '📅 Meetings This Month', val: String(thisMonthCount), sub: 'New consultations', barW: `${Math.min(thisMonthCount * 10, 100)}%`, barColor: 'var(--green)' },
            { label: '⭐ Avg Rating', val: brand.rating > 0 ? brand.rating.toFixed(1) : '—', sub: `From ${brand.review_count} reviews`, barW: `${(brand.rating / 5) * 100}%`, barColor: '#F59E0B' },
            { label: '📋 Plan', val: isPro ? 'Pro' : 'Free', sub: isPro ? '50% off meeting rates' : 'Standard rates apply', barW: isPro ? '100%' : '30%', barColor: isPro ? 'var(--accent)' : 'var(--ink-4)' },
          ].map(m => (
            <div key={m.label} className="dash-metric-card">
              <div className="dash-mc-label">{m.label}</div>
              <div className="dash-mc-value">{m.val}</div>
              <div className="dash-mc-sub">{m.sub}</div>
              {m.action && <div className="dash-mc-action">{m.action} <ChevronRight /></div>}
              <div className="dash-mc-bar"><div className="dash-mc-bar-fill" style={{ width: m.barW, background: m.barColor }}></div></div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="dash-grid">

          {/* LEFT */}
          <div>
            <div style={{ marginBottom: 24 }}>
              <div className="dash-section-header">
                <span className="dash-section-title">📅 Upcoming Meetings</span>
                <Link href="/brand/meetings" className="dash-section-link">View All <ChevronRight /></Link>
              </div>
              {upcoming.length === 0 ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '32px 24px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 14 }}>
                  No upcoming meetings. Your profile is live and accepting bookings.
                </div>
              ) : upcoming.map(booking => (
                <div key={booking.id} className="dash-meet-card">
                  <div className="dash-meet-top">
                    <span className="dash-meet-customer">{booking.homeowner_name}</span>
                    <span className={`dash-meet-badge ${TYPE_CLASS[booking.meeting_type] ?? 'vc'}`}>{MEETING_LABELS[booking.meeting_type]}</span>
                  </div>
                  <div className="dash-meet-datetime">
                    {fmtDateTime(booking.preferred_date, booking.preferred_time)}{' '}
                    <span className="dash-meet-countdown">{getCountdown(booking.preferred_date)}</span>
                  </div>
                  {(booking.project_type || booking.budget_range) && (
                    <div className="dash-meet-scope">
                      {[booking.project_type, booking.budget_range].filter(Boolean).join(' · ')}
                    </div>
                  )}
                  <div className="dash-meet-fee">
                    <span className="dash-meet-fee-label">Meeting Fee</span>
                    <span className="dash-meet-fee-val">{fmtFee(booking.meeting_type, brand.plan_type)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="dash-section-header">
                <span className="dash-section-title">🕐 Recent Activity</span>
              </div>
              <div className="dash-activity-list">
                {recent.length === 0 ? (
                  <div style={{ fontSize: 13, color: 'var(--ink-4)', padding: '16px 0' }}>No activity yet.</div>
                ) : recent.map(b => (
                  <div key={b.id} className="dash-activity-item">
                    <div className="dash-ai-icon" style={{ background: b.status === 'completed' ? 'var(--green-soft)' : b.status === 'cancelled' ? 'var(--red-soft)' : 'var(--accent-soft)' }}>
                      {b.status === 'completed' ? '✅' : b.status === 'cancelled' ? '❌' : '📅'}
                    </div>
                    <div>
                      <div className="dash-ai-text">
                        <strong>{b.status === 'completed' ? 'Meeting completed' : b.status === 'cancelled' ? 'Booking cancelled' : 'New booking'}</strong>
                        {' '}— {b.homeowner_name} · {MEETING_LABELS[b.meeting_type]}
                      </div>
                      <div className="dash-ai-time">{fmtRelative(b.created_at)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div>
            {/* Subscription Card */}
            <div className="dash-sub-card">
              <div className="dash-sub-header">
                <span className="dash-sub-tier">{isPro ? '✨ Pro Plan' : 'Free Plan'}</span>
                <Link href="/brand/wallet" style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', textDecoration: 'none' }}>Manage →</Link>
              </div>
              <div className="dash-sub-rows">
                {isPro ? [
                  ['Monthly Fee', '₹10,000/mo'],
                  ['Free Meetings', '2/month included'],
                  ['Meeting Rates', '50% off MRP'],
                ] : [
                  ['Plan', 'Free'],
                  ['Meeting Rates', 'Standard MRP'],
                  ['Upgrade', 'Pro saves 50% per meeting'],
                ].map(([l, v]) => (
                  <div key={l} className="dash-sub-row">
                    <span className="dash-sub-row-label">{l}</span>
                    <span className="dash-sub-row-val">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dash-qa-title">Quick Actions</div>
            <div className="dash-qa-grid">
              {[
                { icon: '✏️', bg: '#EFF4FB', text: 'Edit Profile', sub: 'Update portfolio & info', href: '/brand/profile' },
                { icon: '💳', bg: 'var(--green-soft)', text: 'Recharge Wallet', sub: `Balance: ${fmtBalance}`, href: '/brand/wallet' },
                { icon: '📅', bg: 'var(--accent-soft)', text: 'View Meetings', sub: `${upcoming.length} upcoming`, href: '/brand/meetings' },
                { icon: paused ? '▶️' : '⏸️', bg: '#FFFBEB', text: paused ? 'Resume Leads' : 'Pause Leads', sub: paused ? 'Currently paused' : 'Take a break', href: '#' },
              ].map(a => (
                <Link
                  key={a.text} href={a.href} className="dash-qa-btn"
                  onClick={a.href === '#' ? (e) => { e.preventDefault(); paused ? handleUnpause() : setPauseModal(true); } : undefined}
                >
                  <div className="dash-qa-icon" style={{ background: a.bg }}>{a.icon}</div>
                  <div>
                    <div className="dash-qa-text">{a.text}</div>
                    <div className="dash-qa-sub">{a.sub}</div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Meeting Rates */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 22 }}>
              <div className="dash-qa-title" style={{ marginBottom: 14 }}>
                Your Meeting Rates {isPro ? '(Pro — 50% Off)' : '(Free Plan)'}
              </div>
              {isPro ? (
                [['📹 Video Call', '₹2,000', '₹4,000'], ['🏠 Site Visit', '₹2,500', '₹5,000'], ['🏢 Experience Center', '₹3,500', '₹7,000']].map(([t, p, old]) => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{p} <s style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 400 }}>{old}</s></span>
                  </div>
                ))
              ) : (
                [['📹 Video Call', '₹4,000'], ['🏠 Site Visit', '₹5,000'], ['🏢 Experience Center', '₹7,000']].map(([t, p]) => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{t}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{p}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pause Modal */}
      {pauseModal && (
        <div className="dash-pause-modal-overlay" onClick={e => { if (e.target === e.currentTarget) setPauseModal(false); }}>
          <div className="dash-pause-modal">
            <div className="dash-pm-title">Pause incoming leads?</div>
            <div className="dash-pm-desc">Your profile will show "Currently Unavailable" and no new bookings will come through. Existing meetings are not affected.</div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>Return date</label>
              <input type="date" className="booking-input" value={pauseDate} onChange={e => setPauseDate(e.target.value)} />
            </div>
            <div className="dash-pm-note">⏸ Pro subscription billing is frozen during pause. You get 1 pause per year, up to 30 days max.</div>
            <div className="dash-pm-btns">
              <button className="dash-pm-btn dash-pm-btn-cancel" onClick={() => setPauseModal(false)}>Cancel</button>
              <button className="dash-pm-btn dash-pm-btn-pause" onClick={confirmPause}>Pause Leads</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
