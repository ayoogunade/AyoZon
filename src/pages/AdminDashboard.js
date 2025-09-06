import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import axios from 'axios';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAdmin, logout } = useAdmin();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5003/products');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await axios.delete(`http://localhost:5003/products/${productId}`);
      setProducts(products.filter(p => p.id !== productId));
      alert('Product deleted successfully!');
    } catch (err) {
      alert('Failed to delete product: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/add-product')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
          >
            Add Product
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="border rounded-lg shadow-lg p-4 bg-white flex flex-col">
            {product.image_url ? (
              <div className="w-full flex justify-center mb-4">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="max-w-full max-h-64 object-contain rounded-md"
                />
              </div>
            ) : (
              <div className="w-full h-48 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
            
            <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold mb-4">${product.price}</p>
            
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/admin/edit-product/${product.id}`)}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-xl mb-4">No products found</p>
          <button
            onClick={() => navigate('/add-product')}
            className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition-colors"
          >
            Add Your First Product
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;