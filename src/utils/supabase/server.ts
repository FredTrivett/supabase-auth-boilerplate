import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

let cachedClient: any = null;

export async function createClient(useAdmin: boolean = false) {
  if (cachedClient) return cachedClient;

  const authKey = useAdmin
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  cachedClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    authKey!,
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies()
            cookieStore.set(name, value, options)
          } catch (error) {
            // Cookie errors can be ignored in middleware
          }
        },
        async remove(name: string, options: CookieOptions) {
          try {
            const cookieStore = await cookies()
            cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // Cookie errors can be ignored in middleware
          }
        },
      },
    }
  )

  return cachedClient
}