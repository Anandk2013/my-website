import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  const role = session?.user?.user_metadata?.role as string | undefined

  // /brand/* (excluding /brand/login) — brand accounts only
  if (pathname.startsWith('/brand/') && !pathname.startsWith('/brand/login')) {
    if (!session) {
      const url = new URL('/brand/login', req.url)
      url.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(url)
    }
    if (role !== 'brand') {
      return NextResponse.redirect(new URL('/brand/login', req.url))
    }
  }

  // /admin/* — admin accounts only
  if (pathname.startsWith('/admin/')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // /my-consultations — any logged-in user
  if (pathname === '/my-consultations') {
    if (!session) {
      const url = new URL('/login', req.url)
      url.searchParams.set('returnTo', pathname)
      return NextResponse.redirect(url)
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
