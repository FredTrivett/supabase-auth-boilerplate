import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { EmailChangeForm } from "@/components/forms/email-change-form"
import { createClient } from '@/utils/supabase/server'
import { unstable_noStore as noStore } from 'next/cache'
import { PasswordChangeForm } from "@/components/forms/password-change-form"

async function getUser() {
    noStore()
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
        <div className="space-y-8">
            {/* Email Section */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Email Address</h3>
                    <p className="text-sm text-muted-foreground">
                        Update your email address
                    </p>
                </div>
                <EmailChangeForm email={user.email || ''} />
            </div>

            {/* Password Section */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Password & Authentication</h3>
                    <p className="text-sm text-muted-foreground">
                        Update your password and security preferences
                    </p>
                </div>
                <div className="p-4 bg-muted/40 rounded-lg">
                    <PasswordChangeForm />
                </div>
            </div>

            {/* Danger Zone */}
            <div className="space-y-4 pt-4">
                <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Danger Zone</h3>
                    <p className="text-sm text-muted-foreground/60">
                        Permanent actions to your account
                    </p>
                </div>
                <div className="p-4 border border-muted rounded-lg">
                    <Button
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                        Delete Account
                    </Button>
                </div>
            </div>
        </div>
    )
} 