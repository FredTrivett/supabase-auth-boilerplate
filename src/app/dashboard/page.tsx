import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import SignOutButton from '@/components/ui/SignOutButton'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            </div>

            <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                    Account
                </h3>
                <div className="text-2xl font-bold">{user.email}</div>
                <p className="text-xs text-muted-foreground mt-1">
                    {user.user_metadata?.email_verified ? 'Email verified' : 'Email not verified'}
                </p>
            </div>
        </div>
    )
} 