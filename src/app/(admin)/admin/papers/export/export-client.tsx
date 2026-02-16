'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download, FileText, Users, MessageSquare } from "lucide-react";
import {
    exportPapersData,
    exportReviewersData,
    exportReviewsData,
} from "@/app/actions/paper-export";
import {
    toCSV,
    PAPER_CSV_COLUMNS,
    REVIEWER_CSV_COLUMNS,
    REVIEW_CSV_COLUMNS
} from "@/lib/csv-utils";
import type { PaperTrack } from "@/app/actions/paper-tracks";

interface ExportPageProps {
    tracks: PaperTrack[];
}

export function ExportPage({ tracks }: ExportPageProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [trackFilter, setTrackFilter] = useState<string>('all');

    const downloadCSV = (csvContent: string, filename: string) => {
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadJSON = (data: any[], filename: string) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportPapers = async (format: 'csv' | 'json') => {
        setLoading('papers-' + format);
        try {
            const filters = {
                status: statusFilter !== 'all' ? statusFilter : undefined,
                track_id: trackFilter !== 'all' ? parseInt(trackFilter) : undefined,
            };
            const data = await exportPapersData(filters);

            const timestamp = new Date().toISOString().slice(0, 10);
            if (format === 'csv') {
                const csv = toCSV(data, PAPER_CSV_COLUMNS);
                downloadCSV(csv, `papers-export-${timestamp}.csv`);
            } else {
                downloadJSON(data, `papers-export-${timestamp}.json`);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        }
        setLoading(null);
    };

    const handleExportReviewers = async (format: 'csv' | 'json') => {
        setLoading('reviewers-' + format);
        try {
            const data = await exportReviewersData();

            const timestamp = new Date().toISOString().slice(0, 10);
            if (format === 'csv') {
                const csv = toCSV(data, REVIEWER_CSV_COLUMNS);
                downloadCSV(csv, `reviewers-export-${timestamp}.csv`);
            } else {
                downloadJSON(data, `reviewers-export-${timestamp}.json`);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        }
        setLoading(null);
    };

    const handleExportReviews = async (format: 'csv' | 'json') => {
        setLoading('reviews-' + format);
        try {
            const data = await exportReviewsData();

            const timestamp = new Date().toISOString().slice(0, 10);
            if (format === 'csv') {
                const csv = toCSV(data, REVIEW_CSV_COLUMNS);
                downloadCSV(csv, `reviews-export-${timestamp}.csv`);
            } else {
                downloadJSON(data, `reviews-export-${timestamp}.json`);
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data');
        }
        setLoading(null);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Export Papers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Papers
                    </CardTitle>
                    <CardDescription>
                        Export paper submission data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Filters */}
                    <div className="space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs">Status Filter</Label>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="under_review">Under Review</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                    <SelectItem value="revision_required">Revision Required</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs">Track Filter</Label>
                            <Select value={trackFilter} onValueChange={setTrackFilter}>
                                <SelectTrigger>
                                    <SelectValue />
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
                        </div>
                    </div>

                    {/* Export Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={() => handleExportPapers('csv')}
                            disabled={loading !== null}
                            className="flex-1"
                            variant="outline"
                        >
                            {loading === 'papers-csv' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                                <Download className="h-4 w-4 mr-1" />
                            )}
                            CSV
                        </Button>
                        <Button
                            onClick={() => handleExportPapers('json')}
                            disabled={loading !== null}
                            className="flex-1"
                            variant="outline"
                        >
                            {loading === 'papers-json' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                                <Download className="h-4 w-4 mr-1" />
                            )}
                            JSON
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Export Reviewers */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Reviewers
                    </CardTitle>
                    <CardDescription>
                        Export reviewer information and stats
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">
                        Includes reviewer names, expertise, affiliations, and performance statistics.
                    </p>

                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={() => handleExportReviewers('csv')}
                            disabled={loading !== null}
                            className="flex-1"
                            variant="outline"
                        >
                            {loading === 'reviewers-csv' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                                <Download className="h-4 w-4 mr-1" />
                            )}
                            CSV
                        </Button>
                        <Button
                            onClick={() => handleExportReviewers('json')}
                            disabled={loading !== null}
                            className="flex-1"
                            variant="outline"
                        >
                            {loading === 'reviewers-json' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                                <Download className="h-4 w-4 mr-1" />
                            )}
                            JSON
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Export Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Reviews
                    </CardTitle>
                    <CardDescription>
                        Export all review data
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">
                        Includes scores, recommendations, and comments from all reviews.
                    </p>

                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={() => handleExportReviews('csv')}
                            disabled={loading !== null}
                            className="flex-1"
                            variant="outline"
                        >
                            {loading === 'reviews-csv' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                                <Download className="h-4 w-4 mr-1" />
                            )}
                            CSV
                        </Button>
                        <Button
                            onClick={() => handleExportReviews('json')}
                            disabled={loading !== null}
                            className="flex-1"
                            variant="outline"
                        >
                            {loading === 'reviews-json' ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : (
                                <Download className="h-4 w-4 mr-1" />
                            )}
                            JSON
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
