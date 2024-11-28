import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from '@/utils/supabase/server'

async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', user.id)
        .single()

    return {
        ...profile,
        email: user.email
    }
}

export default async function SettingsPage() {
    const profile = await getProfile()

    if (!profile) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>
                        View and manage your account information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Name</p>
                        <p className="text-sm text-muted-foreground">{profile.name}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{profile.email}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium">Role</p>
                        <p className="text-sm text-muted-foreground capitalize">{profile.role.replace(/_/g, ' ')}</p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Edit Profile</CardTitle>
                        <CardDescription>
                            Update your name and role
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="link" asChild>
                            <Link className="pl-0" href="/dashboard/settings/profile">
                                Edit Profile →
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>
                            Manage your email, password and account security
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="link" asChild>
                            <Link className="pl-0" href="/dashboard/settings/account">
                                Manage Security →
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 