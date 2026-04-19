import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth({ children, roles }) {
  const { user, ready } = useAuth()
  const loc = useLocation()

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-400">Chargement…</div>
    )
  }

  if (!user) {
    return <Navigate to="/connexion" replace state={{ from: loc.pathname }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
