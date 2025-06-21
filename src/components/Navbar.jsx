import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import GenerateRecipeModal from "./GenerateRecipeModal";
import UserNav from './UserNav';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="material-icons text-orange-500 mr-2">restaurant</span>
                <span className="text-2xl font-bold text-orange-500">TasteBite</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-orange-500"
                >
                  <span className="material-icons mr-1 text-sm">home</span>
                  Home
                </Link>
                {user && (
                  <>
                    <Link
                      to="/create"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-orange-500"
                    >
                      <span className="material-icons mr-1 text-sm">add_circle</span>
                      Create Recipe
                    </Link>
                    <button
                      onClick={() => setIsGenerateModalOpen(true)}
                      className="inline-flex items-center px-3 pt-1 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-full hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-sm hover:shadow-md"
                    >
                      <span className="material-icons mr-1 text-sm">auto_fix_high</span>
                      Generate Recipe
                    </button>
                    <Link
                      to="/profile"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-orange-500"
                    >
                      <span className="material-icons mr-1 text-sm">favorite</span>
                      My Favorites
                    </Link>
                    <Link
                      to="/shopping-list"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-orange-500"
                      title="Shopping List"
                    >
                      <span className="material-icons mr-1 text-sm">shopping_cart</span>
                      List
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-full bg-orange-50 text-orange-500 hover:bg-orange-100 transition-colors"
                  >
                    <span className="material-icons mr-2">person</span>
                    <span className="font-medium">{user.name}</span>
                  </Link>
                  {user.is_admin && (
                    <Link
                      to="/admin-panel"
                      className="flex items-center px-3 py-2 rounded-full bg-purple-50 text-purple-500 hover:bg-purple-100 transition-colors"
                    >
                      <span className="material-icons mr-2">admin_panel_settings</span>
                      <span className="font-medium">Admin</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <span className="material-icons">logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-x-3">
                  <Link
                    to="/auth"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-orange-500 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <span className="material-icons mr-1 text-sm">login</span>
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <GenerateRecipeModal 
        isOpen={isGenerateModalOpen} 
        onClose={() => setIsGenerateModalOpen(false)} 
      />
    </>
  );
}
