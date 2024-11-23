'use client'

import { useState, useEffect } from 'react'
import { updateEmail, signOut } from '@/app/(auth)/actions'
import { createClient } from '@/utils/supabase/client'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Mail, User, ArrowRight, LogOut } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSearchParams } from 'next/navigation'

export default function SettingsPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [currentEmail, setCurrentEmail] = useState<string | null>(null)
    const [newEmail, setNewEmail] = useState('')
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const searchParams = useSearchParams()
    const [isPolling, setIsPolling] = useState(false)

    useEffect(() => {
        async function getUser() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                setCurrentEmail(user.email)
            }
        }
        getUser()

        if (searchParams.get('success') === 'email-change') {
            setSuccess(true)
            setError(null)
            setIsPolling(true)
        } else if (searchParams.get('error') === 'email-change') {
            setError(searchParams.get('message') || 'Error changing email')
            setSuccess(false)
        }
    }, [searchParams])

    useEffect(() => {
        let interval: NodeJS.Timeout

        if (isPolling) {
            interval = setInterval(async () => {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user?.email && user.email !== currentEmail) {
                    setCurrentEmail(user.email)
                    setIsPolling(false)
                    setSuccess(false)
                    setError(null)
                    clearInterval(interval)
                }
            }, 2000)
        }

        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [isPolling, currentEmail])

    useEffect(() => {
        if (success && !isPolling) {
            setIsPolling(true)
        }
    }, [success])

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (newEmail === currentEmail) {
            setError('New email cannot be the same as your current email')
            return
        }

        setShowConfirmDialog(true)
    }

    async function confirmEmailChange() {
        setError(null)
        setLoading(true)
        setSuccess(false)
        setShowConfirmDialog(false)

        const formData = new FormData()
        formData.append('email', newEmail)

        const result = await updateEmail(formData)

        if (result?.error) {
            setError(result.error)
        } else {
            setSuccess(true)
            setShowForm(false)
            setNewEmail('')
        }
        setLoading(false)
    }

    return (
        <div className="flex-1 space-y-4">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your account settings</p>
                </div>
                <form action={signOut}>
                    <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        Sign out
                        <LogOut className="mr-2 h-4 w-4" />
                    </Button>
                </form>
            </div>

            {error && (
                <Alert variant="destructive" className="">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {success && (
                <Alert className="mb-6 border-green-500 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                        {searchParams.get('success') === 'email-change'
                            ? 'Email changed successfully!'
                            : 'Email update initiated. Please check your new email for a confirmation link.'}
                    </AlertDescription>
                </Alert>
            )}

            <div className="py-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Account Information</h2>
                        <p className="text-sm text-muted-foreground">Manage your personal information</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-4">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email Address</p>
                                <p className="text-sm text-muted-foreground">{currentEmail}</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Cancel' : 'Change'}
                        </Button>
                    </div>

                    {showForm && (
                        <div className="p-4 bg-muted/30 rounded-lg space-y-4">
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
                                        className="border-0 bg-background"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                    >
                                        {loading ? "Updating..." : "Update Email"}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

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