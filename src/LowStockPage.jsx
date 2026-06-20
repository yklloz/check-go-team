import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { AlertTriangle, ChevronLeft, Star, Filter } from 'lucide-react';

export default function LowStockPage({ setView }) {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('전체');

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('inventories')
        .select(`
          *,
          product_insights (*)
        `)
        .lte('current_quantity', 1);

      if (error) throw error;
      setLowStockItems(data);
    } catch (error) {
      console.error('재고 부족 데이터를 불러오는데 실패했습니다:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(id)) return prevFavorites.filter((favId) => favId !== id);
      return [...prevFavorites, id];
    });
  };

  const categories = ['전체', ...new Set(lowStockItems.map(item => item.product_insights?.category).filter(Boolean))];

  const filteredItems = lowStockItems.filter(item => {
    if (selectedCategory === '전체') return true;
    return item.product_insights?.category === selectedCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    const isAFav = favorites.includes(a.id);
    const isBFav = favorites.includes(b.id);
    if (isAFav && !isBFav) return -1;
    if (!isAFav && isBFav) return 1;
    return 0;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h1 className="text-xl md:text-3xl font-black flex items-center gap-3 md:gap-4">
          <AlertTriangle size={24} className="text-red-500 md:hidden" />
          <AlertTriangle size={32} className="text-red-500 hidden md:block" />
          재고 부족 확인
        </h1>
      </div>

      {/*  카테고리 선택 필터 (가로 스크롤 가능) */}
      {!loading && lowStockItems.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          <div className="flex items-center gap-2 text-gray-500 mr-2">
            <Filter size={18} />
            <span className="text-sm font-bold whitespace-nowrap">분류:</span>
          </div>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === category 
                  ? 'bg-gray-800 text-white dark:bg-gray-200 dark:text-black' 
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-[#1E1E1E] dark:text-gray-400 dark:border-[#2F2F2F] dark:hover:bg-[#252525]'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* 리스트 출력 */}
      {loading ? (
        <p className="text-center text-gray-500 mt-10 font-medium">데이터를 불러오는 중입니다...</p>
      ) : lowStockItems.length === 0 ? (
        <p className="text-center text-gray-500 mt-10 font-medium">현재 재고가 1개 이하인 물품이 없습니다! 🎉</p>
      ) : sortedItems.length === 0 ? (
        <p className="text-center text-gray-500 mt-10 font-medium">해당 카테고리에는 재고가 부족한 물품이 없습니다.</p>
      ) : (
        <div className="border border-gray-100 dark:border-[#2F2F2F] rounded-3xl bg-white dark:bg-transparent overflow-hidden shadow-xl shadow-gray-100/50 dark:shadow-none">
          {sortedItems.map((item, index) => {
            const isFavorite = favorites.includes(item.id);
            const info = item.product_insights || {};
            const itemName = info.product_name || '이름 없음(DB확인필요)';

            return (
              <div 
                key={item.id} 
                // 👉 핵심: flex-col을 전부 없애고 하나의 가로줄(flex items-center)로 쫙 폈어!
                className={`flex items-center w-full p-4 hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors gap-4 ${
                  index !== sortedItems.length - 1 ? 'border-b border-gray-100 dark:border-[#2F2F2F]' : ''
                }`}
              >
                {/* 1. 별표 버튼 */}
                <button 
                  onClick={() => toggleFavorite(item.id)}
                  className="p-1 focus:outline-none transition-colors shrink-0"
                >
                  <Star 
                    size={22} 
                    className={isFavorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600 hover:text-yellow-400"} 
                  />
                </button>
                
                {/* 2. 상품 이름 (flex-1을 줘서 중간의 빈 공간을 다 밀어내고 혼자 차지함) */}
                <span className="font-bold text-gray-900 dark:text-white text-lg truncate flex-1">
                  {itemName}
                </span>
                
                {/* 3. 카테고리 (일렬 배치) */}
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 w-24 text-center shrink-0">
                  {info.category || '미분류'}
                </span>
                
                {/* 4. 수정일(updated_at) (일렬 배치) */}
                <span className="text-sm text-gray-400 dark:text-gray-500 font-medium w-28 text-center shrink-0">
                  {new Date(item.updated_at || item.created_at).toLocaleDateString()}
                </span>

                {/* 5. 수량 뱃지 */}
                <div className="shrink-0">
                  <div className="px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-lg font-black text-sm flex items-center gap-1 border border-red-100 dark:border-red-900/50">
                    수량 <span className="text-base ml-0.5">{item.current_quantity}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
