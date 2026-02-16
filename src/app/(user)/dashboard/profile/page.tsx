import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfileRedirectPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    // Redirect to the dynamic route
    redirect(`/dashboard/profile/${session.userId}`);
}
