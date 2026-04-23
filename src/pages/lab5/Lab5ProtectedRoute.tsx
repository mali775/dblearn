import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getCurrentUser } from "../../app/lib/auth";

export default function Lab5ProtectedRoute() {
  const location = useLocation();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/lab5/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
