import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="space-y-4">
      <Outlet />
    </div>
  );
}
