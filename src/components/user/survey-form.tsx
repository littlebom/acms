'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Star } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { submitSurveyResponse, type Question, type Questionnaire } from "@/app/actions/questions";
import Link from 'next/link';

interface SurveyFormProps {
    questionnaire: Questionnaire;
    questions: Question[];
}

function RatingInput({ value, onChange, max = 5 }: { value: number; onChange: (v: number) => void; max?: number }) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: max }).map((_, i) => (
                <button
                    key={i}
                    type="button"
                    onClick={() => onChange(i + 1)}
                    className="focus:outline-none transition-transform hover:scale-110"
                >
                    <Star
                        className={`h-8 w-8 transition-colors ${i < value
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-slate-300 hover:text-yellow-300'
                            }`}
                    />
                </button>
            ))}
            {value > 0 && (
                <span className="ml-3 text-lg font-medium text-slate-700">
                    {value} / {max}
                </span>
            )}
        </div>
    );
}

export function SurveyForm({ questionnaire, questions }: SurveyFormProps) {
    const router = useRouter();
    const [answers, setAnswers] = useState<Record<number, string | number | string[]>>({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [errors, setErrors] = useState<Record<number, string>>({});

    const updateAnswer = (questionId: number, value: string | number | string[]) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        // Clear error when user answers
        if (errors[questionId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[questionId];
                return newErrors;
            });
        }
    };

    const validateAnswers = () => {
        const newErrors: Record<number, string> = {};
        for (const q of questions) {
            if (q.is_required) {
                const answer = answers[q.id];
                if (answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0)) {
                    newErrors[q.id] = 'This field is required';
                }
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateAnswers()) {
            return;
        }

        setLoading(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
                questionId: parseInt(questionId),
                answer: Array.isArray(answer) ? answer.join(', ') : answer
            }));

            const result = await submitSurveyResponse(questionnaire.id, formattedAnswers);

            if (result.success) {
                setSubmitted(true);
            } else {
                alert(result.error || 'Failed to submit survey');
            }
        } catch (error) {
            console.error('Submit error:', error);
            alert('An error occurred while submitting the survey');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <Card className="text-center py-12">
                <CardContent>
                    <div className="flex justify-center mb-6">
                        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h2>
                    <p className="text-slate-600 mb-6">
                        Your response has been submitted successfully.
                    </p>
                    <Link href="/dashboard/surveys">
                        <Button>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Surveys
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const parseOptions = (options: string | null): string[] => {
        if (!options) return [];
        try {
            // Try JSON first
            const parsed = JSON.parse(options);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            // Fall back to comma-separated
            return options.split(',').map(o => o.trim()).filter(Boolean);
        }
        return [];
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <Link href="/dashboard/surveys">
                    <Button variant="ghost" size="sm" className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Surveys
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">{questionnaire.title}</h1>
                {questionnaire.description && (
                    <p className="text-muted-foreground mt-2">{questionnaire.description}</p>
                )}
            </div>

            {/* Questions */}
            <div className="space-y-6">
                {questions.map((question, index) => {
                    const options = parseOptions(question.options);

                    return (
                        <Card key={question.id} className={errors[question.id] ? 'border-red-300' : ''}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-medium flex items-start gap-2">
                                    <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center text-sm flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <span>
                                        {question.question_text}
                                        {question.is_required && <span className="text-red-500 ml-1">*</span>}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Text Input */}
                                {question.type === 'text' && (
                                    <Input
                                        placeholder={question.placeholder || 'Enter your answer...'}
                                        value={(answers[question.id] as string) || ''}
                                        onChange={(e) => updateAnswer(question.id, e.target.value)}
                                    />
                                )}

                                {/* Textarea */}
                                {question.type === 'textarea' && (
                                    <Textarea
                                        placeholder={question.placeholder || 'Enter your answer...'}
                                        value={(answers[question.id] as string) || ''}
                                        onChange={(e) => updateAnswer(question.id, e.target.value)}
                                        rows={4}
                                    />
                                )}

                                {/* Select Dropdown */}
                                {question.type === 'select' && (
                                    <Select
                                        value={(answers[question.id] as string) || ''}
                                        onValueChange={(value) => updateAnswer(question.id, value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select an option..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {options.map((opt, i) => (
                                                <SelectItem key={i} value={opt}>
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {/* Radio Buttons */}
                                {question.type === 'radio' && (
                                    <RadioGroup
                                        value={(answers[question.id] as string) || ''}
                                        onValueChange={(value) => updateAnswer(question.id, value)}
                                        className="space-y-2"
                                    >
                                        {options.map((opt, i) => (
                                            <div key={i} className="flex items-center space-x-2">
                                                <RadioGroupItem value={opt} id={`q${question.id}_opt${i}`} />
                                                <Label htmlFor={`q${question.id}_opt${i}`}>{opt}</Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                )}

                                {/* Checkboxes */}
                                {question.type === 'checkbox' && (
                                    <div className="space-y-2">
                                        {options.map((opt, i) => {
                                            const selectedValues = (answers[question.id] as string[]) || [];
                                            return (
                                                <div key={i} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`q${question.id}_opt${i}`}
                                                        checked={selectedValues.includes(opt)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                updateAnswer(question.id, [...selectedValues, opt]);
                                                            } else {
                                                                updateAnswer(question.id, selectedValues.filter(v => v !== opt));
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={`q${question.id}_opt${i}`}>{opt}</Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Rating */}
                                {question.type === 'rating' && (
                                    <RatingInput
                                        value={(answers[question.id] as number) || 0}
                                        onChange={(value) => updateAnswer(question.id, value)}
                                        max={question.max_value || 5}
                                    />
                                )}

                                {/* Number */}
                                {question.type === 'number' && (
                                    <Input
                                        type="number"
                                        placeholder={question.placeholder || 'Enter a number...'}
                                        value={(answers[question.id] as number) || ''}
                                        onChange={(e) => updateAnswer(question.id, parseInt(e.target.value) || 0)}
                                        min={question.min_value || undefined}
                                        max={question.max_value || undefined}
                                    />
                                )}

                                {/* Date */}
                                {question.type === 'date' && (
                                    <Input
                                        type="date"
                                        value={(answers[question.id] as string) || ''}
                                        onChange={(e) => updateAnswer(question.id, e.target.value)}
                                    />
                                )}

                                {/* Error message */}
                                {errors[question.id] && (
                                    <p className="text-sm text-red-500 mt-2">{errors[question.id]}</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
                <Button
                    size="lg"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="min-w-[200px]"
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            Submit Survey
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
