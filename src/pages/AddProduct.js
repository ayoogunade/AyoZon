// pages/AddProduct.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';
import axios from 'axios';

const AddProduct = () => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const { isAdmin } = useAdmin();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login');
    }
  }, [isAdmin, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', formData.name);
    form.append('price', formData.price);
    form.append('description', formData.description);
    if (imageFile) {
      form.append('image', imageFile);
    }
  
    try {
      await axios.post('http://localhost:5003/add_product', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Product added successfully!');
      navigate('/admin');
    } catch (error) {
      alert('Error adding product: ' + (error.response?.data?.error || error.message));
    }
  };
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add New Product</h2>
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
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            onChange={handleChange}
            required
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-4 w-48 h-48 object-cover rounded border"
          />
        )}
      </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Add Product
        </button>
      </form>
    </div>
  );
};

export default AddProduct;