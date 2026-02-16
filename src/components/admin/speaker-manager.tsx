'use client';

import { useState } from 'react';
import {
    User,
    Mail,
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Loader2,
    Image as ImageIcon
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createSpeaker, updateSpeaker, deleteSpeaker, type Speaker } from "@/app/actions/speakers";

function SpeakerForm({
    speaker,
    onClose
}: {
    speaker?: Speaker | null,
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            if (speaker) {
                formData.append('id', speaker.id.toString());
                await updateSpeaker(formData);
            } else {
                await createSpeaker(formData);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                        id="first_name"
                        name="first_name"
                        defaultValue={speaker?.first_name}
                        required
                        placeholder="John"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                        id="last_name"
                        name="last_name"
                        defaultValue={speaker?.last_name}
                        required
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={speaker?.email}
                    required
                    placeholder="john@example.com"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="profile_image">Profile Image URL</Label>
                <Input
                    id="profile_image"
                    name="profile_image"
                    defaultValue={speaker?.profile_image || ''}
                    placeholder="https://..."
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                    id="bio"
                    name="bio"
                    defaultValue={speaker?.bio || ''}
                    placeholder="Short bio..."
                    rows={4}
                />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {speaker ? 'Update Speaker' : 'Add Speaker'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function SpeakerManager({ speakers }: { speakers: Speaker[] }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);

    async function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this speaker?')) {
            const result = await deleteSpeaker(id);
            if (result.error) {
                alert(result.error);
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">All Speakers ({speakers.length})</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Speaker
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Add New Speaker</DialogTitle>
                            <DialogDescription>
                                Add a new speaker to the database.
                            </DialogDescription>
                        </DialogHeader>
                        <SpeakerForm onClose={() => setIsCreateOpen(false)} />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {speakers.map(speaker => (
                    <div key={speaker.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={speaker.profile_image || ''} />
                                <AvatarFallback className="text-lg">
                                    {speaker.first_name[0]}{speaker.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="-mr-2">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setEditingSpeaker(speaker)}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(speaker.id)}>
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg">{speaker.first_name} {speaker.last_name}</h3>
                            <div className="flex items-center text-sm text-slate-500 mt-1">
                                <Mail className="h-3 w-3 mr-1" />
                                {speaker.email}
                            </div>
                            {speaker.bio && (
                                <p className="text-sm text-slate-600 mt-3 line-clamp-3">
                                    {speaker.bio}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingSpeaker} onOpenChange={(open) => !open && setEditingSpeaker(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Speaker</DialogTitle>
                    </DialogHeader>
                    {editingSpeaker && (
                        <SpeakerForm
                            speaker={editingSpeaker}
                            onClose={() => setEditingSpeaker(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
