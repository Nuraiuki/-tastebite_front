import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Container from './Container';

export default function UserProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const DEFAULT_RECIPE_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#fff7ed"/>
      <text x="50%" y="50%" font-family="Material Icons" font-size="100" fill="#fb923c" text-anchor="middle" dominant-baseline="middle">TasteBite</text>
    </svg>
  `);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        // Fetch the user data
        const userResponse = await axios.get(`http://localhost:5001/api/users/${userId}`, {
          withCredentials: true
        });
        
        // Fetch the user's created recipes
        const recipesResponse = await axios.get(`http://localhost:5001/api/users/${userId}/recipes`, {
          withCredentials: true
        });
        
        setProfile(userResponse.data);
        setRecipes(recipesResponse.data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-screen">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-red-500 mb-4">{error || 'User not found'}</p>
          <Link to="/" className="text-orange-500 hover:text-orange-600">
            Return to Home
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-6xl mx-auto py-8">
        {/* User Info Card */}
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="bg-orange-100 rounded-full p-8 text-orange-500">
              <span className="material-icons text-5xl">person</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{profile.name}'s Profile</h1>
              <p className="text-gray-600">Member since {new Date(profile.created).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">Recipes by {profile.name}</h2>
          
          {recipes && recipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map(recipe => (
                <Link key={recipe.id} to={`/recipe/${recipe.id}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden h-full transition duration-300 hover:shadow-lg relative">
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">This user hasn't created any recipes yet.</p>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
} 