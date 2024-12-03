'use server'

import { createClient } from '@/utils/supabase/server'
import { isAdmin } from '@/utils/auth'

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
    const adminStatus = await isAdmin()
    if (!adminStatus) {
        return { error: 'Unauthorized' }
    }

    const supabase = await createClient()

    const { error } = await supabase
        .from('profiles')
        .update({ app_role: role })
        .eq('id', userId)

    if (error) {
        return { error: error.message }
    }

    return { success: true } 