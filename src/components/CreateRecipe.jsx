// pages/CreateRecipe.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Container from './Container';
import { Input } from './ui/Input';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen';
import Toast from '../components/ui/Toast';
import GenerateRecipeModal from './GenerateRecipeModal';
import { API_BASE_URL } from '../utils/api';
import { DEFAULT_IMG } from '../utils/constants';
import Button from '../components/ui/Button';

export default function CreateRecipe() {
  /* ─────── state / hooks ─────── */
  const navigate = useNavigate();
  const { user } = useAuth();

  const [error, setError]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [categories, setCategories]     = useState([]);
  const [areas, setAreas]               = useState([]);
  const [currentStep, setCurrentStep]   = useState(1);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const totalSteps                      = 4;

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    area: '',
    instructions: '',
    image_url: '',
    ingredients: [{ name: '', measure: '' }]
  });

  const [imagePreview, setImagePreview]           = useState('');
  const [validationErrors, setValidationErrors]   = useState({});
  const [showToast, setShowToast]                 = useState(false);
  const [measureValidation, setMeasureValidation] = useState({});
  const [aiPreview, setAiPreview]                 = useState(null);

  /* ─────── constants ─────── */
  const DEFAULT_IMG =
    'data:image/svg+xml;base64,' +
    btoa(`<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="400" fill="#fff7ed"/>
      <text x="50%" y="50%" font-family="Arial" font-size="48" fill="#fb923c"
            text-anchor="middle" dominant-baseline="middle">TasteBite</text>
    </svg>`);

  /* ─────── fetch categories/areas once ─────── */
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [cat, ar] = await Promise.all([
          axios.get('https://tastebite-back.onrender.com/api/external/categories'),
          axios.get('https://tastebite-back.onrender.com/api/external/areas')
        ]);
        setCategories(cat.data.map(c => ({ value: c.strCategory, label: c.strCategory })));
        setAreas(ar.data.map(a => ({ value: a.strArea, label: a.strArea })));
      } catch (e) {
        setError('Failed to load categories & areas');
      }
    };
    fetchInitialData();
  }, []);

  /* ─────── helpers ─────── */
  const validateMeasure = (s) => {
    if (!s) return { isValid: true, message: '' };
    const ok = /^(\d+(\.\d+)?)\s*(g|kg|ml|l|tbsp|tsp|cup|oz|lb|piece|slice|whole)?$/i
      .test(s);
    return {
      isValid: ok,
      message: ok ? '' : 'Use numbers + unit e.g. 100g'
    };
  };
  const handleMeasureChange = (idx, val) => {
    setFormData(p => ({
      ...p,
      ingredients: p.ingredients.map((ing, i) =>
        i === idx ? { ...ing, measure: val } : ing
      )
    }));
    setMeasureValidation(p => ({ ...p, [idx]: validateMeasure(val) }));
  };

  /* ─────── AI generator ─────── */
  const ingredientNames = () =>
    formData.ingredients.map(i => i.name.trim()).filter(Boolean);

  const handleGenerateRecipe = () => {
    setIsGenerateModalOpen(true);
  };

  /* ─────── validation ─────── */
  const validateStep = (step) => {
    const err = {};
    if (step === 1) {
      if (!formData.title.trim()) err.title = 'Enter a title';
      if (!formData.category) err.category = 'Choose category';
      if (!formData.area) err.area = 'Choose cuisine/area';
    }
    if (step === 3) {
      if (formData.ingredients.some(i => !i.name.trim()))
        err.ingredients = 'All ingredients need a name';
      if (Object.values(measureValidation).some(v => !v.isValid))
        err.ingredients = 'Fix measure formats';
    }
    if (step === 4) {
      if (typeof formData.instructions !== 'string' ||
          !formData.instructions.trim())
        err.instructions = 'Add cooking instructions';
      else if (formData.instructions.length < 20)
        err.instructions = 'At least 20 characters';
    }
    setValidationErrors(err);
    return !Object.keys(err).length;
  };

  /* ─────── submit ─────── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;
    try {
      setLoading(true); setError('');
      const { data } = await axios.post(
        'https://tastebite-back.onrender.com/api/recipes',
        { ...formData, image_url: formData.image_url || DEFAULT_IMG },
        { withCredentials: true }
      );
      setShowToast(true);
      setTimeout(() => navigate(`/recipe/${data.id}`), 1200);
    } catch (er) {
      setError(er.response?.data?.error || 'Create failed');
    } finally { setLoading(false); }
  };

  /* ─────── misc ─────── */
  const next = () => validateStep(currentStep) &&
                     currentStep < totalSteps &&
                     setCurrentStep(p => p + 1);
  const prev = () => currentStep > 1 && setCurrentStep(p => p - 1);

  const setImage = (e) => {
    const f = e.target.files[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    setImagePreview(url);
    setFormData(p => ({ ...p, image_url: url }));
  };

  /* ─────── step indicator UI ─────── */
  const Steps = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[...Array(totalSteps)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep > i + 1
                ? 'bg-green-500 text-white'
                : currentStep === i + 1
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>{currentStep > i + 1 ? '✓' : i + 1}</div>
            {i < totalSteps - 1 &&
              <div className={`w-full h-1 mx-2 ${
                currentStep > i + 1 ? 'bg-green-500' : 'bg-gray-200'
              }`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>Basic Info</span><span>Image</span>
        <span>Ingredients</span><span>Instructions</span>
      </div>
    </div>
  );

  if (loading) return <LoadingScreen message="Working..." />;

  return (
    <Container>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold text-center mb-2">Create Recipe</h1>
        {error &&
          <p className="my-4 p-3 bg-red-50 text-red-600 rounded">{error}</p>}

        <Steps/>

        <form onSubmit={handleSubmit}
              className="bg-white p-6 shadow rounded-xl space-y-8">
          {/* STEP 1 — basic info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* title */}
              <div>
                <label className="block mb-1">Title *</label>
                <Input value={formData.title}
                       onChange={e=>setFormData(p=>({...p,title:e.target.value}))}
                       placeholder="Delicious pasta…" required/>
                {validationErrors.title &&
                 <p className="text-sm text-red-500">{validationErrors.title}</p>}
              </div>

              {/* category & area */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-1">Category *</label>
                  <select className={`w-full border rounded p-2 ${
                          validationErrors.category && 'border-red-500'}`}
                          value={formData.category}
                          onChange={e=>setFormData(p=>({...p,category:e.target.value}))}>
                    <option value="">Choose…</option>
                    {categories.map(c=>(
                      <option key={c.id||c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  {validationErrors.category &&
                    <p className="text-sm text-red-500">{validationErrors.category}</p>}
                </div>

                <div>
                  <label className="block mb-1">Cuisine / Area *</label>
                  <select className={`w-full border rounded p-2 ${
                          validationErrors.area && 'border-red-500'}`}
                          value={formData.area}
                          onChange={e=>setFormData(p=>({...p,area:e.target.value}))}>
                    <option value="">Choose…</option>
                    {areas.map(a=>(
                      <option key={a.name} value={a.name}>{a.name}</option>
                    ))}
                  </select>
                  {validationErrors.area &&
                    <p className="text-sm text-red-500">{validationErrors.area}</p>}
                </div>
              </div>

              {/* AI generate button */}
              <button
                type="button"
                onClick={handleGenerateRecipe}
                className="inline-flex items-center px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                <span className="material-icons mr-2">auto_fix_high</span>
                Generate Recipe
              </button>

              {aiPreview &&
                <div className="mt-4 p-4 bg-gray-50 rounded text-sm text-gray-700">
                  <p className="font-semibold mb-1">{aiPreview.title}</p>
                  <p className="line-clamp-2">{aiPreview.instructions}</p>
                </div>}
            </div>
          )}

          {/* STEP 2 — image */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block mb-1">Recipe image (optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6
                                border-2 border-dashed rounded">
                  <div className="space-y-2 text-center">
                    {imagePreview || formData.image_url ? (
                      <div className="relative">
                        <img src={imagePreview||formData.image_url}
                             alt="preview"
                             className="mx-auto h-48 object-cover rounded"/>
                        <button type="button"
                                onClick={()=>{
                                  setImagePreview('');
                                  setFormData(p=>({...p,image_url:''}));
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                          <span className="material-icons text-sm">close</span>
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="h-32 w-32 bg-orange-50 rounded
                                        flex items-center justify-center">
                          <span className="material-icons text-orange-200"
                                style={{fontSize:'64px'}}>restaurant</span>
                        </div>
                        <div className="text-sm text-gray-600 flex">
                          <label className="relative cursor-pointer bg-white
                                             rounded-md font-medium text-orange-600
                                             hover:text-orange-500">
                            <span>Upload a file</span>
                            <input type="file" accept="image/*"
                                   onChange={setImage} className="sr-only"/>
                          </label>
                          <p className="pl-1">or drag & drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG/JPG/GIF up to 10&nbsp;MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* URL input */}
              <div>
                <label className="block mb-1">or enter image URL</label>
                <Input type="url" value={formData.image_url}
                       onChange={e=>setFormData(p=>({...p,image_url:e.target.value}))}
                       placeholder="https://…/image.jpg"/>
              </div>
            </div>
          )}

          {/* STEP 3 — ingredients */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <label className="block mb-1">Ingredients *</label>
              <div className="space-y-4">
                {formData.ingredients.map((ing, idx)=>(
                  <div key={idx} className="flex items-center gap-4">
                    <Input className={`flex-1 ${
                              validationErrors.ingredients && 'border-red-500'}`}
                           placeholder="Ingredient"
                           value={ing.name}
                           onChange={e=>setFormData(p=>({
                             ...p,
                             ingredients:p.ingredients.map((i,iIdx)=>
                               iIdx===idx?{...i,name:e.target.value}:i)
                           }))}/>
                    <Input className="w-44"
                           placeholder="Amount 100g"
                           value={ing.measure}
                           onChange={e=>handleMeasureChange(idx,e.target.value)}/>
                    {idx>0 &&
                      <button type="button"
                              onClick={()=>setFormData(p=>({
                                ...p,
                                ingredients:p.ingredients.filter((_,i)=>i!==idx)
                              }))}
                              className="text-red-500 hover:text-red-700 p-2">
                        <span className="material-icons">delete</span>
                      </button>}
                  </div>
                ))}
              </div>
              {validationErrors.ingredients &&
                <p className="text-sm text-red-500">
                  {validationErrors.ingredients}</p>}

              <button type="button"
                      onClick={()=>setFormData(p=>({
                        ...p,
                        ingredients:[...p.ingredients,{name:'',measure:''}]
                      }))}
                      className="inline-flex items-center text-orange-600 hover:text-orange-700">
                <span className="material-icons mr-1">add_circle</span>
                Add ingredient
              </button>

              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                Valid measure examples: 100g • 2&nbsp;tbsp • 1&nbsp;cup etc.
              </div>
            </div>
          )}

          {/* STEP 4 — instructions */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <label className="block mb-1">Instructions *</label>
              <textarea rows="8"
                        value={formData.instructions}
                        onChange={e=>setFormData(p=>({...p,instructions:e.target.value}))}
                        className={`w-full border rounded p-3 ${
                          validationErrors.instructions && 'border-red-500'}`}
                        placeholder="Step-by-step cooking guide…" required/>
              {validationErrors.instructions &&
                <p className="text-sm text-red-500">
                  {validationErrors.instructions}</p>}
            </div>
          )}

          {/* nav buttons */}
          <div className="flex justify-between pt-4">
            {currentStep>1
              ? <button type="button" onClick={prev}
                        className="inline-flex items-center px-4 py-2 border rounded
                                   text-sm bg-white hover:bg-gray-50">
                  <span className="material-icons mr-1">arrow_back</span>
                  Previous
                </button>
              : <span/>}

            {currentStep<totalSteps
              ? <button type="button" onClick={next}
                        className="inline-flex items-center px-4 py-2 rounded
                                   text-sm text-white bg-orange-600 hover:bg-orange-700">
                  Next <span className="material-icons ml-1">arrow_forward</span>
                </button>
              : <button type="submit"
                        className="inline-flex items-center px-6 py-3 rounded
                                   text-base text-white bg-orange-600 hover:bg-orange-700">
                  <span className="material-icons mr-2">restaurant</span>
                  Create Recipe
                </button>}
          </div>
        </form>
      </div>

      {showToast &&
        <Toast message="Recipe created!" onClose={()=>setShowToast(false)}/>}

      <GenerateRecipeModal 
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />
    </Container>
  );
}
