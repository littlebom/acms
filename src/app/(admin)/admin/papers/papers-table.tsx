'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    exportPapersData,
} from "@/app/actions/paper-export";
import {
    toCSV,
    PAPER_CSV_COLUMNS,
} from "@/lib/csv-utils";
import {
    Search, Eye, Edit3, Send, Clock, CheckCircle2, XCircle, AlertCircle, FileText, Download, Loader2, BookOpen
} from "lucide-react";

import type { Paper, PaperStatus } from "@/app/actions/papers";
import type { PaperTrack } from "@/app/actions/paper-tracks";

const STATUS_CONFIG: Record<PaperStatus, { label: string; color: string }> = {
    draft: { label: 'Draft', color: 'bg-slate-100 text-slate-700' },
    submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-700' },
    under_review: { label: 'Under Review', color: 'bg-purple-100 text-purple-700' },
    revision_required: { label: 'Revision Required', color: 'bg-amber-100 text-amber-700' },
    revision_submitted: { label: 'Revision Submitted', color: 'bg-indigo-100 text-indigo-700' },
    accepted: { label: 'Accepted', color: 'bg-emerald-100 text-emerald-700' },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700' },
    camera_ready: { label: 'Camera Ready', color: 'bg-teal-100 text-teal-700' },
    published: { label: 'Published', color: 'bg-green-100 text-green-700' },
};

interface PapersTableProps {
    papers: Paper[];
    tracks: PaperTrack[];
}

export function PapersTable({ papers, tracks }: PapersTableProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [trackFilter, setTrackFilter] = useState<string>('all');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const filters = {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                track_id: trackFilter !== 'all' ? parseInt(trackFilter) : undefined,
            };
            const data = await exportPapersData(filters);
            const csv = toCSV(data, PAPER_CSV_COLUMNS);

            const timestamp = format(new Date(), 'yyyy-MM-dd');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `papers-export-${timestamp}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        } finally {
            setIsExporting(false);
        }
    };

    // Filter papers
    const filteredPapers = papers.filter(paper => {
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = !searchQuery ||
            paper.title.toLowerCase().includes(searchLower) ||
            paper.submitter_name?.toLowerCase().includes(searchLower) ||
            paper.submitter_email?.toLowerCase().includes(searchLower);

        const matchesStatus = statusFilter === 'all' || paper.status === statusFilter;
        const matchesTrack = trackFilter === 'all' || paper.track_id?.toString() === trackFilter;

        return matchesSearch && matchesStatus && matchesTrack;
    });

    return (
        <Card>
            <CardHeader className="border-b bg-slate-50/50">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <CardTitle className="text-lg">All Papers</CardTitle>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search title or author..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 w-[200px]"
                            />
                        </div>

                        {/* Track Filter */}
                        <Select value={trackFilter} onValueChange={setTrackFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Tracks" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Tracks</SelectItem>
                                {tracks.map(track => (
                                    <SelectItem key={track.id} value={track.id.toString()}>
                                        {track.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Abstract Book Button */}
                        <Button
                            asChild
                            variant="default"
                            className="bg-primary hover:bg-primary/90"
                        >
                            <Link href="/admin/papers/abstract-book">
                                <BookOpen className="h-4 w-4 mr-2" />
                                Abstract Book
                            </Link>
                        </Button>

                        {/* Status Filter */}
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="All Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="revision_required">Revision Required</SelectItem>
                                <SelectItem value="accepted">Accepted</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Export Button */}
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleExport}
                            disabled={isExporting}
                            title="Export to CSV"
                        >
                            {isExporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="w-[60px]">ID</TableHead>
                            <TableHead>Title / Author</TableHead>
                            <TableHead>Track</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredPapers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                    No papers found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPapers.map((paper) => {
                                const statusConfig = STATUS_CONFIG[paper.status];
                                return (
                                    <TableRow key={paper.id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-mono text-sm text-slate-500">
                                            #{paper.id}
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm line-clamp-1" title={paper.title}>
                                                    {paper.title}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {paper.submitter_name} • {paper.submitter_email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {paper.track_name ? (
                                                <Badge variant="outline" className="text-xs">
                                                    {paper.track_name}
                                                </Badge>
                                            ) : (
                                                <span className="text-xs text-slate-400">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${statusConfig.color} text-xs`}>
                                                {statusConfig.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {paper.submitted_at
                                                ? format(new Date(paper.submitted_at), 'MMM d, yyyy')
                                                : '-'
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button asChild variant="ghost" size="sm">
                                                <Link href={`/admin/papers/${paper.id}`}>
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Footer */}
                <div className="px-4 py-3 border-t text-sm text-slate-500 bg-slate-50/50">
                    Showing {filteredPapers.length} of {papers.length} papers
                </div>
            </CardContent>
        </Card>
    );
}
