import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Database,
  Plus,
  FileSearch,
  Earth,
  FileText,
  Folder,
  CardSim,
  Book,
  Phone,
  Search,
  ArrowUpRight,
} from 'lucide-react';

interface DashboardQuickLinksProps {
  searchQuery: string;
  t: any;
}

export const DashboardQuickLinks: React.FC<DashboardQuickLinksProps> = ({
  searchQuery,
  t,
}) => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      label: t.comparison,
      path: '/comparacao',
      icon: <Upload size={24} strokeWidth={2.5} />,
    },
    {
      label: t.sharePoint,
      path: 'https://hexingbrasil.sharepoint.com/sites/MSSD/TechSales',
      icon: <Database size={24} strokeWidth={2.5} />,
    },
    {
      label: t.taskBoards,
      path: '/todo',
      icon: <Plus size={24} strokeWidth={2.5} />,
    },
    {
      label: t.changelog_initial,
      path: '/changelog',
      icon: <FileSearch size={24} strokeWidth={2.5} />,
    },
    {
      label: 'Cloud (ORCAS)',
      path: '/ambients',
      icon: <Earth size={24} strokeWidth={2.5} />,
    },
    {
      label: 'Documents',
      path: '/templates',
      icon: <FileText size={24} strokeWidth={2.5} />,
    },
    {
      label: t.samples,
      path: '/amostras',
      icon: <Folder size={24} strokeWidth={2.5} />,
    },
    {
      label: t.simcards,
      path: '/chips',
      icon: <CardSim size={24} strokeWidth={2.5} />,
    },
    {
      label: t.testbooks,
      path: '/testbooks',
      icon: <Book size={24} strokeWidth={2.5} />,
    },
    {
      label: 'Equipments Track',
      path: '/tracking-equipments',
      icon: <Phone size={24} strokeWidth={2.5} />,
    },
    {
      label: t.sidebar.etlSearch,
      path: '/pesquisas',
      icon: <Search size={24} strokeWidth={2.5} />,
    },
  ];

  const filteredLinks = quickLinks.filter((l) =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredLinks.length > 0 ? (
            filteredLinks.map((btn, i) => (
              <motion.button
                key={btn.label}
                className="group relative flex flex-col items-center justify-center gap-4 min-h-[160px] rounded-md border border-[var(--border-color)]/50 bg-[var(--bg-app)] p-6 text-center backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:border-[var(--accent-color)]/40 hover:bg-[var(--bg-app)]/80 hover:shadow-2xl hover:shadow-[var(--shadow-color)] overflow-hidden cursor-default"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.04, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                onClick={() =>
                  btn.path.startsWith('http')
                    ? window.open(btn.path, '_blank', 'noopener,noreferrer')
                    : navigate(btn.path)
                }
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex mt-2 h-14 w-14 items-center justify-center rounded-md bg-[var(--bg-app)] text-[var(--text-primary)] backdrop-blur-md border border-[var(--border-color)]/30 transition-all duration-500 group-hover:scale-110 group-hover:bg-[var(--accent-color)] group-hover:text-white group-hover:shadow-[var(--accent-color)]/30 group-hover:border-transparent">
                  {btn.icon}
                </div>
                
                <div className="flex flex-col items-center relative z-1">
                  <span className="text-[13px] font-black tracking-tight text-[var(--text-primary)] leading-tight opacity-70 group-hover:opacity-100 transition-all duration-300">
                    {btn.label}
                  </span>
                  <div className="mt-2 h-1 w-0 bg-[var(--accent-color)] rounded-md group-hover:w-8 transition-all duration-500" />
                </div>
              </motion.button>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center rounded-md border border-dashed border-[var(--border-color)]/50 bg-[var(--bg-app)]/20 p-12 backdrop-blur-xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-[var(--bg-app)]/40 backdrop-blur-md text-[var(--text-secondary)] opacity-40 mb-4">
                <Search size={24} strokeWidth={2} />
              </div>
              <span className="text-xs font-bold text-[var(--text-secondary)] opacity-60 uppercase tracking-widest">
                No matching tools
              </span>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
