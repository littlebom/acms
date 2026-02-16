import { getDashboardStats } from "@/app/actions/dashboard";
import { getAdminEventId } from "@/lib/admin-event";
import { getEvent } from "@/app/actions/events";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { StatsCard } from "@/components/admin/dashboard/stats-card";
import { OverviewChart } from "@/components/admin/dashboard/overview-chart";
import { PaperStatusChart } from "@/components/admin/dashboard/paper-status-chart";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { Users, FileText, CreditCard, Calendar, Activity, AlertTriangle } from "lucide-react";

export default async function AdminDashboardPage() {
    const selectedEventId = await getAdminEventId();
    // Safety check: if selectedEventId is 0 or invalid, dashboard stats might fail or return empty
    const stats = await getDashboardStats(selectedEventId);
    const selectedEvent = await getEvent(selectedEventId);

    if (!stats) {
        return (
            <AdminPageContainer>
                <div className="p-8 text-center text-red-500">
                    Failed to load dashboard data. Please try again later.
                </div>
            </AdminPageContainer>
        )
    }

    const { counts, trend, paperStatus, recentLogs } = stats;

    return (
        <AdminPageContainer>
            {selectedEvent && !selectedEvent.is_active && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                        <p className="font-semibold text-sm">You are viewing historical data</p>
                        <p className="text-xs text-yellow-700">
                            Currently displaying statistics for <strong>{selectedEvent.title}</strong> which is an archived event.
                        </p>
                    </div>
                </div>
            )}

            <AdminPageHeader
                title="Dashboard"
                description={`Overview for ${selectedEvent?.title || 'System'}`}
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Revenue"
                    value={`฿${counts.revenue.toLocaleString()}`}
                    icon={CreditCard}
                    iconClassName="text-green-600"
                    iconBgClassName="bg-green-100"
                    description="From paid registrations"
                />
                <StatsCard
                    title="Paid Registrations"
                    value={counts.registrations}
                    icon={Users}
                    iconClassName="text-blue-600"
                    iconBgClassName="bg-blue-100"
                    description="Confirmed attendees"
                />
                <StatsCard
                    title="Papers Submitted"
                    value={counts.papers}
                    icon={FileText}
                    iconClassName="text-purple-600"
                    iconBgClassName="bg-purple-100"
                    description="Across all tracks"
                />
                <StatsCard
                    title="Total Users"
                    value={counts.users}
                    icon={Users}
                    iconClassName="text-orange-600"
                    iconBgClassName="bg-orange-100"
                    description="Registered accounts"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <OverviewChart data={trend} />
                <PaperStatusChart data={paperStatus} />
            </div>

            {/* Recent Activity & Quick Links (Optional, here just Activity) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecentActivity logs={recentLogs} />
            </div>

        </AdminPageContainer>
    );
}
