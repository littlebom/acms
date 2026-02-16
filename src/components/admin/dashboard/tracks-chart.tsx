'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TracksChartProps {
    data: { track: string, count: number }[];
}

export function TracksChart({ data }: TracksChartProps) {
    return (
        <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
                <CardTitle>Papers by Track</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="track"
                                type="category"
                                width={120}
                                tick={{ fontSize: 12 }}
                                interval={0}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0' }}
                            />
                            <Bar
                                dataKey="count"
                                fill="#8884d8"
                                radius={[0, 4, 4, 0]}
                                barSize={20}
                                className="fill-primary"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
