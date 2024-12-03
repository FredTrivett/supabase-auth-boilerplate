'use client'

import { signOut } from "@/app/(auth)/actions"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface SignOutButtonProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    className?: string
}

export function SignOutButton({ variant = 'default', className }: SignOutButtonProps) {
    return (
        <form action={signOut}>
            <Button
                type="submit"
                variant={variant}
                className={className}
            >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
            </Button>
        </form>
    )
} 