import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function HomePage() {
  return (
    <div className="flex h-screen w-full bg-white text-gray-800 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}