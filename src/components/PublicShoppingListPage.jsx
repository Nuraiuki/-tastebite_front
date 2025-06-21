import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Container from './Container';

export default function PublicShoppingListPage() {
  const { token } = useParams();
  const [list, setList] = useState([]);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [localChecked, setLocalChecked] = useState({});

  useEffect(() => {
    const fetchPublicList = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5001/api/public/shopping-list/${token}`);
        const sortedItems = response.data.items.sort((a, b) => a.is_checked - b.is_checked);
        setList(sortedItems);
        setOwnerName(response.data.owner_name);
        // Инициализируем локальное состояние чекбоксов
        const checkedMap = {};
        sortedItems.forEach(item => {
          checkedMap[item.id] = item.is_checked;
        });
        setLocalChecked(checkedMap);
      } catch (err) {
        setError('Не удалось загрузить список покупок. Возможно, ссылка недействительна.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPublicList();
    }
  }, [token]);

  const handleToggle = (itemId) => {
    setLocalChecked(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
        <Container>
            <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
            </div>
        </Container>
    );
  }

  return (
    <Container>
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Список покупок от <span className="text-orange-500">{ownerName}</span></h1>
        </div>

        {list.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Этот список покупок пуст.</p>
          </div>
        ) : (
          <ul className="bg-white p-6 rounded-xl shadow-md space-y-4">
            {list.map((item) => (
              <li 
                key={item.id} 
                className={`flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 last:border-b-0 transition-all ${localChecked[item.id] ? 'opacity-50' : 'opacity-100'}`}
              >
                <div className="flex items-center flex-grow mb-2 sm:mb-0">
                  <input
                    type="checkbox"
                    checked={!!localChecked[item.id]}
                    onChange={() => handleToggle(item.id)}
                    className="h-5 w-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 mr-4"
                  />
                  <div className={localChecked[item.id] ? 'line-through' : ''}>
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
                        <span key={detail.id + detail.title} className="bg-gray-100 px-2 py-1 rounded-full">
                          {detail.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
} 