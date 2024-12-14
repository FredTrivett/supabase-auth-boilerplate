import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient(useAdmin: boolean = false) {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    useAdmin ? process.env.SUPABASE_SERVICE_ROLE_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: async (name: string) => {
          const cookie = await cookieStore.get(name)
          return cookie?.value
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          try {
            await cookieStore.set(name, value, options)
          } catch (error) {
            // Handle cookie errors in middleware
          }
        },
        remove: async (name: string, options: CookieOptions) => {
          try {
            await cookieStore.set(name, '', { ...options, maxAge: 0 })
          } catch (error) {
            // Handle cookie errors in middleware
          }
        },
      },
    }
  )
}