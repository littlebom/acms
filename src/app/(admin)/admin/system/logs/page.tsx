'use client';

import { useState, useEffect } from 'react';
import { AdminPageHeader, AdminPageContainer } from "@/components/admin/admin-page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ShieldAlert, ChevronLeft, ChevronRight } from "lucide-react";
import { getAuditLogs, AuditLog } from '@/app/actions/audit-logs';
import { format } from 'date-fns';

export default function AdminSecurityPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const data = await getAuditLogs({
                page,
                limit: 20,
                search,
                action: actionFilter
            });
            setLogs(data.logs);
            setTotalPages(data.pagination.totalPages);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 300); // Debounce
        return () => clearTimeout(timer);
    }, [page, search, actionFilter]);

    const getActionColor = (action: string) => {
        switch (action.toUpperCase()) {
            case 'LOGIN': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
            case 'CREATE': return 'bg-green-100 text-green-700 hover:bg-green-100';
            case 'UPDATE': return 'bg-amber-100 text-amber-700 hover:bg-amber-100';
            case 'DELETE': return 'bg-red-100 text-red-700 hover:bg-red-100';
            default: return 'bg-slate-100 text-slate-700 hover:bg-slate-100';
        }
    };

    return (
        <AdminPageContainer maxWidth="6xl">
            <AdminPageHeader
                title="Event Logs"
                description="Monitor system activities, user actions, and security events."
            />

            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                        <div>
                            <CardTitle>System Activity</CardTitle>
                            <CardDescription>All user actions and changes within the system.</CardDescription>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search user, email, or details..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select value={actionFilter} onValueChange={setActionFilter}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Filter Action" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Actions</SelectItem>
                                    <SelectItem value="LOGIN">Login</SelectItem>
                                    <SelectItem value="CREATE">Create</SelectItem>
                                    <SelectItem value="UPDATE">Update</SelectItem>
                                    <SelectItem value="DELETE">Delete</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[180px]">Timestamp</TableHead>
                                    <TableHead className="w-[200px]">User</TableHead>
                                    <TableHead className="w-[120px]">Action</TableHead>
                                    <TableHead className="w-[150px]">Resource</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-slate-400" />
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                            No logs found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-xs text-slate-500">
                                                {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{log.user_name || 'Unknown User'}</span>
                                                    <span className="text-xs text-slate-500">{log.user_email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={`font-mono text-[10px] ${getActionColor(log.action)}`}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600 font-medium">
                                                {log.resource}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                <div className="truncate max-w-sm" title={log.details || ''}>
                                                    {log.details || '-'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="text-sm text-muted-foreground">
                            Page {page} of {totalPages || 1}
                        </div>
                        <div className="space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                disabled={page === 1 || loading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={page === totalPages || loading}
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </AdminPageContainer>
    );
}
