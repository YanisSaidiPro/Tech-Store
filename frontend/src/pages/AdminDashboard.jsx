import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listDemandesVendeur, listUtilisateurs } from '../api'

export function AdminDashboard() {
  const [users, setUsers] = useState(0)
  const [pending, setPending] = useState(0)

  useEffect(() => {
    listUtilisateurs({ limit: 1, page: 1 })
      .then((r) => setUsers(r.total))
      .catch(() => setUsers(0))
    listDemandesVendeur({ statut: 'en_attente', limit: 1, page: 1 })
      .then((r) => setPending(r.total))
      .catch(() => setPending(0))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard administrateur</h1>
      <p className="mt-1 text-slate-400">Indicateurs globaux</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <p className="text-sm text-slate-500">Utilisateurs</p>
          <p className="mt-2 text-3xl font-bold text-white">{users}</p>
          <Link to="/admin/utilisateurs" className="mt-4 inline-block text-sm text-[#3b82f6] hover:underline">
            Gérer →
          </Link>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#111827] p-6">
          <p className="text-sm text-slate-500">Demandes vendeur en attente</p>
          <p className="mt-2 text-3xl font-bold text-amber-400">{pending}</p>
          <Link to="/admin/demandes" className="mt-4 inline-block text-sm text-[#3b82f6] hover:underline">
            Traiter →
          </Link>
        </div>
      </div>
    </div>
  )
}
