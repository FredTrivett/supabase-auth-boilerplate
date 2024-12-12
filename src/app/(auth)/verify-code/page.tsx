'use client'

import { useState, useEffect, useRef } from 'react'
import { verifyCode, resendCode } from '@/app/(auth)/actions'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function VerifyCode() {
    const [countdown, setCountdown] = useState(30)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const inputs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputs.current[0]) {
                inputs.current[0].focus()
            }
        }, 50)

        return () => clearTimeout(timer)
    }, [])

    const handleInput = async (index: number, value: string) => {
        const numericValue = value.replace(/[^0-9]/g, '')

        if (numericValue.length > 1) {
            value = numericValue[0]
        }

        if (inputs.current[index]) {
            inputs.current[index]!.value = numericValue
        }

        if (numericValue && index < 3) {
            inputs.current[index + 1]?.focus()
        }

        if (index === 3 && numericValue) {
            const code = inputs.current
                .map(input => input?.value)
                .join('')

            if (code.length === 4) {
                await handleVerify(code)
            }
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text')
        const numbers = pastedData.replace(/[^0-9]/g, '').slice(0, 4)

        if (numbers) {
            numbers.split('').forEach((num, index) => {
                if (inputs.current[index]) {
                    inputs.current[index]!.value = num
                    if (index < 3) {
                        inputs.current[index + 1]?.focus()
                    }
                }
            })

            if (numbers.length === 4) {
                handleVerify(numbers)
            }
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !e.currentTarget.value && index > 0) {
            inputs.current[index - 1]?.focus()
        }
    }

    const handleVerify = async (code: string) => {
        setError(null)
        setLoading(true)

        const formData = new FormData()
        for (let i = 0; i < 4; i++) {
            formData.append(`code-${i}`, code[i])
        }

        const result = await verifyCode(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setError(null)
        setLoading(true)

        try {
            const cookieStore = document.cookie
            const verificationData = cookieStore
                .split('; ')
                .find(row => row.startsWith('verification_data='))

            if (!verificationData) {
                setError('No email found. Please try signing up again.')
                setLoading(false)
                return
            }

            const data = JSON.parse(decodeURIComponent(verificationData.split('=')[1]))
            const result = await resendCode(data.email)

            if (result?.error) {
                setError(result.error)
            } else {
                setCountdown(30)
            }
        } catch (error) {
            setError('Error resending code. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
        inputs.current[index] = el
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                    <CardDescription>
                        We've sent a 4-digit code to your email
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="flex justify-center gap-2">
                        {[0, 1, 2, 3].map((i) => (
                            <Input
                                key={i}
                                ref={setInputRef(i)}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                className="w-14 h-14 text-center text-2xl font-semibold"
                                onChange={(e) => handleInput(i, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(i, e)}
                                onPaste={handlePaste}
                                disabled={loading}
                            />
                        ))}
                    </div>

                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleResend}
                        disabled={countdown > 0 || loading}
                    >
                        {loading ? 'Sending...' : countdown > 0 ? `Resend code (${countdown}s)` : 'Resend code'}
                    </Button>

                    <p className="text-sm text-muted-foreground text-center">
                        Didn't receive the code? Check your spam folder.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
} 