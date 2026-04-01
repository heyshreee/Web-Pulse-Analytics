import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';

export default function TrafficTrendsChart({
    data,
    loading
}) {
    return (
        <div className="h-full w-full relative min-h-[300px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#0b1121]/50 backdrop-blur-sm z-10 rounded-lg">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="#64748b"
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0b1121', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }}
                        itemStyle={{ color: '#3B82F6' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
