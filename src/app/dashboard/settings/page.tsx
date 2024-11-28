import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from '@/utils/supabase/server'
import { cn } from "@/lib/utils"

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
                <CardContent className="pt-6">
                    <div className="grid gap-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{profile.name}</p>
                                <p className="text-sm text-muted-foreground">{profile.email}</p>
                            </div>
                            <div className="text-sm text-muted-foreground bg-muted px-2.5 py-0.5 rounded-md">
                                {profile.role.replace(/_/g, ' ')}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Link href="/dashboard/settings/profile" className="block group h-full">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Edit Profile</CardTitle>
                            <CardDescription>
                                Update your name and role
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className={cn(
                                "text-sm font-medium text-primary",
                                "group-hover:underline"
                            )}>
                                Edit Profile →
                            </span>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/dashboard/settings/account" className="block group h-full">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Security Settings</CardTitle>
                            <CardDescription>
                                Manage your email, password and account security
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <span className={cn(
                                "text-sm font-medium text-primary",
                                "group-hover:underline"
                            )}>
                                Manage Security →
                            </span>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    )
} 