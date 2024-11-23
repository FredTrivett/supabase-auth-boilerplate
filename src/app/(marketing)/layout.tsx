import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="px-6 flex h-14 items-center justify-between">
                    <Link href="/" className="font-semibold text-lg">
                        Growvy
                    </Link>
                    <div className="flex items-center gap-2">
                        <Link href="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/signup">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1 px-6">{children}</main>
        </div>
    )
} 