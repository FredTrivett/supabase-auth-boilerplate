'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { updatePassword } from '@/app/(auth)/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { PasswordInput } from "@/components/ui/password-input"
import Link from 'next/link'

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const searchParams = useSearchParams()
    const code = searchParams.get('code')

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!code) {
            setError('Invalid reset link')
            return
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        setError(null)
        setLoading(true)
        setSuccess(false)

        const formData = new FormData()
        formData.append('password', password)
        formData.append('confirmPassword', confirmPassword)

        const result = await updatePassword(formData, code)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else {
            setSuccess(true)
            setLoading(false)
            setPassword('')
            setConfirmPassword('')
        }
    }

    if (!code) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-destructive">Invalid Reset Link</CardTitle>
                        <CardDescription>
                            This password reset link is invalid or has expired. Please request a new password reset.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link
                            href="/forgot-password"
                            className="text-primary hover:underline"
                        >
                            Request new reset link
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Reset password</CardTitle>
                    <CardDescription>
                        Enter your new password below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success ? (
                        <Alert className="mb-6 border-green-500 text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <AlertDescription>
                                Password successfully reset. You can now{' '}
                                <Link href="/login" className="font-medium underline">
                                    log in
                                </Link>
                                {' '}with your new password.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New password</Label>
                                <PasswordInput
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm new password</Label>
                                <PasswordInput
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Updating..." : "Update password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    )
} 