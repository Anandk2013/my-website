import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { phone } = await req.json() as { phone: string };

  if (!phone) {
    return NextResponse.json({ ok: false, message: 'Phone number is required' }, { status: 400 });
  }

  const digits = phone.replace(/\D/g, '');
  const mobile = digits.startsWith('91') ? digits : `91${digits.slice(-10)}`;

  if (mobile.length !== 12) {
    return NextResponse.json({ ok: false, message: 'Enter a valid 10-digit Indian mobile number' }, { status: 400 });
  }

  const authkey = process.env.MSG91_AUTHKEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (!authkey || !templateId) {
    return NextResponse.json({ ok: false, message: 'SMS service not configured' }, { status: 500 });
  }

  const res = await fetch('https://control.msg91.com/api/v5/otp', {
    method: 'POST',
    headers: {
      authkey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mobile,
      otp_length: 4,
      otp_expiry: 10,
      template_id: templateId,
    }),
  });

  const data = await res.json() as { type: string; message: string };

  if (data.type === 'success') {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, message: 'Failed to send OTP. Please try again.' }, { status: 400 });
}
