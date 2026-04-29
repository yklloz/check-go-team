import React from 'react';
import { 
  ShoppingCart, 
  Plus, 
  ChevronRight, 
  Users 
} from 'lucide-react';
// 위시리스트 뷰 (장소별 블록 그룹화)
  export default function WishlistPage({ PLACES, wishlist, setIsSidePanelOpen }) {
    return (
        <div className="space-y-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
              <ShoppingCart size={36} className="text-blue-600" /> 전역 위시리스트
            </h1>
            <p className="text-gray-400 font-medium ml-1">각 장소에서 필요한 모든 물품을 한눈에 관리하고 추가하세요.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {PLACES.map(place => {
              const placeItems = wishlist.filter(item => item.place === place.id);
              return (
                <div key={place.id} className="bg-white dark:bg-[#1E1E1E] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/30 dark:shadow-none flex flex-col overflow-hidden transition-all hover:border-blue-100 dark:hover:border-blue-900 group">
                  {/* 블록 헤더 */}
                  <div className={`p-6 ${place.color} text-white flex items-center justify-between relative`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                        {place.smallIcon}
                      </div>
                      <h3 className="font-black text-lg tracking-tight">{place.name} 첵고</h3>
                    </div>
                    {/* 우측 상단 + 추가 버튼 */}
                    <button 
                      onClick={() => setIsSidePanelOpen(true)}
                      className="w-9 h-9 bg-white text-black dark:bg-[#121212] dark:text-white rounded-full flex items-center justify-center shadow-lg transform active:scale-90 transition-transform hover:scale-110"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  {/* 블록 내용 (아이템 리스트) */}
                  <div className="p-4 flex-1 space-y-3 min-h-[250px] bg-gray-50/20 dark:bg-transparent">
                    {placeItems.length > 0 ? (
                      placeItems.map(item => (
                        <div key={item.id} className="p-4 bg-white dark:bg-[#252525] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between group/item hover:shadow-md transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                              {/* 체크박스 */}
                            </div>
                            <div>
                              <p className="font-bold text-sm tracking-tight">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium tracking-tight">₩{item.price.toLocaleString()} · {item.shop}</p>
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

                  {/* 블록 하단 푸터 (간략 정보) */}
                  <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total {placeItems.length} Items</span>
                    {place.isShared && <Users size={14} className="text-blue-500" />}
                  </div>
                </div>
              );
            })}
            
            {/* 새 장소 추가용 빈 블록 (Optional) */}
            <div className="border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-gray-300 hover:border-blue-200 hover:text-blue-400 transition-all cursor-pointer min-h-[350px] group">
              <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors shadow-inner">
                <Plus size={32} />
              </div>
              <p className="font-black text-sm uppercase tracking-widest">Add New Place</p>
            </div>
          </div>
        </div>
    );
  }