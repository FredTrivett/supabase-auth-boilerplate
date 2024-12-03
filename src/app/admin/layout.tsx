import { AdminSidebar } from "@/components/admin-sidebar"
import { isAdmin } from "@/utils/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const adminStatus = await isAdmin()
    if (!adminStatus) {
        redirect('/dashboard')
    }

    return (
        <div className="flex min-h-screen">
            <div className="fixed inset-y-0 z-50">
                <AdminSidebar />
            </div>

            <div className="flex-1 md:ml-64">
                <main className="h-full min-h-screen bg-background">
                    <div className="container p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
} 