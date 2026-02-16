'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2, Shield, UserCog, Search, Filter, Pencil, Camera, Loader2, Eye, Mail, Calendar, ExternalLink, LayoutDashboard, Plus } from "lucide-react";
import { deleteUser, updateUserRole, updateUserDetails, createUser, type User } from "@/app/actions/users";
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ImageCropper } from '@/components/admin/image-cropper';

const TITLES = ["Mr.", "Ms.", "Mrs.", "Dr.", "Asst. Prof.", "Assoc. Prof.", "Prof.", "Asst. Prof. Dr.", "Assoc. Prof. Dr.", "Prof. Dr.", "Other"];
const EDUCATION_LEVELS = ["High School", "Bachelor's Degree", "Master's Degree", "Doctorate", "Other"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

function EditUserForm({ user, onClose }: { user: User, onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(user.profile_image);
    const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('user_id', user.id.toString());

        // If we have a cropped image, use it instead of the original
        if (croppedImageFile) {
            formData.delete('profile_image');
            formData.append('profile_image', croppedImageFile);
        }

        await updateUserDetails(formData);

        setLoading(false);
        onClose();
        router.refresh();
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
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });

        setCroppedImageFile(file);
        setImagePreview(croppedImageUrl);
        setCropperOpen(false);
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            <div className="flex justify-center mb-6">
                <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-slate-200">
                        <AvatarImage src={imagePreview || undefined} className="object-cover object-top" />
                        <AvatarFallback className="text-2xl">{user.first_name[0]}</AvatarFallback>
                    </Avatar>
                    <label
                        htmlFor="edit_user_image"
                        className="absolute bottom-0 right-0 bg-white border rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-slate-50"
                    >
                        <Camera className="h-4 w-4 text-slate-600" />
                        <input
                            type="file"
                            id="edit_user_image"
                            name="profile_image"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase border-b pb-2">Personal Information</h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Select name="title" defaultValue={user.title || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" name="first_name" defaultValue={user.first_name} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" name="last_name" defaultValue={user.last_name} required />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select name="gender" defaultValue={user.gender || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birth_year">Birth Year</Label>
                        <Input id="birth_year" name="birth_year" type="number" defaultValue={user.birth_year || ''} placeholder="YYYY" />
                    </div>
                </div>
            </div>

            {/* Account Info */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase border-b pb-2">Account Information</h4>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" defaultValue={user.email} required />
                </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase border-b pb-2">Contact Details</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input id="phone_number" name="phone_number" defaultValue={user.phone_number || ''} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" name="country" defaultValue={user.country || ''} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" name="address" defaultValue={user.address || ''} rows={3} />
                </div>
            </div>

            {/* Professional Info */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase border-b pb-2">Professional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="education_level">Education Level</Label>
                        <Select name="education_level" defaultValue={user.education_level || undefined}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {EDUCATION_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input id="occupation" name="occupation" defaultValue={user.occupation || ''} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="institution">Institution / Workplace</Label>
                    <Input id="institution" name="institution" defaultValue={user.institution || ''} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                        id="bio"
                        name="bio"
                        defaultValue={user.bio || ''}
                        placeholder="Short biography..."
                        rows={3}
                    />
                </div>
            </div>

            <DialogFooter className="pt-4 sticky bottom-0 bg-white pb-2 border-t mt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
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

function UserProfilePreview({ user }: { user: User }) {
    return (
        <div className="flex flex-col items-center text-center space-y-4 py-4">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={user.profile_image || undefined} className="object-cover object-top" />
                <AvatarFallback className="text-4xl bg-slate-100 text-slate-500">
                    {user.first_name[0]}
                </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-slate-900">{user.first_name} {user.last_name}</h2>
                <Badge variant="secondary" className="uppercase tracking-wider text-[10px]">
                    {user.role}
                </Badge>
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-sm bg-slate-50 px-3 py-1 rounded-full">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
            </div>

            {user.bio && (
                <div className="w-full bg-slate-50 p-4 rounded-lg text-left mt-4">
                    <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Biography</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">
                        {user.bio}
                    </p>
                </div>
            )}

            <div className="w-full flex justify-between items-center text-xs text-slate-400 pt-4 border-t mt-2">
                <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {format(new Date(user.created_at), 'MMMM d, yyyy')}
                </div>
                <div className="flex gap-2">
                    <Link href={`/dashboard/profile/${user.id}`} target="_blank">
                        <Button variant="outline" size="sm" className="h-auto py-1 px-2 text-blue-600 border-blue-200 hover:bg-blue-50">
                            View Full Profile <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

function AddUserForm({ onClose }: { onClose: () => void }) {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImageFile, setSelectedImageFile] = useState<string | null>(null);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [croppedImageFile, setCroppedImageFile] = useState<File | null>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);

        if (croppedImageFile) {
            formData.set('profile_image', croppedImageFile);
        }

        const result = await createUser(formData);

        if (result.error) {
            alert(result.error);
            setLoading(false);
            return;
        }

        setLoading(false);
        onClose();
        router.refresh();
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedImageFile(url);
            setCropperOpen(true);
        }
    };

    const handleCropComplete = async (croppedImageUrl: string) => {
        const blob = await (await fetch(croppedImageUrl)).blob();
        const file = new File([blob], 'profile.jpg', { type: 'image/jpeg' });
        setCroppedImageFile(file);
        setImagePreview(croppedImageUrl);
        setCropperOpen(false);
    };

    return (
        <form action={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            <div className="flex justify-center mb-6">
                <div className="relative group">
                    <Avatar className="h-24 w-24 border-2 border-slate-200">
                        <AvatarImage src={imagePreview || undefined} className="object-cover object-top" />
                        <AvatarFallback className="text-2xl"><UserCog className="h-8 w-8" /></AvatarFallback>
                    </Avatar>
                    <label
                        htmlFor="add_user_image"
                        className="absolute bottom-0 right-0 bg-white border rounded-full p-1.5 shadow-sm cursor-pointer hover:bg-slate-50"
                    >
                        <Camera className="h-4 w-4 text-slate-600" />
                        <input
                            type="file"
                            id="add_user_image"
                            name="profile_image"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase border-b pb-2">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1 space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Select name="title">
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {TITLES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-3 grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" name="first_name" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input id="last_name" name="last_name" required />
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select name="gender">
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="birth_year">Birth Year</Label>
                        <Input id="birth_year" name="birth_year" type="number" placeholder="YYYY" />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase border-b pb-2">Account Information</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" name="password" type="password" placeholder="Default: User123!" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue="attendee" required>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="chair">Chair</SelectItem>
                            <SelectItem value="reviewer">Reviewer</SelectItem>
                            <SelectItem value="author">Author</SelectItem>
                            <SelectItem value="speaker">Speaker</SelectItem>
                            <SelectItem value="attendee">Attendee</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-sm font-medium text-slate-500 uppercase border-b pb-2">Professional Information</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="education_level">Education Level</Label>
                        <Select name="education_level">
                            <SelectTrigger>
                                <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                                {EDUCATION_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input id="occupation" name="occupation" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="institution">Institution / Workplace</Label>
                    <Input id="institution" name="institution" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" name="country" />
                </div>
            </div>

            <DialogFooter className="pt-4 sticky bottom-0 bg-white pb-2 border-t mt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create User
                </Button>
            </DialogFooter>

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

export function UserList({ users }: { users: User[] }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [previewUser, setPreviewUser] = useState<User | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    async function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            await deleteUser(id);
            router.refresh();
        }
    }

    async function handleRoleChange(id: number, newRole: string) {
        await updateUserRole(id, newRole);
        router.refresh();
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800 hover:bg-red-200';
            case 'chair': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
            case 'reviewer': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'author': return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'speaker': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
            default: return 'bg-slate-100 text-slate-800 hover:bg-slate-200';
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = selectedRole === 'all' || user.role === selectedRole;

        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
                <div className="relative w-full sm:w-[300px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-500" />
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                            <SelectTrigger className="w-full sm:w-[150px]">
                                <SelectValue placeholder="Filter by Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="chair">Chair</SelectItem>
                                <SelectItem value="reviewer">Reviewer</SelectItem>
                                <SelectItem value="author">Author</SelectItem>
                                <SelectItem value="speaker">Speaker</SelectItem>
                                <SelectItem value="attendee">Attendee</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={() => setIsAddDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" />
                        Add User
                    </Button>
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-md border bg-white overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <Avatar>
                                        <AvatarImage src={user.profile_image || undefined} className="object-cover object-top" />
                                        <AvatarFallback>{user.first_name[0]}</AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge className={getRoleBadgeColor(user.role)} variant="secondary">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {format(new Date(user.created_at), 'MMM d, yyyy')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-slate-500 hover:text-blue-600"
                                            onClick={() => setPreviewUser(user)}
                                            title="Preview Profile"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => setPreviewUser(user)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Preview Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/dashboard/profile/${user.id}`} target="_blank" className="cursor-pointer w-full">
                                                        <LayoutDashboard className="mr-2 h-4 w-4" />
                                                        View Full Profile
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                                {['admin', 'chair', 'reviewer', 'author', 'speaker', 'attendee'].map((role) => (
                                                    <DropdownMenuItem
                                                        key={role}
                                                        onClick={() => handleRoleChange(user.id, role)}
                                                        disabled={user.role === role}
                                                    >
                                                        <UserCog className="mr-2 h-4 w-4" />
                                                        Make {role.charAt(0).toUpperCase() + role.slice(1)}
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user.id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete User
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                                    No users found matching your criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-xs text-slate-500 text-right">
                Showing {filteredUsers.length} of {users.length} users
            </div>

            {/* Edit User Dialog */}
            <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Edit User Details</DialogTitle>
                        <DialogDescription>
                            Update profile information for this user.
                        </DialogDescription>
                    </DialogHeader>
                    {editingUser && (
                        <EditUserForm
                            user={editingUser}
                            onClose={() => setEditingUser(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Preview User Dialog */}
            <Dialog open={!!previewUser} onOpenChange={(open) => !open && setPreviewUser(null)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>User Profile</DialogTitle>
                    </DialogHeader>
                    {previewUser && (
                        <UserProfilePreview user={previewUser} />
                    )}
                </DialogContent>
            </Dialog>

            {/* Add User Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Add New User</DialogTitle>
                        <DialogDescription>
                            Manually create a new user account with specific details and roles.
                        </DialogDescription>
                    </DialogHeader>
                    <AddUserForm onClose={() => setIsAddDialogOpen(false)} />
                </DialogContent>
            </Dialog>
        </div>
    );
}
