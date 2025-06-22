import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Container from './Container';
import { useAuth } from '../context/AuthContext';

export default function ShoppingListPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchList = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://tastebite-back.onrender.com/api/shopping-list', { withCredentials: true });
      const sortedItems = response.data.sort((a, b) => a.is_checked - b.is_checked);
      setList(sortedItems);
    } catch (err) {
      setError('Не удалось загрузить список покупок.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchList();
    }
  }, [user]);

  const handleClearList = async () => {
    setShowClearConfirmModal(true);
  };

  const confirmClearList = async () => {
    try {
      await axios.delete('https://tastebite-back.onrender.com/api/shopping-list', { withCredentials: true });
      setList([]);
      setShowClearConfirmModal(false);
    } catch (err) {
      setError('Не удалось очистить список.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    const item = list.find(i => i.id === itemId);
    setItemToDelete(item);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteItem = async () => {
    if (!itemToDelete) return;
    
    try {
      await axios.delete(`https://tastebite-back.onrender.com/api/shopping-list/${itemToDelete.id}`, { withCredentials: true });
      setList(list.filter(item => item.id !== itemToDelete.id));
      setShowDeleteConfirmModal(false);
      setItemToDelete(null);
    } catch (err) {
      setError('Не удалось удалить элемент.');
    }
  };

  const handleToggleChecked = async (itemId) => {
    const item = list.find(i => i.id === itemId);
    if (!item) return;

    try {
      const response = await axios.put(`https://tastebite-back.onrender.com/api/shopping-list/${itemId}/toggle`, {}, { withCredentials: true });
      setList(list.map(i => i.id === itemId ? response.data : i));
    } catch (err) {
      setError('Не удалось обновить элемент.');
    }
  };

  const handleShare = async () => {
    setShareLoading(true);
    try {
      const response = await axios.post('https://tastebite-back.onrender.com/api/shopping-list/share', {}, { withCredentials: true });
      const { token } = response.data;
      const shareableLink = `${window.location.origin}/public-shopping-list/${token}`;
      setShareUrl(shareableLink);
      setShowShareModal(true);
    } catch (err) {
      setError('Не удалось создать ссылку для шеринга.');
    } finally {
      setShareLoading(false);
    }
  };

  const sortedList = [...list].sort((a, b) => a.is_checked - b.is_checked);

  if (!user) {
    return (
      <Container>
        <div className="text-center py-12">
          <p className="text-gray-500">Пожалуйста, войдите, чтобы увидеть ваш список покупок.</p>
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Список покупок</h1>
          <div className="flex items-center gap-2">
            {list.length > 0 && (
              <button
                onClick={handleShare}
                disabled={shareLoading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-icons">share</span>
                {shareLoading ? 'Создание...' : 'Поделиться'}
              </button>
            )}
            {list.length > 0 && (
              <button
                onClick={handleClearList}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Очистить все
              </button>
            )}
          </div>
        </div>

        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}

        {list.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Ваш список покупок пуст.</p>
            <p className="text-gray-400 mt-2 text-sm">Добавьте рецепты, чтобы сформировать список.</p>
          </div>
        ) : (
          <ul className="bg-white p-6 rounded-xl shadow-md space-y-4">
            {sortedList.map((item) => (
              <li 
                key={item.id} 
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 last:border-b-0 transition-all ${item.is_checked ? 'opacity-50' : 'opacity-100'}`}
              >
                <div className="flex items-center flex-grow mb-2 sm:mb-0">
                  <input
                    type="checkbox"
                    checked={item.is_checked}
                    onChange={() => handleToggleChecked(item.id)}
                    className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 mr-4"
                  />
                  <div className={item.is_checked ? 'line-through' : ''}>
                    <span className="font-semibold text-lg">{item.name}</span>
                    <p className="text-sm text-gray-500">
                      {item.measure || 'Количество не указано'}
                    </p>
                  </div>
                </div>
                <div className="w-full sm:w-auto flex items-center justify-between pl-9 sm:pl-0">
                  <div className="text-xs text-gray-600 mr-4">
                    <span className="font-bold">Из рецептов:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.recipe_details.map(detail => (
                        detail.id ? (
                          <Link to={`/recipe/${detail.id}`} key={detail.id + detail.title} className="bg-gray-100 px-2 py-1 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors">
                            {detail.title}
                          </Link>
                        ) : (
                          <span key={detail.title} className="bg-gray-100 px-2 py-1 rounded-full cursor-not-allowed">
                            {detail.title}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Удалить"
                  >
                    <span className="material-icons">delete</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {showShareModal && (
        <ShareModal url={shareUrl} onClose={() => setShowShareModal(false)} />
      )}
      
      {/* Clear List Confirmation Modal */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <span className="material-icons text-red-600 text-xl">warning</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Очистить список покупок
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Вы уверены, что хотите удалить все элементы из списка покупок? Это действие нельзя отменить.
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => setShowClearConfirmModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={confirmClearList}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Очистить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Item Confirmation Modal */}
      {showDeleteConfirmModal && itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <span className="material-icons text-red-600 text-xl">delete</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Удалить элемент
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Вы уверены, что хотите удалить <strong>"{itemToDelete.name}"</strong> из списка покупок?
                </p>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirmModal(false);
                      setItemToDelete(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={confirmDeleteItem}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}

function ShareModal({ url, onClose }) {
  const [copied, setCopied] = useState(false);
  const urlRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
      <div className="relative bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Поделиться списком</h3>
        <p className="text-sm text-gray-600 mb-2">Любой, у кого есть эта ссылка, сможет посмотреть ваш список покупок.</p>
        <div className="flex items-center space-x-2">
          <input
            ref={urlRef}
            type="text"
            readOnly
            value={url}
            className="w-full bg-gray-100 border-gray-300 rounded-md p-2 text-sm"
          />
          <button
            onClick={handleCopy}
            className={`px-3 py-2 rounded-md text-white font-semibold text-sm transition-colors ${copied ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-600'}`}
          >
            {copied ? 'Готово!' : 'Копировать'}
          </button>
        </div>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          <span className="material-icons">close</span>
        </button>
      </div>
    </div>
  );
} 