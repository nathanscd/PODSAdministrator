import React from 'react';
import { TrendingUp, BarChart, PieChart } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

interface ReportOverviewProps {
  evolutionData: any[];
  groupStatsData: any[];
  winLossColors: { Win: string; Loss: string; Open: string };
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d0d0d]/90 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.stroke }} />
              <span className="text-xs font-bold text-white uppercase">{entry.name}:</span>
              <span className="text-xs font-mono font-bold text-white/80">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const ReportOverview: React.FC<ReportOverviewProps> = ({
  evolutionData,
  groupStatsData,
  winLossColors,
}) => {
  return (
    <div className="w-full flex flex-col gap-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-color)]/10 flex items-center justify-center text-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/5">
                    <TrendingUp size={32} />
                </div>
                <div>
                    <h2 className="m-0 text-4xl font-black uppercase italic tracking-tighter text-white leading-none">
                        Pipeline Evolution
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mt-2">Historical Growth & Trends</p>
                </div>
            </div>
            
            <div className="hidden md:flex gap-4">
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--accent-color)]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Open Ops</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Won Ops</span>
                </div>
            </div>
        </div>

        <div className="h-[450px] w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={evolutionData}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.05)"
              />
              <XAxis 
                dataKey="name" 
                fontSize={10} 
                fontWeight={900} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.2)' }}
                dy={15}
              />
              <YAxis 
                fontSize={10} 
                fontWeight={700} 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(255,255,255,0.2)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="Win"
                stroke={winLossColors.Win}
                strokeWidth={4}
                dot={{ r: 4, fill: winLossColors.Win, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="Open"
                stroke={winLossColors.Open}
                strokeWidth={4}
                dot={{ r: 4, fill: winLossColors.Open, strokeWidth: 0 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {groupStatsData.map((g, idx) => (
          <div key={g.name} className="relative group">
            <div className="bg-white/5 p-10 rounded-[2.5rem] border border-white/5 transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-white/[0.08] group-hover:border-white/10 group-hover:shadow-2xl">
                <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/20 group-hover:text-[var(--accent-color)] transition-colors">
                        {idx === 0 ? <BarChart size={24} /> : idx === 1 ? <PieChart size={24} /> : <TrendingUp size={24} />}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
                        Group Statistics
                    </span>
                </div>
                
                <p className="text-xs font-black uppercase text-[var(--accent-color)] mb-2 tracking-widest">
                {g.name}
                </p>
                <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white mb-8">
                Performance
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mb-2">Won</p>
                        <p className="text-3xl font-black uppercase italic tracking-tighter text-white">
                            {g.winLoss[0].value}
                        </p>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                        <p className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] mb-2">Open</p>
                        <p className="text-3xl font-black uppercase italic tracking-tighter text-white">
                            {g.winLoss[2].value}
                        </p>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
