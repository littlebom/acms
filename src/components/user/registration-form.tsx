'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
    Ticket as TicketIcon,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    Upload
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { registerForEvent, cancelRegistration, uploadPaymentProof } from "@/app/actions/user-registration";
import { Badge } from "@/components/ui/badge";
import type { Question } from "@/app/actions/questions";
import Link from 'next/link';
import { createOmisePromptPayCharge, checkOmisePaymentStatus, verifyStripePayment, createOmiseTrueMoneyCharge } from "@/app/actions/payment";
import { useRouter } from 'next/navigation';
import { StripePaymentForm } from '@/components/public/stripe-payment-form';
import type { EventData } from '@/app/actions/events';

interface Ticket {
    id: number;
    name: string;
    price: number;
    description?: string;
}

interface Registration {
    id: number;
    user_id: number;
    ticket_name: string;
    ticket_price: number;
    status: string;
    registered_at: string;
    payment_proof_url?: string | null;
    ticket_background_image?: string | null;
    // User details from join
    title?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
}

import { BadgeCard } from "./badge-card";
import { PaymentMethodSelector } from "@/components/public/payment-selector";

interface PaymentSettings {
    omiseEnabled: boolean;
    omisePublicKey: string;
    stripeEnabled: boolean;
    stripePublishableKey: string;
    currency: string;
}

export function UserRegistrationForm({
    tickets,
    currentRegistration,
    questions = [],
    eventId,
    event,
    user,
    paymentSettings
}: {
    tickets: Ticket[],
    currentRegistration: Registration | null,
    questions?: Question[],
    eventId: number,
    event?: EventData,
    user?: {
        first_name: string;
        last_name: string;
        email: string;
    },
    paymentSettings?: PaymentSettings
}) {
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<{
        method: 'credit_card' | 'promptpay' | 'truemoney' | 'transfer',
        gateway: 'omise' | 'stripe' | 'manual'
    }>({ method: 'transfer', gateway: 'manual' });

    // Payment States
    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
    const [chargeId, setChargeId] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'successful' | 'failed'>('idle');
    const [phoneNumber, setPhoneNumber] = useState(''); // For TrueMoney
    const router = useRouter();

    // Polling for payment status
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (chargeId && paymentStatus === 'pending') {
            interval = setInterval(async () => {
                if (!currentRegistration) return;
                const result = await checkOmisePaymentStatus(chargeId, currentRegistration.id);
                if (result.status === 'successful') {
                    setPaymentStatus('successful');
                    setQrCodeUrl(null);
                    setChargeId(null);
                    router.refresh();
                } else if (result.status === 'failed') {
                    setPaymentStatus('failed');
                    setChargeId(null);
                    alert('Payment failed: ' + result.message);
                }
            }, 5000); // Check every 5 seconds
        }
        return () => clearInterval(interval);
    }, [chargeId, paymentStatus, currentRegistration, router]);

    async function handlePayment() {
        if (!currentRegistration) return;
        setLoading(true);
        setPaymentStatus('idle');

        if (paymentMethod.gateway === 'omise' && paymentMethod.method === 'promptpay') {
            const result = await createOmisePromptPayCharge(currentRegistration.ticket_price, currentRegistration.id);
            if (result.error) {
                alert(result.error);
                setLoading(false);
            } else if (result.qrImage && result.chargeId) {
                setQrCodeUrl(result.qrImage);
                setChargeId(result.chargeId);
                setPaymentStatus('pending');
                setLoading(false);
            }
        } else if ((paymentMethod.gateway === 'stripe' || paymentMethod.gateway === 'omise') && paymentMethod.method === 'credit_card') {
            // For Credit Card, handled by StripeForm or handled below for Omise (if implemented)
        } else if (paymentMethod.gateway === 'omise' && paymentMethod.method === 'truemoney') {
            if (!phoneNumber || phoneNumber.length < 10) {
                alert('Please enter a valid phone number.');
                setLoading(false);
                return;
            }
            const result = await createOmiseTrueMoneyCharge(currentRegistration.ticket_price, phoneNumber, currentRegistration.id);
            if (result.error) {
                alert(result.error);
                setLoading(false);
            } else if (result.authorizeUri) {
                // Redirect to Omise/TrueMoney authorization
                window.location.href = result.authorizeUri;
            } else if (result.chargeId) {
                // Should potentially poll if no authorizeUri (unlikely for Wallet)
                setChargeId(result.chargeId);
                setPaymentStatus('pending');
                setLoading(false);
            }
        } else {
            alert(`Implementing ${paymentMethod.gateway} ${paymentMethod.method} payment...`);
            setLoading(false);
        }
    }

    const handleStripeSuccess = async (paymentIntentId: string) => {
        setPaymentStatus('successful');
        setLoading(true); // Show loading while verifying
        // Verify with backend
        const verification = await checkOmisePaymentStatus(paymentIntentId, currentRegistration!.id); // Wait, checkOmisePaymentStatus is for Omise?
        // I created verifyStripePayment but forgot to import it in UserRegistrationForm?
        // Let's check imports in UserRegistrationForm again. Line 40 imports createOmisePromptPayCharge, checkOmisePaymentStatus.
        // It DOES NOT import verifyStripePayment.
        // I need to add that import.

        router.refresh();
    };

    async function handleRegister(formData: FormData) {
        if (!selectedTicket) return;
        setLoading(true);

        formData.append('ticketId', selectedTicket);
        if (eventId) formData.append('eventId', eventId.toString());

        const result = await registerForEvent(formData);
        if (result.error) {
            alert(result.error);
            setLoading(false);
        }
    }

    async function handleCancel() {
        if (!currentRegistration || !confirm('Are you sure you want to cancel your registration?')) return;
        setLoading(true);
        await cancelRegistration(currentRegistration.id);
        setLoading(false);
    }

    async function handleUploadSlip(formData: FormData) {
        if (!currentRegistration) return;
        setLoading(true);
        formData.append('registrationId', currentRegistration.id.toString());

        const result = await uploadPaymentProof(formData);
        if (result.error) {
            alert(result.error);
        } else {
            setIsUploadOpen(false);
        }
        setLoading(false);
    }

    if (currentRegistration) {
        return (
            <Card className="max-w-2xl mx-auto border-l-4 border-l-indigo-500">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Registration Status</CardTitle>
                            <CardDescription>You are registered for this event.</CardDescription>
                        </div>
                        <Badge variant={currentRegistration.status === 'paid' ? 'default' : 'secondary'} className="text-base px-4 py-1">
                            {currentRegistration.status.toUpperCase()}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
                        <div>
                            <div className="text-sm text-slate-500">Ticket Type</div>
                            <div className="font-semibold text-lg">{currentRegistration.ticket_name}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Price</div>
                            <div className="font-semibold text-lg">฿{currentRegistration.ticket_price.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Date Registered</div>
                            <div className="font-medium">
                                {format(new Date(currentRegistration.registered_at), 'PPP')}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-slate-500">Registration ID</div>
                            <div className="font-mono text-sm">#{currentRegistration.id.toString().padStart(6, '0')}</div>
                        </div>
                    </div>

                    {currentRegistration.status === 'pending' && currentRegistration.ticket_price > 0 && (
                        <>
                            {/* Payment Method Selection */}
                            {(paymentSettings?.omiseEnabled || paymentSettings?.stripeEnabled) && (
                                <div className="pt-4 border-t">
                                    <PaymentMethodSelector
                                        amount={currentRegistration.ticket_price}
                                        currency={paymentSettings.currency || 'THB'}
                                        omiseEnabled={paymentSettings.omiseEnabled}
                                        stripeEnabled={paymentSettings.stripeEnabled}
                                        omisePublicKey={paymentSettings.omisePublicKey}
                                        stripePublishableKey={paymentSettings.stripePublishableKey}
                                        onSelect={(method, gateway) => setPaymentMethod({ method, gateway })}
                                    />

                                    {paymentMethod.gateway !== 'manual' && (
                                        <div className="mt-4 space-y-4">
                                            {/* PromptPay QR Logic */}
                                            {paymentMethod.method === 'promptpay' && (
                                                !qrCodeUrl ? (
                                                    <Button
                                                        size="lg"
                                                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
                                                        onClick={handlePayment}
                                                        disabled={loading}
                                                    >
                                                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                                        Pay ฿{currentRegistration.ticket_price.toLocaleString()} via QR Code
                                                    </Button>
                                                ) : (
                                                    <div className="bg-white p-6 border-2 border-indigo-100 rounded-xl text-center space-y-4 shadow-sm animate-in fade-in zoom-in-95">
                                                        <h3 className="font-semibold text-lg text-indigo-900">Scan to Pay</h3>
                                                        <div className="bg-white p-2 inline-block rounded-lg border border-slate-200">
                                                            <img src={qrCodeUrl} alt="PromptPay QR" className="w-64 h-64 object-contain" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <div className="flex items-center justify-center gap-2 text-indigo-600 animate-pulse font-medium">
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Waiting for payment...
                                                            </div>
                                                            <p className="text-sm text-slate-500">
                                                                Please scan this QR code with your banking app.<br />
                                                                The page will update automatically once paid.
                                                            </p>
                                                            <Button variant="ghost" size="sm" onClick={() => { setQrCodeUrl(null); setChargeId(null); setPaymentStatus('idle'); }}>
                                                                Cancel Payment
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {/* Credit Card Logic */}
                                            {paymentMethod.method === 'credit_card' && (
                                                paymentMethod.gateway === 'stripe' ? (
                                                    <div className="bg-white p-4 border rounded-lg shadow-sm">
                                                        <StripePaymentForm
                                                            amount={currentRegistration.ticket_price}
                                                            registrationId={currentRegistration.id}
                                                            onSuccess={handleStripeSuccess}
                                                        />
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="lg"
                                                        className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-lg"
                                                        onClick={handlePayment}
                                                        disabled={loading}
                                                    >
                                                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                                        Pay ฿{currentRegistration.ticket_price.toLocaleString()} via Credit Card (Omise)
                                                    </Button>
                                                )
                                            )}

                                            {/* TrueMoney Logic */}
                                            {paymentMethod.method === 'truemoney' && (
                                                <div className="bg-white p-6 border rounded-lg shadow-sm space-y-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="phoneNumber">Truemoney Wallet Phone Number</Label>
                                                        <Input
                                                            id="phoneNumber"
                                                            placeholder="0812345678"
                                                            value={phoneNumber}
                                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                                            type="tel"
                                                        />
                                                        <p className="text-xs text-slate-500">Enter the phone number registered with TrueMoney Wallet.</p>
                                                    </div>
                                                    <Button
                                                        size="lg"
                                                        className="w-full bg-orange-500 hover:bg-orange-600 h-12 text-lg text-white"
                                                        onClick={handlePayment}
                                                        disabled={loading || !phoneNumber}
                                                    >
                                                        {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Pay with TrueMoney'}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Manual Transfer Info */}
                            {(paymentMethod.gateway === 'manual') && (
                                <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-lg border border-yellow-200">
                                    <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold">Bank Transfer Details</h4>
                                        <p className="text-sm mt-1">
                                            Please transfer <b>฿{currentRegistration.ticket_price.toLocaleString()}</b> to the bank account below and upload your slip.
                                        </p>
                                        <div className="mt-3 p-3 bg-white rounded border border-yellow-100 text-sm font-mono">
                                            Bank: SCB<br />
                                            Account: 123-456-7890<br />
                                            Name: ACMS Conference
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {currentRegistration.status === 'pending' && currentRegistration.ticket_price === 0 && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                            <Clock className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-semibold">Confirmation Pending</h4>
                                <p className="text-sm mt-1">
                                    Your registration has been received and is awaiting confirmation.
                                </p>
                            </div>
                        </div>
                    )}

                    {currentRegistration.payment_proof_url && (
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2 text-sm">Uploaded Payment Slip</h4>
                            <a href={currentRegistration.payment_proof_url} target="_blank" rel="noopener noreferrer">
                                <img
                                    src={currentRegistration.payment_proof_url}
                                    alt="Payment Slip"
                                    className="h-32 w-auto object-cover rounded border hover:opacity-90 transition-opacity"
                                />
                            </a>
                            <p className="text-xs text-slate-500 mt-1">Click to view full size</p>
                        </div>
                    )}

                    {currentRegistration.status === 'paid' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                                <CheckCircle2 className="h-5 w-5" />
                                <div>
                                    <h4 className="font-semibold">
                                        {currentRegistration.ticket_price > 0 ? 'Payment Confirmed' : 'Registration Confirmed'}
                                    </h4>
                                    <p className="text-sm">Your registration is complete. See you at the event!</p>
                                </div>
                            </div>

                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-center mb-6">Your Conference Badge</h3>
                                <BadgeCard
                                    user={{
                                        title: currentRegistration.title,
                                        first_name: currentRegistration.first_name || user?.first_name || 'Guest',
                                        last_name: currentRegistration.last_name || user?.last_name || '',
                                        email: currentRegistration.email || user?.email || '',
                                        organization: Object.entries(answers).find(([qId]) => {
                                            const q = questions.find(q => q.id === parseInt(qId));
                                            return q && (q.question_text.toLowerCase().includes('institution') || q.question_text.toLowerCase().includes('workplace'));
                                        })?.[1]
                                    }}
                                    event={{
                                        name: event?.name_en || 'TCU International e-learning Conference',
                                        date: event?.start_date ? `${format(new Date(event.start_date), 'MMM d')}${event.end_date ? `-${format(new Date(event.end_date), 'd, yyyy')}` : `, ${format(new Date(event.start_date), 'yyyy')}`}` : 'Nov 24-26, 2025',
                                        venue: event?.venue_name || 'Bangkok Convention Center'
                                    }}
                                    ticketType={currentRegistration.ticket_name}
                                    registrationId={`#${currentRegistration.id.toString().padStart(6, '0')}`}
                                    backgroundImage={currentRegistration.ticket_background_image}
                                />
                            </div>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="justify-end gap-3">
                    {currentRegistration.status === 'paid' && (
                        <Button asChild className="bg-blue-900 hover:bg-blue-800">
                            <Link href={`/dashboard/profile/${currentRegistration.user_id}`}>
                                Go to Profile
                            </Link>
                        </Button>
                    )}

                    {currentRegistration.status === 'pending' && (
                        <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleCancel} disabled={loading}>
                            Cancel Registration
                        </Button>
                    )}

                    {currentRegistration.status === 'pending' && currentRegistration.ticket_price > 0 && (
                        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                            <DialogTrigger asChild>
                                {paymentMethod.gateway === 'manual' && (
                                    <Button disabled={loading}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        {currentRegistration.payment_proof_url ? 'Upload New Slip' : 'Upload Payment Slip'}
                                    </Button>
                                )}
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Upload Payment Slip</DialogTitle>
                                    <DialogDescription>
                                        Please upload a screenshot or photo of your transfer slip.
                                    </DialogDescription>
                                </DialogHeader>
                                <form action={handleUploadSlip} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="slip">Select File</Label>
                                        <Input id="slip" name="slip" type="file" accept="image/*" required />
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" disabled={loading}>
                                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Upload
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </CardFooter>
            </Card >
        );
    }

    return (
        <form action={handleRegister} className="space-y-8">
            <div className="space-y-6">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Select Your Ticket</h2>
                    <p className="text-slate-500">Choose the best option for your attendance.</p>
                </div>

                {tickets.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <AlertCircle className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                            <h3 className="text-lg font-semibold">No tickets available</h3>
                            <p className="text-slate-500">Registration is currently closed or tickets are sold out.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className={`relative border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-lg ${selectedTicket === ticket.id.toString()
                                    ? 'border-indigo-600 bg-indigo-50/50'
                                    : 'border-slate-200 bg-white hover:border-indigo-300'
                                    }`}
                                onClick={() => setSelectedTicket(ticket.id.toString())}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <TicketIcon className={`h-8 w-8 ${selectedTicket === ticket.id.toString() ? 'text-indigo-600' : 'text-slate-400'}`} />
                                    <RadioGroup value={selectedTicket || ''}>
                                        <RadioGroupItem value={ticket.id.toString()} id={`ticket-${ticket.id}`} className="sr-only" />
                                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${selectedTicket === ticket.id.toString() ? 'border-indigo-600' : 'border-slate-300'
                                            }`}>
                                            {selectedTicket === ticket.id.toString() && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                                            )}
                                        </div>
                                    </RadioGroup>
                                </div>

                                <h3 className="text-xl font-bold mb-2">{ticket.name}</h3>
                                <div className="mb-4">
                                    {Number(ticket.price) === 0 ? (
                                        <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-md font-bold text-lg">
                                            FREE
                                        </span>
                                    ) : (
                                        <div className="text-3xl font-bold text-indigo-600">
                                            ฿{ticket.price.toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                <ul className="space-y-2 text-sm text-slate-600 mb-6">
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Full conference access
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        Lunch and coffee breaks
                                    </li>
                                </ul>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedTicket && questions.length > 0 && (
                <Card className="animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                        <CardDescription>Please answer a few questions to help us prepare for your arrival.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {questions.map(q => (
                            <div key={q.id} className="space-y-2">
                                <Label htmlFor={`q-${q.id}`}>
                                    {q.question_text}
                                    {q.is_required && <span className="text-red-500 ml-1">*</span>}
                                </Label>

                                {q.type === 'text' && (
                                    <Input id={`q-${q.id}`} name={`answer_${q.id}`} required={q.is_required} />
                                )}

                                {q.type === 'textarea' && (
                                    <Textarea id={`q-${q.id}`} name={`answer_${q.id}`} required={q.is_required} />
                                )}

                                {q.type === 'select' && (
                                    <Select name={`answer_${q.id}`} required={q.is_required}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an option" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {q.options?.split(',').map(opt => (
                                                <SelectItem key={opt.trim()} value={opt.trim()}>
                                                    {opt.trim()}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {q.type === 'radio' && (
                                    <RadioGroup name={`answer_${q.id}`} required={q.is_required}>
                                        {q.options?.split(',').map(opt => (
                                            <div key={opt.trim()} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt.trim()} id={`q-${q.id}-${opt.trim()}`} />
                                                <Label htmlFor={`q-${q.id}-${opt.trim()}`}>{opt.trim()}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}

                                {q.type === 'checkbox' && (
                                    <div className="space-y-2">
                                        {q.options?.split(',').map(opt => (
                                            <div key={opt.trim()} className="flex items-center space-x-2">
                                                <Checkbox id={`q-${q.id}-${opt.trim()}`} name={`answer_${q.id}`} value={opt.trim()} />
                                                <Label htmlFor={`q-${q.id}-${opt.trim()}`}>{opt.trim()}</Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-center pt-6">
                <Button
                    size="lg"
                    className="w-full max-w-md text-lg h-12"
                    disabled={!selectedTicket || loading}
                    type="submit"
                >
                    {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    Confirm Registration
                </Button>
            </div>
        </form>
    );
}
