import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from './ui/Card';
import Container from './Container';
import { Input } from './ui/Input';

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const DEFAULT_RECIPE_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#fff7ed"/>
      <text x="50%" y="50%" font-family="Material Icons" font-size="100" fill="#fb923c" text-anchor="middle" dominant-baseline="middle">TasteBite</text>
    </svg>
  `);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const response = await fetch('https://tastebite-back.onrender.com/api/recipes?user_recipes=true', {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch recipes');
        }
        
        const data = await response.json();
        setRecipes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  const filteredRecipes = recipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container>
        <div className="text-center py-8">Loading recipes...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-red-500 text-center py-8">{error}</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Recipes</h1>
          <Link
            to="/create"
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
          >
            Create Recipe
          </Link>
        </div>

        <div className="mb-8">
          <Input
            type="search"
            placeholder="Search your recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        {filteredRecipes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No recipes found.</p>
            {recipes.length === 0 && (
              <p className="text-gray-500">
                Start by creating your first recipe!
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <Link to={`/recipe/${recipe.id}`} key={recipe.id}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <img
                    src={recipe.image_url || DEFAULT_RECIPE_IMAGE}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_RECIPE_IMAGE;
                    }}
                  />
                  <CardContent>
                    <h3 className="text-lg font-semibold mb-2">{recipe.title}</h3>
                    {recipe.category && (
                      <p className="text-gray-600 text-sm mb-1">Category: {recipe.category}</p>
                    )}
                    {recipe.area && (
                      <p className="text-gray-600 text-sm">Cuisine: {recipe.area}</p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
} 