// components/Navbar.js
import { Link } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

const Navbar = () => {
  const { isAdmin, logout } = useAdmin();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">Amazon Clone</Link>
        
        <div className="flex items-center space-x-4">
          <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
          
          {isAdmin ? (
            <>
              <Link 
                to="/admin" 
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors"
              >
                Admin Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <Link 
              to="/admin/login" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
            >
              Admin Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;