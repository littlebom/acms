import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    className?: string;
    iconClassName?: string;
    iconBgClassName?: string;
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    description,
    className,
    iconClassName = "text-slate-600",
    iconBgClassName = "bg-slate-100"
}: StatsCardProps) {
    return (
        <Card className={cn("", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-full", iconBgClassName, iconClassName)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                {description && (
                    <p className="text-xs text-slate-500 mt-1">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}
