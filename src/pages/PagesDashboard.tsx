import { useNavigate } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import Sidebar from "../components/Sidebar";

export default function PagesDashboard() {
  const { pages, deletePage } = usePages();
  const navigate = useNavigate();

  const handleDelete = async (id: string) => {
    if (confirm("Deletar permanentemente?")) {
      await deletePage(id);
    }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Minhas Páginas</h2>
      <div className="grid gap-4">
        {pages.map((page) => (
          <div
            key={page.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow bg-white"
          >
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => navigate(`/page/${page.id}`)}
            >
              <h3 className="font-medium text-blue-600">{page.title || "Sem título"}</h3>
              <p className="text-xs text-gray-400">ID: {page.id}</p>
            </div>
            <button
              onClick={() => handleDelete(page.id)}
              className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors"
            >
              🗑️ Deletar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}