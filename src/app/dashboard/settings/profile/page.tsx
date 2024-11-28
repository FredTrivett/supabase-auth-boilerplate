import { createClient } from '@/utils/supabase/server'
import { ProfileForm } from '@/components/forms/profile-form'

async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .single()

    return profile
}

export default async function ProfileSettingsPage() {
    const profile = await getProfile()

    if (!profile) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-lg font-medium">Profile Settings</h3>
                <p className="text-sm text-muted-foreground">
                    Update your profile information.
                </p>
            </div>
            <div className="p-4 bg-muted/40 rounded-lg">
                <ProfileForm initialData={profile} />
            </div>
        </div>
    )
} 