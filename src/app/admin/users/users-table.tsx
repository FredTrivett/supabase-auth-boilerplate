'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface User {
    id: string
    name: string
    email: string
    role: string
    app_role: string
    created_at: string
}

interface UsersTableProps {
    users: User[]
    currentPage: number
    totalPages: number
}

export function UsersTable({ users, currentPage, totalPages }: UsersTableProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    function goToPage(page: number) {
        const params = new URLSearchParams(searchParams)
        params.set('page', page.toString())
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Admin Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell>
                                    <Badge variant={user.app_role === 'admin' ? 'default' : 'secondary'}>
                                        {user.app_role}
                                    </Badge>
                                </TableCell>
                                <TableCell>{formatDate(user.created_at)}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push(`/admin/users/${user.id}`)}
                                    >
                                        View
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-center space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                >
                    Next
                </Button>
            </div>
        </div>
    )
} 