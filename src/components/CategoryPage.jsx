import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Container from './Container';
import { Card, CardContent } from './ui/Card';
import { useAuth } from '../context/AuthContext';

export default function CategoryPage() {
  const { category } = useParams();
  const { user } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const DEFAULT_RECIPE_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#fff7ed"/>
      <text x="50%" y="50%" font-family="Material Icons" font-size="100" fill="#fb923c" text-anchor="middle" dominant-baseline="middle">TasteBite</text>
    </svg>
  `);

  useEffect(() => {
    const fetchMealsByCategory = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
        );
        setMeals(response.data.meals || []);
      } catch (err) {
        console.error('Error fetching meals:', err);
        setError('Failed to load meals for this category');
      } finally {
        setLoading(false);
      }
    };

    if (category) {
      fetchMealsByCategory();
    }
  }, [category]);

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div className="text-center text-red-500 py-8">{error}</div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <h1 className="text-3xl font-bold mb-8 font-display">{category} Recipes</h1>
        
        {meals.length === 0 ? (
          <div className="text-center py-8">
            <p>No recipes found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <Link to={`/meal/${meal.idMeal}`} key={meal.idMeal}>
                <Card className="group hover:shadow-lg transition duration-300">
                  <div className="relative">
                  <img
                    src={meal.strMealThumb}
                    alt={meal.strMeal}
                      className="w-full h-52 object-cover rounded-t"
                    onError={(e) => {
                        e.target.src = DEFAULT_RECIPE_IMAGE;
                    }}
                  />
               
                  </div>
                  <CardContent>
                    <h3 className="text-base font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">
                      {meal.strMeal}
                    </h3>
                    <p className="text-sm text-gray-600">Category: {category}</p>
                    <p className="text-sm text-orange-500 mt-2 flex items-center">
                      {user ? 'View recipe' : 'Sign in to view recipe'}
                      <span className="material-icons ml-1 text-sm">arrow_forward</span>
                    </p>
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
