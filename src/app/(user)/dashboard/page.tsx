import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function UserDashboardPage() {
    const session = await getSession();
    if (!session) redirect("/login");
    redirect(`/dashboard/profile/${session.userId}`);
}
