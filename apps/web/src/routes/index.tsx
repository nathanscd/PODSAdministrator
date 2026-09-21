import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense, lazy } from "react";
import { usePlatform } from "../core/providers/PlatformProvider";
import PrivateRoute from "../components/PrivateRoute";
import Layout from "../components/Layout";

const UnderConstruction = lazy(() => import("../pages/Construction"));
const LoginPage = lazy(() => import("../pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/Auth/ForgotPasswordPage"));
const Initial = lazy(() => import("../pages/Initial"));
const ProfilePage = lazy(() => import("../pages/ProfilePage"));
const WorkspacePage = lazy(() => import("../pages/WorkspacePage"));
const PagesDashboard = lazy(() => import("../pages/PagesDashboard"));
const TodoDashboard = lazy(() => import("../pages/TodoDashboard"));
const TodoPages = lazy(() => import("../pages/ToDoPage"));
const OpportunityPage = lazy(() => import("../pages/OpportunityPage"));
const Comparacao = lazy(() => import("../pages/Comparacao"));
const AMIWinLossReport = lazy(() => import("../pages/AMIWinLossReport"));
const Workspace = lazy(() => import("../pages/Workspace"));
const TaskTrackerDashboard = lazy(() => import("../pages/TaskTrackerDashboard"));
const TaskTrackerPages = lazy(() => import("../pages/TaskTrackerPages"));
const AdminUsersPage = lazy(() => import("../pages/AdminUsersPage"));
const ChangelogPage = lazy(() => import("../pages/ChangelogPage"));
const Orca = lazy(() => import("../pages/ORCAS"));
const Templates = lazy(() => import("../pages/Templates"));
const SampleControl = lazy(() => import("../pages/SampleControl"));
const EquipmentControl = lazy(() => import("../pages/ActiveControl"));
const ChipControl = lazy(() => import("../pages/ChipControl"));
const Reports = lazy(() => import("../pages/Reports"));
const ETLResearch = lazy(() => import("../pages/ETLResearch"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const Testbooks = lazy(() => import("../pages/Testbooks"));
const TestbookEditor = lazy(() => import("../pages/TestbookEditor"));
const PantheonTestbook = lazy(() => import("../pages/Testbooks/PantheonTestbook"));
const Streetlight = lazy(() => import("../pages/Testbooks/Streelight"));
const Zeus = lazy(() => import("../pages/Testbooks/Zeus"));
const SESampleControl = lazy(() => import("../pages/SalesEngineering/SESampleControl"));

function AppRoutes() {
  const { modules } = usePlatform();

  return (
    <Suspense fallback={<div className="p-6 text-[var(--text-primary)]">Loading Atlas…</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/se-sample-control" element={<SESampleControl />} />
        <Route path="/testbooks" element={<Testbooks />} />
        <Route path="/testbook/:testbookId" element={<TestbookEditor />} />
        <Route path="/pantheon-ng" element={<PantheonTestbook />} />
        <Route path="/streetlight" element={<Streetlight />} />
        <Route path="/zeus" element={<Zeus />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Initial />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/page/:pageId" element={<WorkspacePage />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/AMIWinLossReport" element={<AMIWinLossReport />} />
            <Route path="/paginas" element={<PagesDashboard />} />
            <Route path="/todo" element={<TodoDashboard />} />
            <Route path="/todo/:pageId" element={<TodoPages />} />
            <Route path="/opportunities" element={<OpportunityPage />} />
            <Route path="/comparacao" element={<Comparacao />} />
            <Route path="/pesquisas" element={<ETLResearch />} />
            <Route path="/task-tracker" element={<TaskTrackerDashboard />} />
            <Route path="/task-tracker/:id" element={<TaskTrackerPages />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/ambients" element={<Orca />} />
            <Route path="/amostras" element={<SampleControl />} />
            <Route path="/tracking-equipments" element={<EquipmentControl />} />
            <Route path="/chips" element={<ChipControl />} />
            <Route path="/changelog" element={<ChangelogPage />} />
            <Route path="/admin" element={<AdminUsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/construction" element={<UnderConstruction />} />
            {modules.map((module) =>
              module.routes?.map((route) => <Route key={`${module.key}-${route}`} path={route} element={<Initial />} />),
            )}
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
