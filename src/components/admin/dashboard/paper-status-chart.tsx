'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaperStatusChartProps {
    data: { status: string, count: number }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a855f7', '#ec4899'];

export function PaperStatusChart({ data }: PaperStatusChartProps) {
    // Transform data for chart if needed (e.g., capitalize status)
    const chartData = data.map(d => ({
        name: d.status.replace('_', ' ').toUpperCase(),
        value: d.count
    }));

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Paper Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
