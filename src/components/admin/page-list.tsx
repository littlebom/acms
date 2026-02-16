'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus,
    MoreVertical,
    Trash2,
    Loader2,
    FileText,
    Eye,
    Pencil,
    Globe,
    Clock,
    CheckCircle,
    Archive,
    Wand2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { deletePage, togglePageStatus, type Page } from "@/app/actions/website";

interface PageListProps {
    pages: (Page & { author_first_name?: string; author_last_name?: string })[];
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
    draft: {
        icon: <Clock className="h-3 w-3" />,
        color: 'bg-yellow-100 text-yellow-700',
        label: 'Draft'
    },
    published: {
        icon: <CheckCircle className="h-3 w-3" />,
        color: 'bg-green-100 text-green-700',
        label: 'Published'
    },
    archived: {
        icon: <Archive className="h-3 w-3" />,
        color: 'bg-slate-100 text-slate-700',
        label: 'Archived'
    },
};

export function PageList({ pages }: PageListProps) {
    const router = useRouter();
    const [deleteTarget, setDeleteTarget] = useState<Page | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function handleDelete() {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deletePage(deleteTarget.id);
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    }

    async function handleStatusChange(id: number, status: 'draft' | 'published' | 'archived') {
        try {
            await togglePageStatus(id, status);
            router.refresh();
        } catch (error) {
            console.error('Status change error:', error);
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pages</h2>
                    <p className="text-sm text-muted-foreground">
                        {pages.length} page{pages.length !== 1 ? 's' : ''} total
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/website/builder">
                        <Button>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Create New Page
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Published</p>
                                <p className="text-2xl font-bold">
                                    {pages.filter(p => p.status === 'published').length}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Drafts</p>
                                <p className="text-2xl font-bold">
                                    {pages.filter(p => p.status === 'draft').length}
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Archived</p>
                                <p className="text-2xl font-bold">
                                    {pages.filter(p => p.status === 'archived').length}
                                </p>
                            </div>
                            <Archive className="h-8 w-8 text-slate-400 opacity-50" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pages Table */}
            {pages.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-slate-50">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No pages yet</h3>
                    <p className="text-slate-500 mt-2">Create your first page to get started.</p>
                    <Link href="/admin/website/pages/new">
                        <Button className="mt-4">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Page
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Updated</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {pages.map((page) => {
                                const statusConfig = STATUS_CONFIG[page.status];
                                return (
                                    <TableRow key={page.id}>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{page.title_en}</div>
                                                {page.title_th && (
                                                    <div className="text-sm text-slate-500">{page.title_th}</div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-sm bg-slate-100 px-2 py-1 rounded">
                                                /{page.slug}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {page.template}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusConfig.color} gap-1`}>
                                                {statusConfig.icon}
                                                {statusConfig.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(page.updated_at).toLocaleDateString('th-TH')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <Link href={`/admin/website/builder/${page.id}`}>
                                                        <DropdownMenuItem>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit Page
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    {page.status === 'published' && (
                                                        <Link href={`/${page.slug}`} target="_blank">
                                                            <DropdownMenuItem>
                                                                <Eye className="mr-2 h-4 w-4" />
                                                                View Page
                                                            </DropdownMenuItem>
                                                        </Link>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    {page.status !== 'published' && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(page.id, 'published')}>
                                                            <Globe className="mr-2 h-4 w-4" />
                                                            Publish
                                                        </DropdownMenuItem>
                                                    )}
                                                    {page.status !== 'draft' && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(page.id, 'draft')}>
                                                            <Clock className="mr-2 h-4 w-4" />
                                                            Unpublish
                                                        </DropdownMenuItem>
                                                    )}
                                                    {page.status !== 'archived' && (
                                                        <DropdownMenuItem onClick={() => handleStatusChange(page.id, 'archived')}>
                                                            <Archive className="mr-2 h-4 w-4" />
                                                            Archive
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => setDeleteTarget(page)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Page</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteTarget?.title_en}"?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
