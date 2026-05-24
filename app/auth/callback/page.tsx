'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get('code');
    const returnTo = searchParams.get('returnTo') ?? '/';

    function redirectByRole(role: string | undefined, fallback: string) {
      if (role === 'brand') router.replace('/brand/dashboard');
      else if (role === 'admin') router.replace('/admin/verification');
      else router.replace(fallback);
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(code)
        .then(({ data }) => {
          redirectByRole(data.session?.user?.user_metadata?.role, returnTo);
        })
        .catch(() => router.replace('/login'));
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) { router.replace('/login'); return; }
        redirectByRole(session.user?.user_metadata?.role, returnTo);
      });
    }
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
    }}>
      <p style={{ color: 'var(--ink-3)', fontSize: '15px' }}>Signing you in…</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
