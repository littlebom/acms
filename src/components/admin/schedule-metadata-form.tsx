'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Loader2, Save, ArrowLeft, Layout, CheckCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createSchedule, updateSchedule, type Schedule } from "@/app/actions/schedule";
import { type EventData } from "@/app/actions/events";

interface ScheduleMetadataFormProps {
    initialData?: Schedule | null;
    events: EventData[];
}

function SubmitButton({ isCreate }: { isCreate: boolean }) {
    const { pending } = useFormStatus();
    return (
        <Button disabled={pending} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm min-w-[140px]">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isCreate ? 'Creating...' : 'Saving...'}
                </>
            ) : (
                <>
                    <Save className="mr-2 h-4 w-4" />
                    {isCreate ? 'Create Schedule' : 'Save Changes'}
                </>
            )}
        </Button>
    );
}

export function ScheduleMetadataForm({ initialData, events }: ScheduleMetadataFormProps) {
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const router = useRouter();
    const isCreate = !initialData?.id;

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        let result;

        if (initialData) {
            formData.append('id', initialData.id.toString());
            result = await updateSchedule(formData);
        } else {
            result = await createSchedule(formData);
        }

        if (result.error) {
            setMessage({ type: 'error', text: result.error });
        } else {
            if (isCreate) {
                router.push('/admin/conference/schedule');
                router.refresh();
            } else {
                setMessage({ type: 'success', text: 'Schedule details updated successfully!' });
                // Force redirect after short delay or immediately? User asked to link back.
                // Immediate redirect is better if requested explicitly.
                router.push('/admin/conference/schedule');
                router.refresh();
            }
        }
    }

    return (
        <div className="max-w-7xl mx-auto pb-16">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-8 pt-2">
                <div className="flex items-center gap-4">
                    <Link href="/admin/conference/schedule">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-500 hover:text-slate-900 rounded-full hover:bg-slate-100/80">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                                {isCreate ? 'New Schedule' : initialData?.title || 'Untitled Schedule'}
                            </h1>
                            {!isCreate && initialData && (
                                <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                                    ID: #{initialData.id}
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            {isCreate ? 'Create a new schedule for an event.' : `Manage schedule details and configurations.`}
                        </p>
                    </div>
                </div>
            </div>

            <form action={handleSubmit}>
                <div className="space-y-8">

                    {/* Schedule Details Card */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                                <Layout className="h-4 w-4" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-800">Schedule Details</h2>
                        </div>

                        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title" className="text-slate-700 font-medium">Schedule Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        defaultValue={initialData?.title}
                                        required
                                        className="text-lg py-5"
                                        placeholder="e.g. Main Conference Schedule"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-slate-700 font-medium">Description</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        defaultValue={initialData?.description || ''}
                                        placeholder="Brief description of this schedule..."
                                        className="min-h-[120px] resize-none leading-relaxed"
                                    />
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <Label htmlFor="event" className="text-slate-700 font-medium">Associated Event</Label>
                                    <Select name="event_id" defaultValue={initialData?.event_id?.toString() || ''} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an event" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {events.map(event => (
                                                <SelectItem key={event.id} value={event.id.toString()}>
                                                    {event.title}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-slate-500">
                                        This determines the available speakers pool and links the schedule to the specific event.
                                    </p>
                                </div>

                                <div className="pt-4 flex justify-end gap-2">
                                    <Link href="/admin/conference/schedule">
                                        <Button type="button" variant="outline">
                                            Cancel
                                        </Button>
                                    </Link>
                                    <SubmitButton isCreate={isCreate} />
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {message && (
                    <div className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-xl z-50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${message.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}`}>
                        {message.type === 'success' ? <CheckCircle className="h-5 w-5 text-green-400" /> : <Loader2 className="h-5 w-5" />}
                        <div>
                            <p className="font-semibold">{message.type === 'success' ? 'Saved Successfully' : 'Error'}</p>
                            <p className="text-xs opacity-90">{message.text}</p>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
