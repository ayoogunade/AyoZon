import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import axios from 'axios';

const EditProduct = () => {
  const { productId } = useParams();
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    currentImage: '',
  });

  const fetchProduct = async () => {
    try {
      const response = await axios.get('http://localhost:5003/products');
      const product = response.data.find(p => p.id === productId);
      
      if (!product) {
        alert('Product not found');
        navigate('/admin');
        return;
      }

      setFormData({
        name: product.name,
        price: product.price.toString(),
        description: product.description,
        currentImage: product.image_url,
      });
      
      if (product.image_url) {
        setPreview(product.image_url);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Failed to load product');
      navigate('/admin');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
      return;
    }
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, productId, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const form = new FormData();
    form.append('name', formData.name);
    form.append('price', formData.price);
    form.append('description', formData.description);
    
    if (imageFile) {
      form.append('image', imageFile);
    }

    try {
      await axios.put(`http://localhost:5003/products/${productId}`, form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Product updated successfully!');
      navigate('/admin');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Product</h2>
        <button
          onClick={() => navigate('/admin')}
          className="text-blue-600 hover:text-blue-500"
        >
          ← Back to Dashboard
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Price
          </label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full mb-4"
          />
          {preview && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {imageFile ? 'New image preview:' : 'Current image:'}
              </p>
              <img
                src={preview}
                alt="Preview"
                className="w-48 h-48 object-cover rounded border"
              />
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className={`flex-1 text-white px-4 py-2 rounded transition-colors ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {submitting ? 'Updating...' : 'Update Product'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;