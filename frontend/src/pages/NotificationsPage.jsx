import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listNotifications, markAllNotificationsRead, markNotificationRead } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'

export function NotificationsPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const r = await listNotifications({ page: 1, limit: 100 })
      setRows(r.data || [])
    } catch {
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  const markOne = async (n) => {
    if (n.lu) return
    try {
      await markNotificationRead(n.idNotification)
      setRows((prev) => prev.map((x) => (x.idNotification === n.idNotification ? { ...x, lu: true } : x)))
    } catch {
      /* ignore */
    }
  }

  const markAll = async () => {
    setMsg(null)
    try {
      await markAllNotificationsRead()
      setRows((prev) => prev.map((x) => ({ ...x, lu: true })))
      setMsg('Toutes marquées comme lues.')
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Erreur')
    }
  }

  if (!user) {
    return (
      <p className="text-slate-400">
        <Link to="/connexion" className="text-[#00d154] hover:underline">
          Connectez-vous
        </Link>{' '}
        pour voir vos notifications.
      </p>
    )
  }

  if (loading) return <p className="text-slate-400">Chargement…</p>

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <button
          type="button"
          onClick={() => void markAll()}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
        >
          Tout marquer comme lu
        </button>
      </div>
      {msg ? <p className="mt-4 text-sm text-[#00d154]">{msg}</p> : null}

      <div className="mt-8 space-y-2">
        {rows.map((n) => (
          <div
            key={n.idNotification}
            className={`rounded-xl border px-4 py-3 ${
              n.lu ? 'border-white/5 bg-[#0c1220]' : 'border-[#00d154]/30 bg-[#111827]'
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-white">{n.titre}</p>
                <p className="mt-1 text-sm text-slate-400">{n.message}</p>
                <p className="mt-2 text-xs text-slate-600">{formatDate(n.createdAt)}</p>
              </div>
              {!n.lu ? (
                <button
                  type="button"
                  onClick={() => void markOne(n)}
                  className="shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/15"
                >
                  Marquer lu
                </button>
              ) : null}
            </div>
            {user.role === 'client' && n.idCommande ? (
              <Link
                to="/commandes"
                className="mt-2 inline-block text-xs text-[#00d154] hover:underline"
                onClick={() => void markOne(n)}
              >
                Voir mes commandes →
              </Link>
            ) : null}
          </div>
        ))}
      </div>
      {rows.length === 0 ? <p className="mt-8 text-slate-500">Aucune notification pour le moment.</p> : null}
    </div>
  )
}
