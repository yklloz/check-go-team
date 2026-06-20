import React, { useEffect, useMemo, useState } from 'react';
import {
  ShoppingCart,
  Plus,
  ChevronRight,
  Users,
} from 'lucide-react';
import {
  fetchWishlistItems,
  fetchWishlistPlaces,
  updateWishlistItemStatus,
} from '../services/wishlistService';

export default function WishlistPage({ PLACES, wishlistRefreshKey }) {
  const [wishlist, setWishlist] = useState([]);
  const [places, setPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadWishlist = async () => {
    try {
      setErrorMessage('');
      const [nextWishlist, nextPlaces] = await Promise.all([
        fetchWishlistItems(),
        fetchWishlistPlaces(),
      ]);

      setWishlist(nextWishlist);
      setPlaces(nextPlaces);
    } catch (error) {
      console.error('위시리스트 불러오기 실패:', error);
      setErrorMessage(`위시리스트를 불러오지 못했습니다. ${error.message || ''}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(loadWishlist);
  }, [wishlistRefreshKey]);

  const displayPlaces = useMemo(() => {
    return places.map(place => {
      const visual = PLACES.find(item => item.id === place.place_type || item.name === place.name);

      return {
        ...place,
        displayName: visual?.name || place.name,
        color: visual?.color || 'bg-blue-500',
        smallIcon: visual?.smallIcon || <ShoppingCart size={18} />,
        isShared: Boolean(visual?.isShared),
      };
    });
  }, [PLACES, places]);

  const handleTogglePurchased = async (item) => {
    try {
      await updateWishlistItemStatus({
        id: item.id,
        status: item.status === 'purchased' ? 'active' : 'purchased',
      });
      await loadWishlist();
    } catch (error) {
      console.error('위시리스트 상태 변경 실패:', error);
      alert(`상태 변경 중 오류가 발생했습니다.\n${error.message || ''}`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
          <ShoppingCart size={36} className="text-blue-600" /> 위시리스트
        </h1>
        <p className="text-gray-400 font-medium ml-1">오른쪽 위 상품 등록 버튼으로 구매 후보를 추가하세요.</p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="p-20 text-center text-gray-400 font-bold">위시리스트를 불러오는 중입니다.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayPlaces.map(place => {
            const placeItems = wishlist.filter(item => item.placeId === place.id);

            return (
              <div key={place.id} className="bg-white dark:bg-[#1E1E1E] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/30 dark:shadow-none flex flex-col overflow-hidden transition-all hover:border-blue-100 dark:hover:border-blue-900 group">
                <div className={`p-6 ${place.color} text-white flex items-center justify-between relative`}>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                      {place.smallIcon}
                    </div>
                    <h3 className="font-black text-lg tracking-tight">{place.displayName}</h3>
                  </div>
                  <span className="w-9 h-9 bg-white text-black dark:bg-[#121212] dark:text-white rounded-full flex items-center justify-center shadow-lg font-black text-xs">
                    {placeItems.length}
                  </span>
                </div>

                <div className="p-4 flex-1 space-y-3 min-h-[250px] bg-gray-50/20 dark:bg-transparent overflow-y-auto max-h-[400px]">
                  {placeItems.length > 0 ? (
                    placeItems.map(item => (
                      <div key={item.id} className="p-4 bg-white dark:bg-[#252525] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between group/item hover:shadow-md transition-all">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleTogglePurchased(item)}
                            className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-colors ${
                              item.checked
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-gray-200 dark:border-gray-700 hover:border-blue-500'
                            }`}
                            aria-label="구매 완료"
                          >
                            {item.checked && <span className="w-2 h-2 bg-white rounded-sm" />}
                          </button>
                          <div>
                            <p className={`font-bold text-sm tracking-tight ${item.checked ? 'line-through text-gray-400' : ''}`}>
                              {item.name}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium tracking-tight">
                              {item.brand || '브랜드 없음'} · {item.desiredQuantity.toLocaleString()}{item.unit} · {item.category}
                            </p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="text-gray-300 group-hover/item:translate-x-1 transition-transform" />
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-700 space-y-2 opacity-50">
                      <Plus size={32} className="mb-1" />
                      <p className="text-xs font-black uppercase tracking-widest">No Items</p>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total {placeItems.length} Items</span>
                  {place.isShared && <Users size={14} className="text-blue-500" />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
