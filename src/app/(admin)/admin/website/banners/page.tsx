import { getBanners } from "@/app/actions/website";
import { BannerManager } from "@/components/admin/banner-manager";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
    const banners = await getBanners();

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Banner Management"
                description="Manage homepage banners and sliders."
            />
            <BannerManager banners={banners} />
        </AdminPageContainer>
    );
}
