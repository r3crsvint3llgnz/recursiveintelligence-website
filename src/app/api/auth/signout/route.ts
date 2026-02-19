import { NextResponse } from 'next/server'

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const response = NextResponse.redirect(`${baseUrl}/`)
  response.cookies.set('ri_session', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   0,
    path:     '/',
  })
  return response
}
