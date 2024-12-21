import { Suspense } from 'react'
import { SettingsSkeleton } from '@/components/skeletons/settings-skeleton'
import { createClient } from '@/utils/supabase/server'
import { EmailChangeForm } from '@/components/forms/email-change-form'
import { PasswordChangeForm } from '@/components/forms/password-change-form'

async function AccountContent() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium">Account Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account settings and set email preferences.
                </p>
            </div>
            <div className="space-y-6">
                <EmailChangeForm initialEmail={user.email} />
                <PasswordChangeForm />
            </div>
        </div>
    )
}

export default function AccountPage() {
    return (
        <Suspense fallback={<SettingsSkeleton />}>
            <AccountContent />
        </Suspense>
    )
} 