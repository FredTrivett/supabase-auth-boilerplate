'use client'

import { signOut } from '@/app/(auth)/actions'
import { Button } from "@/components/ui/button"

export default function SignOutButton() {
    return (
        <form action={signOut}>
            <Button
                variant="ghost"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
                Sign out
            </Button>
        </form>
    )
} 