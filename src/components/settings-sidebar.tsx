'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
    items: {
        href: string
        title: string
    }[]
}

export function SidebarNav({ className, items, ...props }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                "flex w-full space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1",
                className
            )}
            {...props}
        >
            <Link
                href="/dashboard/settings"
                className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    pathname === "/dashboard/settings"
                        ? "bg-muted"
                        : "hover:bg-muted/50",
                )}
            >
                Overview
            </Link>
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                        pathname === item.href
                            ? "bg-muted"
                            : "hover:bg-muted/50",
                    )}
                >
                    {item.title}
                </Link>
            ))}
        </nav>
    )
} 