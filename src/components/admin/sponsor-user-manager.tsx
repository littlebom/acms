'use client';

import { useState } from 'react';
import {
    Plus,
    Trash2,
    Search,
    UserPlus,
    Mail,
    X,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRouter } from 'next/navigation';
import { addSponsorUser, removeSponsorUser, type SponsorUser } from '@/app/actions/sponsors';

interface PotentialUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    profile_image: string | null;
}

export function SponsorUserManager({
    sponsorId,
    currentUsers,
    allUsers
}: {
    sponsorId: number,
    currentUsers: SponsorUser[],
    allUsers: PotentialUser[]
}) {
    const [openCombobox, setOpenCombobox] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleAddUser(userId: number) {
        setLoading(true);
        const result = await addSponsorUser(sponsorId, userId);
        setLoading(false);

        if (result.error) {
            alert(result.error);
        } else {
            setOpenCombobox(false);
            setSearchQuery("");
            router.refresh();
        }
    }

    async function handleRemoveUser(userId: number) {
        if (confirm('Are you sure you want to remove this user from this sponsor?')) {
            await removeSponsorUser(sponsorId, userId);
            router.refresh();
        }
    }

    // Filter out users who are already assigned
    const availableUsers = allUsers.filter(user =>
        !currentUsers.some(cu => cu.user_id === user.id)
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
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-slate-700">Linked Users ({currentUsers.length})</h4>

                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add User
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[320px] p-2" align="end">
                        <Input
                            placeholder="Search users..."
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
                                        onClick={() => handleAddUser(user.id)}
                                        className="flex items-center w-full p-2 hover:bg-slate-100 rounded-md transition-colors text-left"
                                        disabled={loading}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentUsers.map((user) => (
                    <Card key={user.user_id} className="relative group">
                        <CardContent className="p-4 flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-slate-100 text-slate-500">
                                    {user.first_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {user.first_name} {user.last_name}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-slate-500">
                                    <Mail className="h-3 w-3" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemoveUser(user.user_id)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {currentUsers.length === 0 && (
                    <div className="col-span-full py-8 border-2 border-dashed rounded-lg text-center text-slate-400 bg-slate-50/50">
                        No users linked to this sponsor yet.
                    </div>
                )}
            </div>
        </div>
    );
}
