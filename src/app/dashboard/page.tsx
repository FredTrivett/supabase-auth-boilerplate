import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 60

async function getProfile() {
    const supabase = await createClient()

    try {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) return null

        const [profileData] = await Promise.all([
            supabase
                .from('profiles')
                .select('name, first_login')
                .eq('id', user.id)
                .single()
        ])

        return profileData.data
    } catch (error) {
        console.error('Error fetching profile:', error)
        return null
    }
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
                    <span>Welcome {profile.name}</span>
                ) : (
                    <span>Welcome back {profile.name}</span>
                )}
            </h1>
        </div>
    )
} 