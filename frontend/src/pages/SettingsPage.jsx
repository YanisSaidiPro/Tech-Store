import { useEffect, useState } from 'react'
import { updateUtilisateur } from '../api'
import { useAuth } from '../context/AuthContext'

export function SettingsPage() {
  const { user, setUser } = useAuth()
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [email, setEmail] = useState('')
  const [adresse, setAdresse] = useState('')
  const [password, setPassword] = useState('')
  const [photoProfil, setPhotoProfil] = useState('')
  const [msg, setMsg] = useState(null)
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)
  const [imgLoading, setImgLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setNom(user.nom || '')
    setPrenom(user.prenom || '')
    setEmail(user.email)
    setAdresse(user.adresse || '')
    setPhotoProfil(user.photoProfil || '')
  }, [user])

  if (!user) {
    return <p className="text-slate-400">Connexion requise.</p>
  }

  const save = async (e) => {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setLoading(true)
    try {
      const body = {
        nom: nom || undefined,
        prenom: prenom || undefined,
        email,
        adresse: adresse || undefined,
        photoProfil: photoProfil.trim() || undefined,
      }
      if (password.length >= 6) body.motDePasse = password
      const u = await updateUtilisateur(user.idUtilisateur, body)
      setUser(u)
      setMsg('Profil enregistré.')
      setPassword('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-white">Paramètres</h1>
      <p className="mt-1 text-slate-400">Informations du compte</p>
      <form onSubmit={save} className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-[#111827] p-6">
        <div>
          <label className="mb-1 block text-sm text-slate-300">Photo de profil</label>
          <input
            type="file"
            accept="image/*"
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2.5 text-slate-100 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:text-xs file:font-medium file:text-slate-200 hover:file:bg-white/15"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              if (f.size > 2_000_000) {
                setErr('Image trop lourde (max 2 Mo).')
                e.target.value = ''
                return
              }
              setErr(null)
              setImgLoading(true)
              const reader = new FileReader()
              reader.onload = () => {
                setPhotoProfil(typeof reader.result === 'string' ? reader.result : '')
                setImgLoading(false)
              }
              reader.onerror = () => {
                setErr("Impossible de lire l'image.")
                setImgLoading(false)
              }
              reader.readAsDataURL(f)
            }}
          />
          <p className="mt-1 text-xs text-slate-500">Formats: JPG/PNG/WebP · max 2 Mo.</p>
          {photoProfil ? (
            <div className="mt-3 flex items-center gap-3">
              <img
                src={photoProfil}
                alt=""
                className="h-16 w-16 rounded-full border border-white/10 object-cover"
              />
              <button
                type="button"
                className="text-xs text-slate-500 hover:text-white"
                onClick={() => setPhotoProfil('')}
              >
                Retirer la photo
              </button>
            </div>
          ) : null}
          {imgLoading ? <p className="mt-2 text-xs text-slate-500">Chargement image…</p> : null}
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Nom</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2.5 text-slate-100"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Prénom</label>
          <input
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2.5 text-slate-100"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Email</label>
          <input
            type="email"
            required
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2.5 text-slate-100"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Adresse</label>
          <textarea
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2.5 text-slate-100"
            rows={3}
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-slate-300">Nouveau mot de passe (optionnel)</label>
          <input
            type="password"
            className="w-full rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2.5 text-slate-100"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 6 caractères"
            minLength={6}
          />
        </div>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        {msg ? <p className="text-sm text-[#00d154]">{msg}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#00d154] py-3 font-semibold text-black hover:bg-[#00b849] disabled:opacity-50"
        >
          Enregistrer
        </button>
      </form>
    </div>
  )
}
