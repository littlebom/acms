'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewChartProps {
    data: { date: string, count: number }[];
}

export function OverviewChart({ data }: OverviewChartProps) {
    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Registration Trend (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => {
                                    const d = new Date(value);
                                    return `${d.getDate()}/${d.getMonth() + 1}`;
                                }}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0' }}
                                labelStyle={{ color: '#64748b' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="currentColor"
                                radius={[4, 4, 0, 0]}
                                className="fill-primary"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
