'use client';

import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import AdminNav from '@/components/AdminNav';

Chart.register(...registerables);
Chart.defaults.font.family = "'DM Sans', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.display = false;
(Chart.defaults.elements.bar as { borderRadius: number }).borderRadius = 6;
(Chart.defaults.elements.line as { tension: number }).tension = 0.35;

const GRID = { color: '#E4E8EF', lineWidth: 1 };
const NO_GRID = { display: false };

const PERIODS = ['7D', '30D', '90D', 'YTD'];

const KPIS = [
  { label: 'Total Revenue', num: '₹5.4L', change: '↑ 18% vs last month', dir: 'up', barW: '65%', barColor: 'var(--green)' },
  { label: 'Meetings', num: '127', change: '↑ 24% vs last month', dir: 'up', barW: '72%', barColor: 'var(--accent)' },
  { label: 'Active Brands', num: '42', change: '↑ 6 new this month', dir: 'up', barW: '84%', barColor: '#3B82F6' },
  { label: 'Customers', num: '2,847', change: '↑ 312 new', dir: 'up', barW: '55%', barColor: '#7C3AED' },
  { label: 'Completion Rate', num: '87%', change: '↑ 3% improvement', dir: 'up', barW: '87%', barColor: 'var(--green)' },
  { label: 'Avg Rating', num: '4.6', change: '→ Stable', dir: 'neutral', barW: '92%', barColor: '#F59E0B' },
];

const TOP_BRANDS = [
  { rank: '1', rankBg: 'var(--gold-light)', rankColor: '#92400E', name: 'DesignCraft Studio', meta: 'Pro · Koramangala · 31 meetings', revenue: '₹2,14,000' },
  { rank: '2', rankBg: 'var(--surface-2)', rankColor: 'var(--ink-3)', name: 'Artisan Interiors', meta: 'Pro · Koramangala · 24 meetings', revenue: '₹1,62,000' },
  { rank: '3', rankBg: 'var(--surface-2)', rankColor: 'var(--ink-3)', name: 'SpaceWell Interiors', meta: 'Pro · HSR Layout · 18 meetings', revenue: '₹98,000' },
  { rank: '4', rankBg: 'var(--surface-2)', rankColor: 'var(--ink-3)', name: 'KitchenKraft India', meta: 'Pro · JP Nagar · 16 meetings', revenue: '₹86,000' },
  { rank: '5', rankBg: 'var(--surface-2)', rankColor: 'var(--ink-3)', name: 'Livora Interiors', meta: 'Pro · Whitefield · 14 meetings', revenue: '₹72,000' },
];

const FUNNEL = [
  { label: 'Homepage', val: '12,400', pct: '100%', w: '100%', color: 'var(--primary)', drop: null },
  { label: 'Discovery', val: '7,192', pct: '58%', w: '58%', color: 'var(--primary-light)', drop: '↓ 42% drop' },
  { label: 'Brand Profile', val: '4,028', pct: '32%', w: '32%', color: 'var(--accent)', drop: '↓ 44% drop' },
  { label: 'Auth (OTP)', val: '1,410', pct: '11%', w: '11%', color: '#3B82F6', drop: '↓ 65% drop' },
  { label: 'Booking', val: '1,015', pct: '8.2%', w: '8%', color: 'var(--gold)', drop: '↓ 28% drop' },
  { label: 'Completed', val: '883', pct: '7.1%', w: '7%', color: 'var(--green)', drop: '↓ 13% drop' },
  { label: 'Reviewed', val: '338', pct: '2.7%', w: '2.7%', color: 'var(--gold)', drop: '↓ 62% drop' },
];

export default function AdminAnalyticsPage() {
  const [activePeriod, setActivePeriod] = useState('30D');

  const revenueRef = useRef<HTMLCanvasElement>(null);
  const revSplitRef = useRef<HTMLCanvasElement>(null);
  const meetingsWeeklyRef = useRef<HTMLCanvasElement>(null);
  const meetTypeRef = useRef<HTMLCanvasElement>(null);
  const brandTierRef = useRef<HTMLCanvasElement>(null);
  const custTrendRef = useRef<HTMLCanvasElement>(null);

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
          scales: { y: { beginAtZero: true, grid: GRID, ticks: { callback: (v) => `₹${v}L` } }, x: { grid: NO_GRID } },
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
        data: { labels: ['Pro', 'Free'], datasets: [{ data: [28, 20], backgroundColor: ['#0D7377', '#D1D6E0'], borderWidth: 0, hoverOffset: 6 }] },
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
          {KPIS.map(k => (
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
              <span className="adm-cc-badge" style={{ background: 'var(--green-soft)', color: 'var(--green)' }}>₹5.4L this month</span>
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
                { color: 'var(--accent)', label: 'Subscriptions', val: '₹2.8L (52%)' },
                { color: 'var(--primary)', label: 'Meeting Fees', val: '₹2.4L (44%)' },
                { color: 'var(--gold)', label: 'Refunds', val: '−₹0.2L (4%)' },
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
                <div className="adm-cc-subtitle">This month</div>
              </div>
            </div>
            <table className="adm-top-tbl">
              <tbody>
                {TOP_BRANDS.map(b => (
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
                <div className="adm-cc-subtitle">Last 8 weeks</div>
              </div>
              <span className="adm-cc-badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>127 total</span>
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
                { color: '#3B82F6', label: 'Video Call', val: '58 (46%)' },
                { color: 'var(--green)', label: 'Site Visit', val: '47 (37%)' },
                { color: 'var(--gold)', label: 'Exp. Center', val: '22 (17%)' },
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
                { color: 'var(--accent)', label: 'Pro', val: '28 (58%)' },
                { color: 'var(--border-2)', label: 'Free', val: '20 (42%)' },
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
                { color: 'var(--green)', label: 'Active', val: '42' },
                { color: 'var(--gold)', label: 'Paused', val: '3' },
                { color: 'var(--red)', label: 'Grace Period', val: '2' },
                { color: 'var(--ink-4)', label: 'Churned', val: '5' },
                { color: 'var(--border)', label: 'Zero Meetings', val: '8 brands', valColor: 'var(--gold)' },
              ].map(r => (
                <div key={r.label} className="adm-stat-row">
                  <span className="adm-stat-row-label"><StatDot color={r.color} />{r.label}</span>
                  <span className="adm-stat-row-val" style={r.valColor ? { color: r.valColor } : {}}>{r.val}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div className="adm-stat-row">
                <span className="adm-stat-row-label" style={{ fontWeight: 700, color: 'var(--ink)' }}>Total Registered</span>
                <span className="adm-stat-row-val" style={{ fontSize: 16 }}>52</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer trend + Funnel */}
        <div className="adm-grid-2">
          <div className="adm-chart-card">
            <div className="adm-cc-header">
              <div>
                <div className="adm-cc-title">Customer Registration Trend</div>
                <div className="adm-cc-subtitle">Weekly new registrations</div>
              </div>
            </div>
            <div className="adm-chart-wrap"><canvas ref={custTrendRef} /></div>
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, textAlign: 'center' }}>
              {[
                { num: '2,847', label: 'Total Registered', color: 'var(--ink)' },
                { num: '1,241', label: 'Active (30d)', color: 'var(--accent)' },
                { num: '387', label: 'Repeat Bookers', color: 'var(--green)' },
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
                <div className="adm-cc-subtitle">Homepage → Completed meeting</div>
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
              { num: '34', label: "Total Reports", color: 'var(--ink)' },
              { num: '25', label: 'Confirmed (73%)', color: 'var(--green)' },
              { num: '9', label: 'Dismissed (27%)', color: 'var(--ink-4)' },
              { num: '₹18.5K', label: 'Credits Issued', color: '#3B82F6' },
              { num: '6', label: 'Suspensions', color: 'var(--red)' },
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
