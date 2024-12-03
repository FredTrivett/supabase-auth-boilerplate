import { createClient } from '@/utils/supabase/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // Refresh session if expired
    const { data: { session } } = await supabase.auth.getSession()

    // Check if route starts with /dashboard
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!session) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Check if route starts with /admin
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!session) {
        const redirectUrl = new URL('/login', request.url)
        return NextResponse.redirect(redirectUrl)
      }

      // Get user profile to check app_role
      const { data: profile } = await supabase
        .from('profiles')
        .select('app_role')
        .eq('id', session.user.id)
        .single()

      if (profile?.app_role !== 'admin') {
        const redirectUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Redirect logged in users away from auth pages
    if (request.nextUrl.pathname.startsWith('/login') ||
      request.nextUrl.pathname.startsWith('/signup')) {
      if (session) {
        const redirectUrl = new URL('/dashboard', request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Clone the response and add the Supabase session cookie
    const finalResponse = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Copy over the cookies from the original response
    const responseCookies = response.headers.get('set-cookie')
    if (responseCookies) {
      finalResponse.headers.set('set-cookie', responseCookies)
    }

    return finalResponse

  } catch (e) {
    if (request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/admin')) {
      const redirectUrl = new URL('/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}