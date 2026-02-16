'use client';

import { useState } from 'react';
import {
    Plus,
    MoreVertical,
    Pencil,
    Trash2,
    Loader2,
    List,
    ArrowLeft,
    BarChart3,
    Eye
} from 'lucide-react';
import Link from 'next/link';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { createQuestion, updateQuestion, deleteQuestion, type Question, type Questionnaire } from "@/app/actions/questions";
import { Badge } from "@/components/ui/badge";

const QUESTION_TYPES = [
    { value: 'text', label: 'Short Text' },
    { value: 'textarea', label: 'Long Text' },
    { value: 'select', label: 'Dropdown Select' },
    { value: 'radio', label: 'Radio Buttons' },
    { value: 'checkbox', label: 'Checkboxes' },
    { value: 'rating', label: 'Star Rating (1-5)' },
    { value: 'number', label: 'Number' },
];

function QuestionForm({
    question,
    questionnaireId,
    onClose
}: {
    question?: Question | null,
    questionnaireId: number,
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState(question?.type || 'text');

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        formData.append('questionnaire_id', questionnaireId.toString());
        try {
            if (question) {
                formData.append('id', question.id.toString());
                await updateQuestion(formData);
            } else {
                await createQuestion(formData);
            }
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const showOptions = ['select', 'radio', 'checkbox'].includes(type);

    return (
        <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="question_text">Question Text</Label>
                <Input
                    id="question_text"
                    name="question_text"
                    defaultValue={question?.question_text}
                    required
                    placeholder="e.g. What is your dietary restriction?"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Answer Type</Label>
                    <Select name="type" value={type} onValueChange={(v: any) => setType(v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                            {QUESTION_TYPES.map(t => (
                                <SelectItem key={t.value} value={t.value}>
                                    {t.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                    <Checkbox id="is_required" name="is_required" defaultChecked={question?.is_required} />
                    <Label htmlFor="is_required">Required Field</Label>
                </div>
            </div>

            {showOptions && (
                <div className="space-y-2">
                    <Label htmlFor="options">Options (Comma separated)</Label>
                    <Textarea
                        id="options"
                        name="options"
                        defaultValue={question?.options || ''}
                        placeholder="Option A, Option B, Option C"
                        rows={3}
                    />
                    <p className="text-xs text-slate-500">
                        Enter options separated by commas.
                    </p>
                </div>
            )}

            <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {question ? 'Update Question' : 'Create Question'}
                </Button>
            </DialogFooter>
        </form>
    );
}

export function QuestionEditor({
    questionnaire,
    questions
}: {
    questionnaire: Questionnaire,
    questions: Question[]
}) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

    async function handleDelete(id: number) {
        if (confirm('Are you sure you want to delete this question?')) {
            await deleteQuestion(id);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/questions">
                    <Button variant="outline" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold">{questionnaire.title}</h1>
                    <p className="text-muted-foreground">{questionnaire.description}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Questions</h2>
                <div className="flex gap-2">
                    <Link href={`/admin/questions/${questionnaire.id}/preview`}>
                        <Button variant="outline">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                        </Button>
                    </Link>
                    <Link href={`/admin/questions/${questionnaire.id}/results`}>
                        <Button variant="outline">
                            <BarChart3 className="mr-2 h-4 w-4" />
                            View Results
                        </Button>
                    </Link>
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Question
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                                <DialogTitle>Add New Question</DialogTitle>
                            </DialogHeader>
                            <QuestionForm
                                questionnaireId={questionnaire.id}
                                onClose={() => setIsCreateOpen(false)}
                            />
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {questions.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-slate-50 text-slate-500">
                    <List className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No questions in this questionnaire yet.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {questions.map((question, index) => (
                        <div key={question.id} className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow flex gap-4 items-start">
                            <div className="mt-1 bg-slate-100 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 font-mono text-sm">
                                {index + 1}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Badge variant="outline" className="text-xs">
                                                {QUESTION_TYPES.find(t => t.value === question.type)?.label}
                                            </Badge>
                                            {question.is_required && (
                                                <Badge variant="destructive" className="text-xs px-1.5 py-0">Required</Badge>
                                            )}
                                        </div>
                                        <h4 className="font-medium text-slate-900">{question.question_text}</h4>
                                        {question.options && (
                                            <p className="text-sm text-slate-500 mt-1">
                                                Options: {question.options}
                                            </p>
                                        )}
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="-mt-1">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setEditingQuestion(question)}>
                                                <Pencil className="mr-2 h-4 w-4" />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(question.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={!!editingQuestion} onOpenChange={(open) => !open && setEditingQuestion(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                    </DialogHeader>
                    {editingQuestion && (
                        <QuestionForm
                            question={editingQuestion}
                            questionnaireId={questionnaire.id}
                            onClose={() => setEditingQuestion(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
