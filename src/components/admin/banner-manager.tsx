'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Plus,
    MoreVertical,
    Trash2,
    Loader2,
    Image as ImageIcon,
    Pencil,
    Eye,
    EyeOff,
    GripVertical,
    ExternalLink,
    ChevronLeft,
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    createBanner,
    updateBanner,
    deleteBanner,
    type Banner
} from "@/app/actions/website";

interface BannerManagerProps {
    banners: Banner[];
}

function BannerForm({
    banner,
    onClose
}: {
    banner?: Banner | null,
    onClose: () => void
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(banner?.image_url || '');

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            if (banner) {
                await updateBanner(banner.id, formData);
            } else {
                await createBanner(formData);
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
        <form action={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Image URL */}
            <div className="space-y-2">
                <Label htmlFor="image_url">Banner Image URL *</Label>
                <Input
                    id="image_url"
                    name="image_url"
                    required
                    defaultValue={banner?.image_url || ''}
                    placeholder="https://example.com/banner.jpg"
                    onChange={(e) => setImagePreview(e.target.value)}
                />
                {imagePreview && (
                    <div className="mt-2 relative aspect-[21/9] rounded-lg overflow-hidden bg-slate-100">
                        <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/1200x400?text=Invalid+Image+URL';
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Titles */}
            <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="en">🇺🇸 English</TabsTrigger>
                    <TabsTrigger value="th">🇹🇭 ไทย</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="space-y-3 pt-3">
                    <div className="space-y-2">
                        <Label htmlFor="title_en">Title</Label>
                        <Input
                            id="title_en"
                            name="title_en"
                            defaultValue={banner?.title_en || ''}
                            placeholder="Welcome to Our Conference"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subtitle_en">Subtitle</Label>
                        <Textarea
                            id="subtitle_en"
                            name="subtitle_en"
                            defaultValue={banner?.subtitle_en || ''}
                            placeholder="Join us for an amazing experience..."
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="button_text_en">Button Text</Label>
                        <Input
                            id="button_text_en"
                            name="button_text_en"
                            defaultValue={banner?.button_text_en || ''}
                            placeholder="Register Now"
                        />
                    </div>
                </TabsContent>
                <TabsContent value="th" className="space-y-3 pt-3">
                    <div className="space-y-2">
                        <Label htmlFor="title_th">Title (ภาษาไทย)</Label>
                        <Input
                            id="title_th"
                            name="title_th"
                            defaultValue={banner?.title_th || ''}
                            placeholder="ยินดีต้อนรับสู่งานประชุม"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subtitle_th">Subtitle (ภาษาไทย)</Label>
                        <Textarea
                            id="subtitle_th"
                            name="subtitle_th"
                            defaultValue={banner?.subtitle_th || ''}
                            placeholder="ร่วมเป็นส่วนหนึ่งของประสบการณ์ที่น่าตื่นเต้น..."
                            rows={2}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="button_text_th">Button Text (ภาษาไทย)</Label>
                        <Input
                            id="button_text_th"
                            name="button_text_th"
                            defaultValue={banner?.button_text_th || ''}
                            placeholder="ลงทะเบียนเลย"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Button Link */}
            <div className="space-y-2">
                <Label htmlFor="button_link">Button Link</Label>
                <Input
                    id="button_link"
                    name="button_link"
                    defaultValue={banner?.button_link || ''}
                    placeholder="/register or https://..."
                />
            </div>

            {/* Display Order */}
            <div className="space-y-2">
                <Label htmlFor="display_order">Display Order</Label>
                <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    defaultValue={banner?.display_order || 0}
                    min={0}
                />
            </div>

            {/* Active Toggle */}
            {banner && (
                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_active"
                        name="is_active"
                        defaultChecked={banner?.is_active !== false}
                    />
                    <Label htmlFor="is_active">Active</Label>
                </div>
            )}

            <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {banner ? 'Update' : 'Create'} Banner
                </Button>
            </DialogFooter>
        </form>
    );
}

function BannerCard({
    banner,
    onEdit,
    onDelete
}: {
    banner: Banner;
    onEdit: () => void;
    onDelete: () => void;
}) {
    return (
        <div className={`border rounded-lg overflow-hidden bg-white transition-shadow hover:shadow-lg ${!banner.is_active ? 'opacity-60' : ''}`}>
            {/* Image */}
            <div className="relative aspect-[21/9] bg-slate-100">
                <img
                    src={banner.image_url}
                    alt={banner.title_en || 'Banner'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/1200x400?text=Image+Not+Found';
                    }}
                />
                {/* Overlay with text preview */}
                {banner.title_en && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-center p-4">
                        <div>
                            <h3 className="text-lg font-bold">{banner.title_en}</h3>
                            {banner.subtitle_en && (
                                <p className="text-sm mt-1 opacity-80 line-clamp-2">{banner.subtitle_en}</p>
                            )}
                            {banner.button_text_en && (
                                <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded text-xs">
                                    {banner.button_text_en}
                                </span>
                            )}
                        </div>
                    </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-2 left-2">
                    <Badge variant={banner.is_active ? 'default' : 'secondary'}>
                        {banner.is_active ? (
                            <><Eye className="mr-1 h-3 w-3" /> Active</>
                        ) : (
                            <><EyeOff className="mr-1 h-3 w-3" /> Inactive</>
                        )}
                    </Badge>
                </div>
                {/* Order Badge */}
                <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/80">
                        #{banner.display_order}
                    </Badge>
                </div>
            </div>

            {/* Actions */}
            <div className="p-3 flex items-center justify-between border-t bg-slate-50">
                <div className="text-sm text-slate-600 truncate flex-1">
                    {banner.button_link ? (
                        <span className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            {banner.button_link}
                        </span>
                    ) : (
                        <span className="text-slate-400">No link</span>
                    )}
                </div>
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
                        <DropdownMenuSeparator />
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

export function BannerManager({ banners }: BannerManagerProps) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Banner | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Banner | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [previewIndex, setPreviewIndex] = useState(0);

    const sortedBanners = [...banners].sort((a, b) => a.display_order - b.display_order);
    const activeBanners = sortedBanners.filter(b => b.is_active);

    async function handleDelete() {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteBanner(deleteTarget.id);
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Total Banners</CardTitle>
                        <ImageIcon className="h-5 w-5 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{banners.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Eye className="h-5 w-5 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{activeBanners.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium">Inactive</CardTitle>
                        <EyeOff className="h-5 w-5 text-slate-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{banners.length - activeBanners.length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Preview Slider */}
            {activeBanners.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Preview Slider</CardTitle>
                        <CardDescription>How banners will appear on the homepage</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative aspect-[21/9] rounded-lg overflow-hidden bg-slate-100">
                            <img
                                src={activeBanners[previewIndex]?.image_url}
                                alt="Preview"
                                className="w-full h-full object-cover transition-opacity"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h2 className="text-2xl font-bold">
                                    {activeBanners[previewIndex]?.title_en || 'No Title'}
                                </h2>
                                {activeBanners[previewIndex]?.subtitle_en && (
                                    <p className="mt-2 opacity-90">
                                        {activeBanners[previewIndex].subtitle_en}
                                    </p>
                                )}
                                {activeBanners[previewIndex]?.button_text_en && (
                                    <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                                        {activeBanners[previewIndex].button_text_en}
                                    </button>
                                )}
                            </div>
                            {/* Navigation */}
                            {activeBanners.length > 1 && (
                                <>
                                    <button
                                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                                        onClick={() => setPreviewIndex(prev => prev === 0 ? activeBanners.length - 1 : prev - 1)}
                                    >
                                        <ChevronLeft className="h-6 w-6 text-white" />
                                    </button>
                                    <button
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors"
                                        onClick={() => setPreviewIndex(prev => prev === activeBanners.length - 1 ? 0 : prev + 1)}
                                    >
                                        <ChevronRight className="h-6 w-6 text-white" />
                                    </button>
                                </>
                            )}
                            {/* Dots */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {activeBanners.map((_, idx) => (
                                    <button
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-colors ${idx === previewIndex ? 'bg-white' : 'bg-white/50'}`}
                                        onClick={() => setPreviewIndex(idx)}
                                    />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Banner List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Banners</CardTitle>
                            <CardDescription>Manage your homepage banners</CardDescription>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Banner
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[600px]">
                                <DialogHeader>
                                    <DialogTitle>Add New Banner</DialogTitle>
                                    <DialogDescription>
                                        Create a new banner for the homepage slider.
                                    </DialogDescription>
                                </DialogHeader>
                                <BannerForm onClose={() => setIsCreateOpen(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {banners.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-slate-50">
                            <ImageIcon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                            <h3 className="text-lg font-medium text-slate-900">No banners yet</h3>
                            <p className="text-slate-500 mt-2">
                                Add your first banner to get started.
                            </p>
                            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add First Banner
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sortedBanners.map((banner) => (
                                <BannerCard
                                    key={banner.id}
                                    banner={banner}
                                    onEdit={() => setEditTarget(banner)}
                                    onDelete={() => setDeleteTarget(banner)}
                                />
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this banner?
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
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Banner</DialogTitle>
                        <DialogDescription>
                            Update the banner details.
                        </DialogDescription>
                    </DialogHeader>
                    {editTarget && (
                        <BannerForm
                            banner={editTarget}
                            onClose={() => setEditTarget(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
