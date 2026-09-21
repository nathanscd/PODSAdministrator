import React from 'react';
import { motion } from 'framer-motion';
import { Database, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';

interface ETLProgressProps {
  status: string;
  progress: number;
}

export const ETLProgress: React.FC<ETLProgressProps> = ({ status, progress }) => {
  const steps = [
    {
      id: 'extracting',
      icon: Database,
      title: 'Extração (Extract)',
      desc: 'Coletando dados reais das fontes via web search',
    },
    {
      id: 'transforming',
      icon: RefreshCw,
      title: 'Transformação (Transform)',
      desc: 'Analisando, normalizando e estruturando dados',
    },
    {
      id: 'loading',
      icon: Layers,
      title: 'Carregamento (Load)',
      desc: 'Consolidando relatório com insights reais',
    },
  ];

  const statusOrder = ['extracting', 'transforming', 'loading'];
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-xl backdrop-blur-sm">
      <h3 className="text-xl font-black text-[var(--text-primary)] mb-8">
        Status do Processamento
      </h3>
      <div className="space-y-8">
        {steps.map((stepItem, index) => {
          const isActive = status === stepItem.id;
          const isPast = currentIndex > index;
          const Icon = stepItem.icon;

          return (
            <div
              key={stepItem.id}
              className={`flex items-start gap-4 transition-all ${
                isActive ? 'opacity-100' : isPast ? 'opacity-60' : 'opacity-30'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border-2 ${
                  isActive
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10 text-[var(--accent-color)] shadow-[0_0_20px_rgba(255,106,0,0.2)]'
                    : isPast
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                    : 'border-[var(--border-color)] bg-[var(--bg-app)] text-[var(--text-secondary)]'
                }`}
              >
                {isPast ? (
                  <CheckCircle2 size={24} />
                ) : (
                  <Icon
                    size={24}
                    className={isActive && stepItem.id === 'transforming' ? 'animate-spin' : ''}
                  />
                )}
              </div>
              <div className="flex-1 pt-1">
                <h4 className="text-lg font-bold text-[var(--text-primary)]">
                  {stepItem.title}
                </h4>
                <p className="text-sm text-[var(--text-secondary)]">{stepItem.desc}</p>
                {isActive && (
                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] font-black uppercase mb-2 text-[var(--accent-color)]">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-app)] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[var(--accent-color)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
