import { BarChart3, LayoutDashboard, Package, User, Warehouse } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from './NotificationBell'

const link =
  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-white/5'
const active = 'bg-[#00d154]/15 text-[#00d154] border border-[#00d154]/30'

export function SellerLayout() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen bg-[#06080f] text-slate-100">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/5 bg-[#0a1628] md:flex">
        <div className="border-b border-white/5 p-4">
          <p className="text-xs uppercase tracking-wider text-slate-500">Espace vendeur</p>
          <p className="truncate font-semibold">{user?.email}</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <NavLink to="/vendeur" end className={({ isActive }) => `${link} ${isActive ? active : 'text-slate-300'}`}>
            <LayoutDashboard className="h-4 w-4" />
            Tableau de bord
          </NavLink>
          <NavLink
            to="/vendeur/profil"
            className={({ isActive }) => `${link} ${isActive ? active : 'text-slate-300'}`}
          >
            <User className="h-4 w-4" />
            Mon profil
          </NavLink>
          <NavLink
            to="/vendeur/produits"
            className={({ isActive }) => `${link} ${isActive ? active : 'text-slate-300'}`}
          >
            <Package className="h-4 w-4" />
            Produits
          </NavLink>
          <NavLink
            to="/vendeur/stocks"
            className={({ isActive }) => `${link} ${isActive ? active : 'text-slate-300'}`}
          >
            <Warehouse className="h-4 w-4" />
            Stocks
          </NavLink>
          <NavLink
            to="/vendeur/predictions"
            className={({ isActive }) => `${link} ${isActive ? active : 'text-slate-300'}`}
          >
            <BarChart3 className="h-4 w-4" />
            Prévisions ventes
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
        <header className="flex items-center justify-between border-b border-white/5 bg-[#0a1628]/90 px-4 py-3">
          <p className="font-semibold md:hidden">Vendeur</p>
          <span className="hidden flex-1 md:block" aria-hidden />
          <NotificationBell accent="green" />
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
