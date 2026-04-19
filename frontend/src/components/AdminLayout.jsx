import { ClipboardList, LayoutDashboard, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from './NotificationBell'

const link =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-white/5'
const active = 'bg-[#3b82f6]/20 text-[#93c5fd] border border-[#3b82f6]/30'

export function AdminLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-[#06080f] text-slate-100">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/5 bg-[#0a1628] md:flex">
        <div className="border-b border-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Administration</p>
          <p className="truncate font-semibold">{user?.email}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLink to="/admin" end className={({ isActive }) => `${link} ${isActive ? active : 'text-slate-300'}`}>
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/utilisateurs"
            className={({ isActive }) => `${link} ${isActive ? active : 'text-slate-300'}`}
          >
            <Users className="h-4 w-4" />
            Utilisateurs
          </NavLink>
          <NavLink
            to="/admin/demandes"
            className={({ isActive }) => `${link} ${isActive ? active : 'text-slate-300'}`}
          >
            <ClipboardList className="h-4 w-4" />
            Demandes vendeur
          </NavLink>
        </nav>
        <div className="border-t border-white/5 p-3">
          <NavLink to="/" className="block rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-white">
            ← Boutique
          </NavLink>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-white"
          >
            Déconnexion
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-end gap-2 border-b border-white/5 bg-[#0a1628]/90 px-4 py-3">
          <NavLink to="/notifications" className="text-xs text-slate-400 hover:text-white md:hidden">
            Notifications
          </NavLink>
          <NotificationBell />
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
