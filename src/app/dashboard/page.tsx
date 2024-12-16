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
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-4">
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