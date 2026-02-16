import { notFound } from 'next/navigation';
import { getSpeakerDetails } from '@/app/actions/speakers';
import { SpeakerEditForm } from '@/components/admin/speaker-edit-form';

export const metadata = {
    title: 'Edit Speaker',
};

export default async function EditSpeakerPage({
    params
}: {
    params: Promise<{ groupId: string; userId: string }>
}) {
    const { groupId, userId } = await params;

    const speaker = await getSpeakerDetails(parseInt(userId), parseInt(groupId));

    if (!speaker) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10 max-w-6xl">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Edit Speaker Details</h1>
            <p className="text-slate-500 mb-8">Update profile information for this speaker.</p>

            <SpeakerEditForm
                speaker={speaker}
                groupId={parseInt(groupId)}
            />
        </div>
    );
}
