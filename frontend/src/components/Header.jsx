import { Heart, Menu, Search, ShoppingCart, User } from 'lucide-react'
import { NotificationBell } from './NotificationBell'
import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { fetchCategories } from '../api'
import { useAuth } from '../context/AuthContext'
import { useShopCounts } from '../context/ShopCountsContext'

const navClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? 'text-[#3b82f6]' : 'text-slate-200 hover:text-white'}`

export function Header() {
  const { user, logout } = useAuth()
  const { cartQty, favCount } = useShopCounts()
  const navigate = useNavigate()
  const [cats, setCats] = useState([])
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    fetchCategories()
      .then((r) => setCats(r.data))
      .catch(() => setCats([]))
  }, [])

  const onSearch = (e) => {
    e.preventDefault()
    const s = q.trim()
    navigate(s ? `/recherche?q=${encodeURIComponent(s)}` : '/recherche')
  }

  const topCats = cats.slice(0, 5)

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a1628]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-4 py-3 md:gap-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-white md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="text-xl font-bold tracking-tight">
            <span className="text-white">Tech</span>
            <span className="text-[#3b82f6]">Store</span>
          </Link>
        </div>

        <nav
          className={`order-3 flex w-full flex-col gap-3 md:order-none md:flex md:w-auto md:flex-row md:items-center md:gap-6 ${open ? 'flex' : 'hidden md:flex'}`}
        >
          <NavLink to="/" end className={navClass}>
            Accueil
          </NavLink>
          {topCats.map((c) => (
            <NavLink key={c.idCategorie} to={`/categorie/${c.idCategorie}`} className={navClass}>
              {c.nomCat}
            </NavLink>
          ))}
          <NavLink to="/devenir-vendeur" className={navClass}>
            Devenir vendeur
          </NavLink>
        </nav>

        <form onSubmit={onSearch} className="mx-auto flex max-w-xl flex-1 items-center gap-2 md:min-w-[240px]">
          <div className="relative flex w-full items-center">
            <Search className="pointer-events-none absolute left-3 h-4 w-4 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full rounded-full border border-white/10 bg-[#111827] py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-[#3b82f6] focus:outline-none focus:ring-1 focus:ring-[#3b82f6]"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Link
            to="/favoris"
            className="relative rounded-full p-2.5 text-white transition hover:bg-white/10"
            title="Favoris"
          >
            <Heart className="h-5 w-5" />
            {favCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {favCount > 99 ? '99+' : favCount}
              </span>
            ) : null}
          </Link>
          <Link
            to="/panier"
            className="relative rounded-full p-2.5 text-white transition hover:bg-white/10"
            title="Panier"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartQty > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#00d154] px-1 text-[10px] font-bold leading-none text-black">
                {cartQty > 99 ? '99+' : cartQty}
              </span>
            ) : null}
          </Link>
          {user ? <NotificationBell accent="green" /> : null}
          {user ? (
            <div className="flex items-center gap-1">
              <Link
                to={user.role === 'admin' ? '/admin' : user.role === 'vendeur' ? '/vendeur' : '/parametres'}
                className="rounded-full p-2.5 text-white transition hover:bg-white/10"
                title="Compte"
              >
                <User className="h-5 w-5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="hidden rounded-lg px-2 py-1 text-xs text-slate-400 hover:text-white sm:block"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/connexion"
              className="rounded-full p-2.5 text-white transition hover:bg-white/10"
              title="Connexion"
            >
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
