import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { login, register } from '../api'
import { useAuth } from '../context/AuthContext'

export function LoginPage() {
  const { login: setSession } = useAuth()
  const navigate = useNavigate()
  const loc = useLocation()

  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nom, setNom] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      let res
      if (tab === 'login') {
        res = await login({ email, motDePasse: password })
        setSession(res)
      } else {
        res = await register({
          email,
          motDePasse: password,
          role: 'client',
          nom: nom || undefined,
        })
        setSession(res)
      }
      // Toujours revenir à l'accueil après authentification
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md items-center px-2 py-10">
      <div className="w-full rounded-2xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white">Mon compte</h1>
        <p className="mt-1 text-sm text-slate-400">Connectez-vous ou créez un compte client</p>

        <button
          type="button"
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#1a2332] py-3 text-sm font-medium text-slate-200 transition hover:bg-[#243044]"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continuer avec Google
        </button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#111827] px-3 text-slate-500">ou</span>
          </div>
        </div>

        <div className="flex rounded-xl bg-[#1a2332] p-1">
          <button
            type="button"
            onClick={() => setTab('login')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              tab === 'login' ? 'bg-black text-white' : 'text-slate-500'
            }`}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => setTab('register')}
            className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition ${
              tab === 'register' ? 'bg-black text-white' : 'text-slate-500'
            }`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-4">
          {tab === 'register' ? (
            <div>
              <label className="mb-1 block text-sm text-slate-200">Nom</label>
              <input
                className="w-full rounded-lg border-0 bg-[#1a2332] px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-[#00d154]"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Votre nom"
              />
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-sm text-slate-200">Email</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border-0 bg-[#1a2332] px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-[#00d154]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-200">Mot de passe</label>
            <input
              type="password"
              required
              minLength={6}
              className="w-full rounded-lg border-0 bg-[#1a2332] px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:ring-2 focus:ring-[#00d154]"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
            />
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#4FC3F7] py-3.5 text-sm font-semibold text-black transition hover:bg-[#81D4FA] disabled:opacity-60"
          >
            {tab === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <span className="text-[#4FC3F7] hover:underline cursor-pointer">Mot de passe oublié ?</span>
        </p>

        <p className="mt-6 rounded-lg border border-white/5 bg-black/20 p-4 text-left text-xs leading-relaxed text-slate-500">
          <span className="font-medium text-slate-400">Accès administration :</span> exécutez le seed MongoDB (
          <span className="font-mono text-slate-400">node backend/scripts/seed.js</span>
          ), puis connectez-vous avec l’e-mail <span className="text-slate-300">admin@techstore.local</span> et le
          mot de passe <span className="text-slate-300">admin123</span> (modifiable via{' '}
          <span className="font-mono text-slate-400">SEED_ADMIN_EMAIL</span> /{' '}
          <span className="font-mono text-slate-400">SEED_ADMIN_PASSWORD</span>
          ). Vous serez redirigé vers <span className="text-slate-300">/admin</span>. Compte vendeur démo :{' '}
          <span className="text-slate-300">vendeur@techstore.local</span> / <span className="text-slate-300">vendeur123</span>.
        </p>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="text-slate-400 hover:text-white">
            ← Retour à l’accueil
          </Link>
        </p>
      </div>
    </div>
  )
}
