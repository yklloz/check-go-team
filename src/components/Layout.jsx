// 왼쪽 사이드 바 + 상단 헤더 틀
import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Apple,
  Package,
  Sparkles,
  ShoppingCart,
  User,
  Search,
  Plus,
  Calendar,
  LogOut,
  Moon,
  Sun,
  AlertTriangle,
  Menu,
  X,
  ChevronDown,
  Check
} from 'lucide-react';

import RegistrationPanel from './RegistrationPanel';
import { supabase } from '../supabaseClient';

const NavItem = ({ icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm transition-all ${
        active
          ? 'bg-gray-200/50 dark:bg-gray-800 font-bold text-black dark:text-white shadow-sm'
          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium'
      }`}
    >
      {icon}
      {label}
    </button>
  );

// 모바일 하단 탭 바 아이템
const BottomTabItem = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 transition-all ${
      active
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-gray-400 dark:text-gray-500'
    }`}
  >
    {icon}
    <span className="text-[10px] font-semibold">{label}</span>
  </button>
);

export default function Layout({
  children,
  view,
  setView,
  selectedPlace,
  setSelectedPlace,
  places = [],
  isDarkMode,
  setIsDarkMode,
  isSidePanelOpen,
  setIsSidePanelOpen,
  searchQuery,
  setSearchQuery,
  navigateTo,
  currentCategory,
  onInventoryCreated,
  onWishlistCreated,
  onLogout
}) {

  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("사용자");
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPlaceDropdownOpen, setIsPlaceDropdownOpen] = useState(false);

  const handlePlaceSelect = (place) => {
    setSelectedPlace(place);
    setIsPlaceDropdownOpen(false);
    setIsMobileMenuOpen(false);
    setView('dashboard');
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const savedName = user.user_metadata?.name || user.user_metadata?.full_name;
        const savedAvatar = user.user_metadata?.avatar_url;

        if (savedAvatar) setAvatarUrl(savedAvatar);
        if (savedName) setUserName(savedName);
        else setUserName(user.email.split('@')[0]);
      }
    };
    fetchUser();
  }, []);

  const handleNavClick = (viewName, category) => {
    if (category) navigateTo(viewName, category);
    else setView(viewName);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen transition-colors duration-200 bg-white text-gray-900 dark:bg-[#121212] dark:text-[#E3E3E3]">

      {/* --- 왼쪽 메인 사이드바 (PC 전용) --- */}
      <aside className="hidden md:flex w-64 border-r border-gray-200 dark:border-[#2F2F2F] flex-col bg-[#FBFBFB] dark:bg-[#181818] transition-colors duration-200">

        {/* 상단: 선택된 장소 드롭다운 */}
        <div className="relative p-6 border-b border-gray-100 dark:border-[#2F2F2F]">
          <button
            onClick={() => setIsPlaceDropdownOpen(prev => !prev)}
            className="flex items-center gap-2 w-full group"
          >
            <div className={`w-3 h-3 rounded-full flex-shrink-0 ${selectedPlace?.color || 'bg-blue-500'}`}></div>
            <h1 className="text-xl font-black text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors flex-1 text-left">
              {selectedPlace ? selectedPlace.name : '나의 공간'}
            </h1>
            <ChevronDown size={16} className={`text-gray-400 group-hover:text-blue-500 transition-all flex-shrink-0 ${isPlaceDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isPlaceDropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setIsPlaceDropdownOpen(false)} />
              <div className="absolute left-4 right-4 top-full mt-1 z-20 bg-white dark:bg-[#252525] border border-gray-100 dark:border-[#333] rounded-2xl shadow-xl overflow-hidden">
                {places.map(place => (
                  <button
                    key={place.id}
                    onClick={() => handlePlaceSelect(place)}
                    className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-[#2F2F2F] transition-colors"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${place.color}`}></div>
                    <span className="font-bold text-gray-800 dark:text-white flex-1 text-left">{place.name}</span>
                    {selectedPlace?.id === place.id && <Check size={14} className="text-blue-500 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 중간: 네비게이션 메뉴들 */}
        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar p-4 pr-3">
          <NavItem active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={18}/>} label="홈" />
          <NavItem active={view === 'wishlist'} onClick={() => setView('wishlist')} icon={<ShoppingCart size={18}/>} label="위시리스트" />
          <NavItem active={view === 'low-stock'} onClick={() => setView('low-stock')} icon={<AlertTriangle size={18}/>} label="재고 부족 확인" />
          <div className="pt-6 pb-2 px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Inventory</div>
          <NavItem active={view === 'list' && currentCategory === '식료품'} onClick={() => navigateTo('list', '식료품')} icon={<Apple size={18}/>} label="식료품" />
          <NavItem active={view === 'list' && currentCategory === '생필품'} onClick={() => navigateTo('list', '생필품')} icon={<Package size={18}/>} label="생필품" />
          <NavItem active={view === 'list' && currentCategory === '화장품'} onClick={() => navigateTo('list', '화장품')} icon={<Sparkles size={18}/>} label="화장품" />

          <div className="pt-6 pb-2 px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Account</div>
          <NavItem active={view === 'calendar'} onClick={() => setView('calendar')} icon={<Calendar size={18}/>} label="가계부/캘린더" />

          <div className="pt-2 space-y-1">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center gap-3 w-full p-3 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
              {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
              <span className="font-semibold">{isDarkMode ? '라이트 모드' : '다크 모드'}</span>
            </button>
            <button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
              <LogOut size={18}/>
              <span className="font-semibold">로그아웃</span>
            </button>
          </div>
        </nav>

        {/* 프로필 - 하단 고정 */}
        <button
          onClick={() => setView('profile')}
          className={`p-4 mx-4 mb-3 bg-white dark:bg-[#252525] border rounded-2xl shadow-sm flex-shrink-0 text-left transition-all hover:shadow-md ${view === 'profile' ? 'border-blue-300 dark:border-blue-700' : 'border-gray-100 dark:border-[#333]'}`}
        >
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img src={avatarUrl} alt="profile" className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-lg">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col overflow-hidden">
              <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                {userName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userEmail}
              </span>
            </div>
          </div>
        </button>
      </aside>

      {/* --- 모바일 드로어 메뉴 오버레이 --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* 배경 딤 */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* 드로어 패널 */}
          <div className="relative w-72 h-full bg-[#FBFBFB] dark:bg-[#181818] flex flex-col shadow-2xl">
            {/* 헤더 */}
            <div className="p-5 border-b border-gray-100 dark:border-[#2F2F2F]">
              <div className="flex items-center justify-between mb-0">
                <button
                  onClick={() => setIsPlaceDropdownOpen(prev => !prev)}
                  className="flex items-center gap-2 flex-1 group"
                >
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${selectedPlace?.color || 'bg-blue-500'}`}></div>
                  <h1 className="text-xl font-black text-gray-800 dark:text-white group-hover:text-blue-500 transition-colors flex-1 text-left">
                    {selectedPlace ? selectedPlace.name : '나의 공간'}
                  </h1>
                  <ChevronDown size={16} className={`text-gray-400 group-hover:text-blue-500 transition-all ${isPlaceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 text-gray-400 ml-2 flex-shrink-0">
                  <X size={22} />
                </button>
              </div>

              {isPlaceDropdownOpen && (
                <div className="mt-3 bg-gray-50 dark:bg-[#222] border border-gray-100 dark:border-[#333] rounded-2xl overflow-hidden">
                  {places.map(place => (
                    <button
                      key={place.id}
                      onClick={() => handlePlaceSelect(place)}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-[#2F2F2F] transition-colors"
                    >
                      <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${place.color}`}></div>
                      <span className="font-bold text-gray-800 dark:text-white flex-1 text-left">{place.name}</span>
                      {selectedPlace?.id === place.id && <Check size={14} className="text-blue-500 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 네비게이션 */}
            <nav className="flex-1 space-y-1 overflow-y-auto p-4">
              <NavItem active={view === 'dashboard'} onClick={() => handleNavClick('dashboard')} icon={<LayoutDashboard size={18}/>} label="홈" />
              <NavItem active={view === 'wishlist'} onClick={() => handleNavClick('wishlist')} icon={<ShoppingCart size={18}/>} label="위시리스트" />
              <NavItem active={view === 'low-stock'} onClick={() => handleNavClick('low-stock')} icon={<AlertTriangle size={18}/>} label="재고 부족 확인" />
              <div className="pt-6 pb-2 px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Inventory</div>
              <NavItem active={view === 'list' && currentCategory === '식료품'} onClick={() => handleNavClick('list', '식료품')} icon={<Apple size={18}/>} label="식료품" />
              <NavItem active={view === 'list' && currentCategory === '생필품'} onClick={() => handleNavClick('list', '생필품')} icon={<Package size={18}/>} label="생필품" />
              <NavItem active={view === 'list' && currentCategory === '화장품'} onClick={() => handleNavClick('list', '화장품')} icon={<Sparkles size={18}/>} label="화장품" />
              <div className="pt-6 pb-2 px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Account</div>
              <NavItem active={view === 'calendar'} onClick={() => handleNavClick('calendar')} icon={<Calendar size={18}/>} label="가계부/캘린더" />

              <div className="pt-2 space-y-1">
                <button onClick={() => { setIsDarkMode(!isDarkMode); }} className="flex items-center gap-3 w-full p-3 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
                  {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
                  <span className="font-semibold">{isDarkMode ? '라이트 모드' : '다크 모드'}</span>
                </button>
                <button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                  <LogOut size={18}/>
                  <span className="font-semibold">로그아웃</span>
                </button>
              </div>
            </nav>

            {/* 프로필 - 하단 고정 */}
            <button
              onClick={() => handleNavClick('profile')}
              className={`p-4 mx-4 mb-3 bg-white dark:bg-[#252525] border rounded-2xl shadow-sm flex-shrink-0 text-left transition-all hover:shadow-md ${view === 'profile' ? 'border-blue-300 dark:border-blue-700' : 'border-gray-100 dark:border-[#333]'}`}
            >
              <div className="flex items-center gap-3">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="profile" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-base">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="font-bold text-sm text-gray-900 dark:text-white truncate">{userName}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* --- 메인 콘텐츠 영역 --- */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-white dark:bg-[#121212] min-w-0">
        <header className="h-14 md:h-16 border-b border-gray-100 dark:border-[#2F2F2F] flex items-center justify-between px-4 md:px-10 sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md z-10">

          <div className="flex items-center flex-1 gap-3 md:gap-8 min-w-0">
            {/* 모바일: 햄버거 버튼 */}
            <button
              className="md:hidden flex-shrink-0 p-1 text-gray-600 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>

            {/* 로고 */}
            <div className="flex items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="w-7 h-7 md:w-8 md:h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black shadow-md text-sm">
                C
              </div>
              <span className="text-lg md:text-xl font-black tracking-tighter text-gray-900 dark:text-white hidden sm:block">
                Check-go
              </span>
            </div>

            {/* 검색창 */}
            <div className="flex-1 flex items-center bg-gray-50 dark:bg-[#1C1C1C] rounded-xl px-3 py-2 border border-transparent focus-within:border-blue-500 transition-all min-w-0">
              <Search size={16} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                placeholder={`검색...`}
                className="bg-transparent border-none focus:outline-none w-full text-sm placeholder:text-gray-400 font-medium text-gray-900 dark:text-white min-w-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-5 flex-shrink-0 ml-2 md:ml-0">
            {selectedPlace?.isShared && (
               <div className="hidden md:flex -space-x-2 mr-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#121212] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black shadow-sm">
                     {i === 1 ? '나' : i === 2 ? '엄' : '아'}
                   </div>
                 ))}
               </div>
            )}
            <button
              onClick={() => setIsSidePanelOpen(true)}
              className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">상품 등록</span>
              <span className="sm:hidden">등록</span>
            </button>
          </div>
        </header>

        {/* 콘텐츠 — 모바일은 하단 탭 바 높이만큼 pb 확보 */}
        <div className="p-4 md:p-10 lg:p-14 max-w-7xl mx-auto w-full pb-20 md:pb-10">
          {children}
        </div>
      </main>

      {/* --- 모바일 하단 탭 바 --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#181818]/90 backdrop-blur-md border-t border-gray-200 dark:border-[#2F2F2F] flex items-stretch h-16 safe-area-pb">
        <BottomTabItem
          icon={<LayoutDashboard size={20} />}
          label="홈"
          active={view === 'dashboard'}
          onClick={() => setView('dashboard')}
        />
        <BottomTabItem
          icon={<ShoppingCart size={20} />}
          label="위시"
          active={view === 'wishlist'}
          onClick={() => setView('wishlist')}
        />
        <BottomTabItem
          icon={<Apple size={20} />}
          label="식료품"
          active={view === 'list' && currentCategory === '식료품'}
          onClick={() => navigateTo('list', '식료품')}
        />
        <BottomTabItem
          icon={<Package size={20} />}
          label="생필품"
          active={view === 'list' && currentCategory === '생필품'}
          onClick={() => navigateTo('list', '생필품')}
        />
        <BottomTabItem
          icon={<User size={20} />}
          label="더보기"
          active={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen(true)}
        />
      </nav>

      <RegistrationPanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        selectedPlace={selectedPlace}
        currentCategory={currentCategory}
        mode={view === 'wishlist' ? 'wishlist' : 'inventory'}
        onInventoryCreated={onInventoryCreated}
        onWishlistCreated={onWishlistCreated}
      />
    </div>
  );
}
