'use client';

import { useState } from 'react';
import {
    BarChart3,
    Users,
    MessageSquare,
    Star,
    ChevronDown,
    ChevronUp,
    Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { QuestionStats, QuestionnaireResponse, Questionnaire } from "@/app/actions/questions";

interface QuestionnaireResultsProps {
    analytics: {
        questionnaire: Questionnaire;
        totalResponses: number;
        questionStats: QuestionStats[];
    };
    responses: (QuestionnaireResponse & { user_name?: string; user_email?: string | null })[];
}

function ProgressBar({ percentage, color = "bg-blue-500" }: { percentage: number; color?: string }) {
    return (
        <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
}

function RatingStars({ average, max = 5 }: { average: number; max?: number }) {
    const fullStars = Math.floor(average);
    const hasHalf = average - fullStars >= 0.5;

    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: max }).map((_, i) => (
                <Star
                    key={i}
                    className={`h-5 w-5 ${i < fullStars
                        ? 'fill-yellow-400 text-yellow-400'
                        : i === fullStars && hasHalf
                            ? 'fill-yellow-400/50 text-yellow-400'
                            : 'text-slate-300'
                        }`}
                />
            ))}
            <span className="ml-2 text-lg font-semibold">{average.toFixed(1)}</span>
        </div>
    );
}

function QuestionStatsCard({ stat }: { stat: QuestionStats }) {
    const [expanded, setExpanded] = useState(false);

    return (
        <Card className="mb-4">
            <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-base font-medium">
                            {stat.question_text}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                                {stat.type}
                            </Badge>
                            <span className="text-sm text-slate-500">
                                {stat.total_responses} responses
                            </span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {/* Rating type */}
                {stat.type === 'rating' && stat.average_value !== undefined && (
                    <div className="space-y-4">
                        <RatingStars average={stat.average_value} />
                        {stat.options_breakdown && (
                            <div className="space-y-2">
                                {stat.options_breakdown.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="w-8 text-sm text-slate-600">
                                            {opt.option} ★
                                        </span>
                                        <div className="flex-1">
                                            <ProgressBar percentage={opt.percentage} />
                                        </div>
                                        <span className="w-16 text-sm text-right text-slate-600">
                                            {opt.count} ({opt.percentage}%)
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Select/Radio/Checkbox type */}
                {['select', 'radio', 'checkbox'].includes(stat.type) && stat.options_breakdown && (
                    <div className="space-y-2">
                        {stat.options_breakdown.map((opt, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className="w-32 text-sm text-slate-600 truncate" title={opt.option}>
                                    {opt.option}
                                </span>
                                <div className="flex-1">
                                    <ProgressBar
                                        percentage={opt.percentage}
                                        color={`bg-gradient-to-r from-blue-500 to-purple-500`}
                                    />
                                </div>
                                <span className="w-20 text-sm text-right text-slate-600">
                                    {opt.count} ({opt.percentage}%)
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Number type */}
                {stat.type === 'number' && stat.average_value !== undefined && (
                    <div className="text-center py-4">
                        <div className="text-4xl font-bold text-blue-600">
                            {stat.average_value.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-500 mt-1">Average Value</div>
                    </div>
                )}

                {/* Text/Textarea type */}
                {['text', 'textarea'].includes(stat.type) && stat.text_responses && (
                    <div className="space-y-2">
                        {stat.text_responses.slice(0, expanded ? undefined : 3).map((text, i) => (
                            <div
                                key={i}
                                className="p-3 bg-slate-50 rounded-lg text-sm text-slate-700 border-l-4 border-blue-400"
                            >
                                "{text}"
                            </div>
                        ))}
                        {stat.text_responses.length > 3 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpanded(!expanded)}
                                className="w-full"
                            >
                                {expanded ? (
                                    <>
                                        <ChevronUp className="mr-2 h-4 w-4" />
                                        Show Less
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="mr-2 h-4 w-4" />
                                        Show {stat.text_responses.length - 3} More Responses
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export function QuestionnaireResults({ analytics, responses }: QuestionnaireResultsProps) {
    const { questionnaire, totalResponses, questionStats } = analytics;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalResponses}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Questions</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{questionStats.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <Badge variant={questionnaire.is_active ? "default" : "secondary"}>
                            {questionnaire.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for Analytics vs Responses */}
            <Tabs defaultValue="analytics" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="analytics">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics
                    </TabsTrigger>
                    <TabsTrigger value="responses">
                        <Users className="mr-2 h-4 w-4" />
                        Individual Responses
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="analytics" className="space-y-4">
                    {questionStats.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No questions in this questionnaire yet.
                        </div>
                    ) : (
                        questionStats.map((stat) => (
                            <QuestionStatsCard key={stat.question_id} stat={stat} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="responses">
                    {responses.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            No responses yet.
                        </div>
                    ) : (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>All Responses</CardTitle>
                                    <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        Export CSV
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Respondent</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Submitted At</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {responses.map((response) => (
                                            <TableRow key={response.id}>
                                                <TableCell className="font-medium">
                                                    {response.user_name || 'Anonymous'}
                                                </TableCell>
                                                <TableCell>
                                                    {response.user_email || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={response.status === 'completed' ? 'default' : 'secondary'}>
                                                        {response.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {response.completed_at
                                                        ? new Date(response.completed_at).toLocaleString('th-TH')
                                                        : new Date(response.started_at).toLocaleString('th-TH')
                                                    }
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
