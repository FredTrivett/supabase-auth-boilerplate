import { createClient } from '@/utils/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // Create authenticated Supabase client
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const isVerified = user?.user_metadata?.email_verified || false
    const onboardingCompleted = user?.user_metadata?.onboarding_completed || false

    // Authentication routes - redirect to appropriate step
    if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      if (user) {
        if (!isVerified) {
          return NextResponse.redirect(new URL('/verify-code', request.url))
        } else if (!onboardingCompleted) {
          return NextResponse.redirect(new URL('/onboarding', request.url))
        } else {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
      return NextResponse.next()
    }

    // Protected routes - check complete flow
    if (pathname.startsWith('/dashboard')) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      if (!isVerified) {
        return NextResponse.redirect(new URL('/verify-code', request.url))
      }
      if (!onboardingCompleted) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      return NextResponse.next()
    }

    // Onboarding route - only accessible if verified but not completed onboarding
    if (pathname.startsWith('/onboarding')) {
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      if (!isVerified) {
        return NextResponse.redirect(new URL('/verify-code', request.url))
      }
      if (onboardingCompleted) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.next()
    }

    // Public routes
    if (pathname.startsWith('/')) {
      return NextResponse.next()
    }

    return NextResponse.next()
  } catch (e) {
    // If there's an error, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}