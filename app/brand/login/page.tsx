'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function BrandLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/brand/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });
    if (err) {
      setLoading(false);
      setError('Invalid email or password. Please try again.');
      return;
    }
    const role = data.user?.user_metadata?.role;
    if (role !== 'brand') {
      await supabase.auth.signOut();
      setLoading(false);
      setError('This account is not registered as a brand. Use the homeowner login instead.');
      return;
    }
    router.replace(returnTo);
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <Link href="/" className="login-logo">
          <div className="login-logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="login-logo-text">Inzario</span>
        </Link>

        <div className="login-title">Brand Login</div>
        <p className="login-subtitle">
          Sign in to manage your profile, meetings, and wallet.
        </p>

        {error && <div className="login-error">{error}</div>}

        <div className="login-field">
          <label className="login-label">Email address</label>
          <input
            className={`login-input${error ? ' has-error' : ''}`}
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoFocus
          />
        </div>

        <div className="login-field">
          <label className="login-label">Password</label>
          <div className="reg-pw-wrap">
            <input
              className={`login-input${error ? ' has-error' : ''}`}
              type={showPw ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
            />
            <button className="reg-pw-toggle" type="button" onClick={() => setShowPw(v => !v)}>
              {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button className="login-btn" onClick={handleLogin} disabled={loading}>
          {loading ? 'Signing in…' : 'Sign In →'}
        </button>

        <p className="login-hint" style={{ marginTop: 16 }}>
          Forgot your password?{' '}
          <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in with a one-time email code →
          </Link>
        </p>

        <p className="login-hint">
          New to Inzario?{' '}
          <Link href="/register-brand" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Register your brand →
          </Link>
        </p>

        <div className="login-footer">
          <Link href="/login">Signing in as a homeowner instead? →</Link>
        </div>
      </div>
    </div>
  );
}

export default function BrandLoginPage() {
  return (
    <Suspense>
      <BrandLoginForm />
    </Suspense>
  );
}
