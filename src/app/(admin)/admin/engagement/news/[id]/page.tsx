
import { NewsForm } from "@/components/admin/engagement/news-form";
import { getNewsById } from "@/app/actions/news";
import { notFound } from "next/navigation";

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const { news, error } = await getNewsById(parseInt(id));

    if (error || !news) {
        notFound();
    }

    return <NewsForm initialData={news} isEditing={true} />;
}
