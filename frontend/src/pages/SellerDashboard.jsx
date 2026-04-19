import { BarChart3, Package, Warehouse } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProduits, listStocks } from '../api'
import { useAuth } from '../context/AuthContext'

export function SellerDashboard() {
  const { user } = useAuth()
  const [nProd, setNProd] = useState(0)
  const [nStock, setNStock] = useState(0)

  useEffect(() => {
    if (!user) return
    const vid = user.idUtilisateur
    fetchProduits({ limit: 500, page: 1 })
      .then((r) => setNProd(r.data.filter((p) => p.idVendeur === vid).length))
      .catch(() => setNProd(0))
    listStocks({ limit: 1, page: 1 })
      .then((r) => setNStock(r.total))
      .catch(() => setNStock(0))
  }, [user])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Tableau de bord vendeur</h1>
      <p className="mt-1 text-slate-400">Vue d’ensemble de votre activité</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/vendeur/predictions"
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827] p-6 transition hover:border-purple-400/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Prévisions</p>
            <p className="text-lg font-bold text-white">Ventes à venir</p>
            <p className="mt-1 text-xs text-slate-500">Modèle statistique sur l’historique</p>
          </div>
        </Link>
        <Link
          to="/vendeur/produits"
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827] p-6 transition hover:border-[#00d154]/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#00d154]/15 text-[#00d154]">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Mes produits</p>
            <p className="text-2xl font-bold text-white">{nProd}</p>
          </div>
        </Link>
        <Link
          to="/vendeur/stocks"
          className="flex items-center gap-4 rounded-2xl border border-white/10 bg-[#111827] p-6 transition hover:border-[#3b82f6]/40"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#3b82f6]/15 text-[#93c5fd]">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Entrepôts (global)</p>
            <p className="text-2xl font-bold text-white">{nStock}</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
