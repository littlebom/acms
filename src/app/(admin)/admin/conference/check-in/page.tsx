'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScanLine, UserCheck, XCircle, Search, Camera, Keyboard, CheckCircle2, ArrowLeft } from "lucide-react";
import { getRegistrationForCheckIn, checkInUser } from "@/app/actions/check-in";
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

export default function AdminCheckInPage() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [registration, setRegistration] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [mode, setMode] = useState<'scan' | 'result'>('scan');
    const [inputMode, setInputMode] = useState<'manual' | 'camera'>('manual');

    // Auto-focus input ref
    const inputRef = useRef<HTMLInputElement>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    // Focus input on mount and reset
    useEffect(() => {
        if (mode === 'scan' && inputMode === 'manual') {
            inputRef.current?.focus();
        }
    }, [mode, inputMode]);

    // Initialize QR Scanner when camera mode is selected
    useEffect(() => {
        if (mode === 'scan' && inputMode === 'camera') {
            // Small delay to ensure DOM element exists
            const timeout = setTimeout(() => {
                if (!scannerRef.current) {
                    scannerRef.current = new Html5QrcodeScanner(
                        "qr-reader",
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
                        },
                        false
                    );

                    scannerRef.current.render(
                        (decodedText) => {
                            // Success callback
                            handleQrCodeScan(decodedText);
                        },
                        (errorMessage) => {
                            // Error callback - ignore, just keep scanning
                        }
                    );
                }
            }, 100);

            return () => {
                clearTimeout(timeout);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(console.error);
                    scannerRef.current = null;
                }
            };
        }
    }, [mode, inputMode]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }
        };
    }, []);

    const handleQrCodeScan = useCallback(async (code: string) => {
        // Prevent multiple rapid scans
        if (loading) return;

        // Stop scanning immediately
        if (scannerRef.current) {
            await scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }

        await handleLookup(code);
    }, [loading]);

    const handleLookup = async (code: string) => {
        if (!code.trim()) return;

        setLoading(true);
        setError(null);
        setSuccessMessage(null);
        setRegistration(null);

        const result = await getRegistrationForCheckIn(code);
        setLoading(false);

        if (result.success) {
            setRegistration(result.registration);
            setMode('result');
            setQuery('');
        } else {
            setError(result.error || 'Unknown error');
            setQuery('');
            if (inputMode === 'manual') {
                inputRef.current?.focus();
            }
        }
    };

    const handleSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        await handleLookup(query);
    };

    const handleCheckIn = async () => {
        if (!registration) return;

        setLoading(true);
        const result = await checkInUser(registration.id);
        setLoading(false);

        if (result.success) {
            setSuccessMessage(`Checked in: ${registration.first_name} ${registration.last_name}`);
            setRegistration(result.registration);
        } else {
            setError(result.error || 'Check-in failed');
        }
    };

    const resetScan = () => {
        setMode('scan');
        setRegistration(null);
        setError(null);
        setSuccessMessage(null);
    };

    const toggleInputMode = () => {
        // Cleanup camera if switching away
        if (inputMode === 'camera' && scannerRef.current) {
            scannerRef.current.clear().catch(console.error);
            scannerRef.current = null;
        }
        setInputMode(prev => prev === 'manual' ? 'camera' : 'manual');
        setError(null);
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
                <Button variant="ghost" className="absolute left-4 top-4 md:left-8 md:top-8" asChild>
                    <a href="/admin/conference/check-in-list">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to List
                    </a>
                </Button>
                <div className="bg-blue-100 p-4 rounded-full mt-8 md:mt-0">
                    <ScanLine className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Access Control Check-in</h1>
                <p className="text-slate-500">Scan QR Code or Enter Registration ID</p>
            </div>

            {/* Error / Success Messages at top level */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2 animate-in slide-in-from-top-2">
                    <XCircle className="h-5 w-5" />
                    <span>{error}</span>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2 animate-in slide-in-from-top-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-bold">{successMessage}</span>
                </div>
            )}

            {mode === 'scan' && (
                <div className="space-y-4">
                    {/* Mode Toggle */}
                    <div className="flex justify-center gap-2">
                        <Button
                            variant={inputMode === 'manual' ? 'default' : 'outline'}
                            onClick={() => setInputMode('manual')}
                            className="gap-2"
                        >
                            <Keyboard className="h-4 w-4" />
                            Manual / Scanner
                        </Button>
                        <Button
                            variant={inputMode === 'camera' ? 'default' : 'outline'}
                            onClick={() => setInputMode('camera')}
                            className="gap-2"
                        >
                            <Camera className="h-4 w-4" />
                            Camera
                        </Button>
                    </div>

                    {inputMode === 'manual' && (
                        <Card className="max-w-md mx-auto shadow-lg border-2 border-slate-200">
                            <CardContent className="pt-6 pb-8">
                                <form onSubmit={handleSearch} className="flex gap-2">
                                    <Input
                                        ref={inputRef}
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Scan or type ID..."
                                        className="text-lg h-12"
                                        disabled={loading}
                                        autoFocus
                                    />
                                    <Button type="submit" size="lg" className="h-12 w-12 px-0" disabled={loading}>
                                        <Search className="h-5 w-5" />
                                    </Button>
                                </form>
                                <p className="text-xs text-slate-400 mt-2 text-center">
                                    Use barcode scanner or type ID manually. Press Enter to search.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {inputMode === 'camera' && (
                        <Card className="max-w-md mx-auto shadow-lg border-2 border-blue-200 overflow-hidden">
                            <CardContent className="p-4">
                                <div id="qr-reader" className="w-full rounded-lg overflow-hidden"></div>
                                <p className="text-xs text-slate-500 mt-3 text-center">
                                    Point camera at the QR Code on the attendee's badge.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {mode === 'result' && registration && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-200">
                    {/* User Card */}
                    <Card className="border-t-4 border-t-blue-500 shadow-md">
                        <CardHeader className="bg-slate-50 border-b pb-8 pt-8">
                            <div className="flex flex-col items-center">
                                <Avatar className="h-32 w-32 border-4 border-white shadow-lg mb-4">
                                    <AvatarImage src={registration.profile_image} />
                                    <AvatarFallback className="text-4xl">
                                        {registration.first_name?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <CardTitle className="text-2xl font-bold flex flex-col items-center gap-1">
                                    <span className="text-base font-normal text-slate-500">{registration.title}</span>
                                    {registration.first_name} {registration.last_name}
                                </CardTitle>
                                <Badge variant="outline" className="mt-2 text-slate-500 border-slate-300">
                                    {registration.email}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider font-bold">Registration ID</span>
                                    <span className="font-mono text-lg font-bold">#{registration.id.toString().padStart(6, '0')}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block text-xs uppercase tracking-wider font-bold">Ticket Type</span>
                                    <span className="text-blue-700 font-semibold">{registration.ticket_name}</span>
                                </div>
                            </div>
                            <div className="pt-4 border-t">
                                <span className="text-slate-500 block text-xs uppercase tracking-wider font-bold mb-1">Status</span>
                                {registration.status === 'paid' ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 text-sm px-3 py-1">
                                        Confirmed (Paid)
                                    </Badge>
                                ) : (
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 text-sm px-3 py-1">
                                        {registration.status.toUpperCase()}
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Card */}
                    <Card className="flex flex-col justify-center shadow-md bg-slate-50/50">
                        <CardContent className="p-8 flex flex-col gap-6">
                            {registration.checked_in_at ? (
                                <div className="bg-emerald-100 border-emerald-200 border rounded-lg p-6 text-center text-emerald-800">
                                    <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-emerald-600" />
                                    <h3 className="text-2xl font-bold mb-2">Already Checked In</h3>
                                    <p>Time: {new Date(registration.checked_in_at).toLocaleTimeString()}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-semibold">Ready to Check In</h3>
                                        <p className="text-slate-500 text-sm">Verify the user identity before proceeding.</p>
                                    </div>
                                    <Button
                                        onClick={handleCheckIn}
                                        size="lg"
                                        disabled={loading || registration.status !== 'paid'}
                                        className={`w-full h-16 text-xl font-bold shadow-lg 
                                            ${registration.status === 'paid' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed text-slate-500'}
                                        `}
                                    >
                                        <UserCheck className="w-6 h-6 mr-3" />
                                        Confirm Check-in
                                    </Button>
                                    {registration.status !== 'paid' && (
                                        <p className="text-center text-red-500 text-sm font-medium">
                                            Cannot check in: Payment not confirmed.
                                        </p>
                                    )}
                                </>
                            )}

                            <Button onClick={resetScan} variant="outline" size="lg" className="w-full mt-auto">
                                Back to Scan (Next Person)
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
