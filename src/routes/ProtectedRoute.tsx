import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { Logo } from "@/components/Logo";

function FullScreenLoader() {
  return (
    <div className="bg-paper grid min-h-dvh place-items-center">
      <div className="flex flex-col items-center gap-4">
        <Logo />
        <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-shimmer rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

/** Forces profile completion before the rest of the app is reachable. */
export function RequireOnboarded() {
  const { userData, loading } = useAuth();
  if (loading) return <FullScreenLoader />;
  if (userData && !userData.profile.onboarded) return <Navigate to="/app/profile" replace />;
  return <Outlet />;
}
