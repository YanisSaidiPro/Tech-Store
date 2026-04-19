import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  addContient,
  addFavori,
  fetchCategories,
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

function mapSort(sortKey) {
  switch (sortKey) {
    case 'priceAsc':
      return { sortBy: 'prix', sortOrder: 'asc' }
    case 'priceDesc':
      return { sortBy: 'prix', sortOrder: 'desc' }
    case 'nameAsc':
      return { sortBy: 'nomProd', sortOrder: 'asc' }
    case 'new':
    default:
      return { sortBy: 'createdAt', sortOrder: 'desc' }
  }
}

export function CategoriesPage() {
  const { user, ready } = useAuth()
  const { refreshCounts } = useShopCounts()
  const navigate = useNavigate()
  const loc = useLocation()

  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [images, setImages] = useState({})
  const [favSet, setFavSet] = useState(() => new Set())
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  const [search, setSearch] = useState('')
  const [selectedCat, setSelectedCat] = useState('all')
  const [minPrix, setMinPrix] = useState('')
  const [maxPrix, setMaxPrix] = useState('')
  const [sortKey, setSortKey] = useState('new')

  const selectedCategorieId = useMemo(() => {
    if (selectedCat === 'all') return undefined
    const id = Number(selectedCat)
    return Number.isFinite(id) ? id : undefined
  }, [selectedCat])

  useEffect(() => {
    fetchCategories()
      .then((r) => setCategories(r.data || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    setLoading(true)
    setErr(null)
    const sort = mapSort(sortKey)
    fetchProduits({
      page: 1,
      limit: 48,
      categorie: selectedCategorieId,
      search: search.trim() || undefined,
      minPrix: minPrix !== '' ? Number(minPrix) : undefined,
      maxPrix: maxPrix !== '' ? Number(maxPrix) : undefined,
      ...sort,
    })
      .then((r) => setItems(r.data || []))
      .catch((e) => setErr(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [selectedCategorieId, search, minPrix, maxPrix, sortKey])

  useEffect(() => {
    if (!user || !canUseFavorites(user)) return
    listFavoris({ idClient: user.idUtilisateur, limit: 200 })
      .then((r) => {
        const s = new Set()
        ;(r.data || []).forEach((row) => s.add(row.idProd))
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
            /* */
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

  const resetFilters = () => {
    setSearch('')
    setSelectedCat('all')
    setMinPrix('')
    setMaxPrix('')
    setSortKey('new')
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Toutes les catégories</h1>
      <p className="mt-2 text-slate-400">Filtrez par catégorie, prix, nouveautés et autres critères.</p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-white/10 bg-[#111827] p-4 md:grid-cols-5">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un produit..."
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white md:col-span-2"
        />
        <select
          value={selectedCat}
          onChange={(e) => setSelectedCat(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((c) => (
            <option key={c.idCategorie} value={c.idCategorie}>
              {c.nomCat}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          value={minPrix}
          onChange={(e) => setMinPrix(e.target.value)}
          placeholder="Prix min"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        />
        <input
          type="number"
          min="0"
          value={maxPrix}
          onChange={(e) => setMaxPrix(e.target.value)}
          placeholder="Prix max"
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
        />
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white md:col-span-2"
        >
          <option value="new">Nouveautés</option>
          <option value="priceAsc">Prix croissant</option>
          <option value="priceDesc">Prix décroissant</option>
          <option value="nameAsc">Nom (A-Z)</option>
        </select>
        <button
          type="button"
          onClick={resetFilters}
          className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10"
        >
          Réinitialiser les filtres
        </button>
      </div>

      {err ? <p className="mt-4 text-sm text-red-400">{err}</p> : null}

      {loading ? <p className="mt-8 text-slate-400">Chargement des produits…</p> : null}
      {!loading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard
              key={p.idProd}
              produit={p}
              imageUrl={images[p.idProd]}
              favoriteActive={favSet.has(p.idProd)}
              onToggleFavorite={() => void toggleFav(p.idProd)}
              onAddToCart={() => void addCart(p)}
            />
          ))}
        </div>
      ) : null}
      {!loading && items.length === 0 ? (
        <p className="mt-8 text-slate-500">Aucun produit trouvé avec ces filtres.</p>
      ) : null}
    </div>
  )
}
