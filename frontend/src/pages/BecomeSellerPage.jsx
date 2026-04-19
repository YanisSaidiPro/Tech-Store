import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createDemandeVendeur } from '../api'
import { useAuth } from '../context/AuthContext'

export function BecomeSellerPage() {
  const { user } = useAuth()
  const [tel, setTel] = useState('')
  const [contenu, setContenu] = useState('')
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!user || user.role !== 'client') return
    setErr(null)
    setMsg(null)
    setLoading(true)
    try {
      await createDemandeVendeur({
        idClient: user.idUtilisateur,
        contactTel: tel || undefined,
        contenu: contenu || undefined,
      })
      setMsg('Demande envoyée. Un administrateur vous contactera.')
      setTel('')
      setContenu('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-[#111827] p-8 text-center">
        <p className="text-slate-300">Connectez-vous pour faire une demande vendeur.</p>
        <Link to="/connexion" className="mt-4 inline-block text-[#81D4FA] hover:underline">
          Connexion
        </Link>
      </div>
    )
  }

  if (user.role !== 'client') {
    return (
      <p className="text-slate-400">
        Cette page est réservée aux comptes clients. Les vendeurs ont déjà accès à l’espace{' '}
        <Link to="/vendeur" className="text-[#00d154]">
          vendeur
        </Link>
        .
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-white">Devenir vendeur</h1>
      <p className="mt-2 text-slate-400">
        Décrivez votre activité. Notre équipe étudiera votre demande sous peu.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Téléphone</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2.5 text-slate-100"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="+213 …"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Message</label>
          <textarea
            required
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2.5 text-slate-100"
            rows={5}
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            placeholder="Présentez votre boutique, vos produits…"
          />
        </div>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        {msg ? <p className="text-sm text-[#00d154]">{msg}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#00d154] py-3 font-semibold text-black hover:bg-[#00b849] disabled:opacity-50"
        >
          Envoyer la demande
        </button>
      </form>
    </div>
  )
}
