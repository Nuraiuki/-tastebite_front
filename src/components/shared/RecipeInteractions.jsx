import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../ui/StarRating';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaShare, FaBookmark, FaRegBookmark } from 'react-icons/fa';

export default function RecipeInteractions({ recipeId }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_URL = 'https://tastebite-back.onrender.com/api';

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

  const getAvatarUrl = (avatarUrl) => {
    if (!avatarUrl) {
      return `https://i.pravatar.cc/40?u=${Math.random()}`;
    }
    return avatarUrl.startsWith('http')
      ? avatarUrl
      : `https://tastebite-back.onrender.com${avatarUrl}`;
  };

  const handleShare = async () => {
    // Implementation of handleShare function
  };

  const renderAvatar = (avatarUrl) => {
    if (!avatarUrl) {
      return (
        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
          <span className="text-lg font-bold text-white">?</span>
        </div>
      );
    }

    const fullAvatarUrl = avatarUrl.startsWith('http') 
      ? avatarUrl 
      : `https://tastebite-back.onrender.com${avatarUrl}`;

    return (
      <img
        src={fullAvatarUrl}
        alt="Profile avatar"
        className="w-full h-full object-cover"
        onError={(e) => {
          console.error('Error loading avatar:', e);
          e.target.onerror = null;
          e.target.src = null;
          e.target.parentElement.innerHTML = `
            <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
              <span class="text-lg font-bold text-white">?</span>
            </div>
          `;
        }}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      <div className="bg-white rounded-lg p-6 shadow">
        <h3 className="text-xl font-semibold mb-4">Comments</h3>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <Link to={`/user-profile/${comment.user.id}`} className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100">
                      {renderAvatar(comment.user.avatar)}
                    </div>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Link to={`/user-profile/${comment.user.id}`} className="font-medium text-gray-900 hover:text-orange-500">
                        {comment.user.name}
                      </Link>
                      <span className="text-sm text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {user && (
          <div className="mt-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            rows="3"
          />
          <button
              onClick={handleAddComment}
            disabled={!comment.trim()}
            className="mt-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post Comment
          </button>
                </div>
        )}
      </div>
    </div>
  );
} 