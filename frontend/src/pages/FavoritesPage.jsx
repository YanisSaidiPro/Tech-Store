import { HeartOff } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchProduit, listFavoris, removeFavori } from '../api'
import { useAuth } from '../context/AuthContext'
import { useShopCounts } from '../context/ShopCountsContext'
import { formatMoneyDA } from '../utils/format'
import { canUseFavorites } from '../utils/roles'

export function FavoritesPage() {
  const { user } = useAuth()
  const { refreshCounts } = useShopCounts()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user || !canUseFavorites(user)) return
    setLoading(true)
    try {
      const r = await listFavoris({ idClient: user.idUtilisateur, limit: 50, page: 1 })
      const base = r.data.map((x) => ({ idProd: x.idProd, produit: x.Produit }))
      const enriched = await Promise.all(
        base.map(async (row) => {
          try {
            const full = await fetchProduit(row.idProd)
            return { idProd: row.idProd, produit: full }
          } catch {
            return row
          }
        })
      )
      setRows(enriched)
    } finally {
      setLoading(false)
    }
    void refreshCounts()
  }, [user, refreshCounts])

  useEffect(() => {
    void load()
  }, [load])

  const remove = async (idProd) => {
    if (!user) return
    await removeFavori(user.idUtilisateur, idProd)
    setRows((prev) => prev.filter((r) => r.idProd !== idProd))
    void refreshCounts()
  }

  if (!user || !canUseFavorites(user)) {
    return (
      <p className="text-slate-400">
        <Link to="/connexion" className="text-[#00d154] hover:underline">
          Connectez-vous
        </Link>{' '}
        pour voir vos favoris (clients, vendeurs, administrateurs).
      </p>
    )
  }

  if (loading) return <p className="text-slate-400">Chargement…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Favoris</h1>
      <div className="mt-8 space-y-3">
        {rows.map((r) => (
          <div
            key={r.idProd}
            className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-[#111827] px-4 py-4"
          >
            <div>
              <Link to={`/produit/${r.idProd}`} className="font-semibold text-white hover:text-[#00d154]">
                {r.produit?.nomProd ?? `Produit #${r.idProd}`}
              </Link>
              {r.produit ? (
                <p className="mt-1 text-[#00d154]">{formatMoneyDA(r.produit.prix)}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => void remove(r.idProd)}
              className="rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-red-400"
              aria-label="Retirer"
            >
              <HeartOff className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      {rows.length === 0 ? <p className="mt-8 text-slate-500">Aucun favori pour le moment.</p> : null}
    </div>
  )
}
