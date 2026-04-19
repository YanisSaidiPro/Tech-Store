import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AdminLayout } from './components/AdminLayout'
import { RequireAuth } from './components/RequireAuth'
import { SellerLayout } from './components/SellerLayout'
import { StoreLayout } from './components/StoreLayout'
import { AdminDashboard } from './pages/AdminDashboard'
import { AdminDemandesPage } from './pages/AdminDemandesPage'
import { AdminUsersPage } from './pages/AdminUsersPage'
import { BecomeSellerPage } from './pages/BecomeSellerPage'
import { CartPage } from './pages/CartPage'
import { CategoriesPage } from './pages/CategoriesPage'
import { CategoryPage } from './pages/CategoryPage'
import { FavoritesPage } from './pages/FavoritesPage'
import { HomePage } from './pages/HomePage'
import { NotificationsPage } from './pages/NotificationsPage'
import { LoginPage } from './pages/LoginPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductPage } from './pages/ProductPage'
import { SearchPage } from './pages/SearchPage'
import { SellerDashboard } from './pages/SellerDashboard'
import { SellerPredictionsPage } from './pages/SellerPredictionsPage'
import { SellerProfilePage } from './pages/SellerProfilePage'
import { SellerProductsPage } from './pages/SellerProductsPage'
import { SellerStocksPage } from './pages/SellerStocksPage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<StoreLayout />}>
          <Route index element={<HomePage />} />
          <Route path="connexion" element={<LoginPage />} />
          <Route path="recherche" element={<SearchPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categorie/:id" element={<CategoryPage />} />
          <Route path="produit/:id" element={<ProductPage />} />
          <Route path="devenir-vendeur" element={<BecomeSellerPage />} />
          <Route
            path="panier"
            element={
              <RequireAuth roles={['client', 'vendeur']}>
                <CartPage />
              </RequireAuth>
            }
          />
          <Route
            path="favoris"
            element={
              <RequireAuth roles={['client', 'vendeur', 'admin']}>
                <FavoritesPage />
              </RequireAuth>
            }
          />
          <Route
            path="commandes"
            element={
              <RequireAuth roles={['client']}>
                <OrdersPage />
              </RequireAuth>
            }
          />
          <Route
            path="parametres"
            element={
              <RequireAuth>
                <SettingsPage />
              </RequireAuth>
            }
          />
          <Route
            path="notifications"
            element={
              <RequireAuth>
                <NotificationsPage />
              </RequireAuth>
            }
          />
        </Route>

        <Route
          path="vendeur"
          element={
            <RequireAuth roles={['vendeur']}>
              <SellerLayout />
            </RequireAuth>
          }
        >
          <Route index element={<SellerDashboard />} />
          <Route path="profil" element={<SellerProfilePage />} />
          <Route path="produits" element={<SellerProductsPage />} />
          <Route path="stocks" element={<SellerStocksPage />} />
          <Route path="predictions" element={<SellerPredictionsPage />} />
        </Route>

        <Route
          path="admin"
          element={
            <RequireAuth roles={['admin']}>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="utilisateurs" element={<AdminUsersPage />} />
          <Route path="demandes" element={<AdminDemandesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
