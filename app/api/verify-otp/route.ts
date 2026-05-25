import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { phone, otp } = await req.json() as { phone: string; otp: string };

  if (!phone || !otp) {
    return NextResponse.json({ ok: false, message: 'Phone and OTP are required' }, { status: 400 });
  }

  const digits = phone.replace(/\D/g, '');
  const mobile = digits.startsWith('91') ? digits : `91${digits.slice(-10)}`;

  const authkey = process.env.MSG91_AUTHKEY;

  if (!authkey) {
    return NextResponse.json({ ok: false, message: 'SMS service not configured' }, { status: 500 });
  }

  const params = new URLSearchParams({ mobile, otp });
  const res = await fetch(`https://control.msg91.com/api/v5/otp/verify?${params}`, {
    method: 'GET',
    headers: { authkey },
  });

  const data = await res.json() as { type: string; message: string };

  if (data.type === 'success') {
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: false, message: 'Incorrect or expired OTP' }, { status: 400 });
}
