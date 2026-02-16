'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Loader2, CheckCircle2, Clock, Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { createReviewer, updateReviewer, deleteReviewer } from "@/app/actions/paper-reviews";
import type { Reviewer } from "@/app/actions/paper-reviews";
import type { PaperTrack } from "@/app/actions/paper-tracks";
import { cn } from "@/lib/utils";

interface ReviewersTableProps {
    reviewers: Reviewer[];
    availableUsers: { id: number; first_name: string; last_name: string; email: string }[];
    tracks: PaperTrack[];
}

export function ReviewersTable({ reviewers, availableUsers, tracks }: ReviewersTableProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingReviewer, setEditingReviewer] = useState<Reviewer | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [selectedTrackId, setSelectedTrackId] = useState<string>('');

    // Combobox states
    const [openCombobox, setOpenCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const handleCreate = async (formData: FormData) => {
        if (!selectedUserId) return;
        formData.set('user_id', selectedUserId);
        if (selectedTrackId && selectedTrackId !== "0") {
            formData.set('track_id', selectedTrackId);
        }

        setLoading(true);
        const result = await createReviewer(formData);
        setLoading(false);

        if (result.error) {
            alert(result.error);
        } else {
            setDialogOpen(false);
            setSelectedUserId('');
            setSelectedTrackId('');
            setSearchQuery("");
            router.refresh();
        }
    };

    const handleUpdate = async (formData: FormData) => {
        setLoading(true);
        await updateReviewer(formData);
        setLoading(false);
        setEditingReviewer(null);
        router.refresh();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this reviewer? This action cannot be undone.')) return;

        setLoading(true);
        const result = await deleteReviewer(id);
        setLoading(false);

        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
    };

    // Filter users based on search
    const filteredUsers = availableUsers.filter((user) => {
        const query = searchQuery.toLowerCase();
        return (
            user.first_name.toLowerCase().includes(query) ||
            user.last_name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    });

    // Find selected user name for display
    const selectedUser = availableUsers.find(u => u.id.toString() === selectedUserId);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b">
                <div>
                    <CardTitle>All Reviewers</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">
                        {reviewers.length} reviewer(s) registered
                    </p>
                </div>
                {availableUsers.length > 0 && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Reviewer
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form action={handleCreate}>
                                <DialogHeader>
                                    <DialogTitle>Add New Reviewer</DialogTitle>
                                    <DialogDescription>
                                        Register a user as a paper reviewer
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2 flex flex-col">
                                        <Label>Select User *</Label>
                                        <Popover open={openCombobox} onOpenChange={setOpenCombobox} modal={true}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    aria-expanded={openCombobox}
                                                    className="justify-between font-normal text-left"
                                                >
                                                    {selectedUser
                                                        ? `${selectedUser.first_name} ${selectedUser.last_name} (${selectedUser.email})`
                                                        : "Select user..."}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 ml-auto" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-2" align="start">
                                                <Input
                                                    placeholder="Search user..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="mb-2"
                                                    autoFocus
                                                />
                                                <div className="max-h-[300px] overflow-y-auto space-y-1">
                                                    {filteredUsers.length === 0 ? (
                                                        <div className="text-sm text-center text-slate-500 py-4">
                                                            No user found.
                                                        </div>
                                                    ) : (
                                                        filteredUsers.slice(0, 50).map((user) => (
                                                            <button
                                                                key={user.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedUserId(user.id.toString());
                                                                    setOpenCombobox(false);
                                                                }}
                                                                className={cn(
                                                                    "flex items-center w-full p-2 hover:bg-slate-100 rounded-md transition-colors text-left",
                                                                    selectedUserId === user.id.toString() && "bg-slate-100"
                                                                )}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        selectedUserId === user.id.toString() ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                <div className="flex flex-col min-w-0">
                                                                    <span className="font-medium truncate">{user.first_name} {user.last_name}</span>
                                                                    <span className="text-xs text-slate-500 truncate">{user.email}</span>
                                                                </div>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Track (Optional)</Label>
                                        <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="No specific track" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="0">No specific track</SelectItem>
                                                {tracks.map(track => (
                                                    <SelectItem key={track.id} value={track.id.toString()}>
                                                        {track.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expertise">Expertise</Label>
                                        <Textarea
                                            id="expertise"
                                            name="expertise"
                                            placeholder="e.g., Machine Learning, Natural Language Processing"
                                            rows={2}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="affiliation">Affiliation</Label>
                                        <Input
                                            id="affiliation"
                                            name="affiliation"
                                            placeholder="University or Organization"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            name="bio"
                                            placeholder="Brief biography"
                                            rows={3}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading || !selectedUserId}>
                                        {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                                        Add Reviewer
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead>Reviewer</TableHead>
                            <TableHead>Track</TableHead>
                            <TableHead>Expertise</TableHead>
                            <TableHead>Affiliation</TableHead>
                            <TableHead className="text-center">Assignments</TableHead>
                            <TableHead className="text-center">Completed</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviewers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                                    No reviewers found. Add your first reviewer.
                                </TableCell>
                            </TableRow>
                        ) : (
                            reviewers.map((reviewer) => (
                                <TableRow key={reviewer.id}>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium">
                                                {reviewer.first_name} {reviewer.last_name}
                                            </p>
                                            <p className="text-sm text-slate-500">{reviewer.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {reviewer.track_name ? (
                                            <Badge variant="secondary" className="font-normal">
                                                {reviewer.track_name}
                                            </Badge>
                                        ) : (
                                            <span className="text-xs text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="max-w-[200px]">
                                        <p className="text-sm text-slate-600 line-clamp-2">
                                            {reviewer.expertise || '-'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="text-sm text-slate-600">
                                        {reviewer.affiliation || '-'}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="outline">
                                            {reviewer.total_assignments}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Badge className="bg-emerald-100 text-emerald-700">
                                            {reviewer.completed_reviews}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {reviewer.is_active ? (
                                            <Badge className="bg-emerald-100 text-emerald-700">
                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                Active
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                Inactive
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingReviewer(reviewer)}
                                            >
                                                <Edit2 className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleDelete(reviewer.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            {/* Edit Dialog */}
            <Dialog open={!!editingReviewer} onOpenChange={(open) => !open && setEditingReviewer(null)}>
                <DialogContent>
                    {editingReviewer && (
                        <form action={handleUpdate}>
                            <input type="hidden" name="id" value={editingReviewer.id} />
                            <DialogHeader>
                                <DialogTitle>Edit Reviewer</DialogTitle>
                                <DialogDescription>
                                    {editingReviewer.first_name} {editingReviewer.last_name}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Track</Label>
                                    <Select name="track_id" defaultValue={editingReviewer.track_id?.toString() || ""}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="No specific track" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="0">No specific track</SelectItem>
                                            {tracks.map(track => (
                                                <SelectItem key={track.id} value={track.id.toString()}>
                                                    {track.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_expertise">Expertise</Label>
                                    <Textarea
                                        id="edit_expertise"
                                        name="expertise"
                                        rows={2}
                                        defaultValue={editingReviewer.expertise || ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_affiliation">Affiliation</Label>
                                    <Input
                                        id="edit_affiliation"
                                        name="affiliation"
                                        defaultValue={editingReviewer.affiliation || ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_bio">Bio</Label>
                                    <Textarea
                                        id="edit_bio"
                                        name="bio"
                                        rows={3}
                                        defaultValue={editingReviewer.bio || ''}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="edit_is_active"
                                        name="is_active"
                                        defaultChecked={editingReviewer.is_active}
                                        value="true"
                                    />
                                    <Label htmlFor="edit_is_active">Active</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingReviewer(null)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                                    Save Changes
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>
        </Card>
    );
}
