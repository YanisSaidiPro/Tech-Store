import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
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

const badges = ['Populaire', 'Nouveau', 'Best seller', '']

export function HomePage() {
  const { user, ready } = useAuth()
  const { refreshCounts } = useShopCounts()
  const navigate = useNavigate()
  const loc = useLocation()
  const [items, setItems] = useState([])
  const [images, setImages] = useState({})
  const [favSet, setFavSet] = useState(() => new Set())
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetchProduits({ limit: 8, page: 1 })
      .then((r) => setItems(r.data))
      .catch((e) => setErr(e.message))
  }, [])

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
      await Promise.all(
        items.map(async (p) => {
          try {
            const r = await fetchProduitImages(p.idProd)
            const main = r.data.find((i) => i.isMain) ?? r.data[0]
            if (main?.url) map[p.idProd] = main.url
          } catch {
            /* ignore */
          }
        })
      )
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
      <section className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#0a1628] to-[#06080f] px-6 py-16 md:px-14 md:py-20">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#3b82f6]">
              Matériel informatique premium
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              <span className="text-white">Boostez votre </span>
              <span className="text-slate-400">vie </span>
              <span className="text-[#3b82f6]">numérique</span>
            </h1>
            <p className="mt-4 max-w-lg text-slate-400">
              PC portables, tours gaming et composants sélectionnés. Qualité premium, prix compétitifs.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/recherche"
                className="inline-flex items-center gap-2 rounded-xl bg-[#3b82f6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-600"
              >
                Acheter
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Parcourir les catégories
              </Link>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="aspect-[4/3] rounded-2xl bg-[#111827] bg-[url('https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80')] bg-cover bg-center opacity-90 shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold text-white">Produits mis en avant</h2>
        {err ? <p className="mt-4 text-red-400">{err}</p> : null}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p, i) => (
            <ProductCard
              key={p.idProd}
              produit={p}
              badge={badges[i % badges.length]}
              imageUrl={images[p.idProd]}
              favoriteActive={favSet.has(p.idProd)}
              onToggleFavorite={() => toggleFav(p.idProd)}
              onAddToCart={() => addCart(p)}
            />
          ))}
        </div>
        {items.length === 0 && !err ? (
          <p className="mt-8 text-slate-500">Aucun produit pour le moment.</p>
        ) : null}
      </section>
    </div>
  )
}
