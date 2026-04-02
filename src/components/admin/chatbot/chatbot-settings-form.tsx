'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Cpu, Eye, EyeOff, FileText, Save, Sparkles, Wand2 } from 'lucide-react';
import { saveChatbotSettings, type ChatbotSettings } from '@/app/actions/chatbot';
import { toast } from 'sonner';

interface ChatbotSettingsFormProps {
    initialSettings: ChatbotSettings;
}

export function ChatbotSettingsForm({ initialSettings }: ChatbotSettingsFormProps) {
    const [settings, setSettings] = useState<ChatbotSettings>(initialSettings);
    const [saving, setSaving] = useState(false);
    const [showGeminiKey, setShowGeminiKey] = useState(false);
    const [showOpenAIKey, setShowOpenAIKey] = useState(false);

    const update = (key: keyof ChatbotSettings, value: any) =>
        setSettings(prev => ({ ...prev, [key]: value }));

    const handleSave = async () => {
        setSaving(true);
        const result = await saveChatbotSettings(settings);
        setSaving(false);
        if (result.success) {
            toast.success('Chatbot settings saved successfully');
        } else {
            toast.error(result.error || 'Failed to save settings');
        }
    };

    return (
        <div className="space-y-6">
            {/* Chatbot Identity */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Bot className="h-5 w-5 text-slate-600" />
                        Chatbot Identity
                    </CardTitle>
                    <CardDescription>Customize how the chatbot appears to visitors.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="chatbot-name">Chatbot Name</Label>
                        <Input
                            id="chatbot-name"
                            placeholder="e.g. ACMS Assistant, Conference Helper"
                            value={settings.chatbot_name}
                            onChange={(e) => update('chatbot_name', e.target.value)}
                            maxLength={50}
                        />
                        <p className="text-xs text-slate-400">
                            Shown in the chat widget header. Preview: &ldquo;{settings.chatbot_name || 'AI Assistant'}&rdquo;
                        </p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                            <p className="text-sm font-medium text-slate-900">Enable Widget</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                {settings.chatbot_enabled ? 'Visible to all visitors' : 'Hidden from public site'}
                            </p>
                        </div>
                        <Switch
                            checked={settings.chatbot_enabled}
                            onCheckedChange={(v) => update('chatbot_enabled', v)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* AI Provider */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-violet-600" />
                        AI Provider
                    </CardTitle>
                    <CardDescription>Select which AI engine powers the chatbot responses.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {(
                        [
                            { value: 'rule_based', label: 'Rule-based (FAQ Only)', desc: 'Matches user questions to FAQ entries. No API key needed.' },
                            { value: 'gemini', label: 'Google Gemini', desc: 'Free tier available. Understands context from RAG data.' },
                            { value: 'openai', label: 'OpenAI (GPT)', desc: 'Highly capable. Requires paid API key.' },
                        ] as const
                    ).map(opt => (
                        <label
                            key={opt.value}
                            className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${settings.chatbot_provider === opt.value
                                ? 'border-primary bg-primary/5'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                                }`}
                        >
                            <input
                                type="radio"
                                name="provider"
                                value={opt.value}
                                checked={settings.chatbot_provider === opt.value}
                                onChange={() => update('chatbot_provider', opt.value)}
                                className="mt-1 accent-primary"
                            />
                            <div>
                                <p className="text-sm font-medium text-slate-900">{opt.label}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                            </div>
                        </label>
                    ))}
                </CardContent>
            </Card>

            {/* Gemini Config */}
            {settings.chatbot_provider === 'gemini' && (
                <Card className="border-blue-200">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-blue-500" />
                            Gemini Configuration
                        </CardTitle>
                        <CardDescription>
                            Get your free API key at{' '}
                            <span className="font-medium text-blue-600">aistudio.google.com</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="gemini-key">API Key</Label>
                            <div className="relative">
                                <Input
                                    id="gemini-key"
                                    type={showGeminiKey ? 'text' : 'password'}
                                    placeholder="AIza..."
                                    value={settings.chatbot_gemini_api_key}
                                    onChange={(e) => update('chatbot_gemini_api_key', e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowGeminiKey(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="gemini-model">Model</Label>
                            <Select
                                value={settings.chatbot_gemini_model}
                                onValueChange={(v) => update('chatbot_gemini_model', v)}
                            >
                                <SelectTrigger id="gemini-model">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gemini-2.0-flash">gemini-2.0-flash (Recommended — Free)</SelectItem>
                                    <SelectItem value="gemini-1.5-flash">gemini-1.5-flash (Fast — Free)</SelectItem>
                                    <SelectItem value="gemini-1.5-pro">gemini-1.5-pro (Powerful)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* OpenAI Config */}
            {settings.chatbot_provider === 'openai' && (
                <Card className="border-green-200">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Wand2 className="h-5 w-5 text-emerald-600" />
                            OpenAI Configuration
                        </CardTitle>
                        <CardDescription>
                            Get your API key at{' '}
                            <span className="font-medium text-green-600">platform.openai.com</span>
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="openai-key">API Key</Label>
                            <div className="relative">
                                <Input
                                    id="openai-key"
                                    type={showOpenAIKey ? 'text' : 'password'}
                                    placeholder="sk-..."
                                    value={settings.chatbot_openai_api_key}
                                    onChange={(e) => update('chatbot_openai_api_key', e.target.value)}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOpenAIKey(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="openai-model">Model</Label>
                            <Select
                                value={settings.chatbot_openai_model}
                                onValueChange={(v) => update('chatbot_openai_model', v)}
                            >
                                <SelectTrigger id="openai-model">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gpt-4o-mini">gpt-4o-mini (Recommended — Cheap & Fast)</SelectItem>
                                    <SelectItem value="gpt-4o">gpt-4o (Most Capable)</SelectItem>
                                    <SelectItem value="gpt-3.5-turbo">gpt-3.5-turbo (Legacy)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Custom System Prompt */}
            {settings.chatbot_provider !== 'rule_based' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-5 w-5 text-slate-500" />
                            Custom System Prompt
                        </CardTitle>
                        <CardDescription>
                            Override the default instructions given to the AI. Leave blank to use the default.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            rows={5}
                            placeholder="You are a helpful AI assistant for this conference..."
                            value={settings.chatbot_system_prompt}
                            onChange={(e) => update('chatbot_system_prompt', e.target.value)}
                            className="font-mono text-sm resize-none"
                        />
                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/90 px-8">
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Settings'}
                </Button>
            </div>
        </div>
    );
}
