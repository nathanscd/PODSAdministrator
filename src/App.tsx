import { BrowserRouter, Routes, Route } from "react-router-dom";
import PagesDashboard from "./pages/PagesDashboard";
import WorkspacePage from "./pages/WorkspacePage";
import TodoPage from "./pages/ToDoPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import PrivateRoute from "./components/PrivateRoute";
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rotas Privadas (Protegidas) */}
        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<PagesDashboard />} />
            <Route path="/page/:pageId" element={<WorkspacePage />} />
            <Route path="/todo/:pageId" element={<TodoPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;