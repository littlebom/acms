'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { generateRagContext } from '@/app/actions/chatbot';
import { toast } from 'sonner';
import { BrainCircuit, Database, RefreshCw, CheckCircle2, Clock, AlertCircle, CalendarDays, Mic, CalendarClock, HelpCircle, Newspaper, Building2 } from 'lucide-react';
import { format } from 'date-fns';

interface ChatbotRagPanelProps {
    initialContext: string;
    initialUpdatedAt?: string;
}

export function ChatbotRagPanel({ initialContext, initialUpdatedAt }: ChatbotRagPanelProps) {
    const [context, setContext] = useState(initialContext);
    const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleGenerate = async () => {
        setLoading(true);
        setStatus('idle');
        const result = await generateRagContext();
        setLoading(false);
        if (result.success && result.context) {
            setContext(result.context);
            setUpdatedAt(new Date().toISOString());
            setStatus('success');
            toast.success('RAG context generated successfully');
        } else {
            setStatus('error');
            toast.error(result.error || 'Failed to generate context');
        }
    };

    const lineCount = context ? context.split('\n').length : 0;
    const charCount = context ? context.length : 0;

    return (
        <div className="space-y-6">
            {/* Status Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-base flex items-center gap-2">
                                <BrainCircuit className="h-5 w-5 text-indigo-600" />
                                Knowledge Context
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Pre-computed data snapshot that the AI uses to answer questions.
                                Re-generate after updating event info, speakers, schedule, or FAQs.
                            </CardDescription>
                        </div>
                        <Button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 shrink-0"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            {loading ? 'Generating...' : 'Generate Context'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Info Row */}
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        {updatedAt ? (
                            <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                Last generated:{' '}
                                <span className="font-medium">
                                    {format(new Date(updatedAt), 'MMM d, yyyy HH:mm')}
                                </span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-sm text-amber-600">
                                <AlertCircle className="h-3.5 w-3.5" />
                                Context not generated yet
                            </div>
                        )}

                        {context && (
                            <div className="flex items-center gap-2 ml-auto">
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {lineCount} lines
                                </Badge>
                                <Badge variant="secondary" className="text-xs font-normal">
                                    {charCount.toLocaleString()} chars
                                </Badge>
                                {status === 'success' && (
                                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs font-normal gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Updated
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Context Preview */}
                    {context ? (
                        <textarea
                            readOnly
                            value={context}
                            rows={20}
                            className="w-full font-mono text-xs bg-slate-950 text-slate-200 p-4 rounded-lg border border-slate-800 resize-none focus:outline-none leading-relaxed"
                        />
                    ) : (
                        <div className="h-48 bg-slate-50 rounded-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-3">
                            <Database className="h-10 w-10 opacity-30" />
                            <div className="text-center">
                                <p className="text-sm font-medium">No context generated yet</p>
                                <p className="text-xs mt-1">Click &ldquo;Generate Context&rdquo; to build the knowledge base from your database.</p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* What's Included */}
            <Card className="bg-slate-50">
                <CardHeader>
                    <CardTitle className="text-sm text-slate-700">What data is included in the context?</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                            { icon: CalendarDays, label: 'Event Info', desc: 'Name, dates, venue, deadlines', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
                            { icon: Mic, label: 'Speakers', desc: 'Name, title, organization, bio', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
                            { icon: CalendarClock, label: 'Schedule', desc: 'Sessions, rooms, timings', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
                            { icon: HelpCircle, label: 'FAQs', desc: 'All active Q&A pairs', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
                            { icon: Newspaper, label: 'News', desc: 'Latest 5 published articles', iconBg: 'bg-sky-100', iconColor: 'text-sky-600' },
                            { icon: Building2, label: 'Sponsors', desc: 'Sponsor names list', iconBg: 'bg-rose-100', iconColor: 'text-rose-600' },
                        ].map(item => (
                            <div key={item.label} className="flex items-start gap-2.5 p-3 bg-white rounded-lg border border-slate-200">
                                <div className={`p-2 rounded-full shrink-0 ${item.iconBg}`}>
                                    <item.icon className={`h-4 w-4 ${item.iconColor}`} />
                                </div>
                                <div className="pt-1">
                                    <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                                    <p className="text-xs text-slate-500">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
