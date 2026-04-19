import { Bell } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUnreadNotificationCount, listNotifications, markNotificationRead } from '../api'
import { useAuth } from '../context/AuthContext'
import { formatDate } from '../utils/format'
import { NOTIFICATIONS_REFRESH_EVENT } from '../utils/notifications'

export function NotificationBell({ accent = 'blue' }) {
  const { user, token } = useAuth()
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef(null)

  const ringClass =
    accent === 'green'
      ? 'text-[#00d154] hover:bg-[#00d154]/15'
      : 'text-[#93c5fd] hover:bg-[#3b82f6]/15'

  const fetchUnread = useCallback(async () => {
    if (!user || !token) {
      setUnread(0)
      return
    }
    try {
      const r = await getUnreadNotificationCount()
      setUnread(typeof r?.count === 'number' ? r.count : 0)
    } catch {
      setUnread(0)
    }
  }, [user, token])

  const loadPreview = useCallback(async () => {
    if (!user || !token) return
    setLoading(true)
    try {
      const r = await listNotifications({ page: 1, limit: 6 })
      setPreview(r.data || [])
    } catch {
      setPreview([])
    } finally {
      setLoading(false)
    }
  }, [user, token])

  useEffect(() => {
    void fetchUnread()
    const t = window.setInterval(() => void fetchUnread(), 45000)
    const onVis = () => void fetchUnread()
    document.addEventListener('visibilitychange', onVis)
    const onRefresh = () => void fetchUnread()
    window.addEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh)
    return () => {
      window.clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener(NOTIFICATIONS_REFRESH_EVENT, onRefresh)
    }
  }, [fetchUnread])

  useEffect(() => {
    if (!open) return
    void loadPreview()
  }, [open, loadPreview])

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  if (!user) return null

  const onOpenItem = async (n) => {
    if (!n.lu) {
      try {
        await markNotificationRead(n.idNotification)
        void fetchUnread()
        void loadPreview()
      } catch {
        /* ignore */
      }
    }
    setOpen(false)
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`relative rounded-full p-2.5 transition ${ringClass}`}
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold leading-none text-black">
            {unread > 99 ? '99+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-[60] mt-2 w-[min(100vw-2rem,22rem)] rounded-xl border border-white/10 bg-[#111827] py-2 shadow-xl">
          <div className="border-b border-white/5 px-3 pb-2">
            <p className="text-sm font-semibold text-white">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-3 py-4 text-sm text-slate-500">Chargement…</p>
            ) : preview.length === 0 ? (
              <p className="px-3 py-4 text-sm text-slate-500">Aucune notification.</p>
            ) : (
              preview.map((n) => (
                <button
                  key={n.idNotification}
                  type="button"
                  onClick={() => void onOpenItem(n)}
                  className={`w-full border-b border-white/5 px-3 py-2.5 text-left text-sm transition last:border-0 hover:bg-white/5 ${
                    n.lu ? 'text-slate-400' : 'text-white'
                  }`}
                >
                  <span className="block font-medium">{n.titre}</span>
                  <span className="mt-0.5 line-clamp-2 text-xs text-slate-500">{n.message}</span>
                  <span className="mt-1 block text-[10px] uppercase text-slate-600">
                    {formatDate(n.createdAt)}
                  </span>
                </button>
              ))
            )}
          </div>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-white/5 px-3 py-2.5 text-center text-sm text-[#00d154] hover:bg-white/5"
          >
            Voir tout
          </Link>
        </div>
      ) : null}
    </div>
  )
}
