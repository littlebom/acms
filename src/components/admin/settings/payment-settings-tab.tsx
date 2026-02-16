'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Eye, EyeOff, DollarSign, ShieldCheck } from 'lucide-react';
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentSettingsTabProps {
    settings: any;
    setSettings: (settings: any) => void;
}

export function PaymentSettingsTab({ settings, setSettings }: PaymentSettingsTabProps) {
    const [showOmiseSecret, setShowOmiseSecret] = useState(false);
    const [showStripeSecret, setShowStripeSecret] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Omise Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle>Omise Payment Gateway</CardTitle>
                                <CardDescription className="mt-1">
                                    Best for Thailand - PromptPay, TrueMoney, Thai Credit Cards
                                </CardDescription>
                            </div>
                        </div>
                        <Switch
                            checked={settings.omiseEnabled || false}
                            onCheckedChange={(checked) => setSettings({ ...settings, omiseEnabled: checked })}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings.omiseEnabled && (
                        <>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="omisePublicKey">Public Key</Label>
                                    <Input
                                        id="omisePublicKey"
                                        value={settings.omisePublicKey || ''}
                                        onChange={(e) => setSettings({ ...settings, omisePublicKey: e.target.value })}
                                        placeholder="pkey_test_xxxxxxxxxxxxx"
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Starts with <code className="bg-slate-100 px-1 rounded">pkey_</code> (used in frontend)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="omiseSecretKey">Secret Key</Label>
                                    <div className="relative">
                                        <Input
                                            id="omiseSecretKey"
                                            type={showOmiseSecret ? "text" : "password"}
                                            value={settings.omiseSecretKey || ''}
                                            onChange={(e) => setSettings({ ...settings, omiseSecretKey: e.target.value })}
                                            placeholder="skey_test_xxxxxxxxxxxxx"
                                            className="font-mono text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOmiseSecret(!showOmiseSecret)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showOmiseSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Starts with <code className="bg-slate-100 px-1 rounded">skey_</code> (keep private!)
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                <h5 className="font-medium text-blue-800 text-sm mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Omise Setup Guide
                                </h5>
                                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                                    <li>Sign up at <a href="https://dashboard.omise.co/signup" target="_blank" rel="noopener" className="text-blue-600 hover:underline font-medium">Omise Dashboard</a></li>
                                    <li>Get your API keys from Settings → Keys</li>
                                    <li>Use <strong>Test keys</strong> for development (pkey_test_*, skey_test_*)</li>
                                    <li>Use <strong>Live keys</strong> for production (pkey_*, skey_*)</li>
                                    <li>Fee: 2.65% + ฿10 per transaction</li>
                                    <li>Supports: PromptPay, TrueMoney, Credit Cards, Internet Banking</li>
                                </ul>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Stripe Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <CardTitle>Stripe Payment Gateway</CardTitle>
                                <CardDescription className="mt-1">
                                    Best for International - Credit Cards, Apple Pay, Google Pay
                                </CardDescription>
                            </div>
                        </div>
                        <Switch
                            checked={settings.stripeEnabled || false}
                            onCheckedChange={(checked) => setSettings({ ...settings, stripeEnabled: checked })}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {settings.stripeEnabled && (
                        <>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="stripePublishableKey">Publishable Key</Label>
                                    <Input
                                        id="stripePublishableKey"
                                        value={settings.stripePublishableKey || ''}
                                        onChange={(e) => setSettings({ ...settings, stripePublishableKey: e.target.value })}
                                        placeholder="pk_test_xxxxxxxxxxxxx"
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-slate-500">
                                        Starts with <code className="bg-slate-100 px-1 rounded">pk_</code> (used in frontend)
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="stripeSecretKey">Secret Key</Label>
                                    <div className="relative">
                                        <Input
                                            id="stripeSecretKey"
                                            type={showStripeSecret ? "text" : "password"}
                                            value={settings.stripeSecretKey || ''}
                                            onChange={(e) => setSettings({ ...settings, stripeSecretKey: e.target.value })}
                                            placeholder="sk_test_xxxxxxxxxxxxx"
                                            className="font-mono text-sm pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowStripeSecret(!showStripeSecret)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showStripeSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Starts with <code className="bg-slate-100 px-1 rounded">sk_</code> (keep private!)
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
                                <h5 className="font-medium text-purple-800 text-sm mb-2 flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Stripe Setup Guide
                                </h5>
                                <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
                                    <li>Sign up at <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener" className="text-purple-600 hover:underline font-medium">Stripe Dashboard</a></li>
                                    <li>Get your API keys from Developers → API keys</li>
                                    <li>Use <strong>Test keys</strong> for development (pk_test_*, sk_test_*)</li>
                                    <li>Use <strong>Live keys</strong> for production (pk_live_*, sk_live_*)</li>
                                    <li>Fee: 2.95% + $0.30 per transaction</li>
                                    <li>Supports: Credit Cards, Apple Pay, Google Pay, 135+ currencies</li>
                                </ul>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* General Payment Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        General Payment Settings
                    </CardTitle>
                    <CardDescription>
                        Configure default currency and payment behavior
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="paymentCurrency">Default Currency</Label>
                            <Select
                                value={settings.paymentCurrency || 'THB'}
                                onValueChange={(val) => setSettings({ ...settings, paymentCurrency: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="THB">THB (฿) - Thai Baht</SelectItem>
                                    <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                                    <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                                    <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                                    <SelectItem value="SGD">SGD (S$) - Singapore Dollar</SelectItem>
                                    <SelectItem value="MYR">MYR (RM) - Malaysian Ringgit</SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500">
                                This will be the primary currency for all transactions
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
                        <h5 className="font-medium text-amber-800 text-sm mb-2">⚠️ Important Security Notes</h5>
                        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                            <li><strong>Never share your secret keys</strong> publicly or in frontend code</li>
                            <li>Always use <strong>test keys</strong> during development</li>
                            <li>Switch to <strong>live keys</strong> only when ready for production</li>
                            <li>Store keys securely and rotate them periodically</li>
                            <li>Enable webhooks to receive payment status updates</li>
                        </ul>
                    </div>

                    {(settings.omiseEnabled || settings.stripeEnabled) && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                            <h5 className="font-medium text-green-800 text-sm mb-2">✅ Active Payment Gateways</h5>
                            <div className="flex gap-3">
                                {settings.omiseEnabled && (
                                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                                        Omise Active
                                    </div>
                                )}
                                {settings.stripeEnabled && (
                                    <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                                        <div className="h-2 w-2 bg-purple-600 rounded-full animate-pulse"></div>
                                        Stripe Active
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-green-600 mt-2">
                                Users will be able to choose their preferred payment method during checkout
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
