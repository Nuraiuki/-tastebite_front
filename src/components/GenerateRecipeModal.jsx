import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function GenerateRecipeModal({ isOpen, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Сначала получаем сгенерированный рецепт
      const generateResponse = await axios.post('https://tastebite-back.onrender.com/api/ai/generate-recipe', {
        ingredients: prompt.trim().split(',').map(item => item.trim())
      }, {
        withCredentials: true
      });

      if (generateResponse.data) {
        // Затем создаем рецепт в базе данных
        const createResponse = await axios.post('https://tastebite-back.onrender.com/api/recipes', {
          title: generateResponse.data.title,
          category: generateResponse.data.category,
          area: generateResponse.data.area,
          instructions: generateResponse.data.instructions,
          ingredients: generateResponse.data.ingredients,
          image_url: 'https://www.themealdb.com/images/media/meals/default.jpg'
        }, {
          withCredentials: true
        });

        if (createResponse.data) {
          onClose(); // Закрываем модальное окно
          navigate(`/recipe/${createResponse.data.id}`);
        }
      }
    } catch (err) {
      console.error('Error generating recipe:', err);
      setError(err.response?.data?.error || 'Failed to generate recipe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <span className="material-icons">close</span>
          </button>

          {/* Content */}
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 sm:mx-0 sm:h-10 sm:w-10">
              <span className="material-icons text-orange-500">auto_fix_high</span>
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Generate Recipe with AI
              </h3>
              <div className="mt-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="prompt" className="block text-sm font-medium text-gray-700">
                      Enter ingredients (comma-separated)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="prompt"
                        name="prompt"
                        rows={4}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-400 focus:ring-orange-400 sm:text-sm"
                        placeholder="Example: chicken, rice, vegetables, olive oil..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Enter the ingredients you have, and AI will create a recipe for you.
                    </p>
                  </div>

                  {error && (
                    <div className="text-sm text-red-600">
                      {error}
                    </div>
                  )}

                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      disabled={isLoading || !prompt.trim()}
                      className="inline-flex w-full justify-center rounded-md bg-orange-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto"
                    >
                      {isLoading ? (
                        <>
                          <span className="material-icons animate-spin mr-2">refresh</span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <span className="material-icons mr-2">auto_fix_high</span>
                          Generate Recipe
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 