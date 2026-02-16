import { getReviewers } from "@/app/actions/paper-reviews";
import { ReviewersTable } from "./reviewers-table";
import { query } from "@/lib/db";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { getPaperTracks } from "@/app/actions/paper-tracks";

// Get users who are not yet reviewers
async function getNonReviewerUsers() {
    const users = await query(`
        SELECT u.id, u.first_name, u.last_name, u.email
        FROM users u
        LEFT JOIN reviewers r ON u.id = r.user_id
        WHERE r.id IS NULL
        ORDER BY u.first_name ASC
    `) as any[];
    return users;
}

export default async function AdminReviewersPage() {
    const [reviewers, availableUsers, tracks] = await Promise.all([
        getReviewers(false),
        getNonReviewerUsers(),
        getPaperTracks()
    ]);

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Reviewers"
                description="Manage paper reviewers and their expertise"
            />
            <ReviewersTable reviewers={reviewers} availableUsers={availableUsers} tracks={tracks} />
        </AdminPageContainer>
    );
}
