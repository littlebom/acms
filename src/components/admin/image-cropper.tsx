'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Loader2, Crop, RotateCw } from 'lucide-react';

interface Point {
    x: number;
    y: number;
}

interface Area {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface CroppedAreaPixels extends Area { }

interface ImageCropperProps {
    imageUrl: string;
    open: boolean;
    onClose: () => void;
    onCropComplete: (croppedImageUrl: string, cropData: CroppedAreaPixels) => void;
    aspectRatio?: number;
    outputType?: 'image/jpeg' | 'image/png';
}

export function ImageCropper({
    imageUrl,
    open,
    onClose,
    onCropComplete,
    aspectRatio = 16 / 9,
    outputType = 'image/jpeg'
}: ImageCropperProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedAreaPixels | null>(null);
    const [loading, setLoading] = useState(false);

    const onCropChange = (location: Point) => {
        setCrop(location);
    };

    const onZoomChange = (zoom: number) => {
        setZoom(zoom);
    };

    const onCropCompleteCallback = useCallback(
        (croppedArea: Area, croppedAreaPixels: CroppedAreaPixels) => {
            setCroppedAreaPixels(croppedAreaPixels);
        },
        []
    );

    const handleCrop = async () => {
        if (!croppedAreaPixels) return;

        setLoading(true);
        try {
            const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels, rotation, outputType);
            onCropComplete(croppedImage, croppedAreaPixels);
            onClose();
        } catch (error) {
            console.error('Crop error:', error);
            alert('Failed to crop image');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setRotation(0);
    };

    const handleRotate = (degrees: number) => {
        setRotation((prev) => (prev + degrees) % 360);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] p-0 gap-0 bg-gradient-to-br from-slate-50 to-slate-100">
                <DialogHeader className="px-6 pt-6 pb-4 border-b bg-white/50 backdrop-blur">
                    <DialogTitle className="flex items-center gap-3 text-2xl">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Crop className="h-6 w-6 text-blue-600" />
                        </div>
                        <span>Crop & Adjust Image</span>
                    </DialogTitle>
                    <p className="text-sm text-slate-500 mt-1">
                        Adjust the crop area, zoom, and rotation to get the perfect image
                    </p>
                </DialogHeader>

                <div className="flex flex-col lg:flex-row gap-6 p-6">
                    {/* Cropper Area */}
                    <div className="flex-1 space-y-4">
                        <div className="relative h-[400px] lg:h-[500px] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700">
                            <Cropper
                                image={imageUrl}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={aspectRatio}
                                onCropChange={onCropChange}
                                onZoomChange={onZoomChange}
                                onCropComplete={onCropCompleteCallback}
                                style={{
                                    containerStyle: {
                                        backgroundColor: 'transparent'
                                    }
                                }}
                            />
                        </div>

                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 bg-white/70 backdrop-blur px-4 py-2 rounded-lg">
                            <Crop className="h-3.5 w-3.5" />
                            <span>Drag to reposition • Scroll to zoom • Use controls below to adjust</span>
                        </div>
                    </div>

                    {/* Controls Panel */}
                    <div className="lg:w-80 space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg border border-slate-200 space-y-6">
                            {/* Zoom Control */}
                            <div className="space-y-3">
                                <Label className="flex items-center justify-between text-base font-semibold">
                                    <span className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                            </svg>
                                        </div>
                                        Zoom
                                    </span>
                                    <span className="text-sm font-mono bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                                        {zoom.toFixed(1)}x
                                    </span>
                                </Label>
                                <Slider
                                    value={[zoom]}
                                    onValueChange={(value) => setZoom(value[0])}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>1x</span>
                                    <span>3x</span>
                                </div>
                            </div>

                            {/* Rotation Control */}
                            <div className="space-y-3">
                                <Label className="flex items-center justify-between text-base font-semibold">
                                    <span className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                            <RotateCw className="h-4 w-4 text-emerald-600" />
                                        </div>
                                        Rotation
                                    </span>
                                    <span className="text-sm font-mono bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                                        {rotation}°
                                    </span>
                                </Label>
                                <Slider
                                    value={[rotation]}
                                    onValueChange={(value) => setRotation(value[0])}
                                    min={0}
                                    max={360}
                                    step={1}
                                    className="w-full"
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRotate(-90)}
                                        className="flex-1"
                                    >
                                        <RotateCw className="h-3.5 w-3.5 mr-1 transform -scale-x-100" />
                                        -90°
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRotate(90)}
                                        className="flex-1"
                                    >
                                        <RotateCw className="h-3.5 w-3.5 mr-1" />
                                        +90°
                                    </Button>
                                </div>
                            </div>

                            {/* Reset Button */}
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleReset}
                                className="w-full border-slate-300 hover:bg-slate-50"
                            >
                                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset All
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={handleCrop}
                                disabled={loading}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30"
                                size="lg"
                            >
                                {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                {loading ? 'Processing...' : 'Apply Crop'}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="w-full h-12"
                                size="lg"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Helper function to create cropped image
async function getCroppedImg(
    imageSrc: string,
    pixelCrop: CroppedAreaPixels,
    rotation = 0,
    outputType = 'image/jpeg'
): Promise<string> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
        image,
        safeArea / 2 - image.width * 0.5,
        safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
        data,
        Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
        Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    return new Promise((resolve) => {
        // Return base64 data URL with specified type
        const quality = outputType === 'image/jpeg' ? 0.95 : undefined;
        const base64Image = canvas.toDataURL(outputType, quality);
        resolve(base64Image);
    });
}

function createImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.setAttribute('crossOrigin', 'anonymous');
        image.src = url;
    });
}
