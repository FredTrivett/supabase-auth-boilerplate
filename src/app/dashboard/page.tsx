import { createClient } from '@/utils/supabase/server'

async function getProfile() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('name, first_login')
        .eq('id', user.id)
        .single()

    if (profile?.first_login) {
        // Update first_login to false after fetching
        await supabase
            .from('profiles')
            .update({ first_login: false })
            .eq('id', user.id)
    }

    return profile
}

export default async function DashboardPage() {
    const profile = await getProfile()

    if (!profile) {
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">
                {profile.first_login ? (
                    <span>Welcome {profile.name}! 👋</span>
                ) : (
                    <span>Welcome back {profile.name}! 👋</span>
                )}
            </h1>
        </div>
    )
} 