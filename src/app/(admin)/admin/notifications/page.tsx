import { getNotifications, getEmailTemplates } from "@/app/actions/notifications";
import { NotificationManager } from "@/components/admin/notification-manager";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function AdminNotificationsPage() {
    const notifications = await getNotifications();
    const templates = await getEmailTemplates();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Notifications"
                description="Manage system notifications, announcements, and email templates."
            />
            <NotificationManager
                notifications={notifications}
                templates={templates}
            />
        </AdminPageContainer>
    );
}
