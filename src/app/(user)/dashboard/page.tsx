import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Ticket, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function UserDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">My Dashboard</h1>
                <p className="text-slate-500">Manage your conference activities and submissions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-l-4 border-l-indigo-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-indigo-500" />
                            My Papers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 mb-4">You have submitted 0 papers.</p>
                        <Link href="/dashboard/papers">
                            <Button>Submit a Paper</Button>
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-green-500" />
                            Registration Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-slate-600 mb-4">You are not registered for the conference yet.</p>
                        <Link href="/register-conference">
                            <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50">
                                Register Now
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white p-6 rounded-lg border shadow-sm">
                <h2 className="text-lg font-semibold mb-4">Important Dates</h2>
                <div className="space-y-4">
                    {[
                        { date: "Oct 15, 2025", event: "Paper Submission Deadline", status: "Upcoming" },
                        { date: "Nov 01, 2025", event: "Notification of Acceptance", status: "Pending" },
                        { date: "Nov 24, 2025", event: "Conference Day 1", status: "Pending" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0">
                            <div>
                                <p className="font-medium text-slate-900">{item.event}</p>
                                <p className="text-sm text-slate-500">{item.date}</p>
                            </div>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
