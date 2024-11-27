'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { completeOnboarding } from '@/app/(auth)/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

const roles = [
    { value: 'student', label: 'Student' },
    { value: 'small_business_owner', label: 'Small Business Owner' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'startup_founder', label: 'Startup Founder' },
    { value: 'other', label: 'Other' },
]

export default function OnboardingPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState<string>('')
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        setError(null)
        setLoading(true)

        formData.append('role', selectedRole)

        const result = await completeOnboarding(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        } else if (result?.success) {
            router.push('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
                    <CardDescription>
                        Tell us a bit about yourself to get started
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
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                required
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">What is your current role?</Label>
                            <Select
                                value={selectedRole}
                                onValueChange={setSelectedRole}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select your role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem
                                            key={role.value}
                                            value={role.value}
                                        >
                                            {role.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading || !selectedRole}
                        >
                            {loading ? "Saving..." : "Complete Profile"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
} 