import { useEffect, useState } from 'react'
import { listUtilisateurs } from '../api'
import { formatDate } from '../utils/format'

export function AdminUsersPage() {
  const [q, setQ] = useState('')
  const [role, setRole] = useState('')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    listUtilisateurs({
      limit: 50,
      page: 1,
      search: q || undefined,
      role: role || undefined,
    })
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false))
  }, [q, role])

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Utilisateurs</h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <input
          className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-slate-100"
          placeholder="Rechercher…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-slate-100"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Tous les rôles</option>
          <option value="client">Client</option>
          <option value="vendeur">Vendeur</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {loading ? (
        <p className="mt-8 text-slate-400">Chargement…</p>
      ) : (
        <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0a1628] text-slate-400">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">Création</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.idUtilisateur} className="border-t border-white/5">
                  <td className="px-4 py-3 text-slate-500">#{u.idUtilisateur}</td>
                  <td className="px-4 py-3 text-white">
                    {[u.prenom, u.nom].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-slate-400">{u.role}</td>
                  <td className="px-4 py-3 text-slate-500">{formatDate(u.dateCreation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
