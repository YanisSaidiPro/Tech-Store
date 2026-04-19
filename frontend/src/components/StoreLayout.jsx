import { Outlet } from 'react-router-dom'
import { ShopCountsProvider } from '../context/ShopCountsContext'
import { Header } from './Header'

export function StoreLayout() {
  return (
    <ShopCountsProvider>
      <div className="min-h-screen bg-[#06080f]">
        <Header />
        <main className="mx-auto max-w-7xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    </ShopCountsProvider>
  )
}
