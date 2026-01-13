import { NavLink } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import { Home, User, FileText, CheckSquare, BarChart2, FileSpreadsheet, Layout, Search } from "lucide-react";

export default function Sidebar() {
  const { pages, userDisplayName } = usePages();
  const firstDoc = pages.find((p) => p.type === "document");

  const checkActive = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "btn active group flex items-center w-full p-3 rounded-2xl transition-all duration-300"
      : "btn group flex items-center w-full p-3 rounded-2xl transition-all duration-300 hover:bg-white/10";

  return (
    <aside className="sidebar flex flex-col h-full z-[100]">
      <div className="px-6 py-8 border-b border-[var(--border-color)] mb-4 shrink-0 overflow-hidden">
        <p className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-[0.2em] opacity-50 nav-label">Membro</p>
        <p className="text-[var(--text-primary)] font-bold truncate text-sm mt-1 nav-label">{userDisplayName}</p>
      </div>

      <nav className="flex flex-col gap-2 w-full flex-1 overflow-y-auto custom-scrollbar px-3">
        <NavLink to="/" className={checkActive}>
          <Home className="nav-icon !min-w-[24px] !w-6 !h-6" />
          <span className="nav-label ml-4">Início</span>
        </NavLink>

        <NavLink to="/profile" className={checkActive}>
          <User className="nav-icon !min-w-[24px] !w-6 !h-6" />
          <span className="nav-label ml-4">Perfil</span>
        </NavLink>

        <div className="my-4 border-t border-[var(--border-color)] opacity-20 mx-2"></div>

        <NavLink to="/paginas" className={checkActive}>
          <FileText className="nav-icon !min-w-[24px] !w-6 !h-6" />
          <span className="nav-label ml-4">Páginas</span>
        </NavLink>

        <NavLink to="/todo" className={checkActive}>
          <CheckSquare className="nav-icon !min-w-[24px] !w-6 !h-6" />
          <span className="nav-label ml-4">Tarefas</span>
        </NavLink>

        <NavLink to="/opportunities" className={checkActive}>
          <BarChart2 className="nav-icon !min-w-[24px] !w-6 !h-6" />
          <span className="nav-label ml-4">Oportunidades</span>
        </NavLink>

        <NavLink to="/comparacao" className={checkActive}>
          <FileSpreadsheet className="nav-icon !min-w-[24px] !w-6 !h-6" />
          <span className="nav-label ml-4">Comparar Planilhas</span>
        </NavLink>

        <div className="my-4 border-t border-[var(--border-color)] opacity-20 mx-2"></div>

        <NavLink to="/dashboard" className={checkActive}>
          <Layout className="nav-icon !min-w-[24px] !w-6 !h-6" />
          <span className="nav-label ml-4">Report</span>
        </NavLink>

        <NavLink to="/pesquisa" className={checkActive}>
          <Search className="nav-icon !min-w-[24px] !w-6 !h-6" />
          <span className="nav-label ml-4">Pesquisas ETL</span>
        </NavLink>
      </nav>
    </aside>
  );
}