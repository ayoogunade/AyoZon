import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AdminProvider } from './context/AdminContext';
import { CartProvider } from './context/CartContext';
import { ShopLayout } from './components/shop/ShopLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { RequireAdmin } from './components/admin/RequireAdmin';
import Home from './pages/Home';
import ProductPage from './pages/ProductPage';
import Checkout from './pages/Checkout';
import OrderPage from './pages/OrderPage';
import NotFound from './pages/NotFound';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import PhotoEditor from './pages/admin/PhotoEditor';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <AdminProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<ShopLayout />}>
                  <Route index element={<Home />} />
                  <Route path="photo/:id" element={<ProductPage />} />
                  <Route path="checkout" element={<Checkout />} />
                  <Route path="order/:id" element={<OrderPage />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
                <Route path="admin/login" element={<AdminLogin />} />
                <Route path="admin" element={<RequireAdmin />}>
                  <Route element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="photos/new" element={<PhotoEditor />} />
                    <Route path="photos/:id" element={<PhotoEditor />} />
                  </Route>
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AdminProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
