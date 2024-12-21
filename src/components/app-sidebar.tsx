'use client'

import { Home, Settings, Menu, HomeIcon as HomeFilled, Settings as SettingsFilled, ShoppingCart, ShoppingCartIcon as ShoppingCartFilled, Book, BookIcon as BookFilled } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"
import { cn } from "@/lib/utils"

const menuItems = [
    {
        title: "Dashboard",
        icon: Home,
        filledIcon: HomeFilled,
        href: "/dashboard"
    },
    {
        title: "Shop",
        icon: ShoppingCart,
        filledIcon: ShoppingCartFilled,
        href: "/dashboard/shop"
    },
    {
        title: "Courses",
        icon: Book,
        filledIcon: BookFilled,
        href: "/dashboard/courses"
    }
]

function SidebarContent({ onNavigate, isMobile }: { onNavigate?: () => void, isMobile?: boolean }) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 p-4 overflow-y-auto">
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = isActive ? item.filledIcon : item.icon
                        return (
                            <Link
                                key={item.title}
                                href={item.href}
                                prefetch={true}
                                className={cn(
                                    "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                                    pathname === item.href
                                        ? "bg-muted"
                                        : "hover:bg-muted/50",
                                )}
                            >
                                {pathname === item.href ? (
                                    <Icon className="h-5 w-5 mr-3" />
                                ) : (
                                    <Icon className="h-5 w-5 mr-3" />
                                )}
                                {item.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="p-4">
                <Link
                    href="/dashboard/settings"
                    onClick={onNavigate}
                    prefetch={true}
                    className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-md text-gray-700",
                        isMobile ? "text-base" : "text-sm",
                        pathname === "/dashboard/settings"
                            ? "bg-gray-100 text-black font-bold"
                            : "hover:bg-accent"
                    )}
                >
                    {pathname === "/dashboard/settings" ? (
                        <SettingsFilled className={cn("h-5 w-5", !isMobile && "h-4 w-4")} strokeWidth={2.5} />
                    ) : (
                        <Settings className={cn("h-5 w-5", !isMobile && "h-4 w-4")} strokeWidth={2} />
                    )}
                    Settings
                </Link>
            </div>
        </div>
    )
}

export function AppSidebar() {
    const [open, setOpen] = useState(false)

    const handleNavigate = () => {
        setOpen(false)
    }

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 border-b bg-background px-4 flex items-center justify-between z-40">
                <Link href="/dashboard" className="font-semibold text-lg">
                    Growvy
                </Link>
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="p-0 pt-12 w-72">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <SidebarContent onNavigate={handleNavigate} isMobile={true} />
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 border-r bg-background shrink-0 h-screen sticky top-0">
                <div className="h-16 flex items-center px-6">
                    <Link href="/dashboard" className="font-semibold text-lg">
                        Growvy
                    </Link>
                </div>
                <div className="h-[calc(100vh-4rem)]">
                    <SidebarContent isMobile={false} />
                </div>
            </aside>
        </>
    )
}