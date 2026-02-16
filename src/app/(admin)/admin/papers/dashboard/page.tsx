import { getPaperDashboardStats } from "@/app/actions/papers-dashboard";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { StatsCard } from "@/components/admin/dashboard/stats-card";
import { PaperStatusChart } from "@/components/admin/dashboard/paper-status-chart";
import { TracksChart } from "@/components/admin/dashboard/tracks-chart";
import { RecentActivity } from "@/components/admin/dashboard/recent-activity";
import { FileText, CheckCircle2, TrendingUp, Users } from "lucide-react";

export default async function PapersDashboardPage() {
    const stats = await getPaperDashboardStats();

    if (!stats) {
        return (
            <AdminPageContainer>
                <div className="p-8 text-center text-red-500">
                    Failed to load papers dashboard data. Please try again later.
                </div>
            </AdminPageContainer>
        );
    }

    const { kpi, paperStatus, tracksDistribution, recentSubmissions } = stats;

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Papers Dashboard"
                description="Overview of submissions, reviews, and track distribution."
            />

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Total Papers"
                    value={kpi.totalPapers}
                    icon={FileText}
                    iconClassName="text-blue-600"
                    iconBgClassName="bg-blue-100"
                    description="Submitted & Drafts excluded"
                />
                <StatsCard
                    title="Under Review"
                    value={kpi.underReview}
                    icon={FileText}
                    iconClassName="text-purple-600"
                    iconBgClassName="bg-purple-100"
                    description="Pending decision"
                />
                <StatsCard
                    title="Acceptance Rate"
                    value={`${kpi.acceptanceRate}%`}
                    icon={TrendingUp}
                    iconClassName="text-emerald-600"
                    iconBgClassName="bg-emerald-100"
                    description="Of decided papers"
                />
                <StatsCard
                    title="Active Reviewers"
                    value={kpi.activeReviewers}
                    icon={Users}
                    iconClassName="text-indigo-600"
                    iconBgClassName="bg-indigo-100"
                    description="Available for assignment"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <PaperStatusChart data={paperStatus} />
                <TracksChart data={tracksDistribution} />
            </div>

            {/* Recent Submissions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <RecentActivity logs={recentSubmissions} />
            </div>

        </AdminPageContainer>
    );
}
