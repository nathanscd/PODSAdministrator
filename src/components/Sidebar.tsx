import { useNavigate, useParams } from "react-router-dom";
import { usePages } from "../hooks/usePages";

export default function Sidebar() {
  const { pages, createPage, deletePage } = usePages();
  const navigate = useNavigate();
  const { pageId } = useParams();

  const handleCreate = async () => {
    const id = await createPage();
    if (id) navigate(`/page/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Deseja deletar esta página?")) {
      await deletePage(id);
      if (pageId === id) navigate("/");
    }
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col h-full select-none">
      <div className="p-4">
        <button
          onClick={handleCreate}
          className="w-full flex items-center justify-center p-2 bg-white hover:bg-gray-100 rounded border border-gray-300 text-sm font-medium transition-all shadow-sm"
        >
          + Nova Página
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto px-2 space-y-1">
        {pages.map((page) => (
          <div
            key={page.id}
            onClick={() => navigate(`/page/${page.id}`)}
            className={`group flex items-center justify-between p-2 cursor-pointer rounded transition-colors text-sm ${
              pageId === page.id ? "bg-gray-200 text-black" : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center overflow-hidden">
              <span className="mr-2">📄</span>
              <span className="truncate">{page.title || "Sem título"}</span>
            </div>
            <button
              onClick={(e) => handleDelete(e, page.id)}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-300 rounded text-gray-500 transition-opacity"
            >
              🗑️
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}