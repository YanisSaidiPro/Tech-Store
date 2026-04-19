import { useEffect, useState } from 'react'
import { acceptDemande, listDemandesVendeur, rejectDemande } from '../api'
import { formatDate } from '../utils/format'

export function AdminDemandesPage() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('en_attente')

  const load = () => {
    setLoading(true)
    listDemandesVendeur({ statut: filter || undefined, limit: 50, page: 1 })
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [filter])

  const accept = async (id) => {
    const commentaireAdmin = window.prompt('Commentaire (optionnel)') ?? undefined
    try {
      await acceptDemande(id, commentaireAdmin)
      load()
    } catch {
      /* */
    }
  }

  const reject = async (id) => {
    const commentaireAdmin = window.prompt('Motif du refus') ?? undefined
    try {
      await rejectDemande(id, commentaireAdmin)
      load()
    } catch {
      /* */
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Traitement des demandes vendeur</h1>
      <div className="mt-6">
        <select
          className="rounded-lg border border-white/10 bg-[#111827] px-3 py-2 text-slate-100"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">Tous</option>
          <option value="en_attente">En attente</option>
          <option value="acceptee">Acceptées</option>
          <option value="refusee">Refusées</option>
        </select>
      </div>
      {loading ? (
        <p className="mt-8 text-slate-400">Chargement…</p>
      ) : (
        <div className="mt-8 space-y-4">
          {rows.map((d) => (
            <div
              key={d.idDemande}
              className="rounded-xl border border-white/10 bg-[#111827] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    #{d.idDemande} · Client #{d.idClient} · {formatDate(d.date)}
                  </p>
                  <p className="mt-2 font-medium text-white">{d.contactTel || '—'}</p>
                  <p className="mt-2 text-slate-300">{d.contenu || '—'}</p>
                  {d.commentaireAdmin ? (
                    <p className="mt-2 text-sm text-slate-500">Admin : {d.commentaireAdmin}</p>
                  ) : null}
                  <p className="mt-2 text-xs uppercase text-amber-400/90">{d.statut}</p>
                </div>
                {d.statut === 'en_attente' ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void accept(d.idDemande)}
                      className="rounded-lg bg-[#00d154] px-4 py-2 text-sm font-semibold text-black hover:bg-[#00b849]"
                    >
                      Accepter
                    </button>
                    <button
                      type="button"
                      onClick={() => void reject(d.idDemande)}
                      className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      Refuser
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && rows.length === 0 ? <p className="mt-8 text-slate-500">Aucune demande.</p> : null}
    </div>
  )
}
