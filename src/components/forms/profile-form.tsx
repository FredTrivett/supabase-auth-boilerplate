'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/(auth)/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

interface ProfileFormProps {
    initialData: {
        name: string
    }
}

export function ProfileForm({ initialData }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(initialData.name)
    const [hasChanges, setHasChanges] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        const hasFormChanges = name !== initialData.name
        setHasChanges(hasFormChanges)
    }, [name, initialData])

    function handleCancel() {
        setName(initialData.name)
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)

        const result = await updateProfile({ name })

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
            <form onSubmit={handleSubmit} className="space-y-4">
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