'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/(auth)/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

const roles = [
    { value: 'student', label: 'Student' },
    { value: 'small_business_owner', label: 'Small Business Owner' },
    { value: 'entrepreneur', label: 'Entrepreneur' },
    { value: 'freelancer', label: 'Freelancer' },
    { value: 'startup_founder', label: 'Startup Founder' },
    { value: 'other', label: 'Other' },
]

interface ProfileFormProps {
    initialData: {
        name: string
        role: string
    }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [selectedRole, setSelectedRole] = useState(initialData.role)
    const router = useRouter()
    const { toast } = useToast()

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.set('role', selectedRole)

        const result = await updateProfile(formData)

        if (result?.error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: result.error,
            })
        } else {
            toast({
                title: "Success",
                description: "Profile updated successfully",
            })
            router.refresh()
        }
        setLoading(false)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                    Update your profile information
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={initialData.name}
                            placeholder="Your name"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
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

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
} 