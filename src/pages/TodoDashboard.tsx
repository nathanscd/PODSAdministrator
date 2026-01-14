import { useNavigate } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import { Plus, Layout, ArrowRight } from "lucide-react";
import PageTransition from "../components/PageTransition";

export default function TodoDashboard() {
  const { pages, createPage, loading } = usePages();
  const navigate = useNavigate();

  const boards = pages.filter(p => p.type === 'board');

  const handleCreateBoard = async () => {
    const id = await createPage("Novo Quadro", "board");
    if (id) navigate(`/todo/${id}`);
  };

  if (loading) return null;

  return (
    <PageTransition>
      <div className="main mt-10 mr-10 -ml-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter text-[var(--text-primary)]">
              Projetos
            </h1>
            <p className="text-[var(--text-secondary)] font-bold text-[10px] uppercase tracking-[0.3em] mt-2">
              Gerenciamento de Quadros
            </p>
          </div>
          <button 
            onClick={handleCreateBoard} 
            className="flex items-center gap-2 bg-[var(--accent-color)] text-white border-none shadow-lg hover:scale-105 transition-transform"
          >
            <Plus size={20} /> Novo Quadro
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <div 
              key={board.id}
              onClick={() => navigate(`/todo/${board.id}`)}
              className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border-color)] backdrop-blur-md cursor-pointer group hover:border-[var(--accent-color)] transition-all flex flex-col justify-between min-h-[200px]"
            >
              <div>
                <div className="p-3 bg-[var(--accent-color)]/10 text-[var(--accent-color)] rounded-2xl w-fit mb-6">
                  <Layout size={24} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 truncate">
                  {board.title || "Sem título"}
                </h3>
              </div>
              
              <div className="flex justify-between items-center mt-6">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest opacity-60">
                  {Object.keys(board.columns || {}).length} Colunas
                </span>
                <div className="p-2 rounded-full bg-[var(--accent-color)] text-white opacity-0 group-hover:opacity-100 transition-all">
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}

          {boards.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] rounded-[3rem] opacity-30">
              <Layout size={48} className="mb-4" />
              <p className="font-bold uppercase tracking-widest text-sm">Nenhum quadro encontrado</p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}