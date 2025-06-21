import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from './Container';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// API URL
const API_URL = 'https://tastebite-back.onrender.com/api';

// Chart options
const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Activity Overview',
    },
  },
};

const doughnutOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Content Distribution',
    },
  },
};

const lineOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Top Rated Recipes',
    },
  },
};

export default function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'recipes', 'stats'
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (activeTab === 'users') {
          const response = await axios.get(`${API_URL}/admin/users`, { withCredentials: true });
          setUsers(response.data);
        } else if (activeTab === 'recipes') {
          const response = await axios.get(`${API_URL}/admin/recipes`, { withCredentials: true });
          setRecipes(response.data);
        } else if (activeTab === 'stats') {
          const response = await axios.get(`${API_URL}/admin/stats`, { withCredentials: true });
          setStats(response.data);
        }
      } catch (err) {
        console.error('Error fetching admin data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate, activeTab]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user and all their content?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`, { withCredentials: true });
      setUsers(users.filter(u => u.id !== userId));
      setSuccessMessage('User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm('Are you sure you want to delete this recipe and all related content?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/admin/recipes/${recipeId}`, { withCredentials: true });
      setRecipes(recipes.filter(r => r.id !== recipeId));
      setSuccessMessage('Recipe deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Failed to delete recipe. Please try again.');
    }
  };

  const handleToggleAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to change this user\'s admin status?')) {
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/admin/users/${userId}/toggle-admin`, {}, { withCredentials: true });
      setUsers(users.map(u => u.id === userId ? { ...u, is_admin: !u.is_admin } : u));
      setSuccessMessage(response.data.message);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error toggling admin status:', err);
      setError('Failed to change admin status. Please try again.');
    }
  };

  const TabButton = ({ id, label }) => (
    <button
      className={`px-4 py-2 font-medium rounded-t-lg ${
        activeTab === id
          ? 'bg-white text-orange-500 border-b-2 border-orange-500'
          : 'text-gray-500 hover:text-gray-700 bg-gray-100'
      }`}
      onClick={() => setActiveTab(id)}
    >
      {label}
    </button>
  );

  const renderCharts = () => {
    if (!stats) return null;

    // Activity Overview Chart
    const activityData = {
      labels: ['Users', 'Created Recipes', 'Ratings', 'Favorites', 'Comments'],
      datasets: [
        {
          label: 'Count',
          data: [
            stats.total_users,
            stats.total_created_recipes,
            stats.total_ratings,
            stats.total_favorites,
            stats.total_comments,
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    // Content Distribution Chart
    const contentData = {
      labels: ['Created Recipes', 'Ratings', 'Favorites', 'Comments'],
      datasets: [
        {
          data: [
            stats.total_created_recipes,
            stats.total_ratings,
            stats.total_favorites,
            stats.total_comments,
          ],
          backgroundColor: [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <Bar options={barOptions} data={activityData} />
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <Doughnut options={doughnutOptions} data={contentData} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
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

  return (
    <Container>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-2 border-b">
            <TabButton id="users" label="Users" />
            <TabButton id="recipes" label="Recipes" />
            <TabButton id="stats" label="Statistics" />
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users
                    .filter(user => user.email !== 'system@tastebite.com')
                    .map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                              <span className="material-icons text-orange-500">person</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Recipes: {user.stats.recipes_count}</div>
                          <div>Ratings: {user.stats.ratings_count}</div>
                          <div>Favorites: {user.stats.favorites_count}</div>
                          <div>Comments: {user.stats.comments_count}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_admin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleAdmin(user.id)}
                            className={`px-3 py-1 rounded ${
                              user.is_admin 
                                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </button>
                          {!user.is_admin && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'recipes' && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipe</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recipes
                    .filter(recipe => !recipe.author || recipe.author.email !== 'system@tastebite.com')
                    .map((recipe) => (
                    <tr key={recipe.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              src={recipe.image_url}
                              alt={recipe.title}
                              className="h-10 w-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,' + btoa(`
                                  <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="40" height="40" fill="#fff7ed"/>
                                    <text x="50%" y="50%" font-family="Arial" font-size="12" fill="#fb923c" text-anchor="middle" dominant-baseline="middle">TB</text>
                                  </svg>
                                `);
                              }}
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{recipe.title}</div>
                            <div className="text-sm text-gray-500">{recipe.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {recipe.author ? (
                            <>
                              <div>{recipe.author.name}</div>
                              <div className="text-gray-500">{recipe.author.email}</div>
                            </>
                          ) : (
                            <span className="text-gray-500">System</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Rating: {recipe.stats.average_rating.toFixed(1)} ({recipe.stats.ratings_count})</div>
                          <div>Favorites: {recipe.stats.favorites_count}</div>
                          <div>Comments: {recipe.stats.comments_count}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'stats' && stats && (
            <div className="p-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Users</p>
                      <p className="text-2xl font-semibold">{stats.total_users}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <span className="material-icons text-blue-500">people</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Recipes</p>
                      <p className="text-2xl font-semibold">310</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <span className="material-icons text-orange-500">restaurant</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Comments</p>
                      <p className="text-2xl font-semibold">{stats.total_comments}</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <span className="material-icons text-green-500">chat</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">User Created Recipes</p>
                      <p className="text-2xl font-semibold">{stats.user_created_recipes}</p>
                    </div>
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <span className="material-icons text-indigo-500">create</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Favorites</p>
                      <p className="text-2xl font-semibold">{stats.total_favorites}</p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-full">
                      <span className="material-icons text-red-500">favorite</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              {renderCharts()}

              {/* Active Users Table */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Most Active Users</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ratings</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Favorites</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.active_users.map(user => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                <span className="material-icons text-orange-500">person</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.recipes_count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.ratings_count}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.favorites_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
} 