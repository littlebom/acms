import { UserTopNav } from "@/components/user-topnav";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";
import { getActiveQuestionnaires } from "@/app/actions/questions";
import { getSystemSettings } from "@/app/actions/settings";

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    const role = session?.role ?? "attendee";

    let userName = session?.email ?? "";
    let userEmail = session?.email ?? "";
    let userImage: string | undefined;
    let pendingSurveys = 0;

    const settings = await getSystemSettings();

    if (session) {
        const [userRows, questionnaires] = await Promise.all([
            query(
                "SELECT first_name, last_name, email, profile_image FROM users WHERE id = ?",
                [session.userId]
            ) as Promise<any[]>,
            getActiveQuestionnaires(undefined, session.userId) as Promise<any[]>,
        ]);

        if (userRows[0]) {
            const u = userRows[0];
            userName = `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() || u.email;
            userEmail = u.email;
            userImage = u.profile_image || undefined;
        }

        pendingSurveys = questionnaires.filter((q: any) => !q.is_completed).length;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <UserTopNav
                role={role}
                userId={session?.userId ?? 0}
                userName={userName}
                userEmail={userEmail}
                userImage={userImage}
                pendingSurveys={pendingSurveys}
                logoUrl={settings.logo_url || undefined}
                systemName={settings.system_name || 'ACMS'}
            />
            <main className="flex-1 px-6 py-6">
                {children}
            </main>
        </div>
    );
}
