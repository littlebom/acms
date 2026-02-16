'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    Loader2,
    Image as ImageIcon,
    X,
    Upload
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getMediaFiles, type MediaFile } from '@/app/actions/media';
import { MediaLibrary } from '@/components/admin/media-library';
import { ImageCropper } from '@/components/admin/image-cropper';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTicket, updateTicket, type Ticket } from "@/app/actions/registrations";
import { getSystemSettings } from "@/app/actions/settings";
import { getBadgeAspectRatio } from "@/lib/badge-utils";
import { uploadCroppedImage } from "@/app/actions/upload-cropped";
import { Switch } from "@/components/ui/switch";

// Helper to format date for input type="datetime-local"
function formatDateForInput(date: Date | string | null) {
    if (!date) return '';
    const d = new Date(date);
    return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function TicketForm({
    ticket,
    onClose
}: {
    ticket?: Ticket | null,
    onClose?: () => void
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(ticket?.background_image || null);
    const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
    const [isCropperOpen, setIsCropperOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [loadingMedia, setLoadingMedia] = useState(false);
    const [badgeAspectRatio, setBadgeAspectRatio] = useState<number>(1.6);
    const [badgeSize, setBadgeSize] = useState<string>('8.6x5.4');
    const [isFree, setIsFree] = useState<boolean>(ticket?.price === 0 || false);
    const [price, setPrice] = useState<string>(ticket?.price?.toString() || '');

    // Fetch badge size settings on mount
    useEffect(() => {
        async function fetchSettings() {
            const settings = await getSystemSettings();
            setBadgeSize(settings.badge_size);
            setBadgeAspectRatio(getBadgeAspectRatio(settings.badge_size));
        }
        fetchSettings();
    }, []);

    // Update price when isFree changes
    useEffect(() => {
        if (isFree) {
            setPrice('0');
        }
    }, [isFree]);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        try {
            if (ticket) {
                formData.append('id', ticket.id.toString());
                await updateTicket(formData);
            } else {
                await createTicket(formData);
            }

            if (onClose) {
                onClose();
            } else {
                router.push('/admin/conference/tickets');
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('Failed to save ticket');
        } finally {
            setLoading(false);
        }
    }

    async function openMediaPicker() {
        setIsMediaPickerOpen(true);
        if (mediaFiles.length === 0) {
            setLoadingMedia(true);
            const files = await getMediaFiles();
            setMediaFiles(files);
            setLoadingMedia(false);
        }
    }

    function handleSelectMedia(file: MediaFile) {
        setImageToCrop(file.url);
        setIsMediaPickerOpen(false);
        setIsCropperOpen(true);
    }

    async function handleCropComplete(croppedImageBase64: string) {
        try {
            // Upload cropped image to server
            const result = await uploadCroppedImage(croppedImageBase64);

            if (result.success && result.url) {
                // Set the permanent URL
                setBackgroundImage(result.url);
            } else {
                alert('Failed to upload cropped image: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload cropped image');
        } finally {
            setIsCropperOpen(false);
            setImageToCrop(null);
        }
    }

    function handleOpenCropper() {
        if (backgroundImage) {
            setImageToCrop(backgroundImage);
            setIsCropperOpen(true);
        }
    }

    function handleCancel() {
        if (onClose) {
            onClose();
        } else {
            router.push('/admin/conference/tickets');
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{ticket ? 'Edit Ticket Type' : 'Create Ticket Type'}</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Ticket Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={ticket?.name}
                            required
                            placeholder="e.g. Early Bird, Regular, Student"
                        />
                    </div>

                    {/* Free Ticket Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <Label htmlFor="free-ticket" className="text-base font-semibold text-emerald-900 cursor-pointer">
                                    Free Ticket
                                </Label>
                                <p className="text-xs text-emerald-600">
                                    No payment required for this ticket
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="free-ticket"
                            checked={isFree}
                            onCheckedChange={(checked) => setIsFree(checked)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price" className={isFree ? "text-slate-400" : ""}>
                                Price (THB) {isFree && <span className="text-xs">(Free)</span>}
                            </Label>
                            <Input
                                type="number"
                                id="price"
                                name="price"
                                value={isFree ? "0" : price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                disabled={isFree}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className={isFree ? "bg-slate-100 text-slate-500" : ""}
                            />
                            {isFree && (
                                <p className="text-xs text-emerald-600 flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    No payment slip required
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quota">Quota (Optional)</Label>
                            <Input
                                type="number"
                                id="quota"
                                name="quota"
                                defaultValue={ticket?.quota || ''}
                                min="0"
                                placeholder="Unlimited"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="available_until">Available Until (Optional)</Label>
                        <Input
                            type="datetime-local"
                            id="available_until"
                            name="available_until"
                            defaultValue={formatDateForInput(ticket?.available_until || null)}
                        />
                    </div>

                    {/* Background Image Selection */}
                    <div className="space-y-2">
                        <Label>Ticket/Badge Background</Label>
                        <input type="hidden" name="background_image" value={backgroundImage || ''} />

                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                            {backgroundImage ? (
                                <div className="space-y-4">
                                    {/* Preview */}
                                    <div
                                        className="relative w-full max-w-md mx-auto bg-white shadow-lg border-2 border-slate-200 rounded-lg overflow-hidden group"
                                        style={{ aspectRatio: badgeAspectRatio }}
                                    >
                                        <img src={backgroundImage} alt="Background Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <button
                                            type="button"
                                            onClick={() => setBackgroundImage(null)}
                                            className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap gap-3 justify-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={handleOpenCropper}
                                            className="border-blue-500 text-blue-600 hover:bg-blue-50"
                                        >
                                            <ImageIcon className="mr-2 h-4 w-4" />
                                            Adjust Crop
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsMediaPickerOpen(true)}
                                        >
                                            Change Image
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center space-y-4">
                                    {/* Upload Icon */}
                                    <div className="flex justify-center">
                                        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                                            <ImageIcon className="h-10 w-10 text-blue-600" />
                                        </div>
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                                            Upload Background Image
                                        </h3>
                                        <p className="text-sm text-slate-500">
                                            Drag and drop an image here, or click to browse
                                        </p>
                                    </div>

                                    {/* Upload Buttons */}
                                    <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                                        <label className="cursor-pointer">
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const url = URL.createObjectURL(file);
                                                        setImageToCrop(url);
                                                        setIsCropperOpen(true);
                                                    }
                                                }}
                                            />
                                            <Button
                                                type="button"
                                                size="lg"
                                                className="bg-blue-600 hover:bg-blue-700"
                                                asChild
                                            >
                                                <span>
                                                    <Upload className="mr-2 h-5 w-5" />
                                                    Upload New Image
                                                </span>
                                            </Button>
                                        </label>

                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="lg"
                                            onClick={openMediaPicker}
                                        >
                                            <ImageIcon className="mr-2 h-5 w-5" />
                                            Choose from Library
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Info Text */}
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <p className="text-xs text-slate-500 text-center">
                                    <strong>Current badge size:</strong> {badgeSize} •
                                    <span className="text-blue-600 hover:underline cursor-pointer ml-1">
                                        Change in Settings
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Media Library Dialog */}
                        <Dialog open={isMediaPickerOpen} onOpenChange={setIsMediaPickerOpen}>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Select Background Image</DialogTitle>
                                    <DialogDescription>
                                        Choose an image from your media library
                                    </DialogDescription>
                                </DialogHeader>
                                {loadingMedia ? (
                                    <div className="py-20 flex justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                                    </div>
                                ) : (
                                    <MediaLibrary
                                        initialFiles={mediaFiles}
                                        enableSelection={true}
                                        onSelect={handleSelectMedia}
                                    />
                                )}
                            </DialogContent>
                        </Dialog>

                        {/* Image Cropper Dialog */}
                        {imageToCrop && (
                            <ImageCropper
                                imageUrl={imageToCrop}
                                open={isCropperOpen}
                                onClose={() => {
                                    setIsCropperOpen(false);
                                    setImageToCrop(null);
                                }}
                                onCropComplete={handleCropComplete}
                                aspectRatio={badgeAspectRatio}
                            />
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {ticket ? 'Update Ticket' : 'Create Ticket'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
