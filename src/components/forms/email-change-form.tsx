'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { updateEmail } from '@/app/(auth)/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from '@/utils/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface EmailChangeFormProps {
    email: string
}

export function EmailChangeForm({ email: initialEmail }: EmailChangeFormProps) {
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [currentEmail, setCurrentEmail] = useState(initialEmail)
    const [isCheckingEmail, setIsCheckingEmail] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    // Check for changes
    useEffect(() => {
        setHasChanges(newEmail !== '' && newEmail !== currentEmail)
    }, [newEmail, currentEmail])

    // Function to check for email updates
    const checkEmailUpdate = useCallback(async () => {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error) {
            setIsCheckingEmail(false)
            return
        }

        if (user?.email && user.email !== currentEmail) {
            setCurrentEmail(user.email)
            setIsCheckingEmail(false)
            toast({
                title: "Email Updated",
                description: "Your email has been successfully changed.",
            })
            window.location.reload()
        }
    }, [currentEmail, toast])

    // Set up polling when email change is initiated
    useEffect(() => {
        let interval: NodeJS.Timeout

        if (isCheckingEmail) {
            interval = setInterval(checkEmailUpdate, 1000)
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [isCheckingEmail, checkEmailUpdate])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (newEmail === currentEmail) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "New email cannot be the same as your current email"
            })
            return
        }

        setShowConfirmDialog(true)
    }

    async function confirmEmailChange() {
        setLoading(true)
        setShowConfirmDialog(false)

        const formData = new FormData()
        formData.append('email', newEmail)

        const result = await updateEmail(formData)

        if (result?.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error
            })
        } else {
            toast({
                title: "Verification Email Sent",
                description: "Please check your new email for a confirmation link."
            })
            setShowForm(false)
            setNewEmail('')
            setIsCheckingEmail(true) // Start polling for email updates
        }
        setLoading(false)
    }

    function handleCancel() {
        setNewEmail('')
        setShowForm(false)
    }

    return (
        <div className="p-4 bg-muted/40 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Current Email</p>
                    <p className="text-sm text-muted-foreground">{currentEmail}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : 'Change'}
                </Button>
            </div>

            {showForm && (
                <div className="space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">New Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="Enter new email address"
                                required
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
                                {loading ? "Updating..." : "Update Email"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Email Change</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
                        <span className="text-sm">{currentEmail}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{newEmail}</span>
                    </div>
                    <DialogDescription>
                        Are you sure you want to change your email address? You'll need to verify your new email before the change takes effect.
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmEmailChange}
                            disabled={loading}
                        >
                            Confirm Change
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
} 