import { Button } from "@/components/ui/button";
import { Plus, Search, MoreVertical, Pencil, Trash2, Globe } from "lucide-react";
import Link from "next/link";
import { getNews, deleteNews } from "@/app/actions/news";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const resolvedSearchParams = await searchParams;
    const query = resolvedSearchParams?.q || "";
    const { news, error } = await getNews(query);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">News & PR</h1>
                    <p className="text-slate-500 mt-2">Manage news, articles, and public relations content.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/engagement/news/new" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create News
                    </Link>
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex gap-4">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <form>
                            <Input
                                name="q"
                                placeholder="Search news..."
                                defaultValue={query}
                                className="pl-9 bg-white"
                            />
                        </form>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                                <TableHead className="w-[100px]">Image</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Published At</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {news && news.length > 0 ? (
                                news.map((item) => (
                                    <TableRow key={item.id} className="group">
                                        <TableCell>
                                            <div className="h-12 w-20 rounded-md bg-slate-100 overflow-hidden relative">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                        <Globe className="h-5 w-5" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-900">
                                            {item.title}
                                            {item.content && (
                                                <p className="text-sm text-slate-500 font-normal truncate max-w-[300px] mt-0.5">
                                                    {item.content.replace(/<[^>]*>?/gm, "")}
                                                </p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.is_published ? "default" : "secondary"} className={item.is_published ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100"}>
                                                {item.is_published ? "Published" : "Draft"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-slate-500">
                                            {format(new Date(item.created_at), "MMM d, yyyy")}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/engagement/news/${item.id}`} className="gap-2 cursor-pointer">
                                                            <Pencil className="h-4 w-4" /> Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <form action={async () => {
                                                        'use server';
                                                        await deleteNews(item.id);
                                                    }}>
                                                        <DropdownMenuItem className="text-red-600 focus:text-red-600 gap-2 cursor-pointer" asChild>
                                                            <button className="w-full flex items-center">
                                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                                            </button>
                                                        </DropdownMenuItem>
                                                    </form>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                                        No news found. Create one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
