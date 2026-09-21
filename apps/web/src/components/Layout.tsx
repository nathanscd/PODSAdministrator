import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]">
      <Sidebar />
      <Header />
      <main className="pl-[70px] pt-14 min-h-screen w-full box-border">
        <div className="px-4 py-6 sm:px-6 lg:px-8 w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

