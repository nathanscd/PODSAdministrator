import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PagesDashboard from "./pages/PagesDashboard";
import WorkspacePage from "./pages/WorkspacePage";
import Initial from "./pages/Initial";
import ToDoPage from "./pages/ToDoPage"; // Verifique se é ToDoPage ou TodoPage no arquivo
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import Dashboards from "./pages/Dashboards";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Initial />} />
            <Route path="dashboard" element={<Dashboards />} />
            <Route path="paginas" element={<PagesDashboard />} />
            <Route path="page/:pageId" element={<WorkspacePage />} />
            <Route path="todo/:pageId" element={<ToDoPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Redireciona qualquer rota desconhecida para a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;