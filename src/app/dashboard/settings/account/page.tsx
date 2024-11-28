import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { EmailChangeForm } from "@/components/forms/email-change-form"
import { createClient } from '@/utils/supabase/server'
import { signOut } from "@/app/(auth)/actions"

async function getUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    return {
        email: user.email
    }
}

export default async function AccountSettingsPage() {
    const user = await getUser()

    if (!user) {
        return <div>Loading...</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Account Security</h3>
                <p className="text-sm text-muted-foreground">
                    Manage your account security settings.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Email Address</CardTitle>
                    <CardDescription>
                        Update your email address
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <EmailChangeForm email={user.email || ''} />
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Password & Authentication</CardTitle>
                    <CardDescription>
                        Update your password and security preferences
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Password Change Form - To be implemented */}
                    <form className="space-y-4">
                        {/* Password fields */}
                    </form>

                    <Separator />

                    {/* Account Deletion */}
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium">Danger Zone</h4>
                            <p className="text-sm text-muted-foreground">
                                Permanent actions to your account
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <form action={signOut}>
                                <Button
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    Sign out
                                </Button>
                            </form>
                            <Button variant="destructive" className="w-fit">
                                Delete Account
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 