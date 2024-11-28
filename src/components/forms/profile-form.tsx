'use client'

import { useState, useEffect } from 'react'
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
import { cn } from "@/lib/utils"

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
    const [name, setName] = useState(initialData.name)
    const [hasChanges, setHasChanges] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const hasFormChanges =
            name !== initialData.name ||
            selectedRole !== initialData.role
        setHasChanges(hasFormChanges)
    }, [name, selectedRole, initialData])

    function handleCancel() {
        setSelectedRole(initialData.role)
        setName(initialData.name)
    }

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        formData.set('role', selectedRole)
        formData.set('name', name)

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
        <div className="space-y-4">
            <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                        {loading ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </form>
        </div>
    )
} 