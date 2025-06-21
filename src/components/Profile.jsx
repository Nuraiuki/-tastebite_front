import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Container from './Container';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState('created'); 
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // New state variables for profile editing
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(null);

  const DEFAULT_RECIPE_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#fff7ed"/>
      <text x="50%" y="50%" font-family="Material Icons" font-size="100" fill="#fb923c" text-anchor="middle" dominant-baseline="middle">TasteBite</text>
    </svg>
  `);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileRes, recipesRes, favoritesRes, ratingsRes] = await Promise.all([
          axios.get('http://localhost:5001/api/profile', { withCredentials: true }),
          axios.get('http://localhost:5001/api/profile/recipes', { withCredentials: true }),
          axios.get('http://localhost:5001/api/profile/favorites', { withCredentials: true }),
          axios.get('http://localhost:5001/api/profile/ratings', { withCredentials: true })
        ]);

        setProfile(profileRes.data);
        setRecipes(recipesRes.data);
        setFavorites(favoritesRes.data);
        setRatings(ratingsRes.data);
      } catch (err) {
        console.error('Error fetching profile data:', err.response?.data || err.message);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserStats = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/profile/stats', {
          withCredentials: true
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching user stats:', error);
      }
    };

    fetchProfileData();
    fetchUserStats();
  }, []);

  // Update editForm when profile data is loaded
  useEffect(() => {
    if (profile) {
      setEditForm(prev => ({
        ...prev,
        name: profile.name || '',
        email: profile.email || '',
      }));
    }
  }, [profile]);

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/profile`, { withCredentials: true });
      logout();
      navigate('/');
    } catch (err) {
      console.error('Error deleting account:', err);
      setError('Failed to delete account. Please try again.');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', editForm.name);
      formData.append('email', editForm.email);
      
      if (editForm.newPassword) {
        if (editForm.newPassword !== editForm.confirmPassword) {
          setError('New passwords do not match');
          return;
        }
        formData.append('newPassword', editForm.newPassword);
      }

      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const response = await axios.put(
        'http://localhost:5001/api/profile',
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Обновляем профиль с новыми данными
      const updatedProfile = {
        ...response.data,
        avatar: response.data.avatar
      };
      
      setProfile(updatedProfile);
      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      
      // Обновляем данные пользователя в контексте
      updateUser(updatedProfile);

      // Сбрасываем форму
      setEditForm({
        name: '',
        email: '',
        newPassword: '',
        confirmPassword: '',
      });
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Обновляем отображение аватара в профиле
  const renderAvatar = (avatarUrl) => {
    if (!avatarUrl) {
      return (
        <span className="material-icons text-6xl text-orange-500 flex items-center justify-center h-full">
          person
        </span>
      );
    }

    const fullAvatarUrl = avatarUrl.startsWith('http') 
      ? avatarUrl 
      : `http://localhost:5001${avatarUrl}`;

    return (
      <img
        src={fullAvatarUrl}
        alt="Profile avatar"
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Error loading avatar:', e);
          e.target.onerror = null;
          e.target.src = null;
          e.target.parentElement.innerHTML = `
            <span class="material-icons text-6xl text-orange-500 flex items-center justify-center h-full">
              person
            </span>
          `;
        }}
      />
    );
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-orange-500 hover:text-orange-600"
          >
            Retry
          </button>
        </div>
      </Container>
    );
  }

  const TabButton = ({ id, label, count }) => (
    <button
      className={`px-4 py-2 font-medium rounded-t-lg ${
        activeTab === id
          ? 'bg-white text-orange-500 border-b-2 border-orange-500'
          : 'text-gray-500 hover:text-gray-700 bg-gray-100'
      }`}
      onClick={() => setActiveTab(id)}
    >
      {label} {count !== undefined && <span className="ml-1 text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{count}</span>}
    </button>
  );

  const renderRecipeCard = (recipe, isExternal = false) => (
    <Link key={recipe.id} to={`/recipe/${recipe.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden h-full transition duration-300 hover:shadow-lg relative">
        {isExternal && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full z-10">
            External
          </div>
        )}
        <div className="relative h-48 overflow-hidden">
          <img
            src={recipe.image_url || DEFAULT_RECIPE_IMAGE}
            alt={recipe.title}
            className="w-full h-full object-cover transition duration-300 transform hover:scale-105"
            onError={(e) => {
              e.target.src = DEFAULT_RECIPE_IMAGE;
            }}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1 truncate">{recipe.title}</h3>
          {recipe.category && (
            <p className="text-sm text-gray-500">{recipe.category}</p>
          )}
          <div className="mt-2 flex items-center text-xs text-gray-500">
            {recipe.average_rating > 0 && (
              <div className="flex items-center mr-3">
                <span className="material-icons text-yellow-400 text-sm mr-1">star</span>
                <span>{recipe.average_rating.toFixed(1)}</span>
              </div>
            )}
            {recipe.ratings_count > 0 && (
              <div className="flex items-center">
                <span className="material-icons text-gray-400 text-sm mr-1">people</span>
                <span>{recipe.ratings_count}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <Container>
      <div className="max-w-6xl mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          {/* User Info Card */}
          <div className="bg-white p-6 rounded-lg shadow flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
              <button
                onClick={() => {
                  setIsEditing(!isEditing);
                  if (!isEditing) {
                    setEditForm({
                      name: profile.name,
                      email: profile.email,
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }
                }}
                className="text-orange-500 hover:text-orange-600 flex items-center"
              >
                <span className="material-icons mr-1">
                  {isEditing ? 'close' : 'edit'}
                </span>
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                {editError && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-lg">
                    {editError}
                  </div>
                )}
                {editSuccess && (
                  <div className="bg-green-50 text-green-500 p-3 rounded-lg">
                    {editSuccess}
                  </div>
                )}

                <div className="flex flex-col items-center mb-4">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-orange-100">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Avatar preview"
                          className="w-full h-full object-cover"
                        />
                      ) : renderAvatar(profile?.avatar)}
                    </div>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full cursor-pointer hover:bg-orange-600"
                    >
                      <span className="material-icons">photo_camera</span>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    required
                  />
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Change Password</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={editForm.confirmPassword}
                        onChange={(e) => setEditForm({ ...editForm, confirmPassword: e.target.value })}
                        className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-orange-100">
                  {renderAvatar(profile?.avatar)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{profile.name}</h3>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-white p-6 rounded-lg shadow flex-1">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Stats</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-3xl font-bold text-orange-500">{stats?.total_recipes || 0}</p>
                <p className="text-sm text-gray-600">Created</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-3xl font-bold text-red-500">{stats?.total_favorites || 0}</p>
                <p className="text-sm text-gray-600">Favorites</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-3xl font-bold text-yellow-500">{stats?.total_comments || 0}</p>
                <p className="text-sm text-gray-600">Comments</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-3xl font-bold text-green-500">{stats?.total_ratings || 0}</p>
                <p className="text-sm text-gray-600">Ratings Given</p>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone - Compact Version */}
        <div className="flex justify-end mb-6">
          <button
            onClick={handleDeleteAccount}
            className="flex items-center text-red-500 hover:text-red-600 transition-colors"
          >
            <span className="material-icons mr-1">delete_forever</span>
            Delete Account
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex overflow-x-auto space-x-2 border-b">
            <TabButton id="created" label="Created Recipes" count={recipes.length} />
            <TabButton id="favorites" label="Favorites" count={favorites.length} />
            <TabButton id="ratings" label="Rated Recipes" count={ratings.length} />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg p-6 shadow">
          {activeTab === 'created' && (
            <>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">My Created Recipes</h2>
                <Link 
                  to="/create" 
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition flex items-center"
                >
                  <span className="material-icons mr-1">add</span> Create New
                </Link>
              </div>
              {recipes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recipes.map(recipe => renderRecipeCard(recipe))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't created any recipes yet.</p>
                  <Link 
                    to="/create" 
                    className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                  >
                    Create Your First Recipe
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === 'favorites' && (
            <>
              <h2 className="text-xl font-semibold mb-4">My Favorite Recipes</h2>
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map(recipe => renderRecipeCard(recipe))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't favorited any recipes yet.</p>
                  <Link 
                    to="/" 
                    className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                  >
                    Find Recipes to Favorite
                  </Link>
                </div>
              )}
            </>
          )}

          {activeTab === 'ratings' && (
            <>
              <h2 className="text-xl font-semibold mb-4">Recipes I've Rated</h2>
              {ratings.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ratings.map(rating => (
                    <div key={rating.id} className="relative">
                      {rating.recipe && renderRecipeCard(rating.recipe)}
                      <div className="absolute top-2 left-2 bg-yellow-400 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        {rating.value} ★
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">You haven't rated any recipes yet.</p>
                  <Link 
                    to="/" 
                    className="mt-4 inline-block bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition"
                  >
                    Find Recipes to Rate
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Container>
  );
} 