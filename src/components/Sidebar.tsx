import { Link } from "react-router-dom";
import { usePages } from "../hooks/usePages";

export default function Sidebar() {
  const { createPage } = usePages();

  return (
    <aside className="sidebar">
      <div className="p-4 border-b">
        <h1 className="font-bold text-lg">PODS</h1>
      </div>
      
      <nav className="btns">
        <Link to="/dashboard" className="btn">📊 Dashboard</Link>
        <Link to="/perfil" className="btn">👤 Perfil</Link>
        <Link to="/paginas" className="btn">📁 Minhas Páginas</Link>

        <hr className="my-4" />
        
        <button
          onClick={() => createPage()}
          className="w-full flex items-center justify-center p-2 bg-blue-600 text-white hover:bg-blue-700 rounded text-sm transition-all"
        >
          + Nova Página
        </button>
      </nav>
    </aside>
  );
}