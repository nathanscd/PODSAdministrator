'use client';

import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Wifi, WifiOff, Loader } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { useTitle } from '../hooks/useTitle';
import { useLang } from '../contexts/LangContext';
import { useETLResearch } from '../hooks/useETLResearch';
import { ETLConfig } from '../components/ETL/ETLConfig';
import { ETLProgress } from '../components/ETL/ETLProgress';
import { ETLResult } from '../components/ETL/ETLResult';

function ServerStatusBadge({ status, onWake }: { status: string; onWake: () => void }) {
  const statusConfig: Record<string, { icon: ReactNode; label: string; cls: string; clickable: boolean }> = {
    unknown: {
      icon: <Wifi size={13} />,
      label: 'Verificar servidor',
      cls: 'border-[var(--border-color)] text-[var(--text-secondary)]',
      clickable: true,
    },
    checking: {
      icon: <Loader size={13} className="animate-spin" />,
      label: 'Verificando...',
      cls: 'border-[var(--border-color)] text-[var(--text-secondary)]',
      clickable: false,
    },
    waking: {
      icon: <Loader size={13} className="animate-spin" />,
      label: 'Acordando servidor (~30s)…',
      cls: 'border-yellow-500/50 text-yellow-400',
      clickable: false,
    },
    online: {
      icon: <Wifi size={13} />,
      label: 'Servidor online',
      cls: 'border-emerald-500/50 text-emerald-400',
      clickable: false,
    },
    offline: {
      icon: <WifiOff size={13} />,
      label: 'Offline — tentar novamente',
      cls: 'border-red-500/50 text-red-400',
      clickable: true,
    },
  };

  const cfg = statusConfig[status] || {
    icon: <Wifi size={13} />,
    label: 'Status desconhecido',
    cls: 'border-gray-500 text-gray-400',
    clickable: true,
  };

  return (
    <button
      onClick={cfg.clickable ? onWake : undefined}
      disabled={!cfg.clickable}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
        cfg.cls
      } ${cfg.clickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
    >
      {cfg.icon}
      {cfg.label}
    </button>
  );
}

export default function EtlResearch() {
  const { t } = useLang();
  useTitle(`${t.sidebar.etlSearch} - PODS Administrator`);

  const {
    theme,
    setTheme,
    sources,
    setSources,
    status,
    progress,
    reportData,
    errorMsg,
    serverStatus,
    handleStartETL,
    handleWake,
  } = useETLResearch();

  const isRunning =
    status === 'extracting' || status === 'transforming' || status === 'loading';
  const buttonDisabled =
    !theme ||
    Object.values(sources).every((v) => !v) ||
    isRunning ||
    serverStatus === 'waking' ||
    serverStatus === 'checking';

  return (
    <PageTransition>
      <div className="space-y-6 relative overflow-hidden font-sans">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--accent-color)] rounded-full blur-[200px] opacity-10 pointer-events-none" />

        <header className="mb-12 relative z-10">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm">
              <Search size={16} className="text-[var(--accent-color)]" />
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                ETL Research & Reporting
              </span>
            </div>
            <ServerStatusBadge status={serverStatus} onWake={handleWake} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[var(--text-primary)] tracking-tight">
            Pesquisa Automática
          </h1>
          <p className="text-[var(--text-secondary)] mt-4 max-w-2xl text-lg leading-relaxed">
            Defina o tema e as fontes de dados. O motor ETL pesquisará dados reais na web,
            aplicará as transformações necessárias e compilará um relatório analítico
            concreto.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
          <div className="lg:col-span-5 space-y-6">
            <ETLConfig
              theme={theme}
              setTheme={setTheme}
              sources={sources}
              setSources={setSources}
              isRunning={isRunning}
              serverStatus={serverStatus}
              handleStartETL={handleStartETL}
              buttonDisabled={buttonDisabled}
              errorMsg={errorMsg}
              status={status}
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            {isRunning && <ETLProgress status={status} progress={progress} />}

            <AnimatePresence>
              {status === 'done' && reportData && (
                <ETLResult reportData={reportData} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}