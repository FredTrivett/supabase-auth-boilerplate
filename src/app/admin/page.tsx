import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboardWrapper from './components/AdminDashboardWrapper';

export default async function AdminPage() {
    const supabase = await createClient();

    // Verify user and admin status
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.log('No user found:', userError);
        redirect('/login');
    }

    // Double-check admin status
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('app_role')
        .eq('id', user.id)
        .single();

    if (profileError || !profile?.app_role || profile.app_role !== 'admin') {
        console.log('Not admin:', profile?.app_role);
        redirect('/dashboard');
    }

    // Fetch initial data for the dashboard
    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <AdminDashboardWrapper initialTotalUsers={totalUsers || 0} />
        </div>
    );
} 