import React, { useState, useRef, useEffect } from 'react';
import {
  Plus, Users, ShoppingCart, X,
  Home, School, Briefcase, Building2, TreePine, Car, Heart, Star, Coffee,
} from 'lucide-react';

const ICON_OPTIONS = [
  { key: 'Home',      el: <Home size={28} /> },
  { key: 'School',    el: <School size={28} /> },
  { key: 'Briefcase', el: <Briefcase size={28} /> },
  { key: 'Building2', el: <Building2 size={28} /> },
  { key: 'TreePine',  el: <TreePine size={28} /> },
  { key: 'Car',       el: <Car size={28} /> },
  { key: 'Heart',     el: <Heart size={28} /> },
  { key: 'Star',      el: <Star size={28} /> },
  { key: 'Coffee',    el: <Coffee size={28} /> },
];

const COLOR_OPTIONS = [
  'bg-blue-500', 'bg-green-500', 'bg-violet-500', 'bg-red-500',
  'bg-orange-500', 'bg-pink-500', 'bg-yellow-500', 'bg-teal-500',
];

export default function PlaceSelectPage({ PLACES, setSelectedPlace, setView, addPlace, deletePlace }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Home');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [contextMenu, setContextMenu] = useState(null); // { id, x, y }
  const [longPressId, setLongPressId] = useState(null);
  const longPressTimer = useRef(null);

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const handleContextMenu = (e, place) => {
    if (place.id === 1) return;
    e.preventDefault();
    setContextMenu({ id: place.id, x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e, place) => {
    if (place.id === 1) return;
    longPressTimer.current = setTimeout(() => {
      setLongPressId(place.id);
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleAdd = () => {
    if (!name.trim()) return;
    addPlace({ name: name.trim(), iconKey: selectedIcon, color: selectedColor });
    setName('');
    setSelectedIcon('Home');
    setSelectedColor('bg-blue-500');
    setShowModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center transition-colors bg-white text-gray-900 dark:bg-[#121212] dark:text-white px-6 py-12">
      <h2 className="text-xl md:text-3xl font-bold mb-8 md:mb-14 tracking-tight text-center">관리를 시작할 장소를 선택하세요</h2>
      <div className="grid grid-cols-3 md:flex md:flex-wrap gap-3 md:gap-10 justify-center w-full max-w-xs md:max-w-none">
        {PLACES.map((place) => (
          <div
            key={place.id}
            onClick={() => { if (longPressId === place.id) return; setSelectedPlace(place); setView('dashboard'); }}
            onContextMenu={e => handleContextMenu(e, place)}
            onTouchStart={e => handleTouchStart(e, place)}
            onTouchEnd={handleTouchEnd}
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
            {longPressId === place.id && (
              <button
                onClick={e => { e.stopPropagation(); deletePlace(place.id); setLongPressId(null); }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md z-10"
              >
                <X size={12} />
              </button>
            )}
            <p className="text-xs md:text-xl font-bold text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
              {place.name}
            </p>
            {place.isShared && <p className="text-xs text-blue-500 mt-1 font-bold tracking-widest uppercase">Shared</p>}
          </div>
        ))}
        <div className="group cursor-pointer text-center" onClick={() => setShowModal(true)}>
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

      {/* 우클릭 컨텍스트 메뉴 */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-white dark:bg-[#1E1E1E] rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-1 min-w-[120px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => { deletePlace(contextMenu.id); setContextMenu(null); }}
            className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
          >
            <X size={14} /> 삭제
          </button>
        </div>
      )}

      {/* 모바일 롱프레스 배경 딤 */}
      {longPressId && (
        <div className="fixed inset-0 z-40" onClick={() => setLongPressId(null)} />
      )}

      {/* 장소 추가 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">장소 추가</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={22} />
              </button>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">장소 이름</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="예: 할머니 댁"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-5">
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">아이콘</label>
              <div className="grid grid-cols-5 gap-2">
                {ICON_OPTIONS.map(({ key, el }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedIcon(key)}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                      selectedIcon === key
                        ? 'bg-blue-500 text-white shadow-md scale-105'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {el}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">색상</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-9 h-9 rounded-full ${color} transition-all ${
                      selectedColor === color ? 'ring-4 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={!name.trim()}
                className="flex-1 py-2.5 rounded-xl bg-blue-500 text-white text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
