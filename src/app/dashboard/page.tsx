import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        redirect('/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('name, first_login')
        .eq('id', user.id)
        .single();

    return (
        <div className="container">
            <h1 className="text-2xl font-bold ">
                {profile?.first_login ? (
                    <span>Welcome {profile?.name || 'User'}</span>
                ) : (
                    <span>Welcome back {profile?.name || 'User'}</span>
                )}
            </h1>
            {/* Your dashboard content here */}
        </div>
    );
} 