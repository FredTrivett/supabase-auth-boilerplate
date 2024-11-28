import { Separator } from "@/components/ui/separator"
import { SidebarNav } from "@/components/settings-sidebar"

const sidebarNavItems = [
    {
        title: "Edit Profile",
        href: "/dashboard/settings/profile",
    },
    {
        title: "Security",
        href: "/dashboard/settings/account",
    },
]

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="pb-16">
            <div className="space-y-0.5 pb-2">
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>
            <Separator className="mb-4" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="lg:w-1/4">
                    <SidebarNav items={sidebarNavItems} />
                </aside>
                <div className="flex-1 lg:max-w-3xl">{children}</div>
            </div>
        </div>
    )
} 