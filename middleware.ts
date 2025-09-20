import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './utils/signature'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  if (pathname.startsWith('/pro')) {
    const token = req.cookies.get('platy_access')?.value || ''
    const payload = verifyToken(token || '')
    if (!payload || payload.plan !== 'lifetime') {
      const url = new URL('/', req.url)
      url.hash = 'oferta'
      return NextResponse.redirect(url)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/pro/:path*'],
}
