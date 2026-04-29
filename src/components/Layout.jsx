// 왼쪽 사이드 바 + 상단 헤더 틀
import React from 'react';
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
  Users
} from 'lucide-react';

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
// 사이드바 레이아웃 컴포넌트
export default function Layout({ 
  children, 
  view, 
  setView, 
  selectedPlace, 
  isDarkMode, 
  setIsDarkMode, 
  setIsSidePanelOpen, 
  searchQuery, 
  setSearchQuery, 
  navigateTo, 
  currentCategory
}) {
  return (
    <div className="flex h-screen transition-colors duration-200 bg-white text-gray-900 dark:bg-[#121212] dark:text-[#E3E3E3]">
      {/* 사이드바 */}
      <aside className="w-64 border-r border-gray-200 dark:border-[#2F2F2F] flex flex-col p-4 bg-[#FBFBFB] dark:bg-[#181818] transition-colors duration-200">
        <div className="flex items-center gap-2 px-2 py-4 mb-8 cursor-pointer group" onClick={() => setView('place-select')}>
          <div className={`w-9 h-9 rounded-lg ${selectedPlace?.color} flex items-center justify-center text-white text-sm font-black shadow-lg group-hover:scale-105 transition-transform`}>
            {selectedPlace?.name[0]}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg tracking-tighter leading-none">{selectedPlace?.name} 첵고</span>
            {selectedPlace?.isShared && <span className="text-[10px] text-blue-500 font-black tracking-tighter">CO-LIVING SPACE</span>}
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar pr-1">
          <NavItem active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={18}/>} label="대시보드" />
          <NavItem active={view === 'wishlist'} onClick={() => setView('wishlist')} icon={<ShoppingCart size={18}/>} label="위시리스트" />
          
          <div className="pt-6 pb-2 px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Inventory</div>
          <NavItem active={view === 'list' && currentCategory === '식료품'} onClick={() => navigateTo('list', '식료품')} icon={<Apple size={18}/>} label="식료품" />
          <NavItem active={view === 'list' && currentCategory === '생필품'} onClick={() => navigateTo('list', '생필품')} icon={<Package size={18}/>} label="생필품" />
          <NavItem active={view === 'list' && currentCategory === '화장품'} onClick={() => navigateTo('list', '화장품')} icon={<Sparkles size={18}/>} label="화장품" />
          
          <div className="pt-6 pb-2 px-2 text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Account</div>
          <NavItem active={view === 'calendar'} onClick={() => setView('calendar')} icon={<Calendar size={18}/>} label="가계부/캘린더" />
          <NavItem active={view === 'profile'} onClick={() => setView('profile')} icon={<User size={18}/>} label="프로필 설정" />
        </nav>

        <div className="mt-auto pt-4 border-t border-gray-100 dark:border-[#2F2F2F] space-y-2">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex items-center gap-3 w-full p-2.5 text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-all">
            {isDarkMode ? <Sun size={18}/> : <Moon size={18}/>}
            <span className="font-semibold">{isDarkMode ? '라이트 모드' : '다크 모드'}</span>
          </button>
          <button onClick={() => setView('login')} className="flex items-center gap-3 w-full p-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
            <LogOut size={18}/>
            <span className="font-semibold">로그아웃</span>
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-white dark:bg-[#121212]">
        <header className="h-16 border-b border-gray-100 dark:border-[#2F2F2F] flex items-center justify-between px-10 sticky top-0 bg-white/80 dark:bg-[#121212]/80 backdrop-blur-md z-10">
          <div className="flex items-center flex-1 max-w-xl">
            <Search size={18} className="text-gray-300 mr-3" />
            <input 
              type="text" 
              placeholder={`${selectedPlace?.name}에서 필요한 게 있나요?`} 
              className="bg-transparent border-none focus:outline-none w-full text-sm placeholder:text-gray-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-5">
            {selectedPlace?.isShared && (
               <div className="flex -space-x-2 mr-2">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#121212] bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-[10px] font-black shadow-sm">
                     {i === 1 ? '나' : i === 2 ? '엄' : '아'}
                   </div>
                 ))}
               </div>
            )}
            <button 
              onClick={() => setIsSidePanelOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} />
              상품 등록
            </button>
          </div>
        </header>
        <div className="p-10 lg:p-14 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      
    </div>
  );

  
}