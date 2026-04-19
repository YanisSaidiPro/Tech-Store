import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import {
  addContient,
  addFavori,
  fetchProduitImages,
  fetchProduits,
  listFavoris,
  removeFavori,
} from '../api'
import { ProductCard } from '../components/ProductCard'
import { useAuth } from '../context/AuthContext'
import { useShopCounts } from '../context/ShopCountsContext'
import { getOrCreateActivePanier } from '../utils/panier'
import { canUseCart, canUseFavorites } from '../utils/roles'

export function SearchPage() {
  const [params] = useSearchParams()
  const q = params.get('q') || ''
  const { user, ready } = useAuth()
  const { refreshCounts } = useShopCounts()
  const navigate = useNavigate()
  const loc = useLocation()
  const [items, setItems] = useState([])
  const [images, setImages] = useState({})
  const [favSet, setFavSet] = useState(() => new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchProduits({ search: q || undefined, limit: 24, page: 1 })
      .then((r) => setItems(r.data))
      .finally(() => setLoading(false))
  }, [q])

  useEffect(() => {
    if (!user || !canUseFavorites(user)) return
    listFavoris({ idClient: user.idUtilisateur, limit: 200 })
      .then((r) => {
        const s = new Set()
        r.data.forEach((row) => s.add(row.idProd))
        setFavSet(s)
      })
      .catch(() => {})
  }, [user])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const map = {}
      for (const p of items) {
        try {
          const r = await fetchProduitImages(p.idProd)
          const main = r.data.find((i) => i.isMain) ?? r.data[0]
          if (main?.url) map[p.idProd] = main.url
        } catch {
          /* */
        }
      }
      if (!cancelled) setImages(map)
    })()
    return () => {
      cancelled = true
    }
  }, [items])

  const toggleFav = async (idProd) => {
    if (!ready) return
    if (!user) {
      navigate('/connexion', { state: { from: loc.pathname } })
      return
    }
    if (!canUseFavorites(user)) return
    const idClient = user.idUtilisateur
    try {
      if (favSet.has(idProd)) {
        await removeFavori(idClient, idProd)
        setFavSet((prev) => {
          const n = new Set(prev)
          n.delete(idProd)
          return n
        })
      } else {
        await addFavori({ idClient, idProd })
        setFavSet((prev) => new Set(prev).add(idProd))
      }
      void refreshCounts()
    } catch {
      /* */
    }
  }

  const addCart = async (p) => {
    if (!ready) return
    if (!user) {
      navigate('/connexion', { state: { from: loc.pathname } })
      return
    }
    if (!canUseCart(user)) return
    try {
      const pid = await getOrCreateActivePanier(user.idUtilisateur)
      await addContient({ idPanier: pid, idProd: p.idProd, qte: 1 })
      void refreshCounts()
    } catch {
      /* */
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">
        Résultats {q ? `pour « ${q} »` : ''}
      </h1>
      {loading ? (
        <p className="mt-8 text-slate-400">Recherche…</p>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard
              key={p.idProd}
              produit={p}
              badge={i % 4 === 0 ? 'Recherche' : undefined}
              imageUrl={images[p.idProd]}
              favoriteActive={favSet.has(p.idProd)}
              onToggleFavorite={() => void toggleFav(p.idProd)}
              onAddToCart={() => void addCart(p)}
            />
          ))}
        </div>
      )}
      {!loading && items.length === 0 ? (
        <p className="mt-8 text-slate-500">Aucun produit trouvé.</p>
      ) : null}
    </div>
  )
}
