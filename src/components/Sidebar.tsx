import { useState } from "react";
import { NavLink } from "react-router-dom";
import { usePages } from "../hooks/usePages";
import { 
  Home, User, FileText, CheckSquare, BarChart2, 
  FileSpreadsheet, Layout, Search, Briefcase, ListTodo, Menu, X 
} from "lucide-react";

export default function Sidebar() {
  const { userDisplayName } = usePages();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const checkActive = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "btn active group flex items-center w-full p-3 rounded-2xl transition-all duration-300"
      : "btn group flex items-center w-full p-3 rounded-2xl transition-all duration-300 hover:bg-white/10";

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      {/* BOTÃO HAMBURGUER (Apenas Mobile) */}
      <button 
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-[5000] p-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl text-[var(--text-primary)] shadow-lg backdrop-blur-md"
      >
        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* OVERLAY ESCURO (Apenas Mobile quando aberto) */}
      {isMobileOpen && (
        <div 
          onClick={closeMobileMenu}
          className="md:hidden fixed inset-0 bg-black/60 z-[3999] backdrop-blur-sm transition-opacity"
        />
      )}

      {/* SIDEBAR */}
      <aside 
        className={`
          sidebar flex flex-col h-full z-[4000]
          fixed top-0 left-0 bottom-0
          transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        <div className="px-6 py-8 border-b border-[var(--border-color)] mb-4 shrink-0 overflow-hidden mt-10 md:mt-0">
          <p className="text-[var(--text-secondary)] text-[10px] uppercase font-black tracking-[0.2em] opacity-50 nav-label">Membro</p>
          <p className="text-[var(--text-primary)] font-bold truncate text-sm mt-1 nav-label">{userDisplayName}</p>
        </div>

        <nav className="flex flex-col gap-2 w-full flex-1 overflow-y-auto custom-scrollbar px-3 pb-20 md:pb-0">
          <NavLink to="/" className={checkActive} onClick={closeMobileMenu}>
            <Home className="nav-icon !min-w-[24px] !w-6 !h-6" />
            <span className="nav-label ml-4">Início</span>
          </NavLink>

          <NavLink to="/profile" className={checkActive} onClick={closeMobileMenu}>
            <User className="nav-icon !min-w-[24px] !w-6 !h-6" />
            <span className="nav-label ml-4">Perfil</span>
          </NavLink>

          <div className="my-4 border-t border-[var(--border-color)] opacity-20 mx-2"></div>

          <NavLink to="/workspace" className={checkActive} onClick={closeMobileMenu}>
            <Briefcase className="nav-icon !min-w-[24px] !w-6 !h-6 text-[var(--accent-color)]" />
            <span className="nav-label ml-4 font-bold">Workspace</span>
          </NavLink>

          <NavLink to="/task-tracker" className={checkActive} onClick={closeMobileMenu}>
            <ListTodo className="nav-icon !min-w-[24px] !w-6 !h-6 text-blue-500" />
            <span className="nav-label ml-4">Task Trackers</span>
          </NavLink>

          <div className="my-4 border-t border-[var(--border-color)] opacity-20 mx-2"></div>

          <NavLink to="/paginas" className={checkActive} onClick={closeMobileMenu}>
            <FileText className="nav-icon !min-w-[24px] !w-6 !h-6" />
            <span className="nav-label ml-4">Páginas</span>
          </NavLink>

          <NavLink to="/todo" className={checkActive} onClick={closeMobileMenu}>
            <CheckSquare className="nav-icon !min-w-[24px] !w-6 !h-6" />
            <span className="nav-label ml-4">Tarefas</span>
          </NavLink>

          <NavLink to="/opportunities" className={checkActive} onClick={closeMobileMenu}>
            <BarChart2 className="nav-icon !min-w-[24px] !w-6 !h-6" />
            <span className="nav-label ml-4">Oportunidades</span>
          </NavLink>

          <NavLink to="/construction" className={checkActive} onClick={closeMobileMenu}>
            <FileSpreadsheet className="nav-icon !min-w-[24px] !w-6 !h-6" />
            <span className="nav-label ml-4">Comparar Planilhas</span>
          </NavLink>

          <div className="my-4 border-t border-[var(--border-color)] opacity-20 mx-2"></div>

          <NavLink to="/dashboard" className={checkActive} onClick={closeMobileMenu}>
            <Layout className="nav-icon !min-w-[24px] !w-6 !h-6" />
            <span className="nav-label ml-4">Report</span>
          </NavLink>

          <NavLink to="/construction2" className={checkActive} onClick={closeMobileMenu}>
            <Search className="nav-icon !min-w-[24px] !w-6 !h-6" />
            <span className="nav-label ml-4">Pesquisas ETL</span>
          </NavLink>
        </nav>
      </aside>
    </>
  );
}