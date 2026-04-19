import {
  ChevronRight,
  Heart,
  Package,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  addContient,
  addFavori,
  createCommentaire,
  fetchProduit,
  fetchProduitImages,
  listCommentaires,
  listFavoris,
  removeFavori,
} from '../api'
import { useAuth } from '../context/AuthContext'
import { useShopCounts } from '../context/ShopCountsContext'
import { formatDate, formatMoneyDA } from '../utils/format'
import { getOrCreateActivePanier } from '../utils/panier'
import { canReviewProduct, canUseCart, canUseFavorites } from '../utils/roles'

function StarsRow({ value, size = 'md' }) {
  const n = Math.round(Number(value) || 0)
  const cls = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5'
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-400" aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${cls} ${i <= n ? 'fill-current' : 'fill-none opacity-30'}`} />
      ))}
    </span>
  )
}

export function ProductPage() {
  const { id } = useParams()
  const pid = Number(id)
  const { user, ready } = useAuth()
  const navigate = useNavigate()
  const { refreshCounts } = useShopCounts()
  const [p, setP] = useState(null)
  const [imgs, setImgs] = useState([])
  const [active, setActive] = useState(0)
  const [comments, setComments] = useState([])
  const [fav, setFav] = useState(false)
  const [err, setErr] = useState(null)
  const [qty, setQty] = useState(1)
  const [cNote, setCNote] = useState(5)
  const [cTitre, setCTitre] = useState('')
  const [cContenu, setCContenu] = useState('')
  const [cImages, setCImages] = useState([''])
  const [cSubmitting, setCSubmitting] = useState(false)
  const [cErr, setCErr] = useState(null)

  useEffect(() => {
    if (!Number.isFinite(pid)) return
    fetchProduit(pid)
      .then(setP)
      .catch((e) => setErr(e.message))
    fetchProduitImages(pid)
      .then((r) => setImgs(r.data.map((i) => i.url)))
      .catch(() => setImgs([]))
    listCommentaires(pid)
      .then((r) => setComments(r.data))
      .catch(() => setComments([]))
  }, [pid])

  useEffect(() => {
    setFav(false)
    if (!user || !canUseFavorites(user) || !Number.isFinite(pid)) return
    listFavoris({ idClient: user.idUtilisateur, idProd: pid, limit: 5, page: 1 })
      .then((r) => setFav(r.data.some((row) => row.idProd === pid)))
      .catch(() => {})
  }, [pid, user])

  const avgNote = useMemo(() => {
    const rated = comments.filter((c) => c.note != null && !Number.isNaN(Number(c.note)))
    if (rated.length === 0) return null
    const sum = rated.reduce((acc, c) => acc + Number(c.note), 0)
    return sum / rated.length
  }, [comments])

  const goLogin = () => navigate('/connexion', { state: { from: `/produit/${pid}` } })

  const toggleFav = async () => {
    if (!user || !canUseFavorites(user) || !p) {
      goLogin()
      return
    }
    try {
      if (fav) {
        await removeFavori(user.idUtilisateur, p.idProd)
        setFav(false)
      } else {
        await addFavori({ idClient: user.idUtilisateur, idProd: p.idProd })
        setFav(true)
      }
      void refreshCounts()
    } catch {
      /* */
    }
  }

  const addCart = async () => {
    if (!ready) return
    if (!user || !canUseCart(user) || !p) {
      goLogin()
      return
    }
    try {
      const panierId = await getOrCreateActivePanier(user.idUtilisateur)
      await addContient({ idPanier: panierId, idProd: p.idProd, qte: qty })
      void refreshCounts()
    } catch {
      /* */
    }
  }

  const submitComment = async (e) => {
    e.preventDefault()
    if (!canReviewProduct(user) || !p) {
      goLogin()
      return
    }
    setCErr(null)
    setCSubmitting(true)
    try {
      const images = cImages.map((s) => s.trim()).filter(Boolean).slice(0, 5)
      await createCommentaire({
        idProduit: p.idProd,
        note: cNote,
        titre: cTitre.trim() || undefined,
        contenu: cContenu.trim() || '—',
        ...(images.length ? { images } : {}),
      })
      setCTitre('')
      setCContenu('')
      setCImages([''])
      const r = await listCommentaires(p.idProd)
      setComments(r.data)
      void refreshCounts()
    } catch (err) {
      setCErr(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setCSubmitting(false)
    }
  }

  if (!Number.isFinite(pid)) return <p className="text-red-400">Produit invalide</p>
  if (err) return <p className="text-red-400">{err}</p>
  if (!p) return <p className="text-slate-400">Chargement…</p>

  const cat = p.Categorie?.nomCat
  const mainImg =
    imgs[active] ||
    imgs[0] ||
    `https://placehold.co/900x900/111827/64748b?text=${encodeURIComponent(p.nomProd)}`

  const vendeurLabel =
    [p.Vendeur?.prenom, p.Vendeur?.nom].filter(Boolean).join(' ').trim() ||
    (p.idVendeur != null ? `Boutique #${p.idVendeur}` : '—')

  return (
    <div className="mx-auto max-w-7xl">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Fil d’Ariane">
        <Link to="/" className="hover:text-white">
          Accueil
        </Link>
        <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
        {p.idCategorie != null && cat ? (
          <>
            <Link to={`/categorie/${p.idCategorie}`} className="hover:text-white">
              {cat}
            </Link>
            <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
          </>
        ) : null}
        <span className="max-w-[min(100%,28rem)] truncate text-slate-300">{p.nomProd}</span>
      </nav>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0c1220] shadow-lg">
            <img src={mainImg} alt={p.nomProd} className="aspect-square w-full object-contain p-6 md:p-10" />
          </div>
          {imgs.length > 1 ? (
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {imgs.map((u, i) => (
                <button
                  key={`${u}-${i}`}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition md:h-20 md:w-20 ${
                    active === i ? 'border-[#00d154] ring-2 ring-[#00d154]/30' : 'border-white/10 hover:border-white/25'
                  }`}
                  aria-label={`Image ${i + 1}`}
                >
                  <img src={u} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-8">
          <div className="rounded-2xl border border-white/10 bg-[#111827]/80 p-6 shadow-xl backdrop-blur-sm md:p-8">
            {cat ? (
              <Link
                to={`/categorie/${p.idCategorie}`}
                className="inline-block text-sm font-medium text-[#3b82f6] hover:underline"
              >
                {cat}
              </Link>
            ) : null}
            <h1 className="mt-2 text-2xl font-bold leading-tight text-white md:text-3xl lg:text-4xl">{p.nomProd}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              {avgNote != null ? (
                <>
                  <StarsRow value={avgNote} />
                  <span className="text-sm text-slate-400">
                    {avgNote.toFixed(1)} sur 5 · {comments.length} avis
                  </span>
                </>
              ) : (
                <span className="text-sm text-slate-500">Pas encore noté</span>
              )}
            </div>

            <p className="mt-6 text-3xl font-bold tracking-tight text-[#00d154] md:text-4xl">
              {formatMoneyDA(p.prix)}
            </p>
            <p className="mt-2 text-sm text-slate-500">TTC · Livraison offerte sur cette boutique</p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="flex items-center rounded-xl border border-white/10 bg-black/30">
                <button
                  type="button"
                  className="px-4 py-3 text-lg text-slate-300 hover:text-white"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Diminuer la quantité"
                >
                  −
                </button>
                <span className="min-w-[3rem] text-center font-semibold text-white">{qty}</span>
                <button
                  type="button"
                  className="px-4 py-3 text-lg text-slate-300 hover:text-white"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Augmenter la quantité"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!user) goLogin()
                  else if (canUseCart(user)) void addCart()
                }}
                disabled={Boolean(user) && !canUseCart(user)}
                title={
                  user && !canUseCart(user)
                    ? 'Réservé aux comptes clients'
                    : undefined
                }
                className="inline-flex flex-1 min-w-[200px] items-center justify-center gap-2 rounded-xl bg-[#00d154] px-8 py-3.5 font-semibold text-black transition hover:bg-[#00b849] enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 md:flex-none"
              >
                <ShoppingCart className="h-5 w-5" />
                {user && !canUseCart(user) ? 'Panier (clients/vendeurs)' : 'Ajouter au panier'}
              </button>
              <button
                type="button"
                onClick={() => void toggleFav()}
                className={`inline-flex items-center justify-center gap-2 rounded-xl border px-6 py-3.5 font-medium transition ${
                  fav ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-white/10 text-slate-300 hover:bg-white/5'
                }`}
              >
                <Heart className={`h-5 w-5 ${fav ? 'fill-current' : ''}`} />
                Favoris
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
              <div className="flex items-start gap-3">
                <Package className="mt-0.5 h-5 w-5 shrink-0 text-[#3b82f6]" />
                <div>
                  <p className="text-sm font-semibold text-white">Fiche produit</p>
                  <ul className="mt-2 space-y-1.5 text-sm text-slate-400">
                    <li>
                      <span className="text-slate-500">Référence</span> #{p.idProd}
                    </li>
                    {cat ? (
                      <li>
                        <span className="text-slate-500">Catégorie</span> {cat}
                      </li>
                    ) : null}
                    <li>
                      <span className="text-slate-500">Vendeur</span> {vendeurLabel}
                    </li>
                    {p.createdAt ? (
                      <li>
                        <span className="text-slate-500">Ajouté le</span> {formatDate(p.createdAt)}
                      </li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111827] p-5">
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 shrink-0 text-[#00d154]" />
                <div>
                  <p className="text-sm font-semibold text-white">Livraison</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Expédition soignée, suivi possible après validation de commande. Délais indicatifs communiqués par
                    le vendeur.
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111827] p-5 sm:col-span-2">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Achat en confiance</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    Paiement sécurisé en caisse, support client TechStore et retours selon conditions affichées au
                    moment de la commande.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-14 border-t border-white/10 pt-12">
        <h2 className="text-xl font-bold text-white">Description</h2>
        {p.description ? (
          <div className="mt-4 max-w-3xl space-y-4 text-base leading-relaxed text-slate-300">
            {p.description.split('\n').map((para, i) =>
              para.trim() ? (
                <p key={i}>
                  {para}
                </p>
              ) : null
            )}
          </div>
        ) : (
          <p className="mt-4 text-slate-500">Aucune description détaillée pour ce produit.</p>
        )}
      </div>

      <div className="mt-14 border-t border-white/10 pt-12">
        <h2 className="text-xl font-bold text-white">Avis et photos</h2>

        {canReviewProduct(user) ? (
          <form onSubmit={submitComment} className="mt-6 rounded-xl border border-white/10 bg-[#111827] p-5">
            <p className="text-sm font-medium text-white">Donner votre avis</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-500">Note (0–5)</label>
                <select
                  value={cNote}
                  onChange={(e) => setCNote(Number(e.target.value))}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                >
                  {[5, 4, 3, 2, 1, 0].map((n) => (
                    <option key={n} value={n}>
                      {n} / 5
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-500">Titre (optionnel)</label>
                <input
                  value={cTitre}
                  onChange={(e) => setCTitre(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs text-slate-500">Commentaire</label>
              <textarea
                value={cContenu}
                onChange={(e) => setCContenu(e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                placeholder="Votre retour sur le produit…"
              />
            </div>
            <div className="mt-4">
              <label className="mb-1 block text-xs text-slate-500">
                Photos (URL, max 5) — hébergez l’image puis collez le lien
              </label>
              {cImages.map((u, i) => (
                <input
                  key={i}
                  value={u}
                  onChange={(e) => {
                    const next = [...cImages]
                    next[i] = e.target.value
                    setCImages(next)
                  }}
                  placeholder="https://…"
                  className="mb-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                />
              ))}
              {cImages.length < 5 ? (
                <button
                  type="button"
                  className="text-xs text-[#3b82f6] hover:underline"
                  onClick={() => setCImages((prev) => [...prev, ''])}
                >
                  + Ajouter une photo
                </button>
              ) : null}
            </div>
            {cErr ? <p className="mt-2 text-sm text-red-400">{cErr}</p> : null}
            <button
              type="submit"
              disabled={cSubmitting}
              className="mt-4 rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563eb] disabled:opacity-50"
            >
              {cSubmitting ? 'Envoi…' : 'Publier l’avis'}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-slate-500">
            <button type="button" onClick={goLogin} className="text-[#00d154] hover:underline">
              Connectez-vous
            </button>{' '}
            pour noter ou commenter.
          </p>
        )}

        {comments.length === 0 ? (
          <p className="mt-8 text-slate-500">Pas encore d’avis — votre retour aidera les autres.</p>
        ) : (
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {comments.map((c) => {
              const auteur =
                [c.Client?.Utilisateur?.prenom, c.Client?.Utilisateur?.nom].filter(Boolean).join(' ').trim() ||
                c.Client?.Utilisateur?.email?.split('@')[0] ||
                'Utilisateur'
              const avatar = c.Client?.Utilisateur?.photoProfil
              const role = c.Client?.Utilisateur?.role
              return (
                <li
                  key={c.idCommentaire}
                  className="rounded-xl border border-white/5 bg-[#111827] px-5 py-4 text-slate-300"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white/10">
                      {avatar ? (
                        <img src={avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs font-bold text-slate-400">
                          {auteur.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-medium text-white">{auteur}</span>
                        {role ? (
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] uppercase text-slate-500">
                            {role}
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-2">
                        {c.note != null ? <StarsRow value={c.note} size="sm" /> : <span className="text-xs text-slate-600">—</span>}
                        {c.date ? <span className="text-xs text-slate-600">{formatDate(c.date)}</span> : null}
                      </div>
                    </div>
                  </div>
                  {c.titre ? <p className="mt-3 font-medium text-white">{c.titre}</p> : null}
                  <p className="mt-1 text-sm leading-relaxed">{c.contenu || '—'}</p>
                  {Array.isArray(c.images) && c.images.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {c.images.map((src, idx) => (
                        <a
                          key={idx}
                          href={src}
                          target="_blank"
                          rel="noreferrer"
                          className="block h-20 w-20 overflow-hidden rounded-lg border border-white/10"
                        >
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
