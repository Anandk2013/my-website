'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/brand/dashboard' },
  { label: 'Meetings', href: '/brand/meetings' },
  { label: 'Profile', href: '/brand/profile' },
  { label: 'Analytics', href: '/brand/analytics' },
  { label: 'Wallet', href: '/brand/wallet' },
];

export default function BrandNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/brand/login');
    router.refresh();
  }

  return (
    <nav className="navbar">
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        <Link href="/" className="logo">
          <div className="logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="logo-text">Inzario</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <ul style={{ display: 'flex', alignItems: 'center', gap: 6, listStyle: 'none', margin: 0, padding: 0 }}>
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    style={{
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      color: active ? 'var(--accent)' : 'var(--ink-3)',
                      padding: '8px 14px',
                      borderRadius: 8,
                      background: active ? 'var(--accent-soft)' : 'transparent',
                      textDecoration: 'none',
                      display: 'block',
                      transition: 'all 0.15s',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <button
            onClick={handleLogout}
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: 'var(--ink-4)',
              padding: '7px 14px',
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              marginLeft: 8,
              transition: 'all 0.15s',
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
