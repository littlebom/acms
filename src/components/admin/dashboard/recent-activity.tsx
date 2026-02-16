import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface RecentActivityProps {
    logs: {
        id: number;
        user: string;
        action: string;
        details: any;
        time: string | Date;
    }[];
}

export function RecentActivity({ logs }: RecentActivityProps) {
    return (
        <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {logs.length === 0 ? (
                        <p className="text-sm text-slate-500">No recent activity found.</p>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="flex items-center">
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback className="bg-indigo-100 text-indigo-700">
                                        {log.user.substring(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        <span className="font-bold">{log.user}</span> {log.action.toLowerCase()}d a {log.details?.resource || 'resource'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(log.time), { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-slate-500">
                                    {log.details?.details ? JSON.stringify(log.details.details).substring(0, 30) + '...' : ''}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
