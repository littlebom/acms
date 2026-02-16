import { getActiveQuestionnaires } from "@/app/actions/questions";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, ArrowRight } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function UserSurveysPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const questionnaires = await getActiveQuestionnaires(undefined, session.userId);

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Surveys & Questionnaires</h1>
                <p className="text-muted-foreground mt-2">
                    Complete surveys to help us improve our services.
                </p>
            </div>

            {questionnaires.length === 0 ? (
                <div className="text-center py-16 border rounded-lg bg-slate-50">
                    <FileText className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">No surveys available</h3>
                    <p className="text-slate-500 mt-2">Check back later for new surveys.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {questionnaires.map((q: any) => (
                        <Card key={q.id} className={`relative transition-all hover:shadow-lg ${q.is_completed ? 'opacity-75' : ''}`}>
                            {q.is_completed && (
                                <div className="absolute top-4 right-4">
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Completed
                                    </Badge>
                                </div>
                            )}
                            <CardHeader>
                                <div className="flex items-start gap-2">
                                    <Badge variant="secondary" className="mb-2">
                                        {q.category === 'pre-event' ? 'Registration' :
                                            q.category === 'post-event' ? 'Feedback' :
                                                q.category === 'research' ? 'Research' : 'Survey'}
                                    </Badge>
                                </div>
                                <CardTitle className="line-clamp-2">{q.title}</CardTitle>
                                <CardDescription className="line-clamp-2">
                                    {q.description || 'No description provided'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-500">
                                        {q.questions_count || 0} questions
                                    </span>
                                    {!q.is_completed ? (
                                        <Link href={`/dashboard/surveys/${q.id}`}>
                                            <Button size="sm">
                                                Start Survey
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Button size="sm" variant="ghost" disabled>
                                            Submitted
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
