import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function TrafficTrendsChart({
    data,
    loading,
    dark
}) {
    const { theme } = useTheme();
    const isDark = dark ?? theme === 'dark';

    const chartColor = isDark ? '#ededed' : '#0a0a0a';
    const gridColor = isDark ? '#1f1f1f' : '#e5e5e5';
    const textColor = isDark ? '#666666' : '#737373';
    const tooltipBg = isDark ? '#0a0a0a' : '#ffffff';
    const tooltipBorder = isDark ? '#222222' : '#e5e5e5';

    return (
        <div className="h-full w-full relative min-h-[300px] min-w-0">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-canvas/60 backdrop-blur-sm z-10 rounded-lg">
                    <Loader2 className="h-6 w-6 text-ink-muted animate-spin" />
                </div>
            )}
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <AreaChart data={data || []} margin={{ top: 10, right: 10, left: -20, bottom: 24 }}>
                    <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chartColor} stopOpacity={0.12} />
                            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke={gridColor} vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke={textColor}
                        tick={{ fill: textColor, fontSize: 10, fontFamily: 'Geist Mono, monospace' }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                        dy={10}
                    />
                    <YAxis
                        stroke={textColor}
                        tick={{ fill: textColor, fontSize: 10, fontFamily: 'Geist Mono, monospace' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: tooltipBg, 
                            borderColor: tooltipBorder, 
                            borderRadius: '6px', 
                            borderWidth: '1px',
                            boxShadow: 'none',
                            fontSize: '11.5px', 
                            fontFamily: 'Geist Mono, monospace',
                            padding: '8px 12px',
                            color: isDark ? '#ededed' : '#0a0a0a'
                        }}
                        itemStyle={{ color: chartColor }}
                    />
                    <Area
                        type="monotone"
                        dataKey="views"
                        stroke={chartColor}
                        strokeWidth={1.75}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
