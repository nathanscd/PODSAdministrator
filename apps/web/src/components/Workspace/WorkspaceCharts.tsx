import React from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Briefcase,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

interface WorkspaceChartsProps {
  statusChartData: any[];
  utilityChartData: any[];
  colors: string[];
  t: any;
}

export const WorkspaceCharts: React.FC<WorkspaceChartsProps> = ({
  statusChartData,
  utilityChartData,
  colors,
  t,
}) => {
  return (
    <div className= "flex flex-col gap-8">
      <div className="group relative p-6 rounded-md bg-white/5 border border-white/10 hover:border-[var(--accent-color)]/30 transition-all duration-500 h-[380px]">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-primary)] opacity-60">
              {t.workspace.headers.oppsStatus}
            </h3>
            <p className="text-xl font-black text-[var(--text-primary)]">Distribution</p>
          </div>
          <div className="p-3 bg-[var(--accent-color)]/10 rounded-2xl border border-[var(--accent-color)]/20 text-[var(--accent-color)] group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
            <PieChartIcon size={20} />
          </div>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusChartData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
                paddingAngle={10}
                stroke="none"
              >
                {statusChartData.map((_, i) => (
                  <Cell key={i} fill={colors[i % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '900',
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em'
                }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all duration-500 h-[380px]">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-primary)] opacity-60">
              {t.workspace.headers.topUtilities}
            </h3>
            <p className="text-xl font-black text-[var(--text-primary)]">Utility Rank</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-500 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
            <Filter size={20} />
          </div>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={utilityChartData}
              layout="vertical"
              margin={{ left: 0, right: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                width={80}
                tick={{
                  fontSize: 10,
                  fill: 'var(--text-secondary)',
                  fontWeight: '900',
                }}
                axisLine={false}
                tickLine={false}
              />
              <Bar
                dataKey="value"
                fill="var(--accent-color)"
                radius={[0, 8, 8, 0]}
                barSize={20}
              >
                 {utilityChartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  fontSize: '11px',
                  fontWeight: '900',
                  color: '#fff',
                }}
                itemStyle={{ color: '#fff' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
