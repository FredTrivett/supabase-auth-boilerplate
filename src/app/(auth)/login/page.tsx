'use client'

import { useState, useTransition, useEffect } from 'react'
import { LoginForm } from '@/components/forms/login-form'
import { LoginSkeleton } from '@/components/skeletons/login-skeleton'

export default function LoginPage() {
    const [mounted, setMounted] = useState(false)

    // Only show content after component mounts to ensure client/server match
    useEffect(() => {
        setMounted(true)
    }, [])

    // Return null on first render to avoid hydration mismatch
    if (!mounted) {
        return null
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <LoginForm />
        </div>
    )
}

export const dynamic = 'force-dynamic'
export const runtime = 'edge'