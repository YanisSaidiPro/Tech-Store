import { useEffect, useState } from 'react'
import { createStock, listStocks } from '../api'
import { useAuth } from '../context/AuthContext'

export function SellerStocksPage() {
  const { user } = useAuth()
  const [rows, setRows] = useState([])
  const [adresse, setAdresse] = useState('')
  const [err, setErr] = useState(null)

  const load = () => {
    listStocks({ limit: 100, page: 1 })
      .then((r) => setRows(r.data))
      .catch(() => setRows([]))
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setErr(null)
    try {
      if (!adresse.trim()) throw new Error('Adresse requise')
      await createStock({ adresse: adresse.trim() })
      setAdresse('')
      load()
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erreur')
    }
  }

  if (!user || user.role !== 'vendeur') {
    return <p className="text-slate-400">Accès réservé aux vendeurs.</p>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Stocks</h1>
      <p className="mt-1 text-slate-400">
        Entrepôts enregistrés dans le système (partagés entre vendeurs).
      </p>

      <form onSubmit={submit} className="mt-8 flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-[#111827] p-6">
        <input
          className="min-w-[200px] flex-1 rounded-lg border border-white/10 bg-[#1a2332] px-3 py-2.5 text-slate-100"
          placeholder="Adresse du nouvel entrepôt"
          value={adresse}
          onChange={(e) => setAdresse(e.target.value)}
        />
        <button type="submit" className="rounded-xl bg-[#00d154] px-6 py-2.5 font-semibold text-black hover:bg-[#00b849]">
          Ajouter
        </button>
        {err ? <p className="w-full text-sm text-red-400">{err}</p> : null}
      </form>

      <div className="mt-8 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0a1628] text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Adresse</th>
              <th className="px-4 py-3">Produits liés</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.idStock} className="border-t border-white/5">
                <td className="px-4 py-3 text-slate-500">#{s.idStock}</td>
                <td className="px-4 py-3 text-white">{s.adresse}</td>
                <td className="px-4 py-3 text-slate-400">{s.Produits?.length ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 ? <p className="mt-6 text-slate-500">Aucun entrepôt.</p> : null}
    </div>
  )
}
