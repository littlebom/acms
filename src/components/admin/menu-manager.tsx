'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    MoreVertical,
    Trash2,
    Loader2,
    Menu,
    Pencil,
    GripVertical,
    ExternalLink,
    Globe,
    ChevronDown,
    ChevronRight
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
    type MenuItem
} from "@/app/actions/website";

interface MenuManagerProps {
    menuItems: MenuItem[];
}

function MenuItemForm({
    menuItem,
    location,
    onClose
}: {
    menuItem?: MenuItem | null,
    location: string,
    onClose: () => void
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            if (menuItem) {
                await updateMenuItem(menuItem.id, formData);
            } else {
                formData.append('menu_location', location);
                await createMenuItem(formData);
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
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title_en">Title (English) *</Label>
                    <Input
                        id="title_en"
                        name="title_en"
                        required
                        defaultValue={menuItem?.title_en || ''}
                        placeholder="Home"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="title_th">Title (ภาษาไทย)</Label>
                    <Input
                        id="title_th"
                        name="title_th"
                        defaultValue={menuItem?.title_th || ''}
                        placeholder="หน้าแรก"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                    id="url"
                    name="url"
                    required
                    defaultValue={menuItem?.url || ''}
                    placeholder="/about or https://..."
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="target">Open in</Label>
                    <Select name="target" defaultValue={menuItem?.target || '_self'}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="_self">Same Window</SelectItem>
                            <SelectItem value="_blank">New Tab</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="display_order">Order</Label>
                    <Input
                        id="display_order"
                        name="display_order"
                        type="number"
                        defaultValue={menuItem?.display_order || 0}
                        min={0}
                    />
                </div>
            </div>

            {menuItem && (
                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_active"
                        name="is_active"
                        defaultChecked={menuItem?.is_active !== false}
                    />
                    <Label htmlFor="is_active">Active</Label>
                </div>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {menuItem ? 'Update' : 'Add'} Menu Item
                </Button>
            </DialogFooter>
        </form>
    );
}

function MenuItemCard({
    item,
    onEdit,
    onDelete
}: {
    item: MenuItem;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className={`flex items-center gap-3 p-3 border rounded-lg bg-white hover:shadow-sm transition-shadow ${!item.is_active ? 'opacity-50' : ''}`}>
            <div className="cursor-move text-slate-400">
                <GripVertical className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{item.title_en}</span>
                    {item.title_th && (
                        <span className="text-sm text-slate-500 truncate">({item.title_th})</span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <code className="text-xs bg-slate-100 px-2 py-0.5 rounded truncate max-w-[200px]">
                        {item.url}
                    </code>
                    {item.target === '_blank' && (
                        <ExternalLink className="h-3 w-3 text-slate-400" />
                    )}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Badge variant={item.is_active ? 'default' : 'secondary'} className="text-xs">
                    {item.is_active ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                    #{item.display_order}
                </Badge>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={onEdit}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}

export function MenuManager({ menuItems }: MenuManagerProps) {
    const router = useRouter();
    const [activeLocation, setActiveLocation] = useState<'header' | 'footer'>('header');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<MenuItem | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const headerItems = menuItems.filter(item => item.menu_location === 'header').sort((a, b) => a.display_order - b.display_order);
    const footerItems = menuItems.filter(item => item.menu_location === 'footer').sort((a, b) => a.display_order - b.display_order);

    async function handleDelete() {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteMenuItem(deleteTarget.id);
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    }

    const currentItems = activeLocation === 'header' ? headerItems : footerItems;

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Header Menu</CardTitle>
                        <Menu className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{headerItems.length}</div>
                        <p className="text-sm text-muted-foreground">
                            {headerItems.filter(i => i.is_active).length} active
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Footer Menu</CardTitle>
                        <Globe className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{footerItems.length}</div>
                        <p className="text-sm text-muted-foreground">
                            {footerItems.filter(i => i.is_active).length} active
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Menu Tabs */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Menu Items</CardTitle>
                            <CardDescription>
                                Drag and drop to reorder menu items
                            </CardDescription>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Menu Item
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Add Menu Item</DialogTitle>
                                    <DialogDescription>
                                        Add a new item to the {activeLocation} menu.
                                    </DialogDescription>
                                </DialogHeader>
                                <MenuItemForm
                                    location={activeLocation}
                                    onClose={() => setIsCreateOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeLocation} onValueChange={(v) => setActiveLocation(v as 'header' | 'footer')}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="header">
                                <Menu className="mr-2 h-4 w-4" />
                                Header Menu
                            </TabsTrigger>
                            <TabsTrigger value="footer">
                                <Globe className="mr-2 h-4 w-4" />
                                Footer Menu
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value={activeLocation}>
                            {currentItems.length === 0 ? (
                                <div className="text-center py-12 border rounded-lg bg-slate-50">
                                    <Menu className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-900">No menu items</h3>
                                    <p className="text-slate-500 mt-2">
                                        Add items to your {activeLocation} menu.
                                    </p>
                                    <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add First Item
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {currentItems.map((item) => (
                                        <MenuItemCard
                                            key={item.id}
                                            item={item}
                                            onEdit={() => setEditTarget(item)}
                                            onDelete={() => setDeleteTarget(item)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Preview */}
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>How the menu will appear on the website</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg p-4 bg-slate-800 text-white">
                        <div className="flex items-center justify-between">
                            <div className="font-bold text-lg">ACMS</div>
                            <nav className="flex items-center gap-6">
                                {headerItems.filter(i => i.is_active).map((item) => (
                                    <a
                                        key={item.id}
                                        href={item.url}
                                        className="hover:text-blue-300 transition-colors text-sm"
                                        target={item.target}
                                    >
                                        {item.title_en}
                                    </a>
                                ))}
                            </nav>
                        </div>
                    </div>
                    <div className="border rounded-lg p-4 bg-slate-100 mt-4">
                        <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
                            {footerItems.filter(i => i.is_active).map((item, idx) => (
                                <span key={item.id}>
                                    <a href={item.url} className="hover:underline">
                                        {item.title_en}
                                    </a>
                                    {idx < footerItems.filter(i => i.is_active).length - 1 && (
                                        <span className="ml-6 text-slate-300">|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Menu Item</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteTarget?.title_en}"?
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

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Menu Item</DialogTitle>
                        <DialogDescription>
                            Update the menu item details.
                        </DialogDescription>
                    </DialogHeader>
                    {editTarget && (
                        <MenuItemForm
                            menuItem={editTarget}
                            location={editTarget.menu_location}
                            onClose={() => setEditTarget(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
