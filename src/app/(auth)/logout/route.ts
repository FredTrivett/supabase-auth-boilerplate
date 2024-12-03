import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const cookieStore = cookies()
        const supabase = await createClient()

        // Sign out from Supabase
        await supabase.auth.signOut()

        // Get all cookies and delete them
        const cookiesList = cookieStore.getAll()
        cookiesList.forEach(cookie => {
            // Delete any auth-related cookies
            if (cookie.name.startsWith('sb-') ||
                cookie.name.includes('supabase') ||
                cookie.name.includes('auth')) {
                cookieStore.set(cookie.name, '', {
                    expires: new Date(0),
                    path: '/'
                })
            }
        })

        // Redirect to home page
        return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL))
    } catch (error) {
        console.error('Error during logout:', error)
        // Still redirect to home page even if there's an error
        return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL))
    }
} 