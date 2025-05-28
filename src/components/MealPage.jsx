import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import Container from './Container';
import { useAuth } from '../context/AuthContext';
import RecipeInteractions from './shared/RecipeInteractions';
import LoadingScreen from './LoadingScreen';

const API_URL = 'http://localhost:5001/api';

export default function MealPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [localRecipeId, setLocalRecipeId] = useState(null);
  const [importAttempted, setImportAttempted] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rating, setRating] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    // Reset import attempted state when user or id changes
    setImportAttempted(false);
    setLocalRecipeId(null);
    setImportStatus('');
  }, [user, id]);

  useEffect(() => {
    const fetchMeal = async () => {
      setLoading(true);
      try {
        // First get the meal data from MealDB
        const response = await axios.get(
          `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
        );
        
        if (response.data.meals) {
          setMeal(response.data.meals[0]);
          
          // If user is logged in and we haven't attempted import yet
          if (user && !importAttempted) {
            try {
              setImportStatus('Preparing recipe for interactions...');
              setImportAttempted(true);
              
              // First check if this recipe already exists in our database
              const checkResponse = await axios.get(
                `http://localhost:5001/api/recipes?external_id=${id}`,
                { withCredentials: true }
              );
              
              // If recipe already exists, use it
              if (checkResponse.data && checkResponse.data.length > 0) {
                const existingRecipe = checkResponse.data[0];
                console.log("Using existing recipe:", existingRecipe);
                setLocalRecipeId(existingRecipe.id);
                setImportStatus('');
              } else {
                // Otherwise, import the recipe
                try {
                  const importResponse = await axios.post(
                    `http://localhost:5001/api/import-external-recipe`,
                    {
                      externalId: id,
                      title: response.data.meals[0].strMeal,
                      category: response.data.meals[0].strCategory,
                      area: response.data.meals[0].strArea,
                      instructions: response.data.meals[0].strInstructions,
                      imageUrl: response.data.meals[0].strMealThumb,
                      ingredients: Array.from({ length: 20 }, (_, i) => i + 1)
                        .filter(i => response.data.meals[0][`strIngredient${i}`])
                        .map(i => ({
                          name: response.data.meals[0][`strIngredient${i}`],
                          measure: response.data.meals[0][`strMeasure${i}`] || ''
                        }))
                    },
                    { withCredentials: true }
                  );
                  
                  console.log("Imported new recipe:", importResponse.data);
                  setLocalRecipeId(importResponse.data.id);
                  setImportStatus('');
                } catch (err) {
                  console.error("Error importing recipe:", err);
                  setError("Failed to import recipe. Please try again.");
                  setImportStatus('');
                }
              }
            } catch (err) {
              console.error("Error preparing recipe:", err);
              setError("Failed to prepare recipe. Interaction features may not work.");
              setImportStatus('');
            }
          }
        } else {
          setError('Meal not found');
        }
      } catch (err) {
        console.error("Error fetching meal:", err);
        setError('Failed to load meal details');
      } finally {
        setLoading(false);
      }
    };

    fetchMeal();
  }, [id, user, importAttempted]);

  const handleDownloadPDF = async () => {
    if (!meal) return;
    
    const doc = new jsPDF();
    
    try {
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(235, 110, 75); // Orange-ish color
      doc.text('TasteBite Recipe', 105, 15, { align: 'center' });
      
      // Add recipe title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(meal.strMeal, 105, 25, { align: 'center' });
      
      // Add category and cuisine
      if (meal.strCategory || meal.strArea) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${meal.strArea || ''} ${meal.strCategory ? '• ' + meal.strCategory : ''}`, 105, 32, { align: 'center' });
      }
      
      // Add image if available
      if (meal.strMealThumb) {
        try {
          const imgData = await toDataURL(meal.strMealThumb);
          doc.addImage(imgData, 'JPEG', 20, 40, 170, 90);
        } catch (error) {
          console.error('Error loading image:', error);
        }
      }
      
      // Add ingredients section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Ingredients:', 20, 145);
      
      doc.setFontSize(12);
      doc.setTextColor(60, 60, 60);
      
      // Get ingredients and measures
      const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
        .map(i => ({
          name: meal[`strIngredient${i}`],
          measure: meal[`strMeasure${i}`]
        }))
        .filter(({ name, measure }) => name && name.trim());

      ingredients.forEach((ing, idx) => {
        doc.text(`${ing.measure || ''} ${ing.name}`, 25, 155 + (idx * 8));
      });
      
      // Add instructions on a new page
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Instructions:', 20, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      // Break instructions into paragraphs
      const instructions = meal.strInstructions.split('\n').filter(line => line.trim());
      let yPos = 30;
      instructions.forEach((paragraph, i) => {
        // Handle text wrapping using splitTextToSize
        const textLines = doc.splitTextToSize(paragraph, 170);
        textLines.forEach(line => {
          doc.text(line, 20, yPos);
          yPos += 7;
        });
        yPos += 5; // Add extra space between paragraphs
      });
      
      // Save PDF with recipe name
      doc.save(`${meal.strMeal.replace(/\s+/g, '-')}-recipe.pdf`);
      setSuccessMessage('Recipe PDF downloaded successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF');
    }
  };

  const toDataURL = url =>
    fetch(url)
      .then(res => res.blob())
      .then(
        blob =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

  const handleImport = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/import-external-recipe`,
        {
          externalId: meal.id,
          title: meal.strMeal,
          category: meal.strCategory,
          area: meal.strArea,
          instructions: meal.strInstructions,
          imageUrl: meal.strMealThumb,
          ingredients: Array.from({ length: 20 }, (_, i) => i + 1)
            .filter(i => meal[`strIngredient${i}`])
            .map(i => ({
              name: meal[`strIngredient${i}`],
              measure: meal[`strMeasure${i}`] || ''
            }))
        },
        { withCredentials: true }
      );
      navigate(`/recipe/${response.data.id}`);
    } catch (err) {
      console.error('Error importing recipe:', err);
      setError('Failed to import recipe');
    }
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

  if (error && !meal) {
    return (
      <Container>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error || 'Meal not found'}</div>
          <button
            onClick={() => navigate(-1)}
            className="text-orange-500 hover:text-orange-600"
          >
            ← Go Back
          </button>
        </div>
      </Container>
    );
  }

  if (!meal) {
    return (
      <Container>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">Meal not found</div>
          <button
            onClick={() => navigate(-1)}
            className="text-orange-500 hover:text-orange-600"
          >
            ← Go Back
          </button>
        </div>
      </Container>
    );
  }

  // Get ingredients and measures
  const ingredients = Array.from({ length: 20 }, (_, i) => i + 1)
    .map(i => ({
      ingredient: meal[`strIngredient${i}`],
      measure: meal[`strMeasure${i}`]
    }))
    .filter(({ ingredient, measure }) => ingredient && ingredient.trim());

  return (
    <Container>
      <div className="max-w-4xl mx-auto px-4 py-10 text-gray-900 animate-fade-in">
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}
        
        <div className="text-center mb-4">
          <h1 className="text-4xl font-extrabold tracking-tight">
            {meal.strMeal}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {meal.strArea} • {meal.strCategory}
          </p>
        </div>

        <div className="relative mb-10">
          <img
            src={meal.strMealThumb || DEFAULT_RECIPE_IMAGE}
            alt={meal.strMeal}
            className="w-full h-auto rounded-xl shadow-xl object-cover"
            onError={(e) => {
              console.log('Image failed to load, using default image');
              e.target.src = DEFAULT_RECIPE_IMAGE;
            }}
          />
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={handleDownloadPDF}
              className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
              title="Download Recipe PDF"
            >
              <span className="material-icons">file_download</span>
            </button>
        
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <span className="material-icons text-orange-500">restaurant</span>
              Ingredients
            </h2>
            <ul className="space-y-2">
              {ingredients.map((item, index) => (
                <li 
                  key={index} 
                  className="flex items-center p-3 bg-white shadow-sm hover:shadow-md rounded transition-all"
                >
                  <div className="flex-1 flex justify-between">
                    <span className="font-medium text-gray-800">
                      {item.ingredient}
                    </span>
                    <span className="text-right text-gray-600">
                      {item.measure}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <span className="material-icons text-orange-500">menu_book</span>
              Instructions
            </h2>
            <div className="prose max-w-none">
              {meal.strInstructions.split('\n').map((step, index) => (
                step.trim() && (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">{step.trim()}</p>
                )
              ))}
            </div>
          </div>
        </div>


        {/* Recipe Interactions */}
        {user && localRecipeId && (
          <div className="mt-8 border-t pt-8">
            <RecipeInteractions recipeId={localRecipeId} />
          </div>
        )}

        <div className="mt-16 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-sm text-gray-500 hover:text-blue-500 transition flex items-center justify-center mx-auto"
          >
            <span className="material-icons mr-1">arrow_upward</span>
            Back to top
          </button>
        </div>
      </div>
    </Container>
  );
}
