import { Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createProduit, createProduitImage, deleteProduit, fetchCategories, fetchProduits } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatMoneyDA } from '../utils/format'

export function SellerProductsPage() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [cats, setCats] = useState([])
  const [nom, setNom] = useState('')
  const [prix, setPrix] = useState('')
  const [desc, setDesc] = useState('')
  const [cat, setCat] = useState('')
  const [images, setImages] = useState([''])
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = () => {
    if (!user) return
    const vid = user.idUtilisateur
    fetchProduits({ limit: 500, page: 1 })
      .then((r) => setItems(r.data.filter((p) => p.idVendeur === vid)))
      .catch(() => setItems([]))
  }

  useEffect(() => {
    load()
  }, [user])

  useEffect(() => {
    fetchCategories()
      .then((r) => {
        setCats(r.data)
        if (r.data[0]) setCat(String(r.data[0].idCategorie))
      })
      .catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!user || user.role !== 'vendeur') return
    setErr(null)
    setLoading(true)
    try {
      const idCategorie = Number(cat)
      const p = Number(prix.replace(',', '.'))
      const imageUrls = images.map((u) => u.trim()).filter(Boolean)
      if (!nom.trim() || Number.isNaN(p) || !Number.isFinite(idCategorie) || imageUrls.length === 0) {
        throw new Error('Vérifiez nom, prix, catégorie et ajoutez au moins une photo')
      }
      const produit = await createProduit({
        nomProd: nom.trim(),
        prix: p,
        description: desc || undefined,
        idCategorie,
        idVendeur: user.idUtilisateur,
      })
      for (let i = 0; i < imageUrls.length; i += 1) {
        await createProduitImage({
          idProd: produit.idProd,
          url: imageUrls[i],
          isMain: i === 0,
          ordre: i,
        })
      }
      setNom('')
      setPrix('')
      setDesc('')
      setImages([''])
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return
    try {
      await deleteProduit(id)
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur')
    }
  }

  if (!user || user.role !== 'vendeur') {
    return <p className="text-slate-400">Accès réservé aux vendeurs.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Produits</h1>
      <p className="mt-1 text-slate-400">Gérez votre catalogue</p>

      <form
        onSubmit={submit}
        className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-6"
      >
        <h2 className="text-lg font-semibold text-white">Ajouter un produit</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-400">Nom</label>
            <input
              required
              className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2 text-slate-100"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-400">Prix (DA)</label>
            <input
              required
              className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2 text-slate-100"
              value={prix}
              onChange={(e) => setPrix(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Catégorie</label>
          <select
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2 text-slate-100"
            value={cat}
            onChange={(e) => setCat(e.target.value)}
          >
            {cats.map((c) => (
              <option key={c.idCategorie} value={c.idCategorie}>
                {c.nomCat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Description</label>
          <textarea
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2 text-slate-100"
            rows={3}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-400">Photos du produit (URL, min 1)</label>
          {images.map((u, i) => (
            <input
              key={i}
              type="url"
              required={i === 0}
              className="mb-2 w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2 text-slate-100"
              value={u}
              onChange={(e) => {
                const next = [...images]
                next[i] = e.target.value
                setImages(next)
              }}
              placeholder="https://..."
            />
          ))}
          {images.length < 6 ? (
            <button
              type="button"
              className="text-xs text-[#3b82f6] hover:underline"
              onClick={() => setImages((prev) => [...prev, ''])}
            >
              + Ajouter une photo
            </button>
          ) : null}
        </div>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-[#00d154] px-6 py-2.5 font-semibold text-black hover:bg-[#00b849] disabled:opacity-50"
        >
          Publier
        </button>
      </form>

      <div className="mt-10 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0a1628] text-slate-400">
            <tr>
              <th className="px-4 py-3">Produit</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.idProd} className="border-t border-white/5">
                <td className="px-4 py-3 text-white">{p.nomProd}</td>
                <td className="px-4 py-3 text-[#00d154]">{formatMoneyDA(p.prix)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void remove(p.idProd)}
                    className="text-slate-500 hover:text-red-400"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 ? <p className="mt-6 text-slate-500">Aucun produit publié.</p> : null}
    </div>
  )
}
