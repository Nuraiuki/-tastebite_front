import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../ui/StarRating';

export default function RecipeInteractions({ recipeId }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5001/api';

  useEffect(() => {
    if (recipeId) {
      setLoading(true);
      Promise.all([
        fetchComments(),
        fetchRating(),
        fetchFavoriteStatus()
      ]).finally(() => {
        setLoading(false);
      });
    }
  }, [recipeId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/recipes/${recipeId}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments');
    }
  };

  const fetchRating = async () => {
    try {
      const response = await axios.get(`${API_URL}/recipes/${recipeId}/rating`, { withCredentials: true });
      if (response.data && response.data.user_rating) {
        setRating(response.data.user_rating);
      }
    } catch (err) {
      console.error('Error fetching rating:', err);
      setError('Failed to load rating');
    }
  };

  const fetchFavoriteStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/recipes/${recipeId}/favorite`, { withCredentials: true });
      setIsFavorite(response.data.is_favorite);
    } catch (err) {
      console.error('Error fetching favorite status:', err);
      setError('Failed to load favorite status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await axios.post(
        `${API_URL}/recipes/${recipeId}/comments`,
        { content: comment },
        { withCredentials: true }
      );
      setComments(prev => [response.data, ...prev]);
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Failed to add comment. Please try again.');
    }
  };

  const handleRating = async (value) => {
    try {
      await axios.post(
        `${API_URL}/recipes/${recipeId}/rate`,
        { rating: value },
        { withCredentials: true }
      );
      setRating(value);
    } catch (error) {
      console.error('Error rating recipe:', error);
      setError('Failed to rate recipe. Please try again.');
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await axios.post(
        `${API_URL}/recipes/${recipeId}/favorite`,
        {},
        { withCredentials: true }
      );
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError('Failed to update favorite status. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleFavorite}
          className={`flex items-center gap-2 px-4 py-2 rounded-full ${
            isFavorite 
              ? 'bg-orange-500 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span className="material-icons">
            {isFavorite ? 'favorite' : 'favorite_border'}
          </span>
          {isFavorite ? 'Favorited' : 'Add to Favorites'}
        </button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-2">Rate this recipe</h3>
        <StarRating rating={rating} onRate={handleRating} />
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Comments</h3>
        <form onSubmit={handleAddComment} className="mb-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            rows="3"
          />
          <button
            type="submit"
            disabled={!comment.trim()}
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Comment
          </button>
        </form>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="material-icons text-orange-500 text-sm">person</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{comment.user.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 