import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  addContient,
  addFavori,
  fetchCategorie,
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

export function CategoryPage() {
  const { id } = useParams()
  const cid = Number(id)
  const { user, ready } = useAuth()
  const { refreshCounts } = useShopCounts()
  const navigate = useNavigate()
  const loc = useLocation()
  const [title, setTitle] = useState('')
  const [items, setItems] = useState([])
  const [images, setImages] = useState({})
  const [favSet, setFavSet] = useState(() => new Set())

  useEffect(() => {
    if (!Number.isFinite(cid)) return
    fetchCategorie(cid)
      .then((c) => setTitle(c.nomCat))
      .catch(() => setTitle('Catégorie'))
  }, [cid])

  useEffect(() => {
    if (!Number.isFinite(cid)) return
    fetchProduits({ categorie: cid, limit: 24, page: 1 }).then((r) => setItems(r.data))
  }, [cid])

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

  if (!Number.isFinite(cid)) {
    return <p className="text-red-400">Catégorie invalide</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">{title || 'Catégorie'}</h1>
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
      {items.length === 0 ? <p className="mt-8 text-slate-500">Aucun produit dans cette catégorie.</p> : null}
    </div>
  )
}
