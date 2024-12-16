'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { PostgrestError } from '@supabase/supabase-js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface User {
    id: string;
    name: string;
    email: string;
    app_role: string;
    created_at: string;
}

interface TimeSeriesData {
    [key: string]: number;
}

function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [role, setRole] = useState('');
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClientComponentClient();

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Get total count
                const { count, error: countError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                if (countError) {
                    throw countError;
                }

                if (count !== null) {
                    setTotalPages(Math.ceil(count / 10));
                }

                // Fetch users for current page
                let query = supabase
                    .from('profiles')
                    .select('id, email, name, app_role, created_at')
                    .order('created_at', { ascending: false });

                // Apply filters
                if (searchTerm) {
                    query = query.ilike('name', `%${searchTerm}%`);
                }
                if (role) {
                    query = query.eq('app_role', role);
                }

                // Apply pagination
                query = query.range((page - 1) * 10, page * 10 - 1);

                const { data, error: fetchError } = await query;

                if (fetchError) {
                    throw fetchError;
                }

                setUsers(data || []);
            } catch (error) {
                const pgError = error as PostgrestError;
                const errorMessage = pgError.message || 'An error occurred while fetching users';
                console.error('Error fetching users:', pgError);
                setError(errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [page, searchTerm, role, supabase]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <div className="flex gap-4">
                    <input
                        type="text"
                        placeholder="Search by name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                    </select>
                </div>
            </div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}
            <div className="overflow-x-auto rounded-lg">
                {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">Loading users...</div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-gray-500">No users found</div>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email || 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <span className={`px-2 py-1 rounded-full text-xs ${user.app_role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                            {user.app_role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1 || isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Previous
                </button>
                <span className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages || isLoading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Next
                </button>
            </div>
        </div>
    );
}

function AdminDashboard({ initialTotalUsers }: { initialTotalUsers: number }) {
    const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData>({});
    const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('day');
    const supabase = createClientComponentClient();

    const fetchTimeSeriesData = async (period: 'day' | 'week' | 'month') => {
        const { data: users, error } = await supabase
            .from('profiles')
            .select('created_at')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching time series data:', error);
            return;
        }

        if (!users?.length) return;

        const groupedData: TimeSeriesData = {};
        users.forEach(user => {
            let dateKey: string;
            const date = new Date(user.created_at);

            switch (period) {
                case 'day':
                    dateKey = date.toISOString().split('T')[0];
                    break;
                case 'week':
                    const day = date.getDay();
                    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
                    dateKey = new Date(date.setDate(diff)).toISOString().split('T')[0];
                    break;
                case 'month':
                    dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
            }

            groupedData[dateKey] = (groupedData[dateKey] || 0) + 1;
        });

        let sum = 0;
        const cumulativeData: TimeSeriesData = {};
        Object.keys(groupedData).sort().forEach(date => {
            sum += groupedData[date];
            cumulativeData[date] = sum;
        });

        setTimeSeriesData(cumulativeData);
    };

    useEffect(() => {
        fetchTimeSeriesData(timePeriod);

        const channel = supabase
            .channel('profiles-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
                fetchTimeSeriesData(timePeriod);
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [timePeriod, supabase]);

    const chartData = {
        labels: Object.keys(timeSeriesData).map(date => {
            const d = new Date(date);
            return timePeriod === 'month'
                ? d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
                : d.toLocaleDateString();
        }),
        datasets: [
            {
                label: 'Total Accounts',
                data: Object.values(timeSeriesData),
                fill: true,
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderColor: 'rgb(59, 130, 246)',
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: 'rgb(59, 130, 246)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                },
            },
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                    maxRotation: 45,
                    minRotation: 45,
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 14,
                },
            },
        },
    };

    return (
        <div className="space-y-8">
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Account Growth</h2>
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value as 'day' | 'week' | 'month')}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="day">Daily</option>
                        <option value="week">Weekly</option>
                        <option value="month">Monthly</option>
                    </select>
                </div>
                <div className="h-[400px]">
                    <Line data={chartData} options={chartOptions} />
                </div>
            </div>
            <UserTable />
        </div>
    );
}

export default AdminDashboard; 