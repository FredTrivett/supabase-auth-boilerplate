'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'

export default function EmailConfirmationPage() {
    const searchParams = useSearchParams()
    const success = searchParams.get('success') === 'email-change'
    const error = searchParams.get('error') === 'email-change'
    const message = searchParams.get('message')
    const [emailVerified, setEmailVerified] = useState(false)

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        // Only set up polling if there's no error
        if (!error) {
            const checkEmailVerification = async () => {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user?.email_confirmed_at) {
                    setEmailVerified(true)
                    if (window.opener) {
                        window.opener.location.reload()
                    }
                    if (interval) {
                        clearInterval(interval)
                    }
                }
            }

            interval = setInterval(checkEmailVerification, 2000)
        }

        // Cleanup function
        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [error]) // Only depend on error state

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-6 flex flex-col items-center">
                    {emailVerified ? (
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                    ) : error ? (
                        <XCircle className="h-12 w-12 text-red-500" />
                    ) : (
                        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    <CardTitle className="text-2xl font-bold text-center">
                        {emailVerified
                            ? "Email Changed Successfully"
                            : error
                                ? "Email Change Failed"
                                : "Confirming Email Change"}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    <CardDescription className="text-center text-base">
                        {emailVerified
                            ? "Your email has been successfully updated. You can close this window."
                            : error
                                ? message || "There was an error changing your email. Please try again."
                                : "Please wait while we confirm your email change..."}
                    </CardDescription>

                    <div className="flex justify-center">
                        <Button
                            onClick={() => window.close()}
                            variant="outline"
                        >
                            Close Window
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 