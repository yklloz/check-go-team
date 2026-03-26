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
  X, 
  Camera, 
  ChevronRight, 
  Calendar,
  LogOut,
  Moon,
  Sun,
  Home,
  Briefcase,
  School,
  Users,
  Settings,
  Share2,
  CheckCircle2
} from 'lucide-react';

// --- 초기 데이터 및 상수 ---
const PLACES = [
  { id: 'home', name: '집', icon: <Home size={48} />, smallIcon: <Home size={18} />, color: 'bg-green-500', isShared: true, members: ['나', '엄마', '아빠'] },
  { id: 'dorm', name: '기숙사', icon: <School size={48} />, smallIcon: <School size={18} />, color: 'bg-blue-500', isShared: false },
  { id: 'office', name: '회사', icon: <Briefcase size={48} />, smallIcon: <Briefcase size={18} />, color: 'bg-purple-500', isShared: false },
];

const INITIAL_INVENTORY = [
  { id: 1, category: '식료품', name: 'N사 닭가슴살', place: 'dorm', date: '2024-03-20', shop: '쿠팡', quantity: 20, price: 30000, unitPrice: '150원/10g' },
  { id: 2, category: '생필품', name: '크리넥스 휴지', place: 'home', date: '2024-03-15', shop: '이마트', quantity: 1, price: 15000, unitPrice: '15000원/1개' },
];

// 위시리스트 가상 데이터 (장소별)
const INITIAL_WISHLIST = [
  { id: 101, name: '우유 1L', place: 'home', price: 2980, shop: '이마트', checked: false },
  { id: 102, name: '계란 30구', place: 'home', price: 7900, shop: '홈플러스', checked: false },
  { id: 103, name: '섬유유연제', place: 'dorm', price: 12000, shop: '쿠팡', checked: false },
  { id: 104, name: 'A4 용지', place: 'office', price: 5500, shop: '오피스디포', checked: false },
  { id: 105, name: '멀티탭 6구', place: 'dorm', price: 8900, shop: '다이소', checked: false },
];

// --- 메인 컴포넌트 ---
export default function App() {
  const [view, setView] = useState('login'); 
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('식료품');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST);
  const [searchQuery, setSearchQuery] = useState('');


//다크모드(1)_isDarkMode 버튼 누를 시, 이 코드 실행됨.
// 브라우저의 가장 최상단 태그(html)에 'dark'라는 클래스를 달아주거나 뺌.
//tailwind가 다크모드를 알아채고 글자색 바꾸도록 함. 안하면 컴퓨터마다 기본OS설정에 따라 달라질 수 O
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 뷰 전환 함수
  const navigateTo = (newView, category = null) => {
    if (category) setCurrentCategory(category);
    setView(newView);
    setIsSidePanelOpen(false);
  };

  // 로그인 화면
  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors bg-gray-50 text-gray-900 dark:bg-[#121212] dark:text-white">
        <div className="max-w-md w-full p-8 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tighter mb-2"> 첵고</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">LLM 기반 지능형 재고 관리</p>
          </div>
          <div className="space-y-4">
            <input type="text" placeholder="이메일" className="w-full p-3.5 rounded-xl border dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            <input type="password" placeholder="비밀번호" className="w-full p-3.5 rounded-xl border dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
            <button 
              onClick={() => setView('place-select')}
              className="w-full py-3.5 bg-black dark:bg-white dark:text-black text-white rounded-xl font-bold hover:opacity-90 transition-opacity mt-2"
            >
              로그인
            </button>
            <div className="text-sm text-center text-gray-500 mt-4 font-medium">
              계정이 없으신가요? <span className="text-blue-500 cursor-pointer hover:underline">회원가입</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 장소 선택 화면 (넷플릭스 멀티프로필st)
  if (view === 'place-select') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center transition-colors bg-white text-gray-900 dark:bg-[#121212] dark:text-white">
        <h2 className="text-3xl font-bold mb-14 tracking-tight">관리를 시작할 장소를 선택하세요</h2>
        <div className="flex gap-10 flex-wrap justify-center px-4">
          {PLACES.map((place) => (
            <div 
              key={place.id}
              onClick={() => { setSelectedPlace(place); setView('dashboard'); }}
              className="group cursor-pointer text-center relative"
            >
              <div className={`w-40 h-40 rounded-2xl ${place.color} flex items-center justify-center text-white mb-5 group-hover:ring-8 group-hover:ring-gray-100 dark:group-hover:ring-gray-800 transition-all transform group-hover:scale-105 shadow-2xl`}>
                {place.icon}
                {place.isShared && (
                  <div className="absolute -top-3 -right-3 bg-white dark:bg-[#1E1E1E] p-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 text-blue-500">
                    <Users size={18} />
                  </div>
                )}
              </div>
              <p className="text-xl font-bold text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                {place.name}
              </p>
              {place.isShared && <p className="text-xs text-blue-500 mt-1 font-bold tracking-widest uppercase">Shared</p>}
            </div>
          ))}
          <div className="group cursor-pointer text-center">
            <div className="w-40 h-40 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-300 mb-5 group-hover:bg-gray-100 dark:group-hover:bg-gray-700 transition-all shadow-inner">
              <Plus size={54} />
            </div>
            <p className="text-xl font-bold text-gray-300">추가하기</p>
          </div>
        </div>
        
        <button 
          onClick={() => setView('wishlist')}
          className="mt-24 flex items-center gap-3 px-8 py-4 border-2 border-gray-100 dark:border-gray-800 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm font-bold text-gray-600 dark:text-gray-300 group"
        >
          <ShoppingCart size={22} className="group-hover:scale-110 transition-transform" />
          <span>전체 위시리스트 바로가기</span>
        </button>
      </div>
    );
  }

  // 사이드바 레이아웃 컴포넌트
  const Layout = ({ children }) => (
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

      {/* 우측 등록 사이드 패널 */}
      <SidePanel isOpen={isSidePanelOpen} onClose={() => setIsSidePanelOpen(false)} isDarkMode={isDarkMode} />
    </div>
  );

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

  // --- 뷰 구성 요소 ---

  // 대시보드 뷰
  if (view === 'dashboard') {
    return (
      <Layout>
        <div className="space-y-10">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-xs text-blue-500 font-black uppercase tracking-widest">Overview</p>
              <h1 className="text-4xl font-black tracking-tight">반가워요, {selectedPlace?.name} 관리자님! 👋</h1>
            </div>
            {selectedPlace?.isShared && (
              <button className="flex items-center gap-2 px-5 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl text-sm font-bold hover:bg-gray-100 transition-all">
                <Share2 size={18} />
                멤버 초대
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard title="재고 부족" value="4개" color="text-red-500" description="서둘러 구매가 필요해요" />
            <StatCard title="유통기한 임박" value="2개" color="text-amber-500" description="오늘 저녁 메뉴로 어때요?" />
            <StatCard title="월 지출액" value="₩124,500" color="text-blue-500" description="전월 대비 12,000원 절약 중" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-50/50 dark:bg-[#1E1E1E] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="font-black text-lg mb-5 flex items-center gap-2">
                <Sparkles size={20} className="text-purple-500" />
                첵고 지능형 가이드
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                현재 <span className="font-black text-black dark:text-white">우유</span>의 재고가 1개 남았습니다. 
                가장 저렴한 구매처는 <span className="text-blue-600 font-bold">네이버 쇼핑(₩2,450)</span>입니다. 위시리스트에 담아둘까요?
              </p>
              <div className="flex gap-3">
                <button className="text-xs font-black px-4 py-2 bg-blue-600 text-white rounded-xl shadow-md">네, 담아주세요</button>
                <button className="text-xs font-bold px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">다음에요</button>
              </div>
            </div>

            {selectedPlace?.isShared && (
              <div className="bg-blue-50/30 dark:bg-blue-900/10 p-8 rounded-3xl border border-blue-100/50 dark:border-blue-900/30 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Users size={80} />
                </div>
                <h3 className="font-black text-lg mb-5 flex items-center gap-2 text-blue-800 dark:text-blue-400">
                  <Users size={20} />
                  가족/공유 공간 브리핑
                </h3>
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600/70 dark:text-blue-400/70 uppercase">최근 활동</span>
                    <span className="text-[10px] text-gray-400">10분 전</span>
                  </div>
                  <p className="text-sm font-medium">엄마 님이 <span className="font-bold">계란</span>을 구매 목록에 추가했습니다.</p>
                  <div className="flex gap-2">
                    {selectedPlace.members.map(m => (
                      <div key={m} className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-blue-900 shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-[11px] font-bold">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // 리스트 뷰 (공용)
  if (view === 'list') {
    const filteredData = inventory.filter(item => item.category === currentCategory);
    return (
      <Layout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-black flex items-center gap-4">
              {currentCategory === '식료품' && <Apple size={32} className="text-red-500" />}
              {currentCategory === '생필품' && <Package size={32} className="text-blue-500" />}
              {currentCategory === '화장품' && <Sparkles size={32} className="text-pink-500" />}
              {currentCategory} 리스트
            </h1>
          </div>
          <div className="border border-gray-100 dark:border-[#2F2F2F] rounded-3xl bg-white dark:bg-transparent overflow-hidden shadow-xl shadow-gray-100/50 dark:shadow-none">
            <InventoryTable data={filteredData} />
            {filteredData.length === 0 && (
              <div className="p-32 text-center">
                <Package size={64} className="mx-auto text-gray-100 dark:text-gray-800 mb-6" />
                <p className="text-gray-400 font-bold text-lg tracking-tight">아직 등록된 물건이 없네요.</p>
                <button onClick={() => setIsSidePanelOpen(true)} className="mt-4 text-sm text-blue-500 font-black hover:underline underline-offset-4 tracking-tight">지금 바로 첫 상품 등록하기</button>
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  // 위시리스트 뷰 (장소별 블록 그룹화)
  if (view === 'wishlist') {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-24 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Settings size={32} className="text-gray-300 animate-spin-slow" />
        </div>
        <h2 className="text-2xl font-black mb-2 tracking-tight">준비 중인 화면입니다</h2>
        <p className="text-gray-400 font-medium">조금만 기다려주세요! 더 똑똑한 기능을 개발 중입니다.</p>
        <button onClick={() => setView('dashboard')} className="mt-8 text-sm font-black text-blue-600 border-b-2 border-blue-600 pb-0.5 tracking-tight">대시보드로 돌아가기</button>
      </div>
    </Layout>
  );
}

// --- 하위 컴포넌트 ---

function StatCard({ title, value, color, description }) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/20 dark:shadow-none transition-all hover:-translate-y-2 hover:shadow-2xl">
      <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">{title}</p>
      <p className={`text-4xl font-black ${color} mb-3 tracking-tighter`}>{value}</p>
      <p className="text-[11px] text-gray-500 font-bold leading-none">{description}</p>
    </div>
  );
}

function InventoryTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-[#181818] border-b border-gray-100 dark:border-[#2F2F2F] text-gray-400 font-black text-[10px] uppercase tracking-widest">
            <th className="p-5 pl-8 w-10"><input type="checkbox" className="rounded-md border-gray-200 dark:bg-gray-800 dark:border-gray-700" /></th>
            <th className="p-5">품목명</th>
            <th className="p-5">입고일</th>
            <th className="p-5">구매처</th>
            <th className="p-5">재고 수량</th>
            <th className="p-5">총 가격</th>
            <th className="p-5 text-right pr-8 font-black text-blue-500">단위 가격</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-[#2F2F2F]">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-[#1E1E1E] transition-colors group">
              <td className="p-5 pl-8"><input type="checkbox" className="rounded-md border-gray-200 dark:bg-gray-800 dark:border-gray-700" /></td>
              <td className="p-5 font-black text-base">{item.name}</td>
              <td className="p-5 text-gray-500 dark:text-gray-400 font-medium">{item.date}</td>
              <td className="p-5 text-gray-500 dark:text-gray-400 font-medium">{item.shop}</td>
              <td className="p-5 font-black text-lg">{item.quantity}</td>
              <td className="p-5 font-black text-lg">₩{item.price.toLocaleString()}</td>
              <td className="p-5 text-right pr-8">
                <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black tracking-tight border border-blue-100 dark:border-blue-800">
                  {item.unitPrice}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SidePanel({ isOpen, onClose, isDarkMode }) {
  return (
    <div className={`fixed inset-y-0 right-0 w-[450px] bg-white dark:bg-[#181818] shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-none z-50 transform transition-transform duration-500 ease-in-out border-l border-gray-100 dark:border-[#2F2F2F] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex items-center justify-between p-8 border-b border-gray-50 dark:border-[#2F2F2F]">
        <div>
          <h2 className="text-2xl font-black tracking-tight">품목 스마트 등록</h2>
          <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">New Inventory Entry</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90">
          <X size={24} className="text-gray-400 hover:text-black dark:hover:text-white" />
        </button>
      </div>
      
      <div className="p-8 overflow-y-auto h-[calc(100%-100px)] space-y-8 custom-scrollbar">
        {/* OCR Area */}
        <div className="p-12 border-3 border-dashed border-gray-100 dark:border-gray-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 text-gray-400 hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 transition-all cursor-pointer group shadow-sm">
          <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl group-hover:scale-110">
            <Camera size={32} />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-gray-600 dark:text-gray-300">영수증 촬영/업로드</p>
            <p className="text-[11px] mt-1 font-medium">LLM이 품목과 가격을 자동 분석합니다</p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full">
            <Sparkles size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">Smart Scan</span>
          </div>
        </div>

        <div className="space-y-6">
          <InputGroup label="상품 이름" placeholder="예: 닭가슴살 스테이크" />
          <div className="grid grid-cols-2 gap-5">
            <InputGroup label="입고 수량" type="number" placeholder="0" />
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">카테고리 분류</label>
              <select className="w-full p-4 text-sm rounded-2xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 font-bold transition-all">
                <option>식료품</option>
                <option>생필품</option>
                <option>화장품</option>
              </select>
            </div>
          </div>
          <InputGroup label="구매 쇼핑몰" placeholder="예: 쿠팡, 이마트, 네이버" />
          <InputGroup label="최종 결제 금액" type="number" placeholder="₩ 00,000" />
          
          <div className="p-6 bg-gray-50/50 dark:bg-gray-900/50 rounded-[2rem] space-y-4 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">단위 가격 계산기</p>
              <CheckCircle2 size={16} className="text-blue-500" />
            </div>
            <div className="flex gap-3">
              <input type="text" placeholder="용량 (예: 200)" className="flex-1 p-4 text-sm rounded-2xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 font-bold shadow-inner" />
              <select className="w-28 p-4 text-sm rounded-2xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 font-bold">
                <option>g</option>
                <option>ml</option>
                <option>개</option>
              </select>
            </div>
            <div className="flex items-center justify-between px-2">
              <p className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase">Unit Price</p>
              <p className="text-xl font-black tracking-tight">₩ 0 / 100g</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button onClick={onClose} className="py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all text-sm uppercase tracking-widest">Cancel</button>
          <button 
            onClick={onClose}
            className="py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 text-sm uppercase tracking-widest"
          >
            Register Now
          </button>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, placeholder, type = "text" }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        className="w-full p-4 text-sm rounded-2xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-bold shadow-inner" 
      />
    </div>
  );
}