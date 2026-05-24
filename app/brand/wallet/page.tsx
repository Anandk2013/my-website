'use client';

import { useEffect, useState } from 'react';
import BrandNav from '@/components/BrandNav';
import { createClient } from '@/lib/supabase';

const COMPARE_ROWS = [
  { feature: 'Brand Profile', free: 'Basic', pro: 'Enhanced + Verified Badge', proHighlight: true },
  { feature: 'Portfolio Images', free: '5 max', pro: 'Unlimited', proHighlight: true },
  { feature: 'Search Placement', free: 'Standard', pro: 'Featured / Priority', proHighlight: true },
  { feature: 'Analytics Dashboard', free: false, pro: true },
  { feature: 'Free Meetings per Month', free: '0', pro: '2 included', proHighlight: true },
  { feature: 'Video Call Rate', free: '₹4,000', pro: '₹2,000 (50% off)', proHighlight: true },
  { feature: 'Site Visit Rate', free: '₹5,000', pro: '₹2,500 (50% off)', proHighlight: true },
  { feature: 'Experience Center Rate', free: '₹7,000', pro: '₹3,500 (50% off)', proHighlight: true },
  { feature: 'Pause / Resume', free: false, pro: '✓ (billing frozen)' },
  { feature: 'Priority Support', free: false, pro: true },
];

type TxnRow = {
  id: string;
  date: string;
  type: string;
  desc: string;
  amount: number;
};

const MEETING_FEE: Record<string, Record<string, number>> = {
  pro: { video_call: 2000, site_visit: 2500, experience_center: 3500 },
  free: { video_call: 4000, site_visit: 5000, experience_center: 7000 },
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function BrandWalletPage() {
  const [brandName, setBrandName] = useState('');
  const [planType, setPlanType] = useState('free');
  const [walletBalance, setWalletBalance] = useState(0);
  const [transactions, setTransactions] = useState<TxnRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState('All Types');

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setLoading(false); return; }

      const { data: brand } = await supabase
        .from('brands')
        .select('id, name, plan_type, wallet_balance')
        .eq('auth_user_id', session.user.id)
        .single();

      if (brand) {
        setBrandName(brand.name ?? '');
        setPlanType(brand.plan_type ?? 'free');
        setWalletBalance(brand.wallet_balance ?? 0);

        // Derive transaction history from bookings until wallet_transactions table exists
        const { data: meetings } = await supabase
          .from('bookings')
          .select('id, meeting_type, homeowner_name, status, created_at')
          .eq('brand_id', brand.id)
          .neq('status', 'cancelled')
          .order('created_at', { ascending: false })
          .limit(50);

        const plan = brand.plan_type ?? 'free';
        const rows: TxnRow[] = (meetings ?? []).map(m => ({
          id: m.id,
          date: fmtDate(m.created_at),
          type: 'Meeting Fee',
          desc: `${m.meeting_type.replace(/_/g, ' ')} — ${m.homeowner_name}`,
          amount: -(MEETING_FEE[plan]?.[m.meeting_type] ?? 0),
        }));
        setTransactions(rows);
      }
      setLoading(false);
    });
  }, []);

  const isPro = planType === 'pro';
  const fmtBalance = `₹${walletBalance.toLocaleString('en-IN')}`;
  const lowestFee = isPro ? 2000 : 4000;
  const meetingsRemaining = Math.floor(walletBalance / lowestFee);

  if (loading) return (
    <div className="wallet-page">
      <BrandNav />
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>Loading wallet…</div>
      </div>
    </div>
  );

  return (
    <div className="wallet-page">
      <BrandNav />

      <div className="wallet-container">
        <div className="page-header" style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,3.5vw,30px)', fontWeight: 700, color: 'var(--primary)', marginBottom: 4 }}>
            Wallet &amp; Subscription
          </h1>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{brandName} · {isPro ? 'Pro Plan' : 'Free Plan'}</div>
        </div>

        {/* Top Grid */}
        <div className="wallet-top-grid">
          {/* Wallet Card */}
          <div className="wlt-card">
            <div className="wlt-label">Wallet Balance</div>
            <div className="wlt-balance">{fmtBalance}</div>
            <div className="wlt-meetings">≈ {meetingsRemaining} meeting{meetingsRemaining !== 1 ? 's' : ''} remaining at current rates</div>
            <div className="wlt-actions">
              <button className="wlt-btn wlt-btn-primary" onClick={() => alert('Razorpay checkout opens')}>💳 Recharge Wallet</button>
              <button className="wlt-btn wlt-btn-ghost" onClick={() => alert('Auto-recharge settings')}>⚡ Auto-Recharge</button>
            </div>
          </div>

          {/* Subscription Card */}
          <div className="wlt-sub-card">
            <div className="wlt-sub-top">
              <div className="wlt-sub-tier">
                <span className="wlt-sub-badge">{isPro ? 'Pro' : 'Free'}</span>
                <span className="wlt-sub-name">{isPro ? 'Pro Plan' : 'Free Plan'}</span>
              </div>
              {isPro && (
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', cursor: 'pointer' }} onClick={() => alert('Manage subscription')}>Manage →</span>
              )}
            </div>
            <div className="wlt-sub-rows">
              {isPro ? [
                ['Monthly Fee', '₹10,000/mo'],
                ['Free Meetings', '2 per month'],
                ['Meeting Rates', '50% off MRP'],
                ['Wallet Balance', fmtBalance],
              ] : [
                ['Plan', 'Free'],
                ['Meeting Rates', 'Standard MRP'],
                ['Video Call', '₹4,000'],
                ['Site Visit', '₹5,000'],
              ].map(([l, v]) => (
                <div key={l} className="wlt-sub-row">
                  <span className="wlt-sub-row-label">{l}</span>
                  <span className="wlt-sub-row-val">{v}</span>
                </div>
              ))}
            </div>
            {!isPro && (
              <div style={{ marginTop: 16 }}>
                <button className="wlt-btn wlt-btn-primary" style={{ width: '100%' }} onClick={() => alert('Razorpay checkout for Pro upgrade')}>
                  Upgrade to Pro — ₹10,000/mo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="wlt-section-card">
          <div className="wlt-sc-header">
            <div className="wlt-sc-title">💰 Transactions</div>
          </div>
          <div className="txn-filters">
            <select className="txn-filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              {['All Types', 'Meeting Fee', 'Recharge', 'Refund'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          {transactions.length === 0 ? (
            <div style={{ padding: '32px 24px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>
              No transactions yet. They'll appear here once meetings are booked.
            </div>
          ) : (
            <div className="txn-list">
              {transactions
                .filter(t => typeFilter === 'All Types' || t.type === typeFilter)
                .map(t => (
                  <div key={t.id} className="txn-row">
                    <div className="txn-row-icon" style={{ background: t.amount < 0 ? '#FEF2F2' : '#ECFDF5', color: t.amount < 0 ? '#DC2626' : '#059669' }}>
                      {t.amount < 0 ? '↓' : '↑'}
                    </div>
                    <div className="txn-row-info">
                      <div className="txn-row-desc">{t.desc}</div>
                      <div className="txn-row-date">{t.date} · {t.type}</div>
                    </div>
                    <div className="txn-row-amount" style={{ color: t.amount < 0 ? '#DC2626' : '#059669' }}>
                      {t.amount < 0 ? '−' : '+'}₹{Math.abs(t.amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Free vs Pro Comparison */}
        <div className="compare-section">
          <div className="compare-header">
            <h2>Free vs Pro — Full Comparison</h2>
            <p>See exactly what you get with each plan</p>
          </div>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th>Free Plan<br /><span style={{ fontWeight: 400, fontSize: 11, color: 'var(--ink-4)' }}>₹0/month</span></th>
                <th>Pro Plan<br /><span style={{ fontWeight: 400, fontSize: 11, color: 'var(--accent)' }}>₹10,000/month</span></th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map(row => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>
                    {row.free === false ? <span className="compare-cross">✕</span> : <span className="compare-val">{row.free}</span>}
                  </td>
                  <td>
                    {row.pro === true ? <span className="compare-check">✓</span>
                      : row.proHighlight ? <span className="compare-highlight">{row.pro}</span>
                      : <span>{row.pro}</span>}
                  </td>
                </tr>
              ))}
              <tr>
                <td></td>
                <td>
                  <button className={`compare-cta-btn${!isPro ? ' compare-cta-free' : ''}`} disabled={!isPro}>
                    {!isPro ? 'Current Plan' : 'Downgrade'}
                  </button>
                </td>
                <td>
                  <button
                    className={`compare-cta-btn${isPro ? ' compare-cta-free' : ' compare-cta-pro'}`}
                    disabled={isPro}
                    onClick={() => !isPro && alert('Razorpay checkout for Pro upgrade')}
                  >
                    {isPro ? 'Current Plan' : 'Upgrade to Pro'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
