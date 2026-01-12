import { useNavigate } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import PageTransition from "../components/PageTransition";
import { User, FileText, Trash2, Clock, Globe, Lock } from "lucide-react";

export default function PagesDashboard() {
  const { pages, createPage, deletePage, loading } = usePages();
  const navigate = useNavigate();

  const handleCreate = async () => {
    const newId = await createPage("", "document");
    if (newId) navigate(`/page/${newId}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Mover para a lixeira?")) await deletePage(id);
  };

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-app)] text-[var(--accent-color)] font-black uppercase tracking-[0.4em] animate-pulse">
      Sincronizando...
    </div>
  );

  const docPages = pages.filter(p => p.type === 'document');

  return (
    <PageTransition>
      <div className="flex flex-col items-center py-12 px-6 w-full max-w-7xl mx-auto">
        <div className="w-full flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">Documentos</h2>
            <p className="text-[var(--text-secondary)] text-xs font-bold uppercase tracking-widest opacity-40">Gestão de arquivos da equipe</p>
          </div>
          <button onClick={handleCreate} className="bg-[var(--accent-color)] text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:scale-105 transition-all border-none">
            Nova Página
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {docPages.map((page) => (
            <div 
              key={page.id} 
              onClick={() => navigate(`/page/${page.id}`)} 
              className="group relative p-8 rounded-[2.5rem] bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-[var(--accent-color)] cursor-pointer transition-all duration-500 backdrop-blur-md flex flex-col justify-between h-64"
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[var(--bg-app)] rounded-2xl border border-[var(--border-color)] text-[var(--accent-color)] group-hover:bg-[var(--accent-color)] group-hover:text-white transition-all">
                      <FileText size={24} />
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                      page.isPublic ? "border-green-500/20 text-green-500 bg-green-500/5" : "border-orange-500/20 text-orange-500 bg-orange-500/5"
                    }`}>
                      {page.isPublic ? <Globe size={10} /> : <Lock size={10} />}
                      {page.isPublic ? "Público" : "Privado"}
                    </div>
                  </div>
                  <button onClick={(e) => handleDelete(e, page.id)} className="opacity-0 group-hover:opacity-100 p-2 text-red-500 transition-all hover:scale-110">
                    <Trash2 size={18} />
                  </button>
                </div>
                <h4 className="text-xl font-bold text-[var(--text-primary)] truncate mb-2">{page.title || "Sem título"}</h4>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[var(--bg-app)] rounded-full border border-[var(--border-color)]">
                    <User size={10} className="text-[var(--accent-color)]" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                    {(page as any).ownerName || "Membro"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[var(--text-secondary)] opacity-40">
                  <Clock size={10} />
                  <span className="text-[9px] font-bold uppercase">{page.createdAt?.toDate?.().toLocaleDateString('pt-BR') || "Recent"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}