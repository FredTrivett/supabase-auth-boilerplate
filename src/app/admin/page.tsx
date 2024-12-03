import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from '@/utils/supabase/server'

async function getStats() {
    const supabase = await createClient()

    const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

    return {
        users: count ?? 0
    }
}

export default async function AdminDashboard() {
    const stats = await getStats()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 