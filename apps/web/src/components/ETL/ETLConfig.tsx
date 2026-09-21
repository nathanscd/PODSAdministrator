import React from 'react';
import { LayoutTemplate, Search, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ETLConfigProps {
  theme: string;
  setTheme: (t: string) => void;
  sources: { api: boolean; db: boolean; web: boolean; docs: boolean };
  setSources: React.Dispatch<React.SetStateAction<{ api: boolean; db: boolean; web: boolean; docs: boolean }>>;
  isRunning: boolean;
  serverStatus: string;
  handleStartETL: () => void;
  buttonDisabled: boolean;
  errorMsg: string;
  status: string;
}

export const ETLConfig: React.FC<ETLConfigProps> = ({
  theme,
  setTheme,
  sources,
  setSources,
  isRunning,
  serverStatus,
  handleStartETL,
  buttonDisabled,
  errorMsg,
  status,
}) => {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[2rem] p-8 shadow-xl backdrop-blur-sm">
      <h2 className="text-2xl font-black text-[var(--text-primary)] mb-6 flex items-center gap-3">
        <LayoutTemplate className="text-[var(--accent-color)]" /> Configuração da Pipeline
      </h2>

      <div className="space-y-6">
        <div>
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] block mb-3">
            Tema da Pesquisa
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Ex: Mercado de EVs no Brasil 2025"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !buttonDisabled && handleStartETL()}
              disabled={isRunning}
              className="w-full bg-[var(--bg-app)] border-2 border-[var(--border-color)] rounded-xl pl-12 pr-4 py-4 text-[var(--text-primary)] font-bold outline-none focus:border-[var(--accent-color)] transition-colors disabled:opacity-50"
            />
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
              size={20}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-black uppercase tracking-widest text-[var(--text-secondary)] block mb-3">
            Fontes de Extração
          </label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'api', label: 'APIs Externas' },
              { id: 'db', label: 'Bancos Relacionais' },
              { id: 'web', label: 'Web Scraping' },
              { id: 'docs', label: 'Documentos (PDF/XLS)' },
            ].map((src) => (
              <label
                key={src.id}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  sources[src.id as keyof typeof sources]
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/5'
                    : 'border-[var(--border-color)] bg-[var(--bg-app)] hover:border-[var(--text-secondary)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center border ${
                    sources[src.id as keyof typeof sources]
                      ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white'
                      : 'border-[var(--text-secondary)]'
                  }`}
                >
                  {sources[src.id as keyof typeof sources] && <CheckCircle2 size={14} />}
                </div>
                <span className="text-sm font-bold text-[var(--text-primary)]">
                  {src.label}
                </span>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={sources[src.id as keyof typeof sources]}
                  disabled={isRunning}
                  onChange={() =>
                    setSources((s) => ({
                      ...s,
                      [src.id]: !s[src.id as keyof typeof sources],
                    }))
                  }
                />
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartETL}
          disabled={buttonDisabled}
          className="w-full bg-[var(--accent-color)] text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-4"
        >
          <RefreshCw size={18} className={isRunning ? 'animate-spin' : ''} />
          {serverStatus === 'waking'
            ? 'Aguarde, acordando servidor…'
            : isRunning
            ? 'Processando...'
            : 'Executar Pipeline ETL'}
        </button>

        {status === 'error' && (
          <p className="text-red-400 text-sm font-bold text-center">⚠ {errorMsg}</p>
        )}
      </div>
    </div>
  );
};
