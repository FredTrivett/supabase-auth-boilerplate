import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options: CookieOptions) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    // Refresh the session and get the user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Handle auth pages (login, signup, forgot-password)
    if (request.nextUrl.pathname.match(/^\/(?:login|signup|forgot-password)$/)) {
      if (user && !userError) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return response;
    }

    // Handle protected routes
    if ((!user || userError) && (
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/admin')
    )) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Handle admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('app_role')
        .eq('id', user?.id)
        .single();

      if (profileError || !profile?.app_role || profile.app_role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }

    return response;
  } catch (e) {
    console.error('Middleware error:', e);
    // On critical errors, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/forgot-password'
  ],
};