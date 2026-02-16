'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft } from 'lucide-react';
import { updateSpeakerGroup, type SpeakerGroup } from '@/app/actions/speakers';

export function SpeakerGroupEditForm({ group }: { group: SpeakerGroup }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('id', group.id.toString());

        const result = await updateSpeakerGroup(formData);

        setLoading(false);
        if (result.error) {
            alert(result.error);
        } else {
            router.push('/admin/speakers');
            router.refresh();
        }
    }

    return (
        <div className="space-y-6">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="mb-4"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <form action={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg border border-slate-200 shadow-sm">
                <div className="space-y-2">
                    <Label htmlFor="name">Speaker List Name *</Label>
                    <Input
                        id="name"
                        name="name"
                        defaultValue={group.name}
                        required
                        placeholder="e.g., Keynote Speakers"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        defaultValue={group.description || ''}
                        placeholder="Brief description of this speaker group..."
                        rows={4}
                    />
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}
