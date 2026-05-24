'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? '/';

  const [step, setStep] = useState<'email' | 'code'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);

  async function sendCode() {
    const trimmed = email.trim();
    if (!trimmed) { setError('Please enter your email address'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) { setError('Enter a valid email address'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithOtp({
      email: trimmed,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
      },
    });
    setLoading(false);
    if (err) {
      setError(err.message);
    } else {
      setStep('code');
      startCountdown();
    }
  }

  function startCountdown() {
    setCountdown(30);
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(interval); return 0; }
        return c - 1;
      });
    }, 1000);
  }

  async function verifyCode() {
    const trimmed = code.trim();
    if (!trimmed) { setError('Enter the code from your email'); return; }
    setLoading(true);
    setError('');
    const supabase = createClient();
    const { data, error: err } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: trimmed,
      type: 'email',
    });
    setLoading(false);
    if (err) {
      setError('Invalid or expired code. Check your email and try again.');
    } else {
      const role = data.user?.user_metadata?.role;
      if (role === 'brand') {
        router.replace('/brand/dashboard');
      } else if (role === 'admin') {
        router.replace('/admin/verification');
      } else {
        router.replace(returnTo);
      }
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <Link href="/" className="login-logo">
          <div className="login-logo-mark">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span className="login-logo-text">Inzario</span>
        </Link>

        {/* ── STEP 1: Email ── */}
        {step === 'email' && (
          <>
            <div className="login-title">Sign in to Inzario</div>
            <p className="login-subtitle">
              Enter your email and we&apos;ll send you a sign-in code.
              No password needed.
            </p>
            {error && <div className="login-error">{error}</div>}
            <div className="login-field">
              <label className="login-label">Email address</label>
              <input
                className={`login-input${error ? ' has-error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && sendCode()}
                autoFocus
              />
            </div>
            <button className="login-btn" onClick={sendCode} disabled={loading}>
              {loading ? 'Sending…' : 'Send Code →'}
            </button>
          </>
        )}

        {/* ── STEP 2: Code ── */}
        {step === 'code' && (
          <>
            <div className="login-icon-wrap">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div className="login-title">Check your inbox</div>
            <p className="login-subtitle">
              We sent an 8-digit code to{' '}
              <span className="login-email-hl">{email}</span>.
              Enter it below to sign in.
            </p>
            {error && <div className="login-error">{error}</div>}
            <div className="login-field">
              <label className="login-label">8-digit code</label>
              <input
                className={`login-input${error ? ' has-error' : ''}`}
                type="text"
                inputMode="numeric"
                maxLength={8}
                placeholder="12345678"
                value={code}
                onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && verifyCode()}
                autoFocus
                style={{ letterSpacing: '0.2em', fontSize: '20px', textAlign: 'center' }}
              />
            </div>
            <button className="login-btn" onClick={verifyCode} disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Code →'}
            </button>
            <p className="login-hint" style={{ marginTop: 16 }}>
              Didn&apos;t get a code?{' '}
              <button className="login-resend" onClick={sendCode} disabled={countdown > 0}>
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend'}
              </button>
              {' · '}
              <button className="login-change-email" onClick={() => { setStep('email'); setCode(''); setError(''); }}>
                Change email
              </button>
            </p>
            <p className="login-hint">
              Got a link in your email instead?{' '}
              <a href="#" onClick={e => e.preventDefault()} style={{ color: 'var(--ink-4)' }}>
                Just click it — it works too.
              </a>
            </p>
          </>
        )}

        <div className="login-footer">
          <Link href="/">Continue without signing in →</Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
