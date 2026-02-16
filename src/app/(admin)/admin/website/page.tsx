import Link from 'next/link';
import { getPages, getBanners, getAllMenuItems, getSiteSettings } from "@/app/actions/website";
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, Menu, Settings, ArrowRight, Globe } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminWebsitePage() {
    const [pages, banners, menuItems, settings] = await Promise.all([
        getPages(),
        getBanners(),
        getAllMenuItems(),
        getSiteSettings()
    ]);

    const publishedPages = pages.filter(p => p.status === 'published').length;
    const activeBanners = banners.filter(b => b.is_active).length;

    return (
        <AdminPageContainer>
            <AdminPageHeader
                title="Website Management"
                description="Manage your website content, pages, banners, and settings."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Pages Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Pages</CardTitle>
                        <FileText className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pages.length}</div>
                        <p className="text-sm text-muted-foreground">
                            {publishedPages} published
                        </p>
                        <Link href="/admin/website/pages">
                            <Button variant="link" className="px-0 mt-2">
                                Manage Pages
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Banners Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Banners</CardTitle>
                        <Image className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{banners.length}</div>
                        <p className="text-sm text-muted-foreground">
                            {activeBanners} active
                        </p>
                        <Link href="/admin/website/banners">
                            <Button variant="link" className="px-0 mt-2">
                                Manage Banners
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Menu Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
                        <Menu className="h-5 w-5 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{menuItems.length}</div>
                        <p className="text-sm text-muted-foreground">
                            Navigation links
                        </p>
                        <Link href="/admin/website/menus">
                            <Button variant="link" className="px-0 mt-2">
                                Manage Menus
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Settings Card */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Settings</CardTitle>
                        <Settings className="h-5 w-5 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{settings.length}</div>
                        <p className="text-sm text-muted-foreground">
                            Configuration options
                        </p>
                        <Link href="/admin/website/settings">
                            <Button variant="link" className="px-0 mt-2">
                                Site Settings
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Common tasks for managing your website</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-4">
                        <Link href="/admin/website/pages/new">
                            <Button>
                                <FileText className="mr-2 h-4 w-4" />
                                Create New Page
                            </Button>
                        </Link>
                        <Link href="/admin/website/banners">
                            <Button variant="outline">
                                <Image className="mr-2 h-4 w-4" />
                                Add Banner
                            </Button>
                        </Link>
                        <Link href="/" target="_blank">
                            <Button variant="outline">
                                <Globe className="mr-2 h-4 w-4" />
                                View Website
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Pages */}
            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Recent Pages</CardTitle>
                    <CardDescription>Recently updated pages</CardDescription>
                </CardHeader>
                <CardContent>
                    {pages.length === 0 ? (
                        <p className="text-muted-foreground">No pages created yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {pages.slice(0, 5).map((page) => (
                                <div key={page.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                    <div>
                                        <p className="font-medium">{page.title_en}</p>
                                        <p className="text-sm text-muted-foreground">/{page.slug}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs px-2 py-1 rounded ${page.status === 'published' ? 'bg-green-100 text-green-700' :
                                                page.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-slate-100 text-slate-700'
                                            }`}>
                                            {page.status}
                                        </span>
                                        <Link href={`/admin/website/pages/${page.id}`}>
                                            <Button size="sm" variant="ghost">Edit</Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AdminPageContainer>
    );
}
