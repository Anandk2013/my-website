'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import type { Brand } from '@/lib/types';

type Step = 'meeting' | 'details' | 'verify' | 'confirm';
type MeetingType = 'video_call' | 'site_visit' | 'experience_center';

type FormData = {
  meetingType: MeetingType | '';
  name: string;
  phone: string;
  email: string;
  projectType: string;
  budgetRange: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
};

const MEETING_LABELS: Record<MeetingType, string> = {
  video_call: 'Video Call',
  site_visit: 'Site Visit',
  experience_center: 'Experience Center visit',
};

const PREFS_KEY = 'inzario_customer_prefs';

function loadPrefs(): Partial<FormData> {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}');
  } catch {
    return {};
  }
}

function savePrefs(form: FormData) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      projectType: form.projectType,
      budgetRange: form.budgetRange,
      notes: form.notes.trim(),
    }));
  } catch {}
}

export default function BookingModal({
  brand,
  onClose,
}: {
  brand: Brand;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>('meeting');
  const [form, setForm] = useState<FormData>(() => {
    const p = loadPrefs();
    return {
      meetingType: '',
      name: p.name ?? '',
      phone: p.phone ?? '',
      email: p.email ?? '',
      projectType: p.projectType ?? '',
      budgetRange: p.budgetRange ?? '',
      preferredDate: '',
      preferredTime: '',
      notes: p.notes ?? '',
    };
  });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const set = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    };

  const enabledTypes = brand.meeting_types ?? ['video_call', 'site_visit', 'experience_center'];
  const meetingOptions = [
    {
      value: 'video_call' as MeetingType,
      emoji: '📹',
      label: 'Video Call',
      desc: 'Online consultation from the comfort of your home',
    },
    {
      value: 'site_visit' as MeetingType,
      emoji: '🏠',
      label: 'Site Visit',
      desc: 'Designer visits your home for measurements & consultation',
    },
    {
      value: 'experience_center' as MeetingType,
      emoji: '🏢',
      label: 'Experience Center',
      desc: "Visit the brand's studio to see materials and finishes in person",
    },
  ].filter(opt => enabledTypes.includes(opt.value));

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function moveToVerify() {
    if (!validate()) return;
    setOtp('');
    setOtpSent(false);
    setOtpError('');
    setStep('verify');
    sendOtp();
  }

  async function sendOtp() {
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone }),
      });
      const data = await res.json();
      if (data.ok) {
        setOtpSent(true);
        setResendCooldown(30);
        const timer = setInterval(() => {
          setResendCooldown(n => { if (n <= 1) { clearInterval(timer); return 0; } return n - 1; });
        }, 1000);
      } else {
        setOtpError(data.message ?? 'Failed to send OTP. Please try again.');
      }
    } catch {
      setOtpError('Failed to send OTP. Check your connection.');
    }
    setOtpLoading(false);
  }

  async function verifyOtpAndSubmit() {
    if (otp.length !== 4) { setOtpError('Enter the 4-digit code'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: form.phone, otp }),
      });
      const data = await res.json();
      if (!data.ok) {
        setOtpError('Incorrect OTP. Please try again.');
        setOtpLoading(false);
        return;
      }
    } catch {
      setOtpError('Verification failed. Please try again.');
      setOtpLoading(false);
      return;
    }
    setOtpLoading(false);
    await handleSubmit();
  }

  async function handleSubmit() {
    setLoading(true);
    setServerError('');
    const supabase = createClient();
    const { error } = await supabase.from('bookings').insert({
      brand_id: brand.id,
      homeowner_id: null,
      homeowner_name: form.name.trim(),
      homeowner_email: form.email.trim(),
      homeowner_phone: form.phone.trim(),
      meeting_type: form.meetingType,
      preferred_date: form.preferredDate || null,
      preferred_time: form.preferredTime || null,
      project_type: form.projectType || null,
      budget_range: form.budgetRange || null,
      notes: form.notes.trim() || null,
    });
    setLoading(false);
    if (error) {
      setServerError('Something went wrong. Please try again.');
    } else {
      savePrefs(form);
      setStep('confirm');
    }
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div
      className="booking-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="booking-modal">

        {/* ── CONFIRMATION ── */}
        {step === 'confirm' && (
          <div className="booking-confirm">
            <div className="booking-confirm-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="booking-confirm-title">Request Sent!</div>
            <p className="booking-confirm-msg">
              Your consultation request has been sent to <strong>{brand.name}</strong>.
            </p>
            <p className="booking-confirm-msg">
              They will call you at{' '}
              <span className="booking-confirm-phone">{form.phone}</span>{' '}
              to confirm your {form.meetingType ? MEETING_LABELS[form.meetingType as MeetingType] : 'consultation'}.
            </p>
            <p className="booking-confirm-note">
              Most brands respond within {brand.response_time ?? '24 hours'}.
              You&apos;ll also receive a confirmation at <strong>{form.email}</strong>.
            </p>
            <button className="booking-confirm-close" onClick={onClose}>Done</button>
          </div>
        )}

        {/* ── STEPS 1, 2 & 3 ── */}
        {step !== 'confirm' && (
          <>
            <div className="booking-modal-header">
              <div className="booking-modal-title">
                {step === 'meeting' ? 'Book Free Consultation' : step === 'details' ? 'Your Details' : 'Verify Phone'}
              </div>
              <button className="booking-modal-close" onClick={onClose} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            {/* Step dots */}
            <div className="booking-modal-steps">
              <div className={`booking-step-dot ${step === 'meeting' ? 'active' : 'done'}`}></div>
              <div className={`booking-step-dot ${step === 'details' ? 'active' : step === 'meeting' ? 'inactive' : 'done'}`}></div>
              <div className={`booking-step-dot ${step === 'verify' ? 'active' : 'inactive'}`}></div>
            </div>

            <div className="booking-modal-body">

              {/* ── STEP 1: Meeting type ── */}
              {step === 'meeting' && (
                <>
                  <p className="booking-modal-subtitle">
                    Choose how you&apos;d like to meet with <strong>{brand.name}</strong>.
                    All consultations are completely free.
                  </p>
                  <div className="booking-meeting-cards">
                    {meetingOptions.map(opt => (
                      <div
                        key={opt.value}
                        className={`booking-meeting-card${form.meetingType === opt.value ? ' selected' : ''}`}
                        onClick={() => setForm(f => ({ ...f, meetingType: opt.value }))}
                      >
                        <div className="booking-meeting-emoji">{opt.emoji}</div>
                        <div className="booking-meeting-info">
                          <div className="booking-meeting-label">{opt.label}</div>
                          <div className="booking-meeting-desc">{opt.desc}</div>
                        </div>
                        <div className="booking-meeting-check">
                          {form.meetingType === opt.value && (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── STEP 2: Details ── */}
              {step === 'details' && (
                <>
                  <p className="booking-modal-subtitle">
                    Tell us about yourself and your project so {brand.name} can prepare for your meeting.
                  </p>
                  {serverError && <div className="booking-server-error">{serverError}</div>}

                  <div className="booking-form-row">
                    <div className="booking-field">
                      <label className="booking-label">
                        Name <span className="booking-required">*</span>
                      </label>
                      <input
                        className={`booking-input${errors.name ? ' has-error' : ''}`}
                        type="text"
                        placeholder="Your full name"
                        value={form.name}
                        onChange={set('name')}
                      />
                      {errors.name && <div className="booking-field-error">{errors.name}</div>}
                    </div>
                    <div className="booking-field">
                      <label className="booking-label">
                        Phone <span className="booking-required">*</span>
                      </label>
                      <input
                        className={`booking-input${errors.phone ? ' has-error' : ''}`}
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={form.phone}
                        onChange={set('phone')}
                      />
                      {errors.phone && <div className="booking-field-error">{errors.phone}</div>}
                    </div>
                  </div>

                  <div className="booking-field">
                    <label className="booking-label">
                      Email <span className="booking-required">*</span>
                    </label>
                    <input
                      className={`booking-input${errors.email ? ' has-error' : ''}`}
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={set('email')}
                    />
                    {errors.email && <div className="booking-field-error">{errors.email}</div>}
                  </div>

                  <div className="booking-form-row">
                    <div className="booking-field">
                      <label className="booking-label">Project Type</label>
                      <select className="booking-select" value={form.projectType} onChange={set('projectType')}>
                        <option value="">Select...</option>
                        <option>Full Home Interior</option>
                        <option>Modular Kitchen</option>
                        <option>Living Room</option>
                        <option>Bedroom &amp; Wardrobe</option>
                        <option>Bathroom Renovation</option>
                        <option>False Ceiling &amp; Lighting</option>
                        <option>Commercial / Office</option>
                        <option>Other</option>
                      </select>
                    </div>
                    <div className="booking-field">
                      <label className="booking-label">Budget Range</label>
                      <select className="booking-select" value={form.budgetRange} onChange={set('budgetRange')}>
                        <option value="">Select...</option>
                        <option>Under ₹5L</option>
                        <option>₹5L – ₹10L</option>
                        <option>₹10L – ₹20L</option>
                        <option>₹20L – ₹40L</option>
                        <option>₹40L+</option>
                      </select>
                    </div>
                  </div>

                  <div className="booking-form-row">
                    <div className="booking-field">
                      <label className="booking-label">Preferred Date</label>
                      <input
                        className="booking-input"
                        type="date"
                        min={today}
                        value={form.preferredDate}
                        onChange={set('preferredDate')}
                      />
                    </div>
                    <div className="booking-field">
                      <label className="booking-label">Preferred Time</label>
                      <select className="booking-select" value={form.preferredTime} onChange={set('preferredTime')}>
                        <option value="">Any time</option>
                        <option>Morning (9am – 12pm)</option>
                        <option>Afternoon (12pm – 4pm)</option>
                        <option>Evening (4pm – 7pm)</option>
                      </select>
                    </div>
                  </div>

                  <div className="booking-field">
                    <label className="booking-label">
                      Notes{' '}
                      <span className="booking-label-opt">(optional)</span>
                    </label>
                    <textarea
                      className="booking-textarea"
                      rows={3}
                      placeholder="Anything you'd like the designer to know in advance..."
                      value={form.notes}
                      onChange={set('notes')}
                    />
                  </div>
                </>
              )}

              {/* ── STEP 3: Verify phone ── */}
              {step === 'verify' && (
                <div className="booking-verify">
                  <p className="booking-modal-subtitle">
                    We&apos;ll send a 4-digit code to{' '}
                    <strong>{form.phone}</strong> to confirm your booking.
                  </p>
                  {!otpSent ? (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      {otpLoading
                        ? <p className="booking-otp-status">Sending OTP…</p>
                        : <p className="booking-otp-status">Tap Send OTP to receive your code.</p>
                      }
                      {otpError && <div className="booking-field-error" style={{ marginTop: 8 }}>{otpError}</div>}
                    </div>
                  ) : (
                    <div className="booking-otp-block">
                      <label className="booking-label">Enter 4-digit OTP</label>
                      <input
                        className="booking-otp-input"
                        type="tel"
                        inputMode="numeric"
                        maxLength={4}
                        placeholder="- - - -"
                        value={otp}
                        onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(''); }}
                        autoFocus
                      />
                      {otpError && <div className="booking-field-error">{otpError}</div>}
                      <button
                        className="booking-resend-btn"
                        disabled={resendCooldown > 0 || otpLoading}
                        onClick={sendOtp}
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  )}
                  {serverError && <div className="booking-server-error" style={{ marginTop: 12 }}>{serverError}</div>}
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="booking-modal-footer">
              {step === 'meeting' && (
                <>
                  <button className="booking-btn-secondary" onClick={onClose}>Cancel</button>
                  <button
                    className="booking-btn-primary"
                    disabled={!form.meetingType}
                    onClick={() => setStep('details')}
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </>
              )}
              {step === 'details' && (
                <>
                  <button className="booking-btn-secondary" onClick={() => { setErrors({}); setStep('meeting'); }}>
                    Back
                  </button>
                  <button className="booking-btn-primary" onClick={moveToVerify}>
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </>
              )}
              {step === 'verify' && (
                <>
                  <button className="booking-btn-secondary" onClick={() => { setStep('details'); setOtpSent(false); setOtp(''); setOtpError(''); }}>
                    Back
                  </button>
                  {!otpSent ? (
                    <button className="booking-btn-primary" disabled={otpLoading} onClick={sendOtp}>
                      {otpLoading ? 'Sending…' : 'Send OTP'}
                    </button>
                  ) : (
                    <button
                      className="booking-btn-primary"
                      disabled={otp.length !== 4 || otpLoading || loading}
                      onClick={verifyOtpAndSubmit}
                    >
                      {otpLoading || loading ? 'Verifying…' : (
                        <>
                          Verify &amp; Book
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                          </svg>
                        </>
                      )}
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
