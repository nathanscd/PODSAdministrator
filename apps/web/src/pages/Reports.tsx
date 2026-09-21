import { Link } from 'react-router-dom';
import { Compass, ArrowRight, FileBarChart, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTitle } from '../hooks/useTitle';
import { useLang } from '../contexts/LangContext';
import PageTransition from '../components/PageTransition';

const Reports = () => {
  const { t } = useLang();
  useTitle(`${t.sidebar.report} - PODS Administrator`);
  
  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Immersive Background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[var(--accent-color)]/5 blur-[120px]"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, -60, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[120px]"
          />
        </div>

        <div className="relative z-10 mx-auto max-w-[1400px] px-8 pt-24 pb-20">
          <header className="mb-20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-color)]">
                  Analytics Hub
                </span>
              </div>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] leading-none"
            >
              {t.sidebar.report}
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-sm font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] max-w-xl"
            >
              Enterprise-grade performance tracking and strategic insights for AMI Solutions.
            </motion.p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link 
                to="/AMIWinLossReport" 
                className="group relative flex flex-col justify-end p-12 min-h-[450px] rounded-[3rem] overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-4 hover:border-white/20 hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-40 grayscale group-hover:grayscale-0 transition-all"
                  style={{ 
                    backgroundImage: 'url("/AMI Report.png")' 
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                
                <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--accent-color)] flex items-center justify-center text-white mb-8 shadow-lg shadow-[var(--accent-color)]/20 group-hover:scale-110 transition-transform duration-500">
                        <FileBarChart size={28} />
                    </div>
                    <h2 className="text-3xl font-black leading-none mb-4 uppercase tracking-tighter text-white">
                        AMI Solutions <br/>
                        <span className="text-[var(--accent-color)]">Performance Report</span>
                    </h2>
                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-relaxed max-w-[280px]">
                        Pre-Sales and Post-Sales executive analytics of open opportunities.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white transition-colors">
                        Launch Dashboard <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                to="/" 
                className="group relative flex flex-col justify-end p-12 min-h-[450px] rounded-[3rem] overflow-hidden border border-white/5 bg-white/5 backdrop-blur-xl transition-all duration-500 hover:-translate-y-4 hover:border-white/20 hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-40" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
                
                <div className="relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-8 shadow-lg group-hover:bg-white group-hover:text-black transition-all duration-500">
                        <History size={28} />
                    </div>
                    <h2 className="text-3xl font-black leading-none mb-4 uppercase tracking-tighter text-white">
                        Historical <br/>
                        <span className="text-white/40">Archive Analytics</span>
                    </h2>
                    <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-relaxed max-w-[280px]">
                        Deep dive into past performances and closed project histories.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-white transition-colors">
                        Explore Archive <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform" />
                    </div>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Reports;