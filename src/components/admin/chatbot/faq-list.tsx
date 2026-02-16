'use client';

import { useState } from 'react';
import { ChatbotFaq, saveFaq, deleteFaq, toggleFaqStatus, chatWithBot } from '@/app/actions/chatbot';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bot, Plus, Pencil, Trash2, Search, Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface FaqListProps {
    initialFaqs: ChatbotFaq[];
}

export function FaqList({ initialFaqs }: FaqListProps) {
    const [faqs, setFaqs] = useState(initialFaqs);
    const [search, setSearch] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<ChatbotFaq | null>(null);
    const [formData, setFormData] = useState({ question: '', answer: '' });

    // Test Chat State
    const [testInput, setTestInput] = useState('');
    const [testResponse, setTestResponse] = useState<string | null>(null);
    const [isTesting, setIsTesting] = useState(false);

    const filteredFaqs = faqs.filter(f =>
        f.question.toLowerCase().includes(search.toLowerCase()) ||
        f.answer.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (faq: ChatbotFaq) => {
        setEditingFaq(faq);
        setFormData({ question: faq.question, answer: faq.answer });
        setIsOpen(true);
    };

    const handleAddNew = () => {
        setEditingFaq(null);
        setFormData({ question: '', answer: '' });
        setIsOpen(true);
    };

    const handleSave = async () => {
        if (!formData.question || !formData.answer) return;

        const result = await saveFaq({
            id: editingFaq?.id,
            question: formData.question,
            answer: formData.answer,
            is_active: editingFaq ? editingFaq.is_active : true
        });

        if (result.success) {
            toast.success(editingFaq ? "FAQ Updated" : "FAQ Created");
            setIsOpen(false);
            // In a real app we might reload or optimistically update. 
            // For now, let's just refresh the page (or rely on props if we used router.refresh)
            window.location.reload();
        } else {
            toast.error(result.error);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this FAQ?')) {
            const result = await deleteFaq(id);
            if (result.success) {
                toast.success("FAQ Deleted");
                setFaqs(faqs.filter(f => f.id !== id));
            } else {
                toast.error(result.error);
            }
        }
    };

    const handleStatusToggle = async (id: number, currentStatus: boolean) => {
        const result = await toggleFaqStatus(id, currentStatus);
        if (result.success) {
            setFaqs(faqs.map(f => f.id === id ? { ...f, is_active: !currentStatus } : f));
        } else {
            toast.error("Failed to update status");
        }
    };

    const handleTestChat = async () => {
        if (!testInput.trim()) return;
        setIsTesting(true);
        const res = await chatWithBot(testInput);
        setTestResponse(res.reply);
        setIsTesting(false);
    };

    return (
        <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Knowledge Base</CardTitle>
                                <CardDescription>Manage the questions and answers for the chatbot.</CardDescription>
                            </div>
                            <Button onClick={handleAddNew}>
                                <Plus className="h-4 w-4 mr-2" /> Add FAQ
                            </Button>
                        </div>
                        <div className="pt-4">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                                <Input
                                    placeholder="Search FAQs..."
                                    className="pl-9"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Question</TableHead>
                                        <TableHead>Answer</TableHead>
                                        <TableHead className="w-[100px]">Status</TableHead>
                                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFaqs.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                                No FAQs found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredFaqs.map((faq) => (
                                            <TableRow key={faq.id}>
                                                <TableCell className="font-medium">{faq.question}</TableCell>
                                                <TableCell className="text-slate-500 line-clamp-2 max-w-xs" title={faq.answer}>
                                                    {faq.answer}
                                                </TableCell>
                                                <TableCell>
                                                    <Switch
                                                        checked={faq.is_active}
                                                        onCheckedChange={() => handleStatusToggle(faq.id, faq.is_active)}
                                                    />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(faq)}>
                                                            <Pencil className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="bg-slate-50 border-indigo-100">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                            <Bot className="h-5 w-5" /> Test Chatbot
                        </CardTitle>
                        <CardDescription>Preview how the bot responds to queries.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border min-h-[200px] flex flex-col justify-end">
                            {testResponse ? (
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <div className="bg-indigo-600 text-white rounded-lg py-2 px-3 text-sm max-w-[80%]">
                                            {testInput}
                                        </div>
                                    </div>
                                    <div className="flex justify-start">
                                        <div className="bg-slate-100 text-slate-800 rounded-lg py-2 px-3 text-sm max-w-[90%]">
                                            {testResponse}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-slate-400 text-sm py-8">
                                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                    Type a message to test...
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                placeholder="Ask something..."
                                value={testInput}
                                onChange={(e) => setTestInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleTestChat()}
                            />
                            <Button size="icon" onClick={handleTestChat} disabled={isTesting}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle>
                        <DialogDescription>
                            Create a question and answer pair for the chatbot knowledge base.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Question / Keyword</label>
                            <Input
                                value={formData.question}
                                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                                placeholder="e.g. When is the deadline?"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Answer</label>
                            <Textarea
                                value={formData.answer}
                                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                                placeholder="e.g. The deadline is..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
