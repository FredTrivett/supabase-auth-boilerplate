import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export function createClient(request: NextRequest) {
  // Create an unmodified response
  let response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the response
          response.cookies.set({
            name,
            value,
            ...options,
            // Ensure cookies work across all paths
            path: '/',
          })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the response
          response.cookies.set({
            name,
            value: '',
            ...options,
            // Ensure cookies work across all paths
            path: '/',
            expires: new Date(0),
          })
        },
      },
    }
  )

  return { supabase, response }
}