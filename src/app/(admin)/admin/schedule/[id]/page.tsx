import { redirect } from 'next/navigation';

type Props = {
    params: Promise<{ id: string }>;
};

export default async function ScheduleItemRedirect({ params }: Props) {
    const { id } = await params;
    redirect(`/admin/conference/schedule/${id}`);
}
