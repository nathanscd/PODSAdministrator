import { useNavigate } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import PageTransition from "../components/PageTransition";

export default function PagesDashboard() {
  const { pages, createPage, deletePage } = usePages();
  const navigate = useNavigate();

  // Criação simplificada: Apenas "document"
  const handleCreate = async () => {
    const newId = await createPage("document"); 
    navigate(`/page/${newId}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Mover para a lixeira?")) {
      await deletePage(id);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#F7F7F5] flex flex-col items-center py-20 px-4">
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-xl font-semibold text-[#37352F] flex items-center gap-2">
              <span className="text-2xl">📝</span> Minhas Páginas
            </h2>
            <button 
              onClick={handleCreate}
              className="bg-[#2383E2] hover:bg-[#1C6BB1] text-white px-3 py-1.5 rounded text-sm font-medium transition-colors shadow-sm"
            >
              + Nova página
            </button>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-2">
              Documentos Recentes
            </h3>
            
            {pages.filter(p => p.type === 'document').length === 0 && (
               <p className="text-gray-400 text-sm px-2">Nenhum documento criado.</p>
            )}

            {pages
              .filter((page) => page.type === "document") // Filtra apenas páginas de texto
              .map((page) => (
              <div
                key={page.id}
                onClick={() => navigate(`/page/${page.id}`)}
                className="group flex items-center justify-between p-2 rounded hover:bg-[#EFEFED] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className="text-lg opacity-70">📄</span>
                  <span className="text-[#37352F] font-medium truncate text-sm">
                    {page.title || "Sem título"}
                  </span>
                </div>
                
                <button
                  onClick={(e) => handleDelete(e, page.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded text-gray-500 transition-all"
                  title="Deletar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}