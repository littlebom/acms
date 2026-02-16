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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import { createPaperTrack, updatePaperTrack, deletePaperTrack } from "@/app/actions/paper-tracks";
import type { PaperTrack } from "@/app/actions/paper-tracks";

interface TracksTableProps {
    tracks: PaperTrack[];
}

export function TracksTable({ tracks }: TracksTableProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingTrack, setEditingTrack] = useState<PaperTrack | null>(null);

    const handleCreate = async (formData: FormData) => {
        setLoading(true);
        await createPaperTrack(formData);
        setLoading(false);
        setDialogOpen(false);
        router.refresh();
    };

    const handleUpdate = async (formData: FormData) => {
        setLoading(true);
        await updatePaperTrack(formData);
        setLoading(false);
        setEditingTrack(null);
        router.refresh();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this track?')) return;

        setLoading(true);
        const result = await deletePaperTrack(id);
        setLoading(false);

        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b">
                <CardTitle>All Tracks</CardTitle>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button size="sm">
                            <Plus className="h-4 w-4 mr-1" />
                            Add Track
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form action={handleCreate}>
                            <DialogHeader>
                                <DialogTitle>Add New Track</DialogTitle>
                                <DialogDescription>
                                    Create a new paper category/track
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name (English) *</Label>
                                    <Input id="name" name="name" required placeholder="e.g., Artificial Intelligence" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name_th">Name (Thai)</Label>
                                    <Input id="name_th" name="name_th" placeholder="เช่น ปัญญาประดิษฐ์" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea id="description" name="description" placeholder="Brief description of this track" rows={3} />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                                    Create Track
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="w-[60px]">ID</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Thai Name</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tracks.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No tracks found. Create your first track.
                                </TableCell>
                            </TableRow>
                        ) : (
                            tracks.map((track) => (
                                <TableRow key={track.id}>
                                    <TableCell className="font-mono text-sm text-slate-500">
                                        {track.id}
                                    </TableCell>
                                    <TableCell className="font-medium">{track.name}</TableCell>
                                    <TableCell className="text-slate-600">{track.name_th || '-'}</TableCell>
                                    <TableCell className="text-sm text-slate-500 max-w-[200px] truncate">
                                        {track.description || '-'}
                                    </TableCell>
                                    <TableCell>
                                        {track.is_active ? (
                                            <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                                        ) : (
                                            <Badge variant="secondary">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setEditingTrack(track)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => handleDelete(track.id)}
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
            <Dialog open={!!editingTrack} onOpenChange={(open) => !open && setEditingTrack(null)}>
                <DialogContent>
                    {editingTrack && (
                        <form action={handleUpdate}>
                            <input type="hidden" name="id" value={editingTrack.id} />
                            <DialogHeader>
                                <DialogTitle>Edit Track</DialogTitle>
                                <DialogDescription>
                                    Update track information
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit_name">Name (English) *</Label>
                                    <Input
                                        id="edit_name"
                                        name="name"
                                        required
                                        defaultValue={editingTrack.name}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_name_th">Name (Thai)</Label>
                                    <Input
                                        id="edit_name_th"
                                        name="name_th"
                                        defaultValue={editingTrack.name_th || ''}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="edit_description">Description</Label>
                                    <Textarea
                                        id="edit_description"
                                        name="description"
                                        rows={3}
                                        defaultValue={editingTrack.description || ''}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="edit_is_active"
                                        name="is_active"
                                        defaultChecked={editingTrack.is_active}
                                        value="true"
                                    />
                                    <Label htmlFor="edit_is_active">Active</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setEditingTrack(null)}>
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
