import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PagesDashboard from "./pages/PagesDashboard";
import WorkspacePage from "./pages/WorkspacePage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />}>
        <Route index element={<div>Dashboard Principal</div>} />
        <Route path="perfil" element={<div>Perfil do Usuário</div>} />
        <Route path="paginas" element={<PagesDashboard />} />
        <Route path="page/:pageId" element={<WorkspacePage />} />
      </Route>
    </Routes>
  );
}