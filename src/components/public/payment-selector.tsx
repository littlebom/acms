'use client';

import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { loadStripe } from "@stripe/stripe-js";
import Script from 'next/script';

export type PaymentMethodType = 'credit_card' | 'promptpay' | 'truemoney' | 'transfer';

interface PaymentMethodSelectorProps {
    amount: number;
    currency: string;
    omiseEnabled: boolean;
    stripeEnabled: boolean;
    omisePublicKey?: string;
    stripePublishableKey?: string;
    onSelect: (method: PaymentMethodType, gateway: 'omise' | 'stripe' | 'manual') => void;
}

export function PaymentMethodSelector({
    amount,
    currency,
    omiseEnabled,
    stripeEnabled,
    omisePublicKey,
    stripePublishableKey,
    onSelect
}: PaymentMethodSelectorProps) {

    // Default to 'transfer' if no gateway, otherwise select first available
    const [selected, setSelected] = useState<PaymentMethodType>(
        omiseEnabled ? 'promptpay' : stripeEnabled ? 'credit_card' : 'transfer'
    );

    // Initial selection
    useEffect(() => {
        handleSelect(selected);
    }, []);

    const handleSelect = (method: PaymentMethodType) => {
        setSelected(method);
        let gateway: 'omise' | 'stripe' | 'manual' = 'manual';

        if (method === 'promptpay' || method === 'truemoney') {
            gateway = 'omise';
        } else if (method === 'credit_card') {
            // Prefer Stripe for cards if available, else Omise, else manual?
            // Usually if both are active: card->stripe, qr->omise
            if (stripeEnabled) gateway = 'stripe';
            else if (omiseEnabled) gateway = 'omise';
        }

        onSelect(method, gateway);
    };

    return (
        <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-indigo-600" />
                Select Payment Method
            </h3>

            <RadioGroup value={selected} onValueChange={(val) => handleSelect(val as PaymentMethodType)} className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* 1. PromptPay (Omise) */}
                {omiseEnabled && (
                    <div className={`relative flex items-center space-x-2 border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-50 ${selected === 'promptpay' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200'}`}>
                        <RadioGroupItem value="promptpay" id="promptpay" className="sr-only" />
                        <Label htmlFor="promptpay" className="flex items-center gap-3 cursor-pointer w-full">
                            <div className="h-10 w-10 bg-blue-900 rounded-md flex items-center justify-center flex-shrink-0 text-white font-bold text-xs">
                                QR
                            </div>
                            <div>
                                <div className="font-semibold">Thai QR / PromptPay</div>
                                <div className="text-xs text-slate-500">Instant confirmation via banking app</div>
                            </div>
                        </Label>
                    </div>
                )}

                {/* 2. Credit Card (Stripe or Omise) */}
                {(stripeEnabled || omiseEnabled) && (
                    <div className={`relative flex items-center space-x-2 border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-50 ${selected === 'credit_card' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200'}`}>
                        <RadioGroupItem value="credit_card" id="credit_card" className="sr-only" />
                        <Label htmlFor="credit_card" className="flex items-center gap-3 cursor-pointer w-full">
                            <div className="h-10 w-10 bg-indigo-100 rounded-md flex items-center justify-center flex-shrink-0">
                                <CreditCard className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <div className="font-semibold">Credit/Debit Card</div>
                                <div className="text-xs text-slate-500">Visa, Mastercard, JCB</div>
                            </div>
                        </Label>
                    </div>
                )}

                {/* 3. TrueMoney (Omise) */}
                {omiseEnabled && (
                    <div className={`relative flex items-center space-x-2 border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-50 ${selected === 'truemoney' ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200'}`}>
                        <RadioGroupItem value="truemoney" id="truemoney" className="sr-only" />
                        <Label htmlFor="truemoney" className="flex items-center gap-3 cursor-pointer w-full">
                            <div className="h-10 w-10 bg-orange-500 rounded-md flex items-center justify-center flex-shrink-0 text-white font-bold text-[10px]">
                                True
                            </div>
                            <div>
                                <div className="font-semibold">TrueMoney Wallet</div>
                                <div className="text-xs text-slate-500">Pay via TrueMoney app</div>
                            </div>
                        </Label>
                    </div>
                )}

                {/* 4. Manual Transfer (Always backup) */}
                <div className={`relative flex items-center space-x-2 border-2 rounded-lg p-4 cursor-pointer transition-all hover:bg-slate-50 ${selected === 'transfer' ? 'border-indigo-600 bg-indigo-50/30' : 'border-slate-200'}`}>
                    <RadioGroupItem value="transfer" id="transfer" className="sr-only" />
                    <Label htmlFor="transfer" className="flex items-center gap-3 cursor-pointer w-full">
                        <div className="h-10 w-10 bg-slate-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-6 w-6 text-slate-600" />
                        </div>
                        <div>
                            <div className="font-semibold">Bank Transfer</div>
                            <div className="text-xs text-slate-500">Upload slip manually confirmation</div>
                        </div>
                    </Label>
                </div>

            </RadioGroup>

            {selected === 'promptpay' && (
                <div className="bg-blue-50 text-blue-800 text-sm p-4 rounded-lg flex gap-2 items-start">
                    <Smartphone className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <strong>How it works:</strong> A QR code will be generated on the next screen. Scan it with your Thai banking app (KPlus, SCB Easy, etc.) to pay instantly.
                    </div>
                </div>
            )}

            {selected === 'credit_card' && (
                <div className="bg-indigo-50 text-indigo-800 text-sm p-4 rounded-lg flex gap-2 items-start">
                    <CreditCard className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                        <strong>Secure Payment:</strong> Enter your card details securely.
                        {stripeEnabled ? ' Powered by Stripe.' : ' Powered by Omise.'}
                    </div>
                </div>
            )}
        </div>
    );
}
