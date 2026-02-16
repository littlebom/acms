import { getPageBySlug } from "@/app/actions/website";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const page = await getPageBySlug(slug);

    if (!page) {
        return { title: 'Page Not Found' };
    }

    return {
        title: page.meta_title || page.title_en,
        description: page.meta_description || page.excerpt_en || undefined,
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { slug } = await params;

    // Reserved slugs that should not be handled by this catch-all
    const reservedSlugs = ['admin', 'dashboard', 'login', 'register', 'api', 'auth'];
    if (reservedSlugs.includes(slug)) {
        notFound();
    }

    const page = await getPageBySlug(slug);

    if (!page) {
        notFound();
    }

    // Get the appropriate language content (could be enhanced with locale detection)
    const title = page.title_en;
    const content = page.content_en;

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            {page.featured_image && (
                <div
                    className="relative h-64 md:h-80 bg-cover bg-center"
                    style={{ backgroundImage: `url(${page.featured_image})` }}
                >
                    <div className="absolute inset-0 bg-black/50" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white text-center px-4">
                            {title}
                        </h1>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className={`container mx-auto px-4 py-12 ${page.template === 'full-width' ? 'max-w-none' : 'max-w-4xl'}`}>
                {!page.featured_image && (
                    <h1 className="text-4xl font-bold mb-8 text-center">{title}</h1>
                )}

                {content && (
                    <div
                        className="prose prose-lg max-w-none"
                        dangerouslySetInnerHTML={{ __html: content }}
                    />
                )}
            </div>
        </div>
    );
}
