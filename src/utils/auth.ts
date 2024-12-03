import { createClient } from '@/utils/supabase/server'

export async function isAdmin() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    const { data: profile } = await supabase
        .from('profiles')
        .select('app_role')
        .eq('id', session.user.id)
        .single()

    return profile?.app_role === 'admin'
} 