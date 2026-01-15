import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { logAction } from "./utils/systemLogger";
import { ToastProvider } from "./contexts/ToastContext";
import { NotificationListener } from "./components/NotificationListener"; // <--- IMPORTAR

// ... outros imports (PagesDashboard, etc) ...
import PagesDashboard from "./pages/PagesDashboard";
import WorkspacePage from "./pages/WorkspacePage";
import Initial from "./pages/Initial";
import TodoPages from "./pages/ToDoPage";
import TodoDashboard from "./pages/TodoDashboard";
import OpportunityPage from "./pages/OpportunityPage";
import SpreadsheetPage from "./pages/SpreadsheetPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import Dashboards from "./pages/Dashboards";
import Layout from "./components/Layout";
import Workspace from "./pages/Workspace";
import TaskTrackerDashboard from "./pages/TaskTrackerDashboard";
import TaskTrackerPages from "./pages/TaskTrackerPages";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import UnderConstruction from "./pages/Construction";
import ChangelogPage from "./pages/ChangelogPage";

function App() {
  
  useEffect(() => {
    // ... seu código de verificação de sistema ...
  }, []);

  return (
    <ToastProvider> 
      {/* O NotificationListener precisa estar DENTRO do ToastProvider e AuthContext(geralmente no index ou PrivateRoute) */}
      <NotificationListener /> 

      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route index element={<Initial />} />
              <Route path="dashboard" element={<Dashboards />} />
              <Route path="paginas" element={<PagesDashboard />} />
              <Route path="page/:pageId" element={<WorkspacePage />} />
              <Route path="todo" element={<TodoDashboard />} />
              <Route path="todo/:pageId" element={<TodoPages />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="comparacao" element={<SpreadsheetPage />} />
              <Route path="opportunities" element={<OpportunityPage />} />
              <Route path="/task-tracker" element={<TaskTrackerDashboard />} />
              <Route path="/task-tracker/:id" element={<TaskTrackerPages />} />            
              <Route path="workspace" element={<Workspace />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/changelog" element={<ChangelogPage />} />
              <Route path="/construction" element={<UnderConstruction />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;