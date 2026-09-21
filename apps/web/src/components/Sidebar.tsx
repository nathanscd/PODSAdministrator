import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useLang } from "../contexts/LangContext";
import { useAuth } from "../contexts/AuthContext";
import { 
  Home, FileText, CheckSquare, BarChart2, 
  FileSpreadsheet, Layout as LayoutIcon, Search, ListTodo, Building, LogOut, Check
} from "lucide-react";
import { Button } from "./ui/button";

const Tooltip = ({ label, isVisible }: { label: string; isVisible: boolean }) => (  
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, x: -4, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: -4, scale: 0.95 }}
        transition={{ duration: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-[66px] z-[10000] pointer-events-none"
      >
        <div className="px-2.5 py-1 bg-[var(--popover)]/90 backdrop-blur-xl text-[var(--popover-foreground)] border border-[var(--border)]/60 rounded-lg shadow-lg whitespace-nowrap">
          <span className="text-[11px] font-medium tracking-tight">{label}</span>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default function Sidebar() {
  const { user, company, workspaces, activeWorkspace, setActiveWorkspace, logout } = useAuth();
  const { t } = useLang();
  const location = useLocation();
  const [hoveredIdx, setHoveredIdx] = useState<string | null>(null);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const navItems = [
    { to: "/", icon: <Home size={19} />, label: t.sidebar.home, id: 'home' },
    { to: "/task-tracker", icon: <ListTodo size={19} />, label: t.sidebar.taskTrackers, id: 'tasks' },
    { to: "/paginas", icon: <FileText size={19} />, label: t.sidebar.pages, id: 'pages' },
    { to: "/todo", icon: <CheckSquare size={19} />, label: t.sidebar.tasks, id: 'todo' },
    { to: "/opportunities", icon: <BarChart2 size={19} />, label: t.sidebar.opportunities, id: 'opps' },
    { to: "/comparacao", icon: <FileSpreadsheet size={19} />, label: t.sidebar.compareSheets, id: 'compare' },
    { to: "/reports", icon: <LayoutIcon size={19} />, label: t.sidebar.report, id: 'reports' },
    { to: "/pesquisas", icon: <Search size={19} />, label: t.sidebar.etlSearch, id: 'search' },
  ];

  return (
    <aside 
      className="fixed top-0 left-0 bottom-0 z-[7000] w-[70px] flex flex-col items-center py-4 bg-[var(--sidebar)] border-r border-[var(--sidebar-border)] transition-all duration-300 select-none"
    >
      {/* Workspace / Company Switcher Indicator */}
      <div className="relative mb-5">
        <Button
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          className="w-10 h-10 text-[var(--foreground)] bg-[var(--muted-foreground)]/30 flex justify-center items-center border"
          title={company?.name || "Atlas Workspace"}
        >
          {company?.logoUrl ? (
            <img src={company.logoUrl} alt="Logo" className="w-5 h-5 rounded-md object-cover" />
          ) : (
            <Building size={19} className="transition-transform absolute" />
          )}
        </Button>

        {/* Workspace Popup Menu */}
        <AnimatePresence>
          {isWorkspaceMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: 8, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 8, scale: 0.95 }}
              transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-[78px] top-0 w-60 bg-[var(--popover)]/90 backdrop-blur-2xl border border-[var(--border)]/60 rounded-2xl shadow-[var(--shadow-elevation)] p-3 z-[8000]"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-2 px-2">
                {company?.name || "Organização"}
              </div>
              <div className="space-y-1 mb-2">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                      activeWorkspace?.id === ws.id
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold shadow-sm"
                        : "hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {activeWorkspace?.id === ws.id && <Check size={14} className="shrink-0" />}
                  </button>
                ))}
              </div>
              <div className="border-t border-[var(--border)]/50 pt-2 mt-2 px-2 flex items-center justify-between text-xs text-[var(--muted-foreground)]">
                <span className="truncate max-w-[140px] font-medium">{user?.displayName || user?.email}</span>
                <button 
                  onClick={() => logout()}
                  className="p-1 hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                  title="Sair"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Icons */}
      <nav className="flex-1 flex flex-col items-center gap-2 w-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <div 
              key={item.to} 
              className="relative w-full flex justify-center"
              onMouseEnter={() => setHoveredIdx(item.id)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `
                  group relative flex h-10 w-10 items-center justify-center
                  rounded-xl
                  transition-all duration-300 ease-out
                  hover:scale-[1.02]
                  active:scale-95
                  cursor-default
                  ${
                    isActive
                      ? `
                        bg-card
                        text-foreground
                        border border-border/50
                        shadow-sm
                        backdrop-blur-md
                      `
                      : `
                        text-muted-foreground
                        hover:text-foreground
                        hover:bg-muted/70
                        hover:backdrop-blur-sm
                      `
                  }
                `
                }
              >
                <span className="transition-transform duration-300 group-hover:scale-105">
                  {item.icon}
                </span>

                <span
                  className={`
                    absolute inset-0
                    rounded-xl
                    ring-1 ring-transparent
                    transition-all duration-300
                    group-hover:ring-border/40
                  `}
                />
              </NavLink>
              <Tooltip label={item.label} isVisible={hoveredIdx === item.id} />
            </div>
          );
        })}
      </nav>
    </aside>
  );
}


