import { createClient } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // Refresh session if expired
    await supabase.auth.getSession()

    // Add cache control headers for static routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=10, stale-while-revalidate=59'
      )
    }

    return response
  } catch (e) {
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}