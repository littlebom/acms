import { getSpeakerGroup, getGroupMembers, getSpeakers } from "@/app/actions/speakers";
import { SpeakerGroupManager } from "@/components/admin/speaker-group-manager";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function SpeakerGroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
    const { groupId: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        notFound();
    }

    const group = await getSpeakerGroup(id);
    if (!group) {
        notFound();
    }

    const members = await getGroupMembers(id);
    const allUsers = await getSpeakers(); // Fetch all users to select from

    return (
        <SpeakerGroupManager
            group={group}
            members={members}
            allUsers={allUsers}
        />
    );
}
