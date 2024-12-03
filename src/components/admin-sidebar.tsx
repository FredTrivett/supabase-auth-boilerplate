'use client'

import { Users, Settings, Menu, LayoutDashboard, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { cn } from "@/lib/utils"

const menuItems = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/admin"
    },
    {
        title: "Users",
        icon: Users,
        href: "/admin/users"
    },
    {
        title: "Products",
        icon: ShoppingBag,
        href: "/admin/products"
    },
    {
        title: "Settings",
        icon: Settings,
        href: "/admin/settings"
    }
]

export function AdminSidebar() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    return (
        <>
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button
                        variant="ghost"
                        className="md:hidden fixed top-4 left-4 z-40"
                    >
                        <Menu className="h-4 w-4" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                    <nav className="h-full flex flex-col bg-muted/40">
                        <div className="p-6">
                            <h2 className="text-lg font-semibold">Admin Panel</h2>
                        </div>
                        <div className="flex-1 px-3 py-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                                        pathname === item.href ? "bg-accent" : ""
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Link>
                            ))}
                        </div>
                    </nav>
                </SheetContent>
            </Sheet>

            <div className="hidden md:flex h-full w-64">
                <nav className="flex-1 flex flex-col bg-muted/40">
                    <div className="p-6">
                        <h2 className="text-lg font-semibold">Admin Panel</h2>
                    </div>
                    <div className="flex-1 px-3 py-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent",
                                    pathname === item.href ? "bg-accent" : ""
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.title}
                            </Link>
                        ))}
                    </div>
                </nav>
            </div>
        </>
    )
} 