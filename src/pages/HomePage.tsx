import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import PageTransition from "../components/PageTransition";

export default function HomePage() {
  return (
    <PageTransition>
        <div className="app-container">
        <Sidebar />
        <h1>PODS</h1>
        <div className="main">
          <Outlet />
        </div>
      </div>
    </PageTransition>
  );
}