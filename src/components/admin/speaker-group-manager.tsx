'use client';

import { useState } from 'react';
import {
    Plus,
    Trash2,
    Loader2,
    ArrowLeft,
    Search,
    UserPlus,
    Check,
    Pencil,
    Mail,
    FileText,
    Camera
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    addGroupMember,
    removeGroupMember,
    updateSpeakerDetails,
    createSpeakerUser,
    type SpeakerGroup,
    type SpeakerGroupMember
} from "@/app/actions/speakers";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ImageCropper } from '@/components/admin/image-cropper';

// Define a local type for potential speakers (users) if not exported
interface PotentialSpeaker {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image: string | null;
}



function CreateSpeakerForm({
    groupId,
    onClose
}: {
    groupId: number,
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('group_id', groupId.toString());

        // If we have a cropped image, use it instead of the original
        if (croppedImageFile) {
            formData.delete('profile_image');
            formData.append('profile_image', croppedImageFile);
        }

        const result = await createSpeakerUser(formData);

        setLoading(false);
        if (result.error) {
            alert(result.error);
        } else {
            onClose();
            router.refresh();
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedImageFile(url);
            setCropperOpen(true); // Open cropper dialog
        }
    };

    const handleCropComplete = async (croppedImageUrl: string) => {
        // Convert base64 to File object
        const blob = await (await fetch(croppedImageUrl)).blob();
        const file = new File([blob], 'new-speaker-profile.jpg', { type: 'image/jpeg' });

        setCroppedImageFile(file);
        setImagePreview(croppedImageUrl);
        setCropperOpen(false);
    };

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
                <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-slate-200">
                        <AvatarImage src={imagePreview || undefined} />
                        <AvatarFallback className="text-2xl bg-slate-100 text-slate-400">
                            <UserPlus className="h-8 w-8" />
                        </AvatarFallback>
                    </Avatar>
                    <label
                        htmlFor="new_profile_image"
                        className="absolute bottom-0 right-0 bg-white border rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-slate-50"
                    >
                        <Camera className="h-4 w-4 text-slate-600" />
                        <input
                            type="file"
                            id="new_profile_image"
                            name="profile_image"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="new_title">Title / Prefix</Label>
                <select
                    id="new_title"
                    name="title"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <option value="">None</option>
                    <option value="Prof. Dr.">Prof. Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Assoc. Prof. Dr.">Assoc. Prof. Dr.</option>
                    <option value="Assoc. Prof.">Assoc. Prof.</option>
                    <option value="Asst. Prof. Dr.">Asst. Prof. Dr.</option>
                    <option value="Asst. Prof.">Asst. Prof.</option>
                    <option value="Dr.">Dr.</option>
                    <option value="Mr.">Mr.</option>
                    <option value="Ms.">Ms.</option>
                    <option value="Mrs.">Mrs.</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="new_first_name">First Name</Label>
                    <Input id="new_first_name" name="first_name" required placeholder="John" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new_last_name">Last Name</Label>
                    <Input id="new_last_name" name="last_name" required placeholder="Doe" />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="new_email">Email</Label>
                <Input id="new_email" name="email" type="email" required placeholder="john@example.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="new_organization">Organization / Institution</Label>
                    <Input
                        id="new_organization"
                        name="organization"
                        placeholder="e.g., Mahidol University"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="new_country">Country</Label>
                    <Input
                        id="new_country"
                        name="country"
                        placeholder="e.g., Thailand"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="new_password">Password (Optional)</Label>
                <Input id="new_password" name="password" type="password" placeholder="Leave empty for default: Speaker123!" />
            </div>

            <div className="space-y-2">
                <Label htmlFor="new_bio">Bio</Label>
                <Textarea
                    id="new_bio"
                    name="bio"
                    placeholder="Short biography..."
                    rows={3}
                />
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create & Add Speaker
                </Button>
            </DialogFooter>

            {/* Image Cropper Dialog */}
            {selectedImageFile && (
                <ImageCropper
                    imageUrl={selectedImageFile}
                    open={cropperOpen}
                    onClose={() => setCropperOpen(false)}
                    onCropComplete={handleCropComplete}
                    aspectRatio={3 / 4}
                />
            )}
        </form>
    );
}

export function SpeakerGroupManager({
    group,
    members,
    allUsers
}: {
    group: SpeakerGroup,
    members: SpeakerGroupMember[],
    allUsers: PotentialSpeaker[]
}) {
    const [loading, setLoading] = useState(false);
    const [openCombobox, setOpenCombobox] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    async function handleAddMember(userId: number) {
        setLoading(true);
        const result = await addGroupMember(group.id, userId);
        setLoading(false);

        if (result.error) {
            alert(result.error);
        } else {
            setOpenCombobox(false);
            setSearchQuery(""); // Reset search
            router.refresh();
        }
    }

    async function handleRemoveMember(userId: number) {
        if (confirm('Remove this speaker from the group?')) {
            await removeGroupMember(group.id, userId);
            router.refresh();
        }
    }

    // Filter out users who are already members
    const availableUsers = allUsers.filter(user =>
        !members.some(member => member.user_id === user.id)
    );

    // Filter based on search query
    const filteredUsers = availableUsers.filter(user => {
        const query = searchQuery.toLowerCase();
        return (
            user.first_name.toLowerCase().includes(query) ||
            user.last_name.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query)
        );
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/speakers">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold">{group.name}</h2>
                    <p className="text-slate-500">{group.description}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Members ({members.length})</h3>

                <div className="flex gap-2">
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Create New Speaker</span>
                                <span className="sm:hidden">New</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Create New Speaker</DialogTitle>
                                <DialogDescription>
                                    Create a new user account and add them as a speaker.
                                </DialogDescription>
                            </DialogHeader>
                            <CreateSpeakerForm
                                groupId={group.id}
                                onClose={() => setIsCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>

                    <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                        <PopoverTrigger asChild>
                            <Button>
                                <UserPlus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">Add Existing User</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[320px] p-2" align="end">
                            <Input
                                placeholder="Search users by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="mb-2"
                                autoFocus
                            />
                            <div className="max-h-[300px] overflow-y-auto space-y-1">
                                {filteredUsers.length === 0 ? (
                                    <div className="text-sm text-center text-slate-500 py-4">
                                        No users found.
                                    </div>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <button
                                            key={user.id}
                                            onClick={() => handleAddMember(user.id)}
                                            className="flex items-center w-full p-2 hover:bg-slate-100 rounded-md transition-colors text-left"
                                        >
                                            <Avatar className="h-8 w-8 mr-3 flex-shrink-0">
                                                <AvatarImage src={user.profile_image || undefined} />
                                                <AvatarFallback className="bg-slate-200 text-slate-600">
                                                    {user.first_name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                                <div className="text-sm font-medium text-slate-900 truncate">
                                                    {user.first_name} {user.last_name}
                                                </div>
                                                <div className="text-xs text-slate-500 truncate">
                                                    {user.email}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {members.map(member => (
                    <Card key={member.user_id} className="relative group overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2 text-center relative">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm"
                                    onClick={() => router.push(`/admin/speakers/${group.id}/speaker/${member.user_id}/edit`)}
                                >
                                    <Pencil className="h-4 w-4 text-slate-600" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 shadow-sm"
                                    onClick={() => handleRemoveMember(member.user_id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="mx-auto mb-2">
                                <Avatar className="h-20 w-20 border-2 border-white shadow-sm">
                                    <AvatarImage src={member.profile_image || undefined} className="object-cover object-top" />
                                    <AvatarFallback className="text-xl bg-slate-100 text-slate-500">
                                        {member.first_name[0]}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <h3 className="font-semibold text-lg truncate px-2">
                                {(member as any).title && (member as any).title !== '' && (
                                    <span className="text-slate-600">{(member as any).title} </span>
                                )}
                                {member.first_name} {member.last_name}
                            </h3>
                            <div className="flex items-center justify-center gap-1 text-sm text-slate-500">
                                <Mail className="h-3 w-3" />
                                <span className="truncate max-w-[180px]">{member.email}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="text-center pt-0 pb-4">
                            {member.bio ? (
                                <p className="text-sm text-slate-600 line-clamp-3 px-2">
                                    {member.bio}
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400 italic">No biography added.</p>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {members.length === 0 && (
                    <div className="col-span-full text-center py-16 border-2 border-dashed rounded-lg text-slate-500 bg-slate-50/50">
                        <UserPlus className="mx-auto h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-slate-900">No speakers yet</h3>
                        <p className="mb-4">Add members to this group to get started.</p>
                    </div>
                )}
            </div>


        </div>
    );
}
