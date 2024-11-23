import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    const supabase = await createClient()

    // Sign out - this removes the session cookie
    await supabase.auth.signOut()

    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL!), {
        status: 302,
    })
} 