'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Plus,
    MoreVertical,
    Trash2,
    Loader2,
    FileText,
    ExternalLink,
    Pencil
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createQuestionnaire, deleteQuestionnaire, updateQuestionnaire, type Questionnaire } from "@/app/actions/questions";
import { Badge } from "@/components/ui/badge";

function QuestionnaireForm({
    category,
    questionnaire,
    onClose
}: {
    category: string,
    questionnaire?: Questionnaire | null,
    onClose: () => void
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('category', category);

        try {
            if (questionnaire) {
                await updateQuestionnaire(questionnaire.id, formData);
            } else {
                await createQuestionnaire(formData);
            }
            router.refresh();
            onClose();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={questionnaire?.title || ''}
                    placeholder="e.g. General Registration Form"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    defaultValue={questionnaire?.description || ''}
                    placeholder="Brief description of this questionnaire..."
                />
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {questionnaire ? 'Update Questionnaire' : 'Create Questionnaire'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function QuestionnaireList({ questionnaires }: { questionnaires: Questionnaire[] }) {
    const router = useRouter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('pre-event');
    const [deleteTarget, setDeleteTarget] = useState<Questionnaire | null>(null);
    const [editTarget, setEditTarget] = useState<Questionnaire | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const filteredQuestionnaires = questionnaires.filter(q => q.category === activeTab);

    async function handleDelete() {
        if (!deleteTarget) return;

        setIsDeleting(true);
        try {
            await deleteQuestionnaire(deleteTarget.id);
            router.refresh();
        } catch (error) {
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
            setDeleteTarget(null);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Questionnaires</h2>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Questionnaire
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Create New Questionnaire</DialogTitle>
                            <DialogDescription>
                                Create a form for {activeTab === 'pre-event' ? 'registration' : 'feedback'}.
                            </DialogDescription>
                        </DialogHeader>
                        <QuestionnaireForm
                            category={activeTab}
                            onClose={() => setIsCreateOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="pre-event">Pre-Event (Registration)</TabsTrigger>
                    <TabsTrigger value="post-event">Post-Event (Feedback)</TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="space-y-4">
                    {filteredQuestionnaires.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-slate-50 text-slate-500">
                            <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                            <p>No questionnaires created yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredQuestionnaires.map(q => (
                                <div key={q.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditTarget(q)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600"
                                                    onClick={() => setDeleteTarget(q)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="mb-4">
                                        <h3 className="font-semibold text-lg truncate pr-6">{q.title}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 h-10">
                                            {q.description || 'No description'}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                        <Badge variant="secondary">
                                            {q.questions_count} Questions
                                        </Badge>
                                        <Link href={`/admin/questions/${q.id}`}>
                                            <Button size="sm" variant="outline">
                                                Manage Questions
                                                <ExternalLink className="ml-2 h-3 w-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Questionnaire</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{deleteTarget?.title}"?
                            All questions inside will be permanently deleted. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Edit Dialog */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Questionnaire</DialogTitle>
                        <DialogDescription>
                            Update the questionnaire details.
                        </DialogDescription>
                    </DialogHeader>
                    {editTarget && (
                        <QuestionnaireForm
                            category={editTarget.category}
                            questionnaire={editTarget}
                            onClose={() => setEditTarget(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

