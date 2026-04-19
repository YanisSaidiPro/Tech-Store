import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getPanier, listFavoris } from '../api'
import { useAuth } from './AuthContext'
import { getOrCreateActivePanier } from '../utils/panier'
import { canUseCart } from '../utils/roles'

const ShopCountsContext = createContext(null)

export function ShopCountsProvider({ children }) {
  const { user, ready } = useAuth()
  const [cartQty, setCartQty] = useState(0)
  const [favCount, setFavCount] = useState(0)

  const refreshCounts = useCallback(async () => {
    if (!ready || !user) {
      setCartQty(0)
      setFavCount(0)
      return
    }
    const canFav = ['client', 'vendeur', 'admin'].includes(user.role)
    if (canUseCart(user)) {
      try {
        const pid = await getOrCreateActivePanier(user.idUtilisateur)
        const p = await getPanier(pid)
        const lines = p.Produits || []
        const qty = lines.reduce((acc, pr) => acc + (pr.Contient?.qte ?? 1), 0)
        setCartQty(qty)
      } catch {
        setCartQty(0)
      }
    } else {
      setCartQty(0)
    }
    if (canFav) {
      try {
        const r = await listFavoris({ idClient: user.idUtilisateur, limit: 1, page: 1 })
        setFavCount(typeof r.total === 'number' ? r.total : r.data?.length ?? 0)
      } catch {
        setFavCount(0)
      }
    } else {
      setFavCount(0)
    }
  }, [user, ready])

  useEffect(() => {
    void refreshCounts()
  }, [refreshCounts])

  const value = useMemo(
    () => ({ cartQty, favCount, refreshCounts }),
    [cartQty, favCount, refreshCounts]
  )

  return <ShopCountsContext.Provider value={value}>{children}</ShopCountsContext.Provider>
}

export function useShopCounts() {
  const ctx = useContext(ShopCountsContext)
  if (!ctx) {
    throw new Error('useShopCounts doit être utilisé dans ShopCountsProvider')
  }
  return ctx
}
