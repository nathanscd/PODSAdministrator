import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const checkActive = ({ isActive }: { isActive: boolean }) => 
    isActive 
      ? "btn active group flex items-center w-full p-3 rounded-2xl transition-all duration-300" 
      : "btn group flex items-center w-full p-3 rounded-2xl transition-all duration-300 hover:bg-white/10";

  return (
    <aside className="sidebar flex flex-col h-full z-50">
      <nav className="flex flex-col gap-2 w-full mt-4">
        <NavLink to="/home" className={checkActive}>
          <svg className="nav-icon w-6 h-6 shrink-0 transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
          </svg>
          <span className="nav-label ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Home
          </span>
        </NavLink>

        <NavLink to="/profile" className={checkActive}>
          <svg className="nav-icon w-6 h-6 shrink-0 transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
          <span className="nav-label ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Perfil
          </span>
        </NavLink>       

        <NavLink to="/dashboard" className={checkActive}>
          <svg className="nav-icon w-6 h-6 shrink-0 transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13 3v6h8V3h-8zM3 21h8v-6H3v6zM3 3v10h8V3H3zm10 18h8v-10h-8v10z" />
          </svg>
          <span className="nav-label ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Dashboards
          </span>
        </NavLink>

        <NavLink to="/paginas" className={checkActive}>
          <svg className="nav-icon w-6 h-6 shrink-0 transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
          <span className="nav-label ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Páginas
          </span>
        </NavLink>

        <NavLink to="/todo/main-board" className={checkActive}>
          <svg className="nav-icon w-6 h-6 shrink-0 transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
          <span className="nav-label ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Tarefas
          </span>
        </NavLink>
      </nav>
    </aside>
  );
}