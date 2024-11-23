import { AppSidebar } from "@/components/app-sidebar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 w-full">
                    <div className="w-full h-full px-6 py-8 md:p-8 mt-14 md:mt-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
