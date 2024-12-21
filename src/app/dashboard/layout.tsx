import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { AppSidebar } from "@/components/app-sidebar"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 w-full">
                    <div className="w-full h-full px-6 py-8 md:p-10 mt-14 md:mt-0">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
