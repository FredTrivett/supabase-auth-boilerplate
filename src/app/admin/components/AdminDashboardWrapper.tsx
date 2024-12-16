'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('./AdminDashboard'), {
    loading: () => <LoadingDashboard />,
});

function LoadingDashboard() {
    return (
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-gray-500">Loading dashboard...</div>
        </div>
    );
}

export default function AdminDashboardWrapper({ initialTotalUsers }: { initialTotalUsers: number }) {
    return (
        <Suspense fallback={<LoadingDashboard />}>
            <AdminDashboard initialTotalUsers={initialTotalUsers} />
        </Suspense>
    );
} 