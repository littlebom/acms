'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TicketTypeChartProps {
    data: { type: string, count: number }[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE'];

export function TicketTypeChart({ data }: TicketTypeChartProps) {
    const chartData = data.map(d => ({
        name: d.type,
        value: d.count
    }));

    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Ticket Distribution</CardTitle>
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
