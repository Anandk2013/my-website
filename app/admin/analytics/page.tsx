'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import AdminNav from '@/components/AdminNav';
import { createClient } from '@/lib/supabase';

Chart.register(...registerables);
Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.display = false;
(Chart.defaults.elements.bar as { borderRadius: number }).borderRadius = 6;
(Chart.defaults.elements.line as { tension: number }).tension = 0.35;

const GRID = { color: '#E4E8EF', lineWidth: 1 };
const NO_GRID = { display: false };

const PERIODS = ['7D', '30D', '90D', 'YTD'];

const FUNNEL = [
  { label: 'Homepage', val: '12,400', pct: '100%', w: '100%', color: 'var(--primary)', drop: null },
  { label: 'Discovery', val: '7,192', pct: '58%', w: '58%', color: 'var(--primary-light)', drop: 'down 42% drop' },
  { label: 'Brand Profile', val: '4,028', pct: '32%', w: '32%', color: 'var(--accent)', drop: 'down 44% drop' },
  { label: 'Auth (OTP)', val: '1,410', pct: '11%', w: '11%', color: '#3B82F6', drop: 'down 65% drop' },
  { label: 'Booking', val: '1,015', pct: '8.2%', w: '8%', color: 'var(--gold)', drop: 'down 28% drop' },
  { label: 'Completed', val: '883', pct: '7.1%', w: '7%', color: 'var(--green)', drop: 'down 13% drop' },
  { label: 'Reviewed', val: '338', pct: '2.7%', w: '2.7%', color: 'var(--gold)', drop: 'down 62% drop' },
];

type KpiRow = {
  label: string;
  num: string;
  change: string;
  dir: 'up' | 'down' | 'neutral';
  barW: string;
  barColor: string;
};

type TopBrand = {
  rank: string;
  rankBg: string;
  rankColor: string;
  name: string;
  meta: string;
  revenue: string;
};

const MEETING_FEE: Record<string, Record<string, number>> = {
  pro: { video_call: 2000, site_visit: 2500, experience_center: 3500 },
  free: { video_call: 4000, site_visit: 5000, experience_center: 7000 },
};

export default function AdminAnalyticsPage() {
  const [activePeriod, setActivePeriod] = useState('30D');
  const [kpis, setKpis] = useState<KpiRow[]>([]);
  const [topBrands, setTopBrands] = useState<TopBrand[]>([]);

  const revenueRef = useRef<HTMLCanvasElement>(null);
  const revSplitRef = useRef<HTMLCanvasElement>(null);
  const meetingsWeeklyRef = useRef<HTMLCanvasElement>(null);
  const meetTypeRef = useRef<HTMLCanvasElement>(null);
  const brandTierRef = useRef<HTMLCanvasElement>(null);
  const custTrendRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from('brands').select('id, name, location, plan_type, rating, status, wallet_balance'),
      supabase.from('bookings').select('id, brand_id, meeting_type, status, reviewed_at, homeowner_email, created_at'),
    ]).then(([{ data: brandsData }, { data: bookingsData }]) => {
      const brands = brandsData ?? [];
      const bookings = bookingsData ?? [];

      const totalBrands = brands.length;
      const activeBrands = brands.filter(b => b.status === 'active').length;
      const proBrands = brands.filter(b => b.plan_type === 'pro').length;
      const freeBrands = brands.filter(b => b.plan_type === 'free').length;

      const nonCancelledBookings = bookings.filter(b => b.status !== 'cancelled');
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const reviewedBookings = bookings.filter(b => b.reviewed_at);
      const completionRate = nonCancelledBookings.length > 0
        ? Math.round((completedBookings.length / nonCancelledBookings.length) * 100)
        : 0;

      const uniqueCustomers = new Set(bookings.map(b => b.homeowner_email).filter(Boolean)).size;

      const ratings = brands.filter(b => b.rating && b.rating > 0).map(b => b.rating as number);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : '—';

      const totalRevenue = brands.reduce((sum, brand) => {
        const brandBookings = bookings.filter(b => b.brand_id === brand.id && b.status !== 'cancelled');
        const fees = brandBookings.reduce((s, bk) => {
          return s + (MEETING_FEE[brand.plan_type ?? 'free']?.[bk.meeting_type] ?? 0);
        }, 0);
        const sub = brand.plan_type === 'pro' ? 10000 : 0;
        return sum + fees + sub;
      }, 0);

      const revLakh = totalRevenue >= 100000
        ? `Rs.${(totalRevenue / 100000).toFixed(1)}L`
        : `Rs.${(totalRevenue / 1000).toFixed(0)}K`;

      setKpis([
        { label: 'Total Revenue', num: revLakh, change: 'All time', dir: 'up', barW: '65%', barColor: 'var(--green)' },
        { label: 'Meetings', num: String(nonCancelledBookings.length), change: `${completedBookings.length} completed`, dir: 'up', barW: `${Math.min(nonCancelledBookings.length, 100)}%`, barColor: 'var(--accent)' },
        { label: 'Active Brands', num: String(activeBrands), change: `${totalBrands} total registered`, dir: 'up', barW: `${totalBrands > 0 ? Math.round((activeBrands / totalBrands) * 100) : 0}%`, barColor: '#3B82F6' },
        { label: 'Customers', num: String(uniqueCustomers), change: 'Unique bookers', dir: 'up', barW: '55%', barColor: '#7C3AED' },
        { label: 'Completion Rate', num: `${completionRate}%`, change: `${reviewedBookings.length} reviewed`, dir: completionRate >= 70 ? 'up' : 'down', barW: `${completionRate}%`, barColor: 'var(--green)' },
        { label: 'Avg Rating', num: String(avgRating), change: `${ratings.length} rated brands`, dir: 'neutral', barW: ratings.length > 0 ? `${Math.round((parseFloat(avgRating) / 5) * 100)}%` : '0%', barColor: '#F59E0B' },
      ]);

      const brandMeetingCounts: Record<string, { name: string; plan: string; location: string; count: number; revenue: number }> = {};
      for (const brand of brands) {
        const bkgs = bookings.filter(b => b.brand_id === brand.id && b.status !== 'cancelled');
        const rev = bkgs.reduce((s, bk) => s + (MEETING_FEE[brand.plan_type ?? 'free']?.[bk.meeting_type] ?? 0), 0);
        brandMeetingCounts[brand.id] = {
          name: brand.name ?? 'Unknown',
          plan: brand.plan_type ?? 'free',
          location: brand.location ?? '',
          count: bkgs.length,
          revenue: rev,
        };
      }

      const sorted = Object.values(brandMeetingCounts)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      const rankColors = [
        { bg: 'var(--gold-light)', color: '#92400E' },
        { bg: 'var(--surface-2)', color: 'var(--ink-3)' },
        { bg: 'var(--surface-2)', color: 'var(--ink-3)' },
        { bg: 'var(--surface-2)', color: 'var(--ink-3)' },
        { bg: 'var(--surface-2)', color: 'var(--ink-3)' },
      ];

      setTopBrands(sorted.map((b, i) => ({
        rank: String(i + 1),
        rankBg: rankColors[i].bg,
        rankColor: rankColors[i].color,
        name: b.name,
        meta: `${b.plan === 'pro' ? 'Pro' : 'Free'} · ${b.location} · ${b.count} meetings`,
        revenue: b.revenue >= 100000
          ? `Rs.${(b.revenue / 100000).toFixed(2)}L`
          : `Rs.${b.revenue.toLocaleString('en-IN')}`,
      })));

      if (brandTierRef.current) {
        Chart.getChart(brandTierRef.current)?.destroy();
        new Chart(brandTierRef.current, {
          type: 'doughnut',
          data: {
            labels: ['Pro', 'Free'],
            datasets: [{ data: [proBrands, freeBrands], backgroundColor: ['#0D7377', '#D1D6E0'], borderWidth: 0, hoverOffset: 6 }],
          },
          options: { responsive: true, maintainAspectRatio: false, cutout: '60%' },
        });
      }
    });
  }, []);

  useEffect(() => {
    const charts: Chart[] = [];

    if (revenueRef.current) {
      charts.push(new Chart(revenueRef.current, {
        type: 'line',
        data: {
          labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
          datasets: [
            { label: 'Subscriptions', data: [1.2, 1.6, 2.0, 2.2, 2.5, 2.8], borderColor: '#0D7377', backgroundColor: 'rgba(13,115,119,.08)', fill: true, pointRadius: 4, pointBackgroundColor: '#0D7377' },
            { label: 'Meeting Fees', data: [0.6, 0.9, 1.2, 1.5, 1.8, 2.4], borderColor: '#1E3A5F', backgroundColor: 'rgba(30,58,95,.06)', fill: true, pointRadius: 4, pointBackgroundColor: '#1E3A5F' },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 16 } } },
          scales: { y: { beginAtZero: true, grid: GRID, ticks: { callback: (v) => `Rs.${v}L` } }, x: { grid: NO_GRID } },
        },
      }));
    }

    if (revSplitRef.current) {
      charts.push(new Chart(revSplitRef.current, {
        type: 'doughnut',
        data: { labels: ['Subscriptions', 'Meeting Fees', 'Refunds'], datasets: [{ data: [2.8, 2.4, 0.2], backgroundColor: ['#0D7377', '#1E3A5F', '#D97706'], borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } },
      }));
    }

    if (meetingsWeeklyRef.current) {
      charts.push(new Chart(meetingsWeeklyRef.current, {
        type: 'bar',
        data: {
          labels: ['W1 Mar', 'W2 Mar', 'W3 Mar', 'W4 Mar', 'W1 Apr', 'W2 Apr', 'W3 Apr', 'W4 Apr'],
          datasets: [
            { label: 'Video Call', data: [6, 8, 7, 10, 9, 12, 11, 14], backgroundColor: '#3B82F6' },
            { label: 'Site Visit', data: [4, 5, 6, 5, 7, 6, 8, 7], backgroundColor: '#059669' },
            { label: 'Exp. Center', data: [2, 2, 3, 2, 3, 3, 4, 3], backgroundColor: '#C9A84C' },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 12, padding: 16 } } },
          scales: { y: { beginAtZero: true, grid: GRID, stacked: true }, x: { grid: NO_GRID, stacked: true } },
        },
      }));
    }

    if (meetTypeRef.current) {
      charts.push(new Chart(meetTypeRef.current, {
        type: 'doughnut',
        data: { labels: ['Video Call', 'Site Visit', 'Experience Center'], datasets: [{ data: [58, 47, 22], backgroundColor: ['#3B82F6', '#059669', '#C9A84C'], borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%' },
      }));
    }

    if (brandTierRef.current) {
      charts.push(new Chart(brandTierRef.current, {
        type: 'doughnut',
        data: { labels: ['Pro', 'Free'], datasets: [{ data: [0, 0], backgroundColor: ['#0D7377', '#D1D6E0'], borderWidth: 0, hoverOffset: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%' },
      }));
    }

    if (custTrendRef.current) {
      charts.push(new Chart(custTrendRef.current, {
        type: 'bar',
        data: {
          labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12'],
          datasets: [{ data: [45, 52, 61, 58, 73, 68, 82, 79, 91, 86, 98, 107], backgroundColor: 'rgba(13,115,119,.2)', borderColor: '#0D7377', borderWidth: 2 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { y: { beginAtZero: true, grid: GRID, ticks: { stepSize: 25 } }, x: { grid: NO_GRID } },
        },
      }));
    }

    return () => charts.forEach(c => c.destroy());
  }, []);

  function StatDot({ color }: { color: string }) {
    return <span className="adm-dot" style={{ background: color }} />;
  }

  return (
    <div className="adm-page">
      <AdminNav />

      <div className="adm-container" style={{ maxWidth: 1360 }}>
        {/* Header */}
        <div className="adm-page-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1>Platform Analytics</h1>
            <div className="adm-ph-sub">Inzario performance overview — all metrics at a glance</div>
          </div>
          <div className="adm-period">
            {PERIODS.map(p => (
              <button key={p} className={`adm-period-btn${activePeriod === p ? ' active' : ''}`} onClick={() => setActivePeriod(p)}>{p}</button>
            ))}
          </div>
        </div>

        {/* KPI Row */}
        <div className="adm-kpi-row">
          {kpis.map(k => (
            <div key={k.label} className="adm-kpi">
              <div className="adm-kpi-label">{k.label}</div>
              <div className="adm-kpi-num">{k.num}</div>
              <div className={`adm-kpi-change ${k.dir}`}>{k.change}</div>
              <div className="adm-kpi-bar"><div style={{ width: k.barW, height: '100%', background: k.barColor }} /></div>
            </div>
          ))}
        </div>

        {/* Revenue — line chart + donut */}
        <div className="adm-grid-2-1">
          <div className="adm-chart-card">
            <div className="adm-cc-header">
              <div>
                <div className="adm-cc-title">Revenue — Month over Month</div>
                <div className="adm-cc-subtitle">Subscription + wallet meeting fees</div>
              </div>
              <span className="adm-cc-badge" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>Chart placeholder</span>
            </div>
            <div className="adm-chart-wrap"><canvas ref={revenueRef} /></div>
          </div>
          <div className="adm-chart-card">
            <div className="adm-cc-header">
              <div>
                <div className="adm-cc-title">Revenue Split</div>
                <div className="adm-cc-subtitle">Subscription vs meeting fees</div>
              </div>
            </div>
            <div className="adm-chart-wrap adm-chart-wrap-sm"><canvas ref={revSplitRef} /></div>
            <div style={{ marginTop: 12 }}>
              {[
                { color: 'var(--accent)', label: 'Subscriptions', val: 'Pro plan fees' },
                { color: 'var(--primary)', label: 'Meeting Fees', val: 'Per-meeting deductions' },
                { color: 'var(--gold)', label: 'Refunds', val: 'N/A' },
              ].map(r => (
                <div key={r.label} className="adm-stat-row">
                  <span className="adm-stat-row-label"><StatDot color={r.color} />{r.label}</span>
                  <span className="adm-stat-row-val">{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Brands + Meetings weekly */}
        <div className="adm-grid-2">
          <div className="adm-chart-card">
            <div className="adm-cc-header">
              <div>
                <div className="adm-cc-title">Top 5 Brands by Revenue</div>
                <div className="adm-cc-subtitle">All time</div>
              </div>
            </div>
            <table className="adm-top-tbl">
              <tbody>
                {topBrands.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>No brand data yet</td></tr>
                ) : topBrands.map(b => (
                  <tr key={b.rank}>
                    <td style={{ width: 40 }}>
                      <div className="adm-rank" style={{ background: b.rankBg, color: b.rankColor }}>{b.rank}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--ink)', fontSize: 13 }}>{b.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{b.meta}</div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--green)', textAlign: 'right', fontSize: 13 }}>{b.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="adm-chart-card">
            <div className="adm-cc-header">
              <div>
                <div className="adm-cc-title">Meetings — Weekly Trend</div>
                <div className="adm-cc-subtitle">Last 8 weeks (placeholder)</div>
              </div>
              <span className="adm-cc-badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>{kpis[1]?.num ?? '—'} total</span>
            </div>
            <div className="adm-chart-wrap"><canvas ref={meetingsWeeklyRef} /></div>
          </div>
        </div>

        {/* Meeting type + Brand tier + Brand status */}
        <div className="adm-grid-3">
          <div className="adm-chart-card">
            <div className="adm-cc-header"><div className="adm-cc-title">Meeting Type Split</div></div>
            <div className="adm-chart-wrap adm-chart-wrap-sm"><canvas ref={meetTypeRef} /></div>
            <div style={{ marginTop: 12 }}>
              {[
                { color: '#3B82F6', label: 'Video Call', val: 'Live data soon' },
                { color: 'var(--green)', label: 'Site Visit', val: 'Live data soon' },
                { color: 'var(--gold)', label: 'Exp. Center', val: 'Live data soon' },
              ].map(r => (
                <div key={r.label} className="adm-stat-row">
                  <span className="adm-stat-row-label"><StatDot color={r.color} />{r.label}</span>
                  <span className="adm-stat-row-val">{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-chart-card">
            <div className="adm-cc-header"><div className="adm-cc-title">Brand Tier Split</div></div>
            <div className="adm-chart-wrap adm-chart-wrap-sm"><canvas ref={brandTierRef} /></div>
            <div style={{ marginTop: 12 }}>
              {[
                { color: 'var(--accent)', label: 'Pro', val: String(kpis.length > 0 ? '—' : '—') },
                { color: 'var(--border-2)', label: 'Free', val: '—' },
              ].map(r => (
                <div key={r.label} className="adm-stat-row">
                  <span className="adm-stat-row-label"><StatDot color={r.color} />{r.label}</span>
                  <span className="adm-stat-row-val">{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-chart-card">
            <div className="adm-cc-header"><div className="adm-cc-title">Brand Status</div></div>
            <div style={{ marginTop: 8 }}>
              {[
                { color: 'var(--green)', label: 'Active', val: kpis[2]?.num ?? '—' },
                { color: 'var(--gold)', label: 'Paused', val: '—' },
                { color: 'var(--red)', label: 'Grace Period', val: '—' },
                { color: 'var(--ink-4)', label: 'Churned', val: '—' },
                { color: 'var(--border)', label: 'Zero Meetings', val: '—', valColor: 'var(--gold)' },
              ].map(r => (
                <div key={r.label} className="adm-stat-row">
                  <span className="adm-stat-row-label"><StatDot color={r.color} />{r.label}</span>
                  <span className="adm-stat-row-val" style={(r as { valColor?: string }).valColor ? { color: (r as { valColor?: string }).valColor } : {}}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer trend + Funnel */}
        <div className="adm-grid-2">
          <div className="adm-chart-card">
            <div className="adm-cc-header">
              <div>
                <div className="adm-cc-title">Customer Registration Trend</div>
                <div className="adm-cc-subtitle">Weekly new registrations (placeholder)</div>
              </div>
            </div>
            <div className="adm-chart-wrap"><canvas ref={custTrendRef} /></div>
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, textAlign: 'center' }}>
              {[
                { num: kpis[3]?.num ?? '—', label: 'Total Customers', color: 'var(--ink)' },
                { num: '—', label: 'Active (30d)', color: 'var(--accent)' },
                { num: '—', label: 'Repeat Bookers', color: 'var(--green)' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, fontWeight: 700, color: s.color }}>{s.num}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="adm-chart-card">
            <div className="adm-cc-header">
              <div>
                <div className="adm-cc-title">Conversion Funnel</div>
                <div className="adm-cc-subtitle">Homepage to completed meeting</div>
              </div>
            </div>
            <div className="adm-funnel">
              {FUNNEL.map((step, i) => (
                <div key={step.label}>
                  {step.drop && <div className="adm-funnel-drop">{step.drop}</div>}
                  <div className="adm-funnel-step">
                    <span className="adm-funnel-label">{step.label}</span>
                    <div className="adm-funnel-bar-wrap">
                      <div className="adm-funnel-bar" style={{ width: step.w, background: step.color }}>
                        {i === 0 ? step.val : ''}
                      </div>
                    </div>
                    <span className="adm-funnel-val">{i === 0 ? '' : step.val}</span>
                    <span className="adm-funnel-pct">{step.pct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fraud */}
        <div className="adm-chart-card" style={{ marginBottom: 0 }}>
          <div className="adm-cc-header">
            <div>
              <div className="adm-cc-title">Fraud &amp; Anti-Abuse</div>
              <div className="adm-cc-subtitle">This month&apos;s report metrics</div>
            </div>
          </div>
          <div className="adm-fraud-grid">
            {[
              { num: '—', label: 'Total Reports', color: 'var(--ink)' },
              { num: '—', label: 'Confirmed', color: 'var(--green)' },
              { num: '—', label: 'Dismissed', color: 'var(--ink-4)' },
              { num: '—', label: 'Credits Issued', color: '#3B82F6' },
              { num: '—', label: 'Suspensions', color: 'var(--red)' },
            ].map(s => (
              <div key={s.label} className="adm-fraud-stat">
                <div className="adm-fraud-stat-num" style={{ color: s.color }}>{s.num}</div>
                <div className="adm-fraud-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
