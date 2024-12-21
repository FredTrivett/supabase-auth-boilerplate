import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);

  // Only create auth response for protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/admin')) {

    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              requestHeaders.set('Set-Cookie', `${name}=${value}`);
            },
            remove(name: string, options: any) {
              requestHeaders.set('Set-Cookie', `${name}=; max-age=0`);
            },
          },
        }
      );

      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
      }

    } catch (e) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  return response;
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
};