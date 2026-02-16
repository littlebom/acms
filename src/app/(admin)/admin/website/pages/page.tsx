import { getPages } from "@/app/actions/website";
import { PageList } from "@/components/admin/page-list";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function AdminPagesPage() {
    const pages = await getPages();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Page Management"
                description="Create and manage dynamic pages for your website."
            />
            <PageList pages={pages} />
        </AdminPageContainer>
    );
}
