'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Plus,
    MoreVertical,
    Trash2,
    Users,
    ExternalLink,
    Pencil,
    Loader2,
    Globe,
    Phone
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { type Sponsor, deleteSponsor } from "@/app/actions/sponsors";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';

export function SponsorList({
    sponsors
}: {
    sponsors: Sponsor[]
}) {
    const router = useRouter();
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    async function confirmDelete() {
        if (!deleteId) return;

        setIsDeleting(true);
        try {
            await deleteSponsor(deleteId);
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete sponsor');
        } finally {
            setIsDeleting(false);
            setDeleteId(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Link href="/admin/engagement/sponsors/add">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Sponsor
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4">
                {sponsors.length === 0 ? (
                    <div className="text-center py-20 bg-white border rounded-lg border-dashed text-slate-500">
                        No sponsors found. Click "Add Sponsor" to create one.
                    </div>
                ) : (
                    sponsors.map((sponsor) => (
                        <div key={sponsor.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Logo */}
                                <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center border overflow-hidden flex-shrink-0">
                                    {sponsor.logo_url ? (
                                        <img src={sponsor.logo_url} alt={sponsor.name_en} className="w-full h-full object-contain" />
                                    ) : (
                                        <div className="text-2xl font-bold text-slate-300">
                                            {sponsor.name_en?.[0] || 'S'}
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">{sponsor.name_en}</h3>
                                            <p className="text-slate-500 font-medium">{sponsor.name_th}</p>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => router.push(`/admin/engagement/sponsors/${sponsor.id}/edit`)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600" onClick={() => setDeleteId(sponsor.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-600 mt-2">
                                        {sponsor.website_url && (
                                            <a
                                                href={sponsor.website_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 p-1 px-2 rounded-md hover:bg-slate-100 transition-colors text-blue-600"
                                            >
                                                <Globe className="h-4 w-4" />
                                                {new URL(sponsor.website_url).hostname}
                                            </a>
                                        )}
                                        {sponsor.contact_number && (
                                            <div className="flex items-center gap-1.5 p-1 px-2">
                                                <Phone className="h-4 w-4" />
                                                {sponsor.contact_number}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Sponsor</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this sponsor? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
