import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import HomePage from './components/HomePage';
import CreateRecipe from './components/CreateRecipe';
import Navbar from './components/Navbar';
import RecipeDetail from './components/RecipeDetail';
import MealPage from './components/MealPage';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import AdminPanel from './components/AdminPanel';
import CategoryPage from './components/CategoryPage';
import LoadingScreen from './components/LoadingScreen';
import ShoppingListPage from './components/ShoppingListPage';
import PublicShoppingListPage from './components/PublicShoppingListPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return children;
};

function App() {
  const { loading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  
  useEffect(() => {
    if (!loading) {
      setShowLoading(false);
    }
    
    const timer = setTimeout(() => {
      setShowLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [loading]);
  
  if (showLoading) {
    return <LoadingScreen onComplete={() => setShowLoading(false)} text="Tastebite Recipes 🍽️" />;
  }
  
  return (
    <div className="App">
      <Navbar />
      <main>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/meal/:id" element={<MealPage />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route
            path="/create"
            element={
              <ProtectedRoute>
                <CreateRecipe />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-profile/:userId"
            element={<UserProfile />}
          />
          <Route
            path="/admin-panel"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shopping-list"
            element={
              <ProtectedRoute>
                <ShoppingListPage />
              </ProtectedRoute>
            }
          />
          <Route path="/public-shopping-list/:token" element={<PublicShoppingListPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
