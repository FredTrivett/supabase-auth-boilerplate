import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from '@/utils/supabase/server'
import { cn } from "@/lib/utils"
import { signOut } from "@/app/(auth)/actions"

interface Profile {
    name: string | null;
    app_role: string;
    email: string | null;
}

async function getProfile(): Promise<Profile | null> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('name, app_role')
        .eq('id', user.id)
        .single()

    return {
        name: profile?.name || 'Anonymous',
        app_role: profile?.app_role || 'user',
        email: user.email
    }
}

export default async function SettingsPage() {
    const profile = await getProfile()

    if (!profile) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-x-2">
                        <p className="text-sm font-medium leading-none">{profile.name}</p>
                        <div className={`text-xs px-2.5 py-0.5 rounded-md ${profile.app_role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {profile.app_role}
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                </div>
                <form
                    action={signOut}
                    className="inline-block"
                >
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        type="submit"
                    >
                        Sign out
                    </Button>
                </form>
            </div>

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