'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Send, CheckCircle2 } from "lucide-react";
import { submitReview } from "@/app/actions/paper-reviews";

interface ReviewFormProps {
    assignmentId: number;
    paperId: number;
    existingReview?: any;
    isCompleted: boolean;
}

const SCORE_OPTIONS = [
    { value: '1', label: '1 - Poor' },
    { value: '2', label: '2 - Below Average' },
    { value: '3', label: '3 - Average' },
    { value: '4', label: '4 - Good' },
    { value: '5', label: '5 - Excellent' },
];

const RECOMMENDATION_OPTIONS = [
    { value: 'strong_accept', label: 'Strong Accept', color: 'text-emerald-700' },
    { value: 'accept', label: 'Accept', color: 'text-green-600' },
    { value: 'minor_revision', label: 'Minor Revision', color: 'text-blue-600' },
    { value: 'major_revision', label: 'Major Revision', color: 'text-amber-600' },
    { value: 'reject', label: 'Reject', color: 'text-red-600' },
];

export function ReviewForm({ assignmentId, paperId, existingReview, isCompleted }: ReviewFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (formData: FormData) => {
        setLoading(true);
        setError(null);

        formData.set('assignment_id', assignmentId.toString());
        formData.set('paper_id', paperId.toString());

        const result = await submitReview(formData);
        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccess(true);
            setTimeout(() => {
                router.push('/reviewer/assignments');
            }, 2000);
        }
    };

    if (success) {
        return (
            <Card className="border-emerald-200 bg-emerald-50">
                <CardContent className="p-8 text-center">
                    <CheckCircle2 className="h-16 w-16 mx-auto text-emerald-500 mb-4" />
                    <h2 className="text-xl font-bold text-emerald-800 mb-2">
                        Review Submitted Successfully!
                    </h2>
                    <p className="text-emerald-700">
                        Thank you for your review. Redirecting...
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <form action={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Submit Your Review</CardTitle>
                    <CardDescription>
                        {isCompleted
                            ? 'You have already submitted a review. You can update it below.'
                            : 'Please provide your evaluation of this paper'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded">
                            {error}
                        </div>
                    )}

                    {/* Scores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Originality */}
                        <div className="space-y-2">
                            <Label>Originality</Label>
                            <Select name="score_originality" defaultValue={existingReview?.score_originality?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select score..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SCORE_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Methodology */}
                        <div className="space-y-2">
                            <Label>Methodology</Label>
                            <Select name="score_methodology" defaultValue={existingReview?.score_methodology?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select score..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SCORE_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Presentation */}
                        <div className="space-y-2">
                            <Label>Presentation / Writing</Label>
                            <Select name="score_presentation" defaultValue={existingReview?.score_presentation?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select score..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SCORE_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Relevance */}
                        <div className="space-y-2">
                            <Label>Relevance to Track</Label>
                            <Select name="score_relevance" defaultValue={existingReview?.score_relevance?.toString()}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select score..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SCORE_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Overall Score */}
                        <div className="space-y-2 md:col-span-2">
                            <Label className="text-lg font-semibold">Overall Score *</Label>
                            <Select name="score_overall" required defaultValue={existingReview?.score_overall?.toString()}>
                                <SelectTrigger className="text-lg h-12">
                                    <SelectValue placeholder="Select overall score..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {SCORE_OPTIONS.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Recommendation */}
                    <div className="space-y-3">
                        <Label className="text-lg font-semibold">Recommendation *</Label>
                        <RadioGroup
                            name="recommendation"
                            required
                            defaultValue={existingReview?.recommendation}
                            className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                            {RECOMMENDATION_OPTIONS.map(opt => (
                                <div key={opt.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-slate-50">
                                    <RadioGroupItem value={opt.value} id={opt.value} />
                                    <Label htmlFor={opt.value} className={`cursor-pointer font-medium ${opt.color}`}>
                                        {opt.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Comments to Author */}
                    <div className="space-y-2">
                        <Label htmlFor="comments_to_author">Comments to Author *</Label>
                        <Textarea
                            id="comments_to_author"
                            name="comments_to_author"
                            required
                            rows={6}
                            placeholder="Provide constructive feedback that will help the author improve their paper..."
                            defaultValue={existingReview?.comments_to_author || ''}
                        />
                        <p className="text-xs text-slate-500">
                            This feedback will be shared with the author (anonymously)
                        </p>
                    </div>

                    {/* Comments to Editor */}
                    <div className="space-y-2">
                        <Label htmlFor="comments_to_editor">Confidential Comments to Editor</Label>
                        <Textarea
                            id="comments_to_editor"
                            name="comments_to_editor"
                            rows={4}
                            placeholder="Optional confidential comments for the editor only..."
                            defaultValue={existingReview?.comments_to_editor || ''}
                        />
                        <p className="text-xs text-slate-500">
                            These comments will only be visible to the editor
                        </p>
                    </div>

                    {/* Confidence */}
                    <div className="space-y-2">
                        <Label>Confidence Level</Label>
                        <Select name="confidence" defaultValue={existingReview?.confidence || 'medium'}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low - Not my area</SelectItem>
                                <SelectItem value="medium">Medium - Familiar</SelectItem>
                                <SelectItem value="high">High - Expert</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            ) : (
                                <Send className="h-5 w-5 mr-2" />
                            )}
                            {isCompleted ? 'Update Review' : 'Submit Review'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </form>
    );
}
