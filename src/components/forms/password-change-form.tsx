'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword } from '@/app/(auth)/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { PasswordInput } from "@/components/ui/password-input"
import { cn } from "@/lib/utils"

export function PasswordChangeForm() {
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [hasChanges, setHasChanges] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    // Check for changes
    useEffect(() => {
        setHasChanges(
            currentPassword !== '' &&
            newPassword !== '' &&
            confirmPassword !== ''
        )
    }, [currentPassword, newPassword, confirmPassword])

    function handleCancel() {
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setShowForm(false)
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)

        const result = await updatePassword(formData)

        if (result?.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error
            })
        } else {
            toast({
                title: "Success",
                description: "Your password has been updated successfully."
            })
            setShowForm(false)

            // Prompt to update password in password manager
            if ('credentials' in navigator) {
                try {
                    await navigator.credentials.preventSilentAccess()
                    // @ts-ignore - Password credential is not properly typed in TypeScript
                    const cred = await navigator.credentials.create({
                        password: {
                            id: window.location.hostname,
                            password: formData.get('newPassword') as string,
                            name: window.location.hostname
                        }
                    })
                    if (cred) {
                        await navigator.credentials.store(cred)
                    }
                } catch (e) {
                    console.log('Password manager update failed:', e)
                }
            }
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                        Change your password
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : 'Change'}
                </Button>
            </div>

            {showForm && (
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <PasswordInput
                            id="currentPassword"
                            name="currentPassword"
                            required
                            autoComplete="current-password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <PasswordInput
                            id="newPassword"
                            name="newPassword"
                            required
                            autoComplete="new-password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <PasswordInput
                            id="confirmPassword"
                            name="confirmPassword"
                            required
                            autoComplete="new-password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-4">
                        {hasChanges && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button
                            type="submit"
                            disabled={loading || !hasChanges}
                            className={cn(
                                !hasChanges && "opacity-50",
                                "transition-opacity"
                            )}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    )
} 