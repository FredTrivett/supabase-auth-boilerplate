'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { signup } from '@/app/(auth)/actions'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PasswordInput } from "@/components/ui/password-input"
import { Loader2 } from "lucide-react"

export default function SignUpPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'initial' | 'verifying'>('initial')
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (loading || isPending) {
            setProgress(0)
            const timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(timer)
                        return 90
                    }
                    return prev + 10
                })
            }, 300)
            return () => clearInterval(timer)
        }
    }, [loading, isPending])

    async function handleSubmit(formData: FormData) {
        setError(null)
        setLoading(true)
        setStep('verifying')

        try {
            startTransition(() => {
                signup(formData).then((result) => {
                    if (result?.error) {
                        setError(result.error)
                        setLoading(false)
                        setStep('initial')
                    } else if (result?.success) {
                        router.push('/verify-code')
                    }
                })
            })
        } catch (e) {
            setError('An unexpected error occurred')
            setLoading(false)
            setStep('initial')
        }
    }

    if (step === 'verifying' || isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Card className="w-full max-w-md">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">
                            Setting up your account...
                        </CardTitle>
                        <CardDescription>
                            Please wait while we verify your details...
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center justify-center py-8">
                            <div className="w-full max-w-xs mb-4">
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-500 ease-out"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                            </div>
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="mt-4 text-sm text-muted-foreground">
                                {progress < 30 && "Creating your account..."}
                                {progress >= 30 && progress < 60 && "Setting up your profile..."}
                                {progress >= 60 && "Almost there..."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">
                        Create an account
                    </CardTitle>
                    <CardDescription>
                        Enter your email below to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                minLength={6}
                                disabled={loading}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating account...
                                </>
                            ) : (
                                'Create account'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <div className="text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link
                            href="/login"
                            className="text-primary hover:underline"
                        >
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
} 