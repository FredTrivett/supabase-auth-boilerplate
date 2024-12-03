import { createClient } from '@/utils/supabase/server'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { UsersTable } from "./users-table"
import { SearchX } from "lucide-react"

interface PageProps {
    searchParams: {
        page?: string
        query?: string
    }
}

async function getUsers(page = 1, query?: string) {
    const supabase = await createClient()
    const itemsPerPage = 10
    const start = (page - 1) * itemsPerPage
    const end = start + itemsPerPage - 1

    try {
        let profilesQuery = supabase
            .from('profiles')
            .select('id, name, email, role, app_role, created_at', { count: 'exact' })
            .range(start, end)
            .order('created_at', { ascending: false })

        if (query) {
            profilesQuery = profilesQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`)
        }

        const { data: profiles, count, error: profilesError } = await profilesQuery

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
            return { users: [], totalPages: 0 }
        }

        const totalPages = Math.ceil((count ?? 0) / itemsPerPage)

        return {
            users: profiles || [],
            totalPages
        }
    } catch (error) {
        console.error('Error in getUsers:', error)
        return { users: [], totalPages: 0 }
    }
}

export default async function UsersPage({ searchParams }: PageProps) {
    const currentPage = Number(searchParams.page) || 1
    const query = searchParams.query
    const { users, totalPages } = await getUsers(currentPage, query)

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Users</h1>
                <div className="w-72">
                    <form>
                        <Input
                            type="search"
                            name="query"
                            placeholder="Search users..."
                            defaultValue={query}
                        />
                    </form>
                </div>
            </div>

            {users.length > 0 ? (
                <UsersTable
                    users={users}
                    currentPage={currentPage}
                    totalPages={totalPages}
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <SearchX className="h-12 w-12 text-muted-foreground" />
                    <p className="text-lg text-muted-foreground">No users found</p>
                </div>
            )}
        </div>
    )
} 