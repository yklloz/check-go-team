import React from 'react';
import { 
  Plus, 
  Users, 
  ShoppingCart 
} from 'lucide-react';
// 장소 선택 화면 (넷플릭스 멀티프로필st)
  export default function PlaceSelectPage({ PLACES, setSelectedPlace, setView }) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center transition-colors bg-white text-gray-900 dark:bg-[#121212] dark:text-white px-6 py-12">
        <h2 className="text-xl md:text-3xl font-bold mb-8 md:mb-14 tracking-tight text-center">관리를 시작할 장소를 선택하세요</h2>
        <div className="grid grid-cols-3 md:flex md:flex-wrap gap-3 md:gap-10 justify-center w-full max-w-xs md:max-w-none">
          {PLACES.map((place) => (
            <div
              key={place.id}
              onClick={() => { setSelectedPlace(place); setView('dashboard'); }}
              className="group cursor-pointer text-center relative"
            >
              <div className={`w-full aspect-square md:w-40 md:h-40 rounded-2xl ${place.color} flex items-center justify-center text-white mb-3 md:mb-5 group-hover:ring-8 group-hover:ring-gray-100 dark:group-hover:ring-gray-800 transition-all transform group-hover:scale-105 shadow-2xl`}>
                {place.icon}
                {place.isShared && (
                  <div className="absolute -top-3 -right-3 bg-white dark:bg-[#1E1E1E] p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-blue-500">
                    <Users size={18} />
                  </div>
                )}
              </div>
              <p className="text-xs md:text-xl font-bold text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                {place.name}
              </p>
              {place.isShared && <p className="text-xs text-blue-500 mt-1 font-bold tracking-widest uppercase">Shared</p>}
            </div>
          ))}
          <div className="group cursor-pointer text-center">
            <div className="w-full aspect-square md:w-40 md:h-40 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 mb-3 md:mb-5 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-all shadow-inner">
              <Plus size={40} className="md:hidden" />
              <Plus size={54} className="hidden md:block" />
            </div>
            <p className="text-xs md:text-xl font-bold text-gray-300">추가하기</p>
          </div>
        </div>

        <button
          onClick={() => setView('wishlist')}
          className="mt-12 md:mt-24 flex items-center gap-3 px-6 md:px-8 py-3 md:py-4 border-2 border-gray-100 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm font-bold text-gray-600 dark:text-gray-300 group text-sm md:text-base"
        >
          <ShoppingCart size={18} className="group-hover:scale-110 transition-transform md:hidden" />
          <ShoppingCart size={22} className="group-hover:scale-110 transition-transform hidden md:block" />
          <span>전체 위시리스트 바로가기</span>
        </button>
      </div>
    );
  }