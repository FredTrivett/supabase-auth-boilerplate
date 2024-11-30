import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

let cachedClient: any = null;

export async function createClient(useAdmin: boolean = false) {
  if (cachedClient) return cachedClient;

  const cookieStore = cookies()

  cachedClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    useAdmin ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options)
          } catch (error) {
            // Ignore cookie errors in middleware
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // Ignore cookie errors in middleware
          }
        },
      },
    }
  )

  return cachedClient
}