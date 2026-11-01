import { Navigate, Outlet, useLocation } from 'react-router-dom'
import LoadingState from '../components/LoadingState'
import { useAuth } from './useAuth'

export default function RouteGuard({ allowedRoles }) {
  const { user, loading, roleHome } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="container py-5"><LoadingState label="Checking your session…" /></div>
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={roleHome} replace />
  }

  return <Outlet />
}
