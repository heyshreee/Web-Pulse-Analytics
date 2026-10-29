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

    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const tooltipBg = isDark ? '#0f172a' : '#ffffff';
    const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    return (
        <div className="h-full w-full relative min-h-[300px]">
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10 rounded-2xl">
                    <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                </div>
            )}
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                        dataKey="name"
                        stroke={textColor}
                        tick={{ fill: textColor, fontSize: 10, fontWeight: 700 }}
                        tickLine={false}
                        axisLine={false}
                        minTickGap={30}
                        dy={10}
                    />
                    <YAxis
                        stroke={textColor}
                        tick={{ fill: textColor, fontSize: 10, fontWeight: 700 }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: tooltipBg, 
                            borderColor: tooltipBorder, 
                            borderRadius: '12px', 
                            borderWidth: '1px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '12px', 
                            fontWeight: 'bold',
                            padding: '12px'
                        }}
                        itemStyle={{ color: '#8B5CF6' }}
                    />
                    <Area
                        type="monotone"
                        dataKey="views"
                        stroke="#8B5CF6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
