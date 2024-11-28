'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateEmail } from '@/app/(auth)/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { ArrowRight } from "lucide-react"

interface EmailChangeFormProps {
    email: string
}

export function EmailChangeForm({ email }: EmailChangeFormProps) {
    const [loading, setLoading] = useState(false)
    const [showForm, setShowForm] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()

        if (newEmail === email) {
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
                title: "Success",
                description: "Email update initiated. Please check your new email for a confirmation link."
            })
            setShowForm(false)
            setNewEmail('')
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                    <p className="text-sm font-medium">Current Email</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : 'Change'}
                </Button>
            </div>

            {showForm && (
                <div className="p-4 bg-muted/30 rounded-lg">
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

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Email Change</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-4">
                        <span className="text-sm">{email}</span>
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