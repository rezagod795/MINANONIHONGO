import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { LevelsMap } from '../types';
import { useState, useEffect, useMemo } from 'react';

interface ProgressChartProps {
  highScores: Record<number, number>;
  levelsData: LevelsMap;
  isDarkMode: boolean;
}

export const ProgressChart = ({ highScores, levelsData, isDarkMode }: ProgressChartProps) => {
  const data = useMemo(() => {
    return Object.keys(levelsData).map((l) => {
      const levelNum = parseInt(l);
      const total = levelsData[levelNum]?.vocab.length || 0;
      const score = highScores[levelNum] || 0;
      const percentage = total > 0 ? (score / total) * 100 : 0;
      
      return {
        name: `Lv.${levelNum}`,
        percentage: Math.round(percentage),
        fullLevelName: levelsData[levelNum].name,
        icon: levelsData[levelNum].icon
      };
    });
  }, [highScores, levelsData]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-slate-950' : 'bg-white border-slate-200 shadow-xl'} p-3 border rounded-2xl transition-colors duration-300`}>
          <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Kemajuan Tingkat</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{item.icon}</span>
            <div>
              <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{item.fullLevelName}</p>
              <p className="text-[14px] font-black text-rose-500">{item.percentage}% Mastered</p>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-48 sm:h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? '#334155' : '#f1f5f9'} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: isDarkMode ? '#94a3b8' : '#64748b', fontWeight: 700 }}
            dy={10}
          />
          <YAxis 
            domain={[0, 100]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 9, fill: isDarkMode ? '#475569' : '#94a3b8' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: isDarkMode ? 'rgba(244, 63, 94, 0.1)' : '#fff1f2', radius: 8 }} />
          <Bar 
            dataKey="percentage" 
            radius={[6, 6, 6, 6]}
            barSize={20}
            animationDuration={600}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.percentage === 100 ? '#f43f5e' : entry.percentage > 50 ? '#fb7185' : isDarkMode ? '#9f1239' : '#fda4af'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
