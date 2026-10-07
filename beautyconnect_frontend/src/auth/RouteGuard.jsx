import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function RouteGuard({ allowedRoles }) {
  const { user, loading, roleHome } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="container py-5 text-center" role="status">Checking your session…</div>
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome} replace />
  }

  return <Outlet />
}
