'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    MoreVertical,
    Trash2,
    Loader2,
    Bell,
    Mail,
    Send,
    Pencil,
    Eye,
    Clock,
    CheckCircle,
    AlertCircle,
    Users,
    FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    createNotification,
    updateNotification,
    deleteNotification,
    sendNotification,
    deleteEmailTemplate,
    type Notification,
    type EmailTemplate
} from "@/app/actions/notifications";

interface NotificationManagerProps {
    notifications: Notification[];
    templates: EmailTemplate[];
}

const PRIORITY_COLORS: Record<string, string> = {
    low: 'bg-slate-100 text-slate-700',
    normal: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    draft: <FileText className="h-4 w-4 text-slate-500" />,
    scheduled: <Clock className="h-4 w-4 text-blue-500" />,
    sending: <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />,
    sent: <CheckCircle className="h-4 w-4 text-green-500" />,
    failed: <AlertCircle className="h-4 w-4 text-red-500" />,
};

function NotificationForm({
    notification,
    onClose
}: {
    notification?: Notification | null,
    onClose: () => void
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isEmail, setIsEmail] = useState(notification?.is_email || false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            if (notification) {
                await updateNotification(notification.id, formData);
            } else {
                formData.append('status', 'draft');
                await createNotification(formData);
            }
            router.refresh();
            onClose();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={notification?.title || ''}
                    placeholder="Notification title..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    defaultValue={notification?.message || ''}
                    placeholder="Write your message here..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" defaultValue={notification?.type || 'announcement'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="announcement">Announcement</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select name="priority" defaultValue={notification?.priority || 'normal'}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="target_type">Target Audience</Label>
                <Select name="target_type" defaultValue={notification?.target_type || 'all'}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="attendee">Attendees Only</SelectItem>
                        <SelectItem value="speaker">Speakers Only</SelectItem>
                        <SelectItem value="reviewer">Reviewers Only</SelectItem>
                        <SelectItem value="author">Authors Only</SelectItem>
                        <SelectItem value="admin">Admins Only</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center space-x-2 py-2">
                <Switch
                    id="is_email"
                    name="is_email"
                    checked={isEmail}
                    onCheckedChange={setIsEmail}
                />
                <Label htmlFor="is_email">Also send via Email</Label>
            </div>

            {isEmail && (
                <div className="space-y-2">
                    <Label htmlFor="email_subject">Email Subject</Label>
                    <Input
                        id="email_subject"
                        name="email_subject"
                        defaultValue={notification?.email_subject || ''}
                        placeholder="Email subject line..."
                    />
                </div>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {notification ? 'Update' : 'Create'} Notification
                </Button>
            </DialogFooter>
        </form>
    );
}

export function NotificationManager({ notifications, templates }: NotificationManagerProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Notification | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);
    const [sendTarget, setSendTarget] = useState<Notification | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSending, setIsSending] = useState(false);

    const draftNotifications = notifications.filter(n => n.status === 'draft');
    const sentNotifications = notifications.filter(n => n.status === 'sent');

    async function handleDelete() {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteNotification(deleteTarget.id);
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    }

    async function handleSend() {
        if (!sendTarget) return;
        setIsSending(true);
        try {
            const result = await sendNotification(sendTarget.id);
            if (result.success) {
                alert(`Notification sent to ${result.recipientsCount} recipients!`);
            } else {
                alert(result.error || 'Failed to send notification');
            }
            router.refresh();
        } catch (error) {
            console.error('Send error:', error);
        } finally {
            setIsSending(false);
            setSendTarget(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{notifications.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Drafts</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{draftNotifications.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sent</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{sentNotifications.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Email Templates</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{templates.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="notifications" className="w-full">
                <div className="flex justify-between items-center mb-4">
                    <TabsList>
                        <TabsTrigger value="notifications">
                            <Bell className="mr-2 h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                        <TabsTrigger value="templates">
                            <Mail className="mr-2 h-4 w-4" />
                            Email Templates
                        </TabsTrigger>
                    </TabsList>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Notification
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Create Notification</DialogTitle>
                                <DialogDescription>
                                    Create a new notification to send to users.
                                </DialogDescription>
                            </DialogHeader>
                            <NotificationForm onClose={() => setIsCreateOpen(false)} />
                        </DialogContent>
                    </Dialog>
                </div>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Notifications</CardTitle>
                            <CardDescription>
                                Manage and send notifications to your users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {notifications.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                    <p>No notifications created yet.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Target</TableHead>
                                            <TableHead>Priority</TableHead>
                                            <TableHead>Recipients</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {notifications.map((n) => (
                                            <TableRow key={n.id}>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {STATUS_ICONS[n.status]}
                                                        <span className="capitalize text-sm">{n.status}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{n.title}</div>
                                                        <div className="text-sm text-slate-500 line-clamp-1">
                                                            {n.message.substring(0, 50)}...
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize">
                                                        <Users className="mr-1 h-3 w-3" />
                                                        {n.target_type}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={PRIORITY_COLORS[n.priority]}>
                                                        {n.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {n.recipients_count || 0}
                                                    {n.read_count ? ` (${n.read_count} read)` : ''}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(n.created_at).toLocaleDateString('th-TH')}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            {n.status === 'draft' && (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => setEditTarget(n)}>
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Edit
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setSendTarget(n)}>
                                                                        <Send className="mr-2 h-4 w-4" />
                                                                        Send Now
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                </>
                                                            )}
                                                            <DropdownMenuItem
                                                                className="text-red-600"
                                                                onClick={() => setDeleteTarget(n)}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="templates">
                    <Card>
                        <CardHeader>
                            <CardTitle>Email Templates</CardTitle>
                            <CardDescription>
                                Pre-defined email templates for common notifications.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {templates.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    <Mail className="mx-auto h-12 w-12 mb-4 opacity-50" />
                                    <p>No email templates yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {templates.map((t) => (
                                        <Card key={t.id} className="border">
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="secondary" className="capitalize">
                                                        {t.category}
                                                    </Badge>
                                                    {t.is_active ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                                            Active
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-slate-50 text-slate-500">
                                                            Inactive
                                                        </Badge>
                                                    )}
                                                </div>
                                                <CardTitle className="text-base">{t.name}</CardTitle>
                                                <CardDescription>{t.subject}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-sm text-slate-600 line-clamp-3">
                                                    {t.body}
                                                </p>
                                                {t.variables && t.variables.length > 0 && (
                                                    <div className="mt-2 flex flex-wrap gap-1">
                                                        {t.variables.map((v: string, i: number) => (
                                                            <Badge key={i} variant="outline" className="text-xs">
                                                                {`{{${v}}}`}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Notification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteTarget?.title}"?
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

            {/* Send Confirmation Dialog */}
            <AlertDialog open={!!sendTarget} onOpenChange={(open) => !open && setSendTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Send Notification</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to send "{sendTarget?.title}" to {sendTarget?.target_type === 'all' ? 'all users' : `${sendTarget?.target_type}s`}?
                            {sendTarget?.is_email && ' This will also send emails to all recipients.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleSend}
                            disabled={isSending}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Send className="mr-2 h-4 w-4" />
                            Send Now
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Notification</DialogTitle>
                        <DialogDescription>
                            Update the notification details.
                        </DialogDescription>
                    </DialogHeader>
                    {editTarget && (
                        <NotificationForm
                            notification={editTarget}
                            onClose={() => setEditTarget(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
