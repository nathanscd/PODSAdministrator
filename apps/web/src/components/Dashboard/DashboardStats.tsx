import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, FileSearch, Users, Zap } from 'lucide-react';

interface DashboardStatsProps {
  statsData: { opportunities: string; users: string; pages: string };
  t: any;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ statsData, t }) => {
  const stats = [
    {
      label: t.opportunities,
      val: statsData.opportunities,
      icon: <TrendingUp size={24} strokeWidth={2.5} />,
      color: 'var(--accent-color)',
    },
    {
      label: t.pages_initial,
      val: statsData.pages,
      icon: <FileSearch size={24} strokeWidth={2.5} />,
      color: 'var(--text-secondary)',
    },
    {
      label: t.totalUsers,
      val: statsData.users,
      icon: <Users size={24} strokeWidth={2.5} />,
      color: 'var(--accent-color)',
    },
    {
      label: t.systemStatus,
      val: 'Optimal',
      icon: <Zap size={24} strokeWidth={2.5} />,
      color: 'var(--color-success)',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          className="group relative overflow-hidden rounded-xl border border-[var(--border-color)]/50 bg-[var(--bg-app)] p-8 backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[var(--accent-color)]/30 hover:bg-[var(--bg-app)]/60 hover:shadow-2xl hover:shadow-[var(--shadow-color)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >         
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div 
                className="flex h-14 w-14 items-center justify-center rounded-md bg-[var(--bg-app)] text-[var(--text-primary)] shadow-lg shadow-[var(--shadow-color)] backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-5deg] group-hover:bg-[var(--accent-color)] group-hover:text-white group-hover:shadow-xl group-hover:shadow-[var(--accent-color)]/40 group-hover:border-transparent"
              >
                {stat.icon}
              </div>
            </div>
            
            <span className="block text-[10px] font-black tracking-[0.2em] text-[var(--text-secondary)] uppercase mb-2 opacity-60 group-hover:opacity-100 transition-opacity">
              {stat.label}
            </span>
            
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tighter text-[var(--text-primary)] leading-none group-hover:text-[var(--accent-color)] transition-colors duration-300">
                {stat.val}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
