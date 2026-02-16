'use client';

import { Button } from "@/components/ui/button";
import { Download, User } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import QRCode from 'qrcode';

interface BadgeCardProps {
    user: {
        first_name: string;
        last_name: string;
        email: string;
        organization?: string;
        title?: string;
        profile_image?: string | null;
    };
    event: {
        name: string;
        date: string;
        venue: string;
    };
    ticketType: string;
    registrationId: string;
    backgroundImage?: string | null;
}

export function BadgeCard({ user, event, ticketType, registrationId, backgroundImage }: BadgeCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

    useEffect(() => {
        QRCode.toDataURL(registrationId, {
            width: 128,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        })
            .then(url => setQrCodeUrl(url))
            .catch(err => console.error(err));
    }, [registrationId]);

    // Simple print function as functionality to "download" for now
    // In a real app, we might use html2canvas or generate a PDF on server
    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow && cardRef.current) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Conference Badge - ${user.first_name}</title>
                    <style>
                        body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f0f0f0; margin:0; }
                        .badge-container { border: 1px solid #ddd; background: white; width: 350px; height: 500px; padding: 0; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: flex; flex-direction: column; text-align: center; overflow: hidden; position: relative; }
                        ${backgroundImage ? `
                        .badge-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
                        .content-wrapper { position: relative; z-index: 1; height: 100%; display: flex; flex-direction: column; }
                        ` : ''}
                        .header { ${backgroundImage ? 'background: transparent;' : 'background: #2D4391;'} color: white; padding: 20px 10px; height: 120px; display: flex; align-items: center; justify-content: center; flex-direction: column; }
                        .header h2 { margin: 0; font-size: 18px; line-height: 1.2; text-shadow: ${backgroundImage ? '1px 1px 3px rgba(0,0,0,0.8)' : 'none'}; }
                        .header p { margin: 5px 0 0; font-size: 12px; opacity: 0.9; text-shadow: ${backgroundImage ? '1px 1px 3px rgba(0,0,0,0.8)' : 'none'}; }
                        .header p { margin: 5px 0 0; font-size: 12px; opacity: 0.9; text-shadow: ${backgroundImage ? '1px 1px 3px rgba(0,0,0,0.8)' : 'none'}; }
                        .content { padding: 30px 20px; flex: 1; display: flex; flex-direction: column; alignItems: center; ${backgroundImage ? 'background: transparent;' : ''} }
                        .avatar { width: 100px; height: 100px; background: #f0f0f0; border-radius: 50%; margin: 10px auto 20px; border: 4px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center; font-size: 32px; color: #aaa; overflow: hidden; }
                        .avatar img { width: 100%; height: 100%; object-fit: cover; object-position: top; }
                        .name { font-size: 20px; font-weight: bold; ${backgroundImage ? 'color: white; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);' : 'color: #333;'} margin: 0 0 5px; }
                        .org { font-size: 16px; ${backgroundImage ? 'color: white; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);' : 'color: #666;'} margin: 0 0 20px; text-shadow: ${backgroundImage ? '1px 1px 3px rgba(0,0,0,0.8)' : 'none'}; }
                        .ticket-type { font-size: 18px; font-weight: bold; margin-bottom: 20px; ${backgroundImage ? 'color: white; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);' : 'color: #333;'} }
                        .footer { background: #f8fafc; padding: 15px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; ${backgroundImage ? 'background: transparent; border-top: none; color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.8);' : ''} }
                        .id { margin-bottom: 5px; }
                        .separator { width: 100%; border-top: 1px solid #e2e8f0; margin: 10px 0; ${backgroundImage ? 'border-color: rgba(255,255,255,0.5);' : ''} }
                        @media print {
                            body { background: white; }
                            .badge-container { box-shadow: none; border: 1px solid #000; }
                            .no-print { display: none; }
                            .badge-bg { -webkit-print-color-adjust: exact; }
                        }
                    </style>
                </head>
                <body>
                    <div class="badge-container">
                        ${backgroundImage ? `<img src="${backgroundImage}" class="badge-bg" />` : ''}
                        <div class="${backgroundImage ? 'content-wrapper' : ''}">
                            <div class="header">
                                <h2>${event.name}</h2>
                                <p>${event.date}</p>
                            </div>
                            <div class="content">
                                <div class="avatar">
                                    ${user.profile_image
                    ? `<img src="${user.profile_image}" alt="Profile" />`
                    : `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`
                }
                                </div>
                                <h3 class="name">${user.title ? `${user.title} ` : ''}${user.first_name} ${user.last_name}</h3>
                                <div class="separator"></div>
                                <div class="ticket-type">${ticketType}</div>
                                
                                <div class="id">
                                    <img src="${qrCodeUrl}" width="80" height="80" style="display: block; margin: 0 auto; border-radius: 4px;" />
                                </div>
                            </div>
                            <div class="footer">
                                Please wear this badge at all times
                            </div>
                        </div>
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div ref={cardRef} className="w-[300px] h-[450px] bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200 flex flex-col relative group transition-all hover:shadow-2xl">
                {backgroundImage && (
                    <img
                        src={backgroundImage}
                        alt="Badge Background"
                        className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                )}

                <div className={`relative z-10 flex flex-col h-full`}>
                    {/* Header */}
                    <div className={`p-6 text-center text-white h-32 flex flex-col items-center justify-center relative overflow-hidden ${backgroundImage ? 'bg-transparent' : 'bg-[#2D4391]'}`}>
                        {!backgroundImage && <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>}
                        <h3 className={`font-bold text-lg leading-tight relative z-10 ${backgroundImage ? 'text-shadow-md' : ''}`}>{event.name}</h3>
                        {/* Venue removed */}
                    </div>

                    {/* Content */}
                    <div className={`flex-1 p-6 flex flex-col items-center text-center relative ${backgroundImage ? 'bg-transparent' : ''}`}>
                        {/* Avatar Placeholder */}
                        <div className="w-24 h-24 bg-slate-100 rounded-full border-4 border-white shadow-md -mt-12 mb-4 flex items-center justify-center text-2xl font-bold text-slate-400 overflow-hidden">
                            {user.profile_image ? (
                                <img
                                    src={user.profile_image}
                                    alt="Profile"
                                    className="w-full h-full object-cover object-top"
                                />
                            ) : (
                                <span>{user.first_name?.[0]}{user.last_name?.[0]}</span>
                            )}
                        </div>

                        <h2 className={`text-xl font-bold mb-2 ${backgroundImage ? 'text-white text-shadow-md' : 'text-slate-800'}`}>
                            {user.title} {user.first_name} {user.last_name}
                        </h2>

                        <div className={`w-full border-t border-slate-200/50 my-2 ${backgroundImage ? 'border-white/50' : ''}`} />

                        <div className={`text-lg font-bold mb-auto ${backgroundImage ? 'text-white text-shadow-md' : 'text-slate-800'}`}>
                            {ticketType}
                        </div>

                        <div className={`mt-8 w-full pt-4 ${backgroundImage ? 'bg-transparent' : ''}`}>
                            {qrCodeUrl && (
                                <img
                                    src={qrCodeUrl}
                                    alt="Registration QR Code"
                                    className="w-20 h-20 mx-auto rounded-md"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <Button onClick={handlePrint} className="w-full max-w-[300px]">
                <Download className="mr-2 h-4 w-4" />
                Download / Print Badge
            </Button>
        </div>
    );
}
