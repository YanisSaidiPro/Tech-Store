import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addCommandeProduit,
  createCommande,
  createPaiement,
  getPanier,
  removeContient,
  updateCommande,
  updateContient,
  updatePanier,
} from '../api'
import { useAuth } from '../context/AuthContext'
import { useShopCounts } from '../context/ShopCountsContext'
import { formatMoneyDA } from '../utils/format'
import { getOrCreateActivePanier } from '../utils/panier'
import { emitNotificationsRefresh } from '../utils/notifications'
import { canUseCart } from '../utils/roles'

export function CartPage() {
  const { user } = useAuth()
  const { refreshCounts } = useShopCounts()
  const [panierId, setPanierId] = useState(null)
  const [lines, setLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [livraisonNom, setLivraisonNom] = useState('')
  const [livraisonPrenom, setLivraisonPrenom] = useState('')
  const [livraisonTel, setLivraisonTel] = useState('')
  const [livraisonAdresse, setLivraisonAdresse] = useState('')
  const [livraisonVille, setLivraisonVille] = useState('')
  const [livraisonCodePostal, setLivraisonCodePostal] = useState('')
  const [livraisonNotes, setLivraisonNotes] = useState('')
  const [formErr, setFormErr] = useState(null)
  const canCheckout = user?.role === 'client'

  const load = useCallback(async () => {
    if (!canUseCart(user)) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const pid = await getOrCreateActivePanier(user.idUtilisateur)
      setPanierId(pid)
      const p = await getPanier(pid)
      setLines(p.Produits || [])
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erreur chargement panier')
    } finally {
      setLoading(false)
    }
    void refreshCounts()
  }, [user, refreshCounts])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!checkoutOpen || !user) return
    setFormErr(null)
    setLivraisonNom(String(user.nom || '').trim())
    setLivraisonPrenom(String(user.prenom || '').trim())
    setLivraisonTel('')
    setLivraisonAdresse(String(user.adresse || '').trim())
    setLivraisonVille('')
    setLivraisonCodePostal('')
    setLivraisonNotes('')
  }, [checkoutOpen, user])

  useEffect(() => {
    if (!checkoutOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape' && !checkoutLoading) setCheckoutOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [checkoutOpen, checkoutLoading])

  const subtotal = lines.reduce((acc, pr) => {
    const q = pr.Contient?.qte ?? 1
    return acc + pr.prix * q
  }, 0)

  const setQty = async (pr, next) => {
    if (!panierId || next < 1) return
    try {
      await updateContient(panierId, pr.idProd, { qte: next })
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erreur')
    }
  }

  const removeLine = async (pr) => {
    if (!panierId) return
    try {
      await removeContient(panierId, pr.idProd)
      await load()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erreur')
    }
  }

  const checkout = async () => {
    if (!user || !canCheckout || !panierId || lines.length === 0) return
    const fn = livraisonNom.trim()
    const ln = livraisonPrenom.trim()
    const tel = livraisonTel.trim()
    const adr = livraisonAdresse.trim()
    const ville = livraisonVille.trim()
    if (!fn || !ln || !tel || !adr || !ville) {
      setFormErr('Veuillez remplir tous les champs obligatoires (nom, prénom, téléphone, adresse, ville).')
      return
    }
    setFormErr(null)
    setCheckoutLoading(true)
    setMsg(null)
    try {
      const cmd = await createCommande({
        idClient: user.idUtilisateur,
        total: subtotal,
        statut: 'en_attente',
        livraisonNom: fn,
        livraisonPrenom: ln,
        livraisonTel: tel,
        livraisonAdresse: adr,
        livraisonVille: ville,
        livraisonCodePostal: livraisonCodePostal.trim() || undefined,
        livraisonNotes: livraisonNotes.trim() || undefined,
      })
      for (const pr of lines) {
        const q = pr.Contient?.qte ?? 1
        await addCommandeProduit({
          idCommande: cmd.idCommande,
          idProd: pr.idProd,
          qte: q,
          prix: pr.prix,
        })
      }
      await createPaiement({
        idCommande: cmd.idCommande,
        somme: subtotal,
        statut: 'valide',
        methode: 'Paiement à la livraison (simulé)',
        date: new Date().toISOString(),
      })
      await updateCommande(cmd.idCommande, { statut: 'payee', total: subtotal })
      await updatePanier(panierId, { statut: 'converti' })
      setMsg('Commande enregistrée et paiement enregistré.')
      setLines([])
      setPanierId(null)
      setCheckoutOpen(false)
      void refreshCounts()
      emitNotificationsRefresh()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erreur commande')
    } finally {
      setCheckoutLoading(false)
    }
  }

  if (!canUseCart(user)) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111827] p-10 text-center">
        <p className="text-slate-300">
          Connectez-vous en tant que client ou vendeur pour voir votre panier.
        </p>
        <Link to="/connexion" className="mt-4 inline-block text-[#00d154] hover:underline">
          Connexion
        </Link>
      </div>
    )
  }

  if (loading) {
    return <p className="text-slate-400">Chargement du panier…</p>
  }

  return (
    <div>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Continuer les achats
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-white">Panier ({lines.length})</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {lines.map((pr) => {
            const q = pr.Contient?.qte ?? 1
            const lineTotal = pr.prix * q
            const thumb =
              pr.imagePrincipale ||
              `https://placehold.co/192x192/1e293b/64748b?text=${encodeURIComponent(pr.nomProd?.slice(0, 8) || 'P')}`
            return (
              <div
                key={pr.idProd}
                className="relative flex gap-4 rounded-2xl border border-white/5 bg-[#111827] p-4 pr-12"
              >
                <Link
                  to={`/produit/${pr.idProd}`}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition hover:ring-[#00d154]/50"
                  title="Voir la fiche produit"
                >
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/produit/${pr.idProd}`}
                    className="font-semibold text-white transition hover:text-[#00d154]"
                  >
                    {pr.nomProd}
                  </Link>
                  <p className="text-sm text-slate-500">{pr.Categorie?.nomCat ?? 'TechStore'}</p>
                  <p className="mt-1 text-[#00d154]">{formatMoneyDA(pr.prix)}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-white/10 bg-black/30">
                      <button
                        type="button"
                        className="p-2 text-slate-300 hover:text-white"
                        onClick={() => setQty(pr, q - 1)}
                        aria-label="Diminuer"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-[2rem] text-center text-sm">{q}</span>
                      <button
                        type="button"
                        className="p-2 text-slate-300 hover:text-white"
                        onClick={() => setQty(pr, q + 1)}
                        aria-label="Augmenter"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="absolute bottom-4 right-12 font-semibold text-white">{formatMoneyDA(lineTotal)}</p>
                <button
                  type="button"
                  className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 hover:bg-white/10 hover:text-red-400"
                  onClick={() => removeLine(pr)}
                  aria-label="Supprimer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          })}
          {lines.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-slate-500">
              Votre panier est vide.
            </p>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-[#111827] p-6">
            <h2 className="text-lg font-semibold text-white">Résumé</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Sous-total</span>
                <span className="text-white">{formatMoneyDA(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Livraison</span>
                <span className="text-[#00d154]">Gratuite</span>
              </div>
            </div>
            <div className="my-4 border-t border-white/10" />
            <div className="flex justify-between">
              <span className="font-medium text-white">Total</span>
              <span className="text-xl font-bold text-[#00d154]">{formatMoneyDA(subtotal)}</span>
            </div>
            <button
              type="button"
              disabled={lines.length === 0 || checkoutLoading || !canCheckout}
              onClick={() => canCheckout && setCheckoutOpen(true)}
              className="mt-6 w-full rounded-xl bg-[#00d154] py-3.5 text-sm font-semibold text-black transition hover:bg-[#00b849] disabled:opacity-50"
            >
              {canCheckout ? 'Passer la commande' : 'Commande réservée aux clients'}
            </button>
          </div>

          <p className="text-right text-xs text-slate-500">Livraison gratuite à partir de 100,00 DA</p>
        </div>
      </div>

      {msg ? <p className="mt-6 text-center text-sm text-[#00d154]">{msg}</p> : null}

      {checkoutOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4"
          onClick={() => !checkoutLoading && setCheckoutOpen(false)}
          role="presentation"
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#111827] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="checkout-title"
          >
            <h2 id="checkout-title" className="text-lg font-semibold text-white">
              Informations de livraison
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Renseignez vos coordonnées pour finaliser la commande ({formatMoneyDA(subtotal)}).
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs text-slate-400">Nom *</label>
                <input
                  value={livraisonNom}
                  onChange={(e) => setLivraisonNom(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="sm:col-span-1">
                <label className="mb-1 block text-xs text-slate-400">Prénom *</label>
                <input
                  value={livraisonPrenom}
                  onChange={(e) => setLivraisonPrenom(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-400">Téléphone *</label>
                <input
                  value={livraisonTel}
                  onChange={(e) => setLivraisonTel(e.target.value)}
                  placeholder="Ex. 0555 12 34 56"
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-400">Adresse complète *</label>
                <input
                  value={livraisonAdresse}
                  onChange={(e) => setLivraisonAdresse(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Ville *</label>
                <input
                  value={livraisonVille}
                  onChange={(e) => setLivraisonVille(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-400">Code postal</label>
                <input
                  value={livraisonCodePostal}
                  onChange={(e) => setLivraisonCodePostal(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-slate-400">Notes (optionnel)</label>
                <textarea
                  value={livraisonNotes}
                  onChange={(e) => setLivraisonNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            {formErr ? <p className="mt-4 text-sm text-red-400">{formErr}</p> : null}
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={() => setCheckoutOpen(false)}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
              >
                Annuler
              </button>
              <button
                type="button"
                disabled={checkoutLoading}
                onClick={() => void checkout()}
                className="rounded-xl bg-[#00d154] px-5 py-2.5 text-sm font-semibold text-black hover:bg-[#00b849] disabled:opacity-50"
              >
                {checkoutLoading ? 'Traitement…' : 'Confirmer et payer'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
