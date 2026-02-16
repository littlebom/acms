import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ChevronLeft } from "lucide-react";
import ProfileForm from '../../profile-form';
import Link from 'next/link';

async function getUser(id: number) {
    try {
        const users = await query('SELECT * FROM users WHERE id = ?', [id]) as any[];
        return users.length > 0 ? users[0] : null;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

export default async function EditProfilePage({ params }: { params: { id: string } }) {
    const session = await getSession();

    // 1. Check Login
    if (!session) {
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold mb-4">Please Login</h1>
                <Link href="/login" className="text-blue-600 hover:underline">Go to Login Page</Link>
            </div>
        );
    }

    const resolvedParams = await Promise.resolve(params);
    const idString = resolvedParams?.id;

    if (!idString) {
        return <div>Error: No User ID provided</div>;
    }

    const targetUserId = parseInt(idString);
    const sessionUserId = Number(session.userId);

    // 2. Check Permissions (Must be own profile or admin)
    const isOwnProfile = targetUserId === sessionUserId;
    const isAdmin = session.role === 'admin';
    const canEdit = isOwnProfile || isAdmin;

    if (!canEdit) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Access Denied</AlertTitle>
                    <AlertDescription>
                        You do not have permission to edit this profile.
                    </AlertDescription>
                </Alert>
                <div className="mt-4">
                    <Link href={`/dashboard/profile/${targetUserId}`}>
                        <Button variant="outline">Back to Profile</Button>
                    </Link>
                </div>
            </div>
        );
    }

    // 3. Fetch Data
    const user = await getUser(targetUserId);

    if (!user) {
        return (
            <div className="p-6 max-w-4xl mx-auto text-center">
                <h1 className="text-2xl font-bold text-slate-900">User Not Found</h1>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Link href={`/dashboard/profile/${user.id}`} className="text-sm text-slate-500 hover:text-indigo-600 flex items-center">
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back to Profile
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Edit Profile
                    </h1>
                    <p className="text-slate-500">
                        Update your personal and professional information.
                    </p>
                </div>
            </div>

            <ProfileForm user={user} isReadOnly={false} />
        </div>
    );
}
