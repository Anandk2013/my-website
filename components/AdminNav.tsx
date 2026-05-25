'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

const NAV_ITEMS = [
  { label: 'Verification', href: '/admin/verification' },
  { label: 'Users', href: '/admin/brands' },
  { label: 'Analytics', href: '/admin/analytics' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from('brands')
      .select('id', { count: 'exact', head: true })
      .eq('is_verified', false)
      .then(({ count }) => setPendingCount(count ?? 0));
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 56,
      background: 'var(--primary)', zIndex: 900,
      display: 'flex', alignItems: 'center',
    }}>
      <div style={{
        width: '100%', maxWidth: 1280, margin: '0 auto',
        padding: '0 28px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 19, fontWeight: 700, color: 'white' }}>Inzario</span>
          </Link>
          <span style={{
            fontSize: 10, fontWeight: 700,
            background: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.7)',
            padding: '3px 10px', borderRadius: 5, letterSpacing: '.5px', textTransform: 'uppercase',
          }}>Admin Panel</span>
          <ul style={{ display: 'flex', gap: 4, listStyle: 'none' }}>
            {NAV_ITEMS.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    style={{
                      fontSize: 13, fontWeight: active ? 600 : 500,
                      color: active ? 'white' : 'rgba(255,255,255,.5)',
                      padding: '7px 14px', borderRadius: 8,
                      background: active ? 'rgba(255,255,255,.12)' : 'transparent',
                      textDecoration: 'none', display: 'flex', alignItems: 'center',
                      gap: 6, transition: 'all .15s',
                    }}
                  >
                    {item.label}
                    {item.href === '/admin/verification' && pendingCount > 0 && (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: 18, height: 18, background: 'var(--red)', color: 'white',
                        fontSize: 10, fontWeight: 700, borderRadius: 100, padding: '0 5px',
                      }}>{pendingCount}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(255,255,255,.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white',
          }}>SA</div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,.6)' }}>Super Admin</span>
        </div>
      </div>
    </nav>
  );
}
