import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/Card";
import { Input } from "@/components/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import Container from "./Container";
import RecipeCarousel from "./RecipeCarousel";
import { useAuth } from "../context/AuthContext";
// import LoadingScreen from "./LoadingScreen";

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [localRecipes, setLocalRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const topCategories = [
    "Beef",
    "Chicken",
    "Seafood",
    "Dessert",
    "Miscellaneous",
    "Side",
  ];

  const filteredCategories = categories.filter((cat) =>
    topCategories.includes(cat.strCategory)
  );

  const DEFAULT_RECIPE_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#fff7ed"/>
      <text x="50%" y="50%" font-family="Material Icons" font-size="100" fill="#fb923c" text-anchor="middle" dominant-baseline="middle">TasteBite</text>
    </svg>
  `);

  // Handle completion of loading screen
  const handleLoadingComplete = () => {
    setInitialLoading(false);
  };

  // Load local recipes only if user is logged in
  useEffect(() => {
    const fetchLocalRecipes = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/recipes', {
          withCredentials: true
        });
        setLocalRecipes(response.data);
      } catch (err) {
        console.error('Error fetching local recipes:', err);
      }
    };

    fetchLocalRecipes();
  }, [user]);

  // Load categories
  useEffect(() => {
    axios
      .get("https://www.themealdb.com/api/json/v1/1/categories.php")
      .then(res => {
        setCategories(res.data.categories || []);
      })
      .catch(err => console.error("Error loading categories:", err));
  }, []);

  // Load external meals
  useEffect(() => {
    setIsLoading(true);
    const url = searchTerm
      ? `https://www.themealdb.com/api/json/v1/1/search.php?s=${searchTerm}`
      : `https://www.themealdb.com/api/json/v1/1/search.php?s=chicken`;

    axios
      .get(url)
      .then((res) => {
        setMeals(res.data.meals || []);
      })
      .catch((err) => {
        console.error("Error loading meals:", err);
        setMeals([]);
      })
      .finally(() => {
        setIsLoading(false);
        // After a delay, hide the loading screen regardless
        setTimeout(() => {
          setInitialLoading(false);
        }, 2000); // Minimum 2 second display of loading screen
      });
  }, [searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter local recipes based on search term
  const filteredLocalRecipes = localRecipes.filter(recipe =>
    (recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.area?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.author?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Transform external meals to match local recipe format
  const transformedMeals = meals.map(meal => ({
    id: meal.idMeal,
    title: meal.strMeal,
    category: meal.strCategory,
    area: meal.strArea,
    image_url: meal.strMealThumb,
    isExternal: true
  }));

  // Filter out imported recipes that duplicate external API results
  // First, get the external IDs from transformed meals
  const externalIds = transformedMeals.map(meal => meal.id);
  
  // Then filter local recipes to exclude those that are external with matching IDs
  const filteredImportedRecipes = filteredLocalRecipes.filter(recipe => 
    !(recipe.is_external && externalIds.includes(recipe.external_id))
  );
  
  // Combine and sort all recipes (including external ones) to display on the homepage
  const allRecipes = [...filteredImportedRecipes, ...transformedMeals].sort((a, b) => 
    a.title.localeCompare(b.title)
  );

  // // Show LoadingScreen during initial loading
  // if (initialLoading) {
  //   return <LoadingScreen onComplete={handleLoadingComplete} text="Tastebite Recipes 🍽️" />;
  // }

  

  return (
    <Container>
      {/* Hero Section with Carousel */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-center mb-8 font-display">
          Discover Delicious Recipes
        </h1>
        <div className="max-w-6xl mx-auto">
          <RecipeCarousel />
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <Input
          type="search"
          placeholder={user ? "Search all recipes..." : "Search recipes..."}
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-md mx-auto"
        />
        {!user && searchTerm && (
          <p className="text-center text-gray-500 mt-2">
            <Link to="/auth" className="text-orange-500 hover:text-orange-600">
              Sign in
            </Link>{" "}
            to see more recipes!
          </p>
        )}
      </div>

      {/* Categories */}
      {!searchTerm && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4 font-display">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-6 justify-items-center">
            {filteredCategories.map((cat) => (
              <div
                key={cat.idCategory}
                onClick={() => navigate(`/category/${cat.strCategory}`)}
                className="group cursor-pointer text-center transition-transform duration-300 ease-out hover:scale-105"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border border-gray-200 mx-auto transition-all duration-300 ease-out group-hover:shadow-xl group-hover:scale-110">
                  <img
                    src={cat.strCategoryThumb}
                    alt={cat.strCategory}
                    className="w-full h-full object-cover rounded-full transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-base font-display font-semibold transition-colors duration-300 group-hover:text-orange-500">
                  {cat.strCategory}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Recipes */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 font-display">
          {searchTerm ? "Search Results" : "All Recipes"}
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : allRecipes.length === 0 ? (
          <p className="text-center text-gray-500">No recipes found.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {allRecipes.map((recipe) => (
              <Link 
                to={user ? (recipe.isExternal ? `/meal/${recipe.id}` : `/recipe/${recipe.id}`) : "/auth"}
                key={`${recipe.isExternal ? 'ext' : 'loc'}-${recipe.id}`}
              >
                <Card className="group hover:shadow-lg transition duration-300">
                  <div className="relative">
                    <img
                      src={recipe.image_url || DEFAULT_RECIPE_IMAGE}
                      alt={recipe.title}
                      className="w-full h-52 object-cover rounded-t"
                      onError={(e) => {
                        e.target.src = DEFAULT_RECIPE_IMAGE;
                      }}
                    />
                    {user && !recipe.isExternal && recipe.user_id === user.id && (
                      <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                        My Recipe
                      </div>
                    )}
                    {!recipe.isExternal && recipe.user_id !== user?.id && recipe.author && 
                     !recipe.author.is_system && recipe.author.name !== "Tastebite System" && (
                      <div 
                        className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full cursor-pointer z-10"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/user-profile/${recipe.user_id}`);
                        }}
                      >
                        By {recipe.author.name}
                      </div>
                    )}
                  </div>
                  <CardContent>
                    <h3 className="text-base font-semibold text-gray-800 group-hover:text-orange-500 transition-colors">
                      {recipe.title}
                    </h3>
                    {recipe.category && (
                      <p className="text-sm text-gray-600">Category: {recipe.category}</p>
                    )}
                    {recipe.area && (
                      <p className="text-sm text-gray-600">Cuisine: {recipe.area}</p>
                    )}
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

export default HomePage;
