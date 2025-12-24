import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-gray-400">Carregando...</div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}