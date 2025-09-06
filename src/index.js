// index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/NavBar';
import AddProduct from './pages/AddProduct';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import EditProduct from './pages/EditProduct';
import reportWebVitals from './reportWebVitals';
import ProductList from './components/ProductList';
import DemoBanner from './components/DemoBanner';
import { AdminProvider } from './contexts/AdminContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AdminProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <DemoBanner />
          <Navbar />
          <Routes>
            <Route
              path="/"
              element={
                <main className="px-4 py-8">
                  <h1 className="text-2xl font-bold mb-4">Browse All Products</h1>
                  <ProductList />
                </main>
              }
            />
            <Route path="/add-product" element={<AddProduct />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/edit-product/:productId" element={<EditProduct />} />
          </Routes>
        </div>
      </Router>
    </AdminProvider>
  </React.StrictMode>
);

reportWebVitals();
