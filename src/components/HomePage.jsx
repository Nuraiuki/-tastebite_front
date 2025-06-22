import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "./ui/Card";
import { Input } from "@/components/ui/Input";
import { Link, useNavigate } from "react-router-dom";
import Container from "./Container";
import RecipeCarousel from "./RecipeCarousel";
import { useAuth } from "../context/AuthContext";
import { Select } from "./ui/Select";
// import LoadingScreen from "./LoadingScreen";

function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [meals, setMeals] = useState([]);
  const [localRecipes, setLocalRecipes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedSort, setSelectedSort] = useState("name");
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showCategories, setShowCategories] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const recipesPerPage = 12;

  const topCategories = [
    "Beef",
    "Chicken",
    "Seafood",
    "Dessert",
    "Miscellaneous",
    "Side",
  ];

  const sortOptions = [
    { value: "name", label: "Name (A-Z)" },
    { value: "name-desc", label: "Name (Z-A)" },
    { value: "rating", label: "Rating (High to Low)" },
    { value: "rating-desc", label: "Rating (Low to High)" },
  ];

  const ratingOptions = [
    { value: 0, label: "All Ratings" },
    { value: 4, label: "4+ Stars" },
    { value: 3, label: "3+ Stars" },
    { value: 2, label: "2+ Stars" },
    { value: 1, label: "1+ Stars" },
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

  // Load categories and areas from MealDB
  useEffect(() => {
    const fetchCategoriesAndAreas = async () => {
      try {
        // Fetch categories
        const categoriesRes = await axios.get("https://www.themealdb.com/api/json/v1/1/categories.php");
        setCategories(categoriesRes.data.categories || []);

        // Fetch all meals to extract unique areas
        const mealsRes = await axios.get("https://www.themealdb.com/api/json/v1/1/search.php?s=");
        const uniqueAreas = [...new Set(mealsRes.data.meals.map(meal => meal.strArea))].sort();
        setAreas(uniqueAreas);
      } catch (err) {
        console.error("Error loading categories and areas:", err);
      }
    };

    fetchCategoriesAndAreas();
  }, []);

  // Load local recipes only if user is logged in
  useEffect(() => {
    const fetchLocalRecipes = async () => {
      try {
        const response = await axios.get('https://tastebite-back.onrender.com/api/recipes', {
          withCredentials: true
        });
        setLocalRecipes(response.data);
      } catch (err) {
        console.error('Error fetching local recipes:', err);
      }
    };

    fetchLocalRecipes();
  }, [user]);

  // Load meals from MealDB based on filters
  useEffect(() => {
    const fetchMeals = async () => {
      setIsLoading(true);
      try {
        // Fetch all meals at once using the search endpoint
        const response = await axios.get("https://www.themealdb.com/api/json/v1/1/search.php?s=");
        const allMeals = response.data.meals || [];
        console.log("Total meals loaded:", allMeals.length);

        // Transform meals to include all necessary information
        const transformedMeals = allMeals.map(meal => ({
          idMeal: meal.idMeal,
          strMeal: meal.strMeal,
          strMealThumb: meal.strMealThumb,
          strCategory: meal.strCategory,
          strArea: meal.strArea,
          strInstructions: meal.strInstructions,
          strIngredient1: meal.strIngredient1,
          strIngredient2: meal.strIngredient2,
          strIngredient3: meal.strIngredient3,
          strIngredient4: meal.strIngredient4,
          strIngredient5: meal.strIngredient5,
          strIngredient6: meal.strIngredient6,
          strIngredient7: meal.strIngredient7,
          strIngredient8: meal.strIngredient8,
          strIngredient9: meal.strIngredient9,
          strIngredient10: meal.strIngredient10,
          strIngredient11: meal.strIngredient11,
          strIngredient12: meal.strIngredient12,
          strIngredient13: meal.strIngredient13,
          strIngredient14: meal.strIngredient14,
          strIngredient15: meal.strIngredient15,
          strIngredient16: meal.strIngredient16,
          strIngredient17: meal.strIngredient17,
          strIngredient18: meal.strIngredient18,
          strIngredient19: meal.strIngredient19,
          strIngredient20: meal.strIngredient20,
          strMeasure1: meal.strMeasure1,
          strMeasure2: meal.strMeasure2,
          strMeasure3: meal.strMeasure3,
          strMeasure4: meal.strMeasure4,
          strMeasure5: meal.strMeasure5,
          strMeasure6: meal.strMeasure6,
          strMeasure7: meal.strMeasure7,
          strMeasure8: meal.strMeasure8,
          strMeasure9: meal.strMeasure9,
          strMeasure10: meal.strMeasure10,
          strMeasure11: meal.strMeasure11,
          strMeasure12: meal.strMeasure12,
          strMeasure13: meal.strMeasure13,
          strMeasure14: meal.strMeasure14,
          strMeasure15: meal.strMeasure15,
          strMeasure16: meal.strMeasure16,
          strMeasure17: meal.strMeasure17,
          strMeasure18: meal.strMeasure18,
          strMeasure19: meal.strMeasure19,
          strMeasure20: meal.strMeasure20,
        }));

        console.log("Transformed meals:", transformedMeals.length);
        setMeals(transformedMeals);
      } catch (err) {
        console.error("Error loading meals:", err);
        setMeals([]);
      } finally {
        setIsLoading(false);
        setTimeout(() => {
          setInitialLoading(false);
        }, 2000);
      }
    };

    fetchMeals();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchFocus = () => {
    setShowFilters(true);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setShowFilters(true);
    // Immediately filter recipes for the selected category
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    setIsLoading(true);
    axios
      .get(url)
      .then((res) => {
        setMeals(res.data.meals || []);
      })
      .catch((err) => {
        console.error("Error loading category meals:", err);
        setMeals([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // Transform external meals to match local recipe format
  const transformedMeals = meals.map(meal => {
    // Find if this meal exists in local database
    const localRecipe = localRecipes.find(r => r.is_external && r.external_id === meal.idMeal);
    return {
      id: meal.idMeal,
      title: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      image_url: meal.strMealThumb,
      isExternal: true,
      average_rating: localRecipe ? localRecipe.average_rating : 0,
      ratings_count: localRecipe ? localRecipe.ratings_count : 0
    };
  });

  // Filter out imported recipes that duplicate external API results
  const externalIds = transformedMeals.map(meal => meal.id);
  const filteredImportedRecipes = localRecipes.filter(recipe => 
    !(recipe.is_external && externalIds.includes(recipe.external_id))
  );
  
  // Combine all recipes
  const allRecipes = [...filteredImportedRecipes, ...transformedMeals];

  // Apply search filter
  const searchFilteredRecipes = searchTerm
    ? allRecipes.filter(recipe => 
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (recipe.category && recipe.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (recipe.area && recipe.area.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : allRecipes;

  // Apply category and area filters
  const categoryFilteredRecipes = selectedCategory
    ? searchFilteredRecipes.filter(recipe => recipe.category === selectedCategory)
    : searchFilteredRecipes;

  const areaFilteredRecipes = selectedArea
    ? categoryFilteredRecipes.filter(recipe => recipe.area === selectedArea)
    : categoryFilteredRecipes;

  // Apply rating filter
  const ratingFilteredRecipes = areaFilteredRecipes.filter(recipe => 
    recipe.average_rating >= minRating
  );

  // Sort recipes
  const sortedRecipes = [...ratingFilteredRecipes].sort((a, b) => {
    switch (selectedSort) {
      case "name":
        return a.title.localeCompare(b.title);
      case "name-desc":
        return b.title.localeCompare(a.title);
      case "rating":
        return (b.average_rating || 0) - (a.average_rating || 0);
      case "rating-desc":
        return (a.average_rating || 0) - (b.average_rating || 0);
      default:
        return 0;
    }
  });

  // Calculate pagination
  const indexOfLastRecipe = currentPage * recipesPerPage;
  const indexOfFirstRecipe = indexOfLastRecipe - recipesPerPage;
  const currentRecipes = sortedRecipes.slice(indexOfFirstRecipe, indexOfLastRecipe);
  const totalPages = Math.ceil(sortedRecipes.length / recipesPerPage);

  // Debug information
  console.log('Pagination debug:', {
    totalRecipes: sortedRecipes.length,
    recipesPerPage,
    totalPages,
    currentPage,
    currentRecipesLength: currentRecipes.length
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedArea, selectedSort, minRating]);

  // Pagination controls
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex justify-center items-center space-x-2 mt-8">
        <button
          onClick={() => setCurrentPage(1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <span className="material-icons text-sm">first_page</span>
        </button>
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <span className="material-icons text-sm">chevron_left</span>
        </button>
        {startPage > 1 && (
          <>
            <button
              onClick={() => setCurrentPage(1)}
              className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              1
            </button>
            {startPage > 2 && <span className="px-2">...</span>}
          </>
        )}
        {pageNumbers.map(number => (
          <button
            key={number}
            onClick={() => setCurrentPage(number)}
            className={`px-3 py-1 rounded-lg border ${
              currentPage === number
                ? 'bg-orange-500 text-white border-orange-500'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            {number}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="px-2">...</span>}
            <button
              onClick={() => setCurrentPage(totalPages)}
              className="px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <span className="material-icons text-sm">chevron_right</span>
        </button>
        <button
          onClick={() => setCurrentPage(totalPages)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          <span className="material-icons text-sm">last_page</span>
        </button>
      </div>
    );
  };

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

      {/* Search and Filters */}
      <div className="mb-12 space-y-6">
        {/* Search Bar with Icon */}
        <div className="max-w-2xl mx-auto relative">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="material-icons text-gray-400">search</span>
            </span>
        <Input
          type="search"
              placeholder={user ? "Search recipes, ingredients..." : "Search recipes..."}
          value={searchTerm}
          onChange={handleSearch}
              onFocus={handleSearchFocus}
              className="w-full pl-10 pr-4 py-3 text-lg rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setShowFilters(false);
                  setShowCategories(true);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="material-icons">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {showFilters && (selectedCategory || selectedArea || minRating > 0) && (
          <div className="max-w-4xl mx-auto flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-500">Active filters:</span>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
              >
                Category: {selectedCategory}
                <span className="material-icons ml-1 text-sm">close</span>
              </button>
            )}
            {selectedArea && (
              <button
                onClick={() => setSelectedArea("")}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
              >
                Cuisine: {selectedArea}
                <span className="material-icons ml-1 text-sm">close</span>
              </button>
            )}
            {minRating > 0 && (
              <button
                onClick={() => setMinRating(0)}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
              >
                Rating: {minRating}+ stars
                <span className="material-icons ml-1 text-sm">close</span>
              </button>
            )}
            <button
              onClick={() => {
                setSelectedCategory("");
                setSelectedArea("");
                setMinRating(0);
                setShowFilters(false);
                setShowCategories(true);
              }}
              className="text-sm text-orange-500 hover:text-orange-600 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
        
        {/* Filters Grid */}
        {showFilters && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-50"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.idCategory} value={cat.strCategory}>
                        {cat.strCategory}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Cuisine</label>
                  <Select
                    value={selectedArea}
                    onChange={(e) => setSelectedArea(e.target.value)}
                    className="w-full bg-gray-50"
                  >
                    <option value="">All Cuisines</option>
                    {areas.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Sort By</label>
                  <Select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="w-full bg-gray-50"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Minimum Rating</label>
                  <Select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full bg-gray-50"
                  >
                    {ratingOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>
          </div>
        )}

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
      {!selectedCategory && !selectedArea && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 font-display text-center">
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-10 gap-x-6 justify-items-center">
            {categories.slice(0, 6).map((cat) => (
              <Link
                key={cat.idCategory}
                to={`/category/${cat.strCategory}`}
                className="group cursor-pointer text-center transition-all duration-300 ease-out hover:scale-105"
              >
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-gray-200 mx-auto transition-all duration-300 ease-out group-hover:shadow-xl group-hover:scale-110 group-hover:border-orange-500">
                  <img
                    src={cat.strCategoryThumb}
                    alt={cat.strCategory}
                    className="w-full h-full object-cover rounded-full transition-transform duration-300 ease-out group-hover:scale-105"
                  />
                </div>
                <p className="mt-3 text-base font-display font-semibold transition-colors duration-300 group-hover:text-orange-500">
                  {cat.strCategory}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Recipes */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold font-display">
            {searchTerm ? "Search Results" : "All Recipes"}
          </h2>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentRecipes.length === 0 ? (
          <p className="text-center text-gray-500">No recipes found.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentRecipes.map((recipe) => (
                <Link 
                  to={user ? (recipe.isExternal ? `/meal/${recipe.id}` : `/recipe/${recipe.id}`) : "/auth"}
                  key={`${recipe.isExternal ? 'ext' : 'loc'}-${recipe.id}`}
                  className="h-full"
                >
                  <Card className="group hover:shadow-lg transition duration-300 h-full flex flex-col">
                    <div className="relative">
                      <img
                        src={recipe.image_url || DEFAULT_RECIPE_IMAGE}
                        alt={recipe.title}
                        className="w-full h-52 object-cover rounded-t"
                        onError={(e) => {
                          e.target.src = DEFAULT_RECIPE_IMAGE;
                        }}
                      />
                      {user && !recipe.isExternal && !recipe.external_id && recipe.user_id === user.id && (
                        <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          My Recipe
                        </div>
                      )}
                      {!recipe.isExternal && !recipe.external_id && recipe.user_id !== user?.id && recipe.author && 
                       !recipe.author.is_system && recipe.author.name !== "Tastebite System" && !recipe.isExternal && (
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
                      {(recipe.average_rating > 0 || recipe.ratings_count > 0) && (
                        <div className="absolute bottom-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
                          <span className="material-icons text-sm mr-1">star</span>
                          {recipe.average_rating.toFixed(1)}
                          {recipe.ratings_count > 0 && (
                            <span className="ml-1">({recipe.ratings_count})</span>
                          )}
                      </div>
                    )}
                    </div>
                    <CardContent className="flex-grow flex flex-col">
                      <h3 className="text-base font-semibold text-gray-800 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {recipe.title}
                      </h3>
                      <div className="mt-2 space-y-1 flex-grow">
                        {recipe.category && (
                          <p className="text-sm text-gray-600 line-clamp-1">Category: {recipe.category}</p>
                        )}
                        {recipe.area && (
                          <p className="text-sm text-gray-600 line-clamp-1">Cuisine: {recipe.area}</p>
                        )}
                      </div>
                      <p className="text-sm text-orange-500 mt-2 flex items-center">
                        {user ? 'View recipe' : 'Sign in to view recipe'}
                        <span className="material-icons ml-1 text-sm">arrow_forward</span>
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </Container>
  );
}

export default HomePage;
