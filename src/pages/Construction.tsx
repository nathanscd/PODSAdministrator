import { useNavigate } from "react-router-dom";
import { Construction, ArrowLeft } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function UnderConstruction() {
  const navigate = useNavigate();

  return (
    <PageTransition>
      <div className="min-h-screen bg-[var(--bg-app)] flex flex-col items-center justify-center p-8 text-center">
        
        {/* Ícone Animado */}
        <div className="mb-8 p-8 bg-[var(--accent-color)]/10 rounded-full border border-[var(--accent-color)]/20 animate-pulse">
          <Construction size={64} className="text-[var(--accent-color)]" />
        </div>

        {/* Título */}
        <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-[var(--text-primary)] mb-4 leading-none">
          Em <br/>Construção
        </h1>

        {/* Subtítulo */}
        <p className="text-xs md:text-sm font-bold text-[var(--text-secondary)] uppercase tracking-[0.3em] mb-12 max-w-lg opacity-60">
          Esta funcionalidade estará disponível em breve. 
        </p>

        {/* Botão Voltar */}
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-3 px-8 py-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl hover:border-[var(--accent-color)] hover:bg-[var(--accent-color)]/5 transition-all shadow-xl"
        >
          <ArrowLeft size={20} className="text-[var(--text-primary)] group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)]">
            Voltar ao Início
          </span>
        </button>

      </div>
    </PageTransition>
  );
}