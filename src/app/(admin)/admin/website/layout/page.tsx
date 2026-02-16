'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, PanelTop, PanelBottom, ArrowRight } from 'lucide-react';

export default function LayoutDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Layout Management</h2>
                <p className="text-sm text-muted-foreground">
                    Customize the global header and footer of your website.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <PanelTop className="h-10 w-10 text-blue-500 mb-2" />
                        <CardTitle>Header Navigation</CardTitle>
                        <CardDescription>
                            Customize your website's main navigation bar, logo, and menu items.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/website/layout/header">
                            <Button className="w-full">
                                Edit Header
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <PanelBottom className="h-10 w-10 text-indigo-500 mb-2" />
                        <CardTitle>Footer Area</CardTitle>
                        <CardDescription>
                            Edit the footer section, including links, contact info, and copyright text.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/admin/website/layout/footer">
                            <Button className="w-full">
                                Edit Footer
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
