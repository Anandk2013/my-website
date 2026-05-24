'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export default function NavAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!ready) return <div style={{ width: 72, height: 34 }} />;

  if (!user) {
    return (
      <Link
        href={`/login?returnTo=${encodeURIComponent(pathname)}`}
        className="nav-login-btn"
      >
        Login
      </Link>
    );
  }

  const role = user.user_metadata?.role as string | undefined;
  const initials = (user.email ?? 'U').slice(0, 2).toUpperCase();

  return (
    <div className="nav-avatar-wrap" ref={wrapRef}>
      <button
        className="nav-avatar"
        onClick={() => setOpen(o => !o)}
        title={user.email}
        aria-label="Account menu"
      >
        {initials}
      </button>
      {open && (
        <div className="nav-dropdown">
          <div className="nav-dropdown-email">{user.email}</div>
          {role === 'brand' ? (
            <Link href="/brand/dashboard" className="nav-dropdown-item" onClick={() => setOpen(false)}>
              🏢 Brand Dashboard
            </Link>
          ) : role === 'admin' ? (
            <Link href="/admin/verification" className="nav-dropdown-item" onClick={() => setOpen(false)}>
              ⚙️ Admin Panel
            </Link>
          ) : (
            <Link href="/my-consultations" className="nav-dropdown-item" onClick={() => setOpen(false)}>
              📅 My Consultations
            </Link>
          )}
          <button
            className="nav-dropdown-logout"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              setOpen(false);
              router.push('/');
              router.refresh();
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
