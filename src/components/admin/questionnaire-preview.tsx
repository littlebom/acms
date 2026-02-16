'use client';

import { useState } from 'react';
import { Star, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Alert,
    AlertDescription,
} from "@/components/ui/alert";
import type { Question, Questionnaire } from "@/app/actions/questions";

interface QuestionnairePreviewProps {
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

export function QuestionnairePreview({ questionnaire, questions }: QuestionnairePreviewProps) {
    const [answers, setAnswers] = useState<Record<number, string | number | string[]>>({});

    const updateAnswer = (questionId: number, value: string | number | string[]) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
    };

    const parseOptions = (options: string | null): string[] => {
        if (!options) return [];
        try {
            const parsed = JSON.parse(options);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return options.split(',').map(o => o.trim()).filter(Boolean);
        }
        return [];
    };

    return (
        <div className="space-y-6">
            {/* Preview Banner */}
            <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                    <strong>Preview Mode</strong> - This is a preview of how the questionnaire will appear to users.
                    Answers entered here will NOT be saved.
                </AlertDescription>
            </Alert>

            {/* Questionnaire Header */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">{questionnaire.category}</Badge>
                        {questionnaire.is_anonymous && (
                            <Badge variant="outline">Anonymous</Badge>
                        )}
                    </div>
                    <CardTitle className="text-2xl">{questionnaire.title}</CardTitle>
                    {questionnaire.description && (
                        <CardDescription className="text-base">
                            {questionnaire.description}
                        </CardDescription>
                    )}
                </CardHeader>
            </Card>

            {/* Questions */}
            {questions.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center text-slate-500">
                        No questions added yet. Add some questions to preview the form.
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {questions.map((question, index) => {
                        const options = parseOptions(question.options);

                        return (
                            <Card key={question.id}>
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
                                    <div className="ml-8">
                                        <Badge variant="outline" className="text-xs">
                                            {question.type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="ml-8">
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
                                            <SelectTrigger className="w-full md:w-[300px]">
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
                                                    <RadioGroupItem value={opt} id={`preview_q${question.id}_opt${i}`} />
                                                    <Label htmlFor={`preview_q${question.id}_opt${i}`}>{opt}</Label>
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
                                                            id={`preview_q${question.id}_opt${i}`}
                                                            checked={selectedValues.includes(opt)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    updateAnswer(question.id, [...selectedValues, opt]);
                                                                } else {
                                                                    updateAnswer(question.id, selectedValues.filter(v => v !== opt));
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={`preview_q${question.id}_opt${i}`}>{opt}</Label>
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
                                            className="w-full md:w-[200px]"
                                        />
                                    )}

                                    {/* Date */}
                                    {question.type === 'date' && (
                                        <Input
                                            type="date"
                                            value={(answers[question.id] as string) || ''}
                                            onChange={(e) => updateAnswer(question.id, e.target.value)}
                                            className="w-full md:w-[200px]"
                                        />
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Preview Submit Button (disabled) */}
            {questions.length > 0 && (
                <div className="flex justify-end pt-4">
                    <Button size="lg" disabled className="min-w-[200px]">
                        Submit Survey (Preview Only)
                    </Button>
                </div>
            )}
        </div>
    );
}
