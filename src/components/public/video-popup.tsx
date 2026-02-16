'use client';

import { useState } from "react";
import { Play, X, Youtube } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
    DialogClose,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface VideoPopupProps {
    videoUrl: string;
}

export function VideoPopup({ videoUrl }: VideoPopupProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Function to extract YouTube ID and format as embed URL
    const getEmbedUrl = (url: string) => {
        let videoId = '';
        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1]?.split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1]?.split('?')[0];
        } else if (url.includes('youtube.com/embed/')) {
            videoId = url.split('embed/')[1]?.split('?')[0];
        }

        return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : '';
    };

    const embedUrl = getEmbedUrl(videoUrl);

    if (!embedUrl) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn z-10">
                    <div className="relative">
                        {/* Ripple Effect */}
                        <div
                            className="absolute inset-0 bg-white rounded-full animate-ping opacity-20 scale-150"
                            style={{ animationDuration: '3s' }}
                        ></div>
                        <div
                            className="absolute inset-0 bg-white rounded-full animate-ping opacity-10 scale-[2]"
                            style={{ animationDuration: '3s', animationDelay: '1s' }}
                        ></div>

                        {/* Play Button */}
                        <div className="relative w-20 h-20 bg-white/80 backdrop-blur-sm hover:bg-white text-red-600 rounded-full flex items-center justify-center shadow-2xl transform transition-all duration-300 group-hover/btn:scale-110">
                            <Play className="w-8 h-8 fill-current ml-1" />
                        </div>
                    </div>
                </div>
            </DialogTrigger>

            <DialogContent className="max-w-[90vw] max-h-[90vh] w-full p-0 overflow-hidden bg-black border-none sm:rounded-2xl shadow-2xl flex items-center justify-center">
                <DialogTitle className="sr-only">Event Video</DialogTitle>
                <div className="aspect-video w-full relative">
                    {isOpen && (
                        <iframe
                            src={embedUrl}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    )}
                    <div className="absolute top-4 right-4 z-20">
                        <DialogClose asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full bg-black/40 text-white hover:bg-black/60 backdrop-blur-sm"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogClose>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
