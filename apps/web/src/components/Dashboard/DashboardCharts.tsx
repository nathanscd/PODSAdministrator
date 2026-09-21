import React from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardChartsProps {
  chartDataStats: any[];
  goalsChartData: any[];
  hasGoals: boolean;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  chartDataStats,
  goalsChartData,
  hasGoals,
}) => {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-2xl font-black tracking-tighter text-[var(--text-primary)]">Analytics Engine</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col rounded-xl border border-[var(--border-color)]/50 bg-[var(--bg-app)]/40 p-6 shadow-sm">
          <span className="block text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase mb-6 opacity-60">
            Volume Distribution
          </span>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartDataStats}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{
                    fontSize: 10,
                    fill: 'var(--text-secondary)',
                    fontWeight: 800,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fontSize: 10,
                    fill: 'var(--text-secondary)',
                    fontWeight: 800,
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'var(--accent-color)', opacity: 0.05 }}
                  contentStyle={{
                    borderRadius: 5,
                    border: '1px solid var(--border-color)',
                    background: 'transparent',
                    backdropFilter: 'blur(16px)',
                    color: 'var(--text-primary)',
                    fontSize: 12,
                    fontWeight: 800,
                    fontFamily: 'inherit',
                    boxShadow: `0 12px 30px var(--shadow-color)`,
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[3, 3, 2, 2]}
                  maxBarSize={32}
                  fill="var(--accent-color)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-col rounded-xl border border-[var(--border-color)]/50 bg-[var(--bg-app)]/40 p-6 shadow-sm">
          <span className="block text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase mb-6 opacity-60">
            Task Completion
          </span>
          <div className="h-[250px] w-full flex items-center justify-center">
            {hasGoals ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={goalsChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill="var(--accent-color)" />
                    <Cell fill="var(--border-color)" />
                  </Pie>
                  <Tooltip
                    cursor={{ fill: 'var(--accent-color)', opacity: 0.05 }}
                    contentStyle={{
                      borderRadius: 5,
                      border: '1px solid var(--border-color)',
                      background: 'transparent',
                      backdropFilter: 'blur(16px)',
                      color: 'var(--text-primary)',
                      fontSize: 12,
                      fontWeight: 800,
                      fontFamily: 'inherit',
                      boxShadow: `0 12px 30px var(--shadow-color)`,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center opacity-40">
                <span className="text-[10px] font-black uppercase tracking-widest">No Active Goals</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
