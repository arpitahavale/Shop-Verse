import { lazy } from 'react';
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthLayout from './components/AuthLayout';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { ROUTES } from './constants';

const HomePage = lazy(() => import('./pages/HomePage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const VibePage = lazy(() => import('./pages/VibePage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage'));
const CollectionPage = lazy(() => import('./pages/CollectionPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <OrdersProvider>
            <WishlistProvider>
              <CartProvider>
                <Routes>
                  {/* Separate auth pages — no store access */}
                  <Route
                    element={
                      <GuestRoute>
                        <AuthLayout />
                      </GuestRoute>
                    }
                  >
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                  </Route>

                  {/* Entire store requires login */}
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<HomePage />} />
                    <Route path="shop" element={<ShopPage />} />
                    <Route path="shop/:category" element={<ShopPage />} />
                    <Route path="vibe" element={<VibePage />} />
                    <Route path="collections/:slug" element={<CollectionPage />} />
                    <Route path="product/:id" element={<ProductDetailPage />} />
                    <Route path="wishlist" element={<WishlistPage />} />
                    <Route path="cart" element={<CartPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                  </Route>

                  <Route path="*" element={<Navigate to={ROUTES.login} replace />} />
                </Routes>
              </CartProvider>
            </WishlistProvider>
          </OrdersProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
