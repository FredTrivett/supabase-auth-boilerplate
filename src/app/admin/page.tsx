'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { useRouter } from 'next/navigation';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

function UserTable() {
    const [users, setUsers] = useState([]);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [role, setRole] = useState('');
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchUsers = async () => {
            const query = supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })
                .range((page - 1) * 10, page * 10 - 1);

            if (searchTerm) {
                query.ilike('name', `%${searchTerm}%`);
            }

            if (role) {
                query.eq('app_role', role);
            }

            const { data } = await query;
            setUsers(data || []);
        };

        fetchUsers();
    }, [page, searchTerm, role, supabase]);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">User Management</h2>
            <div className="flex gap-4">
                <input
                    type="text"
                    placeholder="Search by name"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border rounded"
                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="px-4 py-2 border rounded"
                >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.app_role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{new Date(user.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="flex justify-between mt-4">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                    Previous
                </button>
                <button
                    onClick={() => setPage(page + 1)}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const [totalAccounts, setTotalAccounts] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClientComponentClient();
    const router = useRouter();

    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();

                if (sessionError) {
                    console.error('Session error:', sessionError);
                    throw new Error('Failed to get session');
                }

                if (!session) {
                    router.replace('/login');
                    return;
                }

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('app_role')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) {
                    console.error('Profile error:', profileError);
                    throw new Error('Failed to get profile');
                }

                if (!profile || profile.app_role !== 'admin') {
                    console.log('User role:', profile?.app_role);
                    router.replace('/dashboard');
                    return;
                }

                setIsLoading(false);
            } catch (error) {
                console.error('Error checking admin status:', error);
                setError(error.message);
                router.replace('/login');
            }
        };

        checkAdmin();
    }, [supabase, router]);

    useEffect(() => {
        if (isLoading) return;

        const fetchStats = async () => {
            const { count } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            setTotalAccounts(count || 0);
        };

        fetchStats();

        const channel = supabase
            .channel('profiles-changes')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, () => {
                fetchStats();
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [supabase, isLoading]);

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen">
            <div className="text-xl">Loading...</div>
        </div>;
    }

    const data = {
        labels: ['Total Accounts'],
        datasets: [
            {
                label: 'Accounts',
                data: [totalAccounts],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
        ],
    };

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Total Accounts: {totalAccounts}</h2>
                <div className="h-64">
                    <Bar data={data} options={{ maintainAspectRatio: false }} />
                </div>
            </div>
            <UserTable />
        </div>
    );
} 