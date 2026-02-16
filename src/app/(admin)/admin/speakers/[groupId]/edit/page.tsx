import { notFound } from 'next/navigation';
import { getSpeakerGroup } from '@/app/actions/speakers';
import { SpeakerGroupEditForm } from '@/components/admin/speaker-group-edit-form';

export default async function EditSpeakerGroupPage({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId } = await params;
    const group = await getSpeakerGroup(parseInt(groupId));

    if (!group) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Edit Speaker List</h1>
                <p className="text-slate-500 mt-2">Update the details of this speaker list.</p>
            </div>

            <SpeakerGroupEditForm group={group} />
        </div>
    );
}
