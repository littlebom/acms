import { redirect } from 'next/navigation';

export default function EditPageRedirect({ params }: { params: { id: string } }) {
    redirect(`/admin/website/builder/${params.id}`);
}
