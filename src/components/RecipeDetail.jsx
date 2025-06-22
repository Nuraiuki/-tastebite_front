import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import Container from './Container';
import Toast from '../components/ui/Toast';
import LoadingScreen from '../components/LoadingScreen';
// import { searchNutrition } from '../api/fatsecret';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import RecipeInteractions from './shared/RecipeInteractions';

// Add categories and areas arrays
const CATEGORIES = [
  'Breakfast', 'Starter', 'Side', 'Dessert', 'Miscellaneous',
  'Beef', 'Chicken', 'Lamb', 'Pasta', 'Pork', 'Seafood', 'Vegetarian', 'Vegan'
];

const AREAS = [
  'American', 'British', 'Chinese', 'French', 'Indian', 'Italian', 'Japanese',
  'Mexican', 'Spanish', 'Thai', 'Turkish', 'Unknown'
];

// Update the validateMeasure function to return more detailed information
const validateMeasure = (measure) => {
  if (!measure) return { isValid: true, message: '' };
  const validUnits = ['g', 'kg', 'ml', 'l', 'tbsp', 'tsp', 'cup', 'oz', 'lb', 'piece', 'slice', 'whole'];
  const measureRegex = new RegExp(`^\\d+(\\.\\d+)?\\s*(${validUnits.join('|')})?$`, 'i');
  const isValid = measureRegex.test(measure);
  return {
    isValid,
    message: isValid ? '' : 'Invalid format. Use numbers with units (e.g., 100g, 2 tbsp)'
  };
};

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    category: '',
    area: '',
    instructions: '',
    image_url: '',
    ingredients: [{ name: '', measure: '' }]
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [measureValidation, setMeasureValidation] = useState({});

  const DEFAULT_RECIPE_IMAGE = 'data:image/svg+xml;base64,' + btoa(`
    <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#fff7ed"/>
      <text x="50%" y="50%" font-family="Arial" font-size="48" fill="#fb923c" text-anchor="middle" dominant-baseline="middle">TasteBite</text>
    </svg>
  `);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axios.get(`https://tastebite-back.onrender.com/api/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError('Failed to load recipe details.');
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchRecipe();
    } else {
      // If not logged in, redirect to login
      navigate('/login', { state: { from: `/recipe/${id}` } });
    }
  }, [id, user, navigate]);

  const toggleChecked = name => {
    setCheckedItems(prev =>
      prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
    );
  };

  const resetChecklist = () => {
    setCheckedItems([]);
    localStorage.removeItem(`checked_${id}`);
    setShowToast(true);
  };

  const handleDownloadPDF = async () => {
    if (!recipe) return;
    
    const doc = new jsPDF();
    
    try {
      // Add header
      doc.setFontSize(20);
      doc.setTextColor(235, 110, 75); // Orange-ish color
      doc.text('TasteBite Recipe', 105, 15, { align: 'center' });
      
      // Add recipe title
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(recipe.title, 105, 25, { align: 'center' });
      
      // Add category and cuisine
      if (recipe.category || recipe.area) {
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`${recipe.area || ''} ${recipe.category ? '• ' + recipe.category : ''}`, 105, 32, { align: 'center' });
      }
      
      // Add image if available
      if (recipe.image_url) {
        try {
          const imgData = await toDataURL(recipe.image_url);
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
      recipe.ingredients.forEach((ing, idx) => {
        doc.text(`${ing.measure} ${ing.name}`, 25, 155 + (idx * 8));
      });
      
      // Add instructions on a new page
      doc.addPage();
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Instructions:', 20, 20);
      
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      // Break instructions into paragraphs
      const instructions = recipe.instructions.split('\n').filter(line => line.trim());
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
      doc.save(`${recipe.title.replace(/\s+/g, '-')}-recipe.pdf`);
      setShowToast(true);
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

  const handleEdit = () => {
    setEditForm({
      title: recipe.title,
      category: recipe.category || '',
      area: recipe.area || '',
      instructions: recipe.instructions,
      image_url: recipe.image_url || '',
      ingredients: recipe.ingredients.map(ing => ({
        name: ing.name,
        measure: ing.measure || ''
      }))
    });
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({
      title: '',
      category: '',
      area: '',
      instructions: '',
      image_url: '',
      ingredients: [{ name: '', measure: '' }]
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Check if any measures are invalid
    const hasInvalidMeasures = Object.values(measureValidation).some(v => !v.isValid);
    if (hasInvalidMeasures) {
      return;
    }

    try {
      const recipeData = {
        ...editForm,
        image_url: editForm.image_url || null
      };

      const response = await axios.put(
        `https://tastebite-back.onrender.com/api/recipes/${id}`,
        recipeData,
        { withCredentials: true }
      );
      setRecipe(response.data);
      setIsEditing(false);
      setSuccessMessage('Recipe updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating recipe:', err);
      setError('Failed to update recipe. Please try again.');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Add function to handle measure changes with validation
  const handleMeasureChange = (index, value) => {
    const newIngredients = [...editForm.ingredients];
    newIngredients[index].measure = value;
    setEditForm({ ...editForm, ingredients: newIngredients });
    
    // Update validation state
    const validation = validateMeasure(value);
    setMeasureValidation(prev => ({
      ...prev,
      [index]: validation
    }));
  };

  const handleDelete = async () => {
    try {
      const response = await axios.delete(`https://tastebite-back.onrender.com/api/recipes/${id}`, {
        withCredentials: true
      });
      
      // Show success message
      setSuccessMessage('Recipe deleted successfully!');
      setShowDeleteConfirm(false);
      
      // Redirect after showing success message
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Failed to delete recipe. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  const handleAddToShoppingList = async (recipeId) => {
    try {
      const response = await axios.post(
        `https://tastebite-back.onrender.com/api/shopping-list/add-recipe/${recipeId}`,
        {},
        { withCredentials: true }
      );
      setSuccessMessage(response.data.message || 'Ingredients added to shopping list!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      setError('Failed to add ingredients to shopping list.');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (loading) return <LoadingScreen text="" />;
  if (error || !recipe)
    return (
      <Container>
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error || 'Recipe not found'}</div>
          <button
            onClick={() => navigate(-1)}
            className="text-orange-500 hover:text-orange-600"
          >
            ← Go Back
          </button>
        </div>
      </Container>
    );

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
            {recipe?.title}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {recipe?.area} • {recipe?.category}
          </p>
          {recipe?.author && !recipe.author.is_system && recipe.author.name !== "Tastebite System" && !recipe.isExternal && !recipe.external_id && (
            <p className="text-sm text-blue-500 mt-1">
              <Link to={`/user-profile/${recipe.author.id}`} className="hover:underline flex items-center justify-center">
                <span className="material-icons text-sm mr-1">person</span>
                By {recipe.author.name}
              </Link>
            </p>
          )}
        </div>

        <div className="relative mb-10">
          <img
            src={recipe.image_url || DEFAULT_RECIPE_IMAGE}
            alt={recipe.title}
            className="w-full h-auto rounded-xl shadow-xl object-cover"
            onError={(e) => {
              e.target.src = DEFAULT_RECIPE_IMAGE;
            }}
          />
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button
              onClick={handleAddToShoppingList}
              className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
              title="Добавить в список покупок"
            >
              <span className="material-icons">shopping_cart</span>
            </button>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <button 
              onClick={handleDownloadPDF}
              className="bg-white text-orange-600 hover:bg-orange-50 px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
              title="Download Recipe PDF"
            >
              <span className="material-icons">file_download</span>
            </button>
            {user && recipe && user.id === recipe.author?.id && !recipe.is_external && !recipe.external_id && !isEditing && (
              <>
                <button
                  onClick={handleEdit}
                  className="bg-white/90 hover:bg-white text-gray-800 px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <span className="material-icons text-lg">edit</span>
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-500/90 hover:bg-red-500 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200 flex items-center gap-2"
                >
                  <span className="material-icons text-lg">delete</span>
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area *
                </label>
                <select
                  value={editForm.area}
                  onChange={(e) => setEditForm({ ...editForm, area: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="">Select an area</option>
                  {AREAS.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <div className="space-y-4">
                  <input
                    type="url"
                    value={editForm.image_url}
                    onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter image URL"
                  />
                  <div className="relative h-48 w-full bg-orange-50 rounded-lg overflow-hidden">
                    <img
                      src={editForm.image_url || DEFAULT_RECIPE_IMAGE}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Preview image failed to load');
                        e.target.src = DEFAULT_RECIPE_IMAGE;
                      }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter a valid image URL or leave empty to use the default TasteBite image
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instructions *
              </label>
              <textarea
                value={editForm.instructions}
                onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                rows="6"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients *
              </label>
              <div className="space-y-3">
                {editForm.ingredients.map((ing, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      value={ing.name}
                      onChange={(e) => {
                        const newIngredients = [...editForm.ingredients];
                        newIngredients[index].name = e.target.value;
                        setEditForm({ ...editForm, ingredients: newIngredients });
                      }}
                      placeholder="Ingredient"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      required
                    />
                    <div className="w-1/3 relative">
                      <input
                        type="text"
                        value={ing.measure}
                        onChange={(e) => handleMeasureChange(index, e.target.value)}
                        placeholder="Measure (e.g., 100g, 2 tbsp)"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                          measureValidation[index]?.isValid === false 
                            ? 'border-red-300 bg-red-50' 
                            : measureValidation[index]?.isValid === true 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-gray-300'
                        }`}
                      />
                      {measureValidation[index]?.message && (
                        <div className="absolute -bottom-6 left-0 text-xs text-red-500">
                          {measureValidation[index].message}
                        </div>
                      )}
                    </div>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newIngredients = editForm.ingredients.filter((_, i) => i !== index);
                          setEditForm({ ...editForm, ingredients: newIngredients });
                          // Remove validation state for deleted ingredient
                          const newValidation = { ...measureValidation };
                          delete newValidation[index];
                          setMeasureValidation(newValidation);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <span className="material-icons">remove_circle</span>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setEditForm({
                      ...editForm,
                      ingredients: [...editForm.ingredients, { name: '', measure: '' }]
                    });
                  }}
                  className="text-orange-500 hover:text-orange-700 flex items-center gap-1"
                >
                  <span className="material-icons">add_circle</span>
                  Add Ingredient
                </button>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Valid measure formats:</span>
                    <br />
                    • Numbers with units: 100g, 2 tbsp, 1 cup
                    <br />
                    • Supported units: g, kg, ml, l, tbsp, tsp, cup, oz, lb, piece, slice, whole
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleEditCancel}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <>
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-4">
              <span className="material-icons text-orange-500">restaurant</span>
              Ingredients
            </h2>
            <ul className="space-y-2">
                  {recipe.ingredients.map((item, index) => (
                <li 
                      key={index} 
                      className="flex items-center p-3 bg-white shadow-sm hover:shadow-md rounded transition-all"
                    >
                  <div className="flex-1 flex justify-between">
                        <span className="font-medium text-gray-800">
                      {item.name}
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
              {recipe.instructions.split('\n').map((step, index) => (
                step.trim() && (
                  <p key={index} className="mb-4 text-gray-700 leading-relaxed">{step.trim()}</p>
                )
              ))}
            </div>
          </div>
        </div>

        {/* Recipe Interactions */}
        <div className="mt-8 border-t pt-8">
          <RecipeInteractions recipeId={id} />
        </div>

        <div className="mt-16 text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm text-gray-500 hover:text-blue-500 transition flex items-center justify-center mx-auto"
          >
            <span className="material-icons mr-1">arrow_upward</span>
            Back to top
          </button>
        </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Delete Recipe</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this recipe? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete Recipe
                </button>
              </div>
            </div>
          </div>
        )}

  
      </div>
    </Container>
  );
}
