import { getConferenceStats } from "@/app/actions/conference-dashboard";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { StatsCard } from "@/components/admin/dashboard/stats-card";
import { OverviewChart } from "@/components/admin/dashboard/overview-chart";
import { TicketTypeChart } from "@/components/admin/dashboard/ticket-type-chart";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { CreditCard, Ticket, CheckSquare, BarChart } from "lucide-react";

export default async function ConferenceDashboardPage() {
    const stats = await getConferenceStats();

    if (!stats) {
        return (
            <AdminPageContainer>
                <div className="p-8 text-center text-red-500">
                    Failed to load conference data. Please try again later.
                </div>
            </AdminPageContainer>
        );
    }

    const { kpi, salesTrend, ticketTypes, recentRegistrations } = stats;

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Conference Dashboard"
                description="Overview of ticket sales, revenue, and attendee check-ins."
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Revenue"
                    value={`฿${kpi.revenue.toLocaleString()}`}
                    icon={CreditCard}
                    iconClassName="text-green-600"
                    iconBgClassName="bg-green-100"
                />
                <StatsCard
                    title="Tickets Sold"
                    value={kpi.sold}
                    icon={Ticket}
                    iconClassName="text-blue-600"
                    iconBgClassName="bg-blue-100"
                />
                <StatsCard
                    title="Checked-in"
                    value={kpi.checkedIn}
                    icon={CheckSquare}
                    iconClassName="text-purple-600"
                    iconBgClassName="bg-purple-100"
                />
                <StatsCard
                    title="Check-in Rate"
                    value={`${kpi.checkInRate}%`}
                    icon={BarChart}
                    iconClassName="text-orange-600"
                    iconBgClassName="bg-orange-100"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <OverviewChart data={salesTrend} />
                <TicketTypeChart data={ticketTypes} />
            </div>

            {/* Recent Registrations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecentActivity logs={recentRegistrations} />
            </div>

        </AdminPageContainer>
    );
}
