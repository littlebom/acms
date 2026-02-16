import { getAllMenuItems } from "@/app/actions/website";
import { MenuManager } from "@/components/admin/menu-manager";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function AdminMenusPage() {
    const menuItems = await getAllMenuItems();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Menu Management"
                description="Manage navigation menus for header and footer."
            />
            <MenuManager menuItems={menuItems} />
        </AdminPageContainer>
    );
}
