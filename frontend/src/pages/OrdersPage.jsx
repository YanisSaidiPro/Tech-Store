import { Fragment, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listCommandes } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatDate, formatMoneyDA } from '../utils/format'

export function OrdersPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== 'client') return
    setLoading(true)
    listCommandes({ idClient: user.idUtilisateur, limit: 50, page: 1 })
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false))
  }, [user])

  if (!user || user.role !== 'client') {
    return (
      <p className="text-slate-400">
        <Link to="/connexion" className="text-[#00d154] hover:underline">
          Connectez-vous
        </Link>{' '}
        pour voir vos commandes.
      </p>
    )
  }

  if (loading) return <p className="text-slate-400">Chargement…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Mes commandes</h1>
      <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#111827] text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">N°</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <Fragment key={c.idCommande}>
                <tr className="border-t border-white/5 bg-[#0c1220]">
                  <td className="px-4 py-3 text-white">#{c.idCommande}</td>
                  <td className="px-4 py-3 text-slate-300">{formatDate(c.date)}</td>
                  <td className="px-4 py-3 capitalize text-slate-300">{c.statut?.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3 text-[#00d154]">
                    {c.total != null ? formatMoneyDA(c.total) : '—'}
                  </td>
                </tr>
                {c.livraisonNom || c.livraisonAdresse ? (
                  <tr className="border-t border-white/5 bg-[#080d18]">
                    <td colSpan={4} className="px-4 py-2 text-xs text-slate-500">
                      <span className="font-medium text-slate-400">Livraison :</span>{' '}
                      {[c.livraisonPrenom, c.livraisonNom].filter(Boolean).join(' ')}
                      {c.livraisonTel ? ` · ${c.livraisonTel}` : ''}
                      {c.livraisonAdresse ? ` · ${c.livraisonAdresse}` : ''}
                      {c.livraisonVille ? `, ${c.livraisonVille}` : ''}
                      {c.livraisonCodePostal ? ` ${c.livraisonCodePostal}` : ''}
                      {c.livraisonNotes ? ` — ${c.livraisonNotes}` : ''}
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <p className="mt-8 text-slate-500">Aucune commande.</p> : null}
    </div>
  )
}
