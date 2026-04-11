import { NextRequest, NextResponse } from 'next/server'
import { getBriefs, isTableNotProvisionedError } from '@/lib/briefs'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const t = request.nextUrl.searchParams.get('t')
  const ownerToken = process.env.OWNER_ACCESS_TOKEN

  if (!ownerToken || t !== ownerToken) {
    return new NextResponse(null, { status: 404 })
  }

  let briefs
  try {
    briefs = await getBriefs()
  } catch (err) {
    if (isTableNotProvisionedError(err)) {
      return new NextResponse(null, { status: 404 })
    }
    throw err
  }

  const latest = briefs.find(b => b.category.toLowerCase() === 'world')
  if (!latest) {
    return new NextResponse(null, { status: 404 })
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL || `https://${request.headers.get('host')}`
  const redirectUrl = new URL(`/briefs/${latest.id}?t=${ownerToken}`, base)
  return NextResponse.redirect(redirectUrl)
}
