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
  created_at: string;
  brands: {
    name: string;
    logo_initials: string | null;
    location: string;
    cover_gradient: string | null;
  } | null;
};

const MEETING_LABELS: Record<string, string> = {
  video_call: '📹 Video Call',
  site_visit: '🏠 Site Visit',
  experience_center: '🏢 Experience Center',
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login?returnTo=/my-bookings');
        return;
      }
      const { data } = await supabase
        .from('bookings')
        .select('id, meeting_type, status, preferred_date, preferred_time, project_type, budget_range, created_at, brands(name, logo_initials, location, cover_gradient)')
        .eq('homeowner_email', session.user.email!)
        .order('created_at', { ascending: false });

      setBookings((data as unknown as Booking[]) ?? []);
      setLoading(false);
    });
  }, []);

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
            <li><Link href="/designers">Browse Designers</Link></li>
            <li><NavAuth /></li>
          </ul>
        </div>
      </nav>

      <div className="mb-page">
        <div className="mb-container">
          <div className="mb-header">
            <div className="mb-title">My Bookings</div>
            <p className="mb-subtitle">Your consultation requests and their current status.</p>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--ink-4)' }}>
              Loading…
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="mb-empty">
              <div className="mb-empty-icon">📅</div>
              <div className="mb-empty-title">No bookings yet</div>
              <p className="mb-empty-msg">
                You haven&apos;t requested any consultations yet. Browse top-rated designers and book a free meeting.
              </p>
              <Link href="/designers" className="mb-browse-btn">
                Browse Designers →
              </Link>
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="mb-list">
              {bookings.map(b => {
                const brand = b.brands;
                const logoStyle = brand?.cover_gradient
                  ? { background: brand.cover_gradient }
                  : { background: 'var(--accent)' };
                const formattedDate = b.created_at
                  ? new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                  : '';

                return (
                  <div className="mb-card" key={b.id}>
                    <div className="mb-brand-logo" style={logoStyle}>
                      {brand?.logo_initials ?? '?'}
                    </div>
                    <div className="mb-info">
                      <div className="mb-brand-name">{brand?.name ?? 'Unknown Brand'}</div>
                      <div className="mb-meta">
                        <span className="mb-meeting">{MEETING_LABELS[b.meeting_type] ?? b.meeting_type}</span>
                        {b.preferred_date && (
                          <span className="mb-date">
                            Preferred: {new Date(b.preferred_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            {b.preferred_time ? ` · ${b.preferred_time}` : ''}
                          </span>
                        )}
                        <span className={`mb-status ${b.status}`}>{b.status}</span>
                      </div>
                      {b.project_type && (
                        <div className="mb-project">{b.project_type}{b.budget_range ? ` · ${b.budget_range}` : ''}</div>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-4)', flexShrink: 0, textAlign: 'right' }}>
                      {formattedDate}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
