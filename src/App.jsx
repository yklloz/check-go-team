import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

import { supabase } from './supabaseClient';
import SidePanel from './components/RegistrationPanel';

import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import ProfilePage from './pages/ProfilePage';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import WishlistPage from './pages/WishlistPage';
import PlaceSelectPage from './pages/PlaceSelectPage';
import GroceryPage from './pages/GroceryPage';
import EssentialsPage from './pages/DailySuppliesPage';
import CosmeticsPage from './pages/CosmeticsPage';
import { fetchInventory } from './services/inventoryService';

import { PLACES, INITIAL_WISHLIST } from './data/mockData';



// --- 메인 컴포넌트 ---
export default function App() {
  const [currentCategory, setCurrentCategory] = useState(() => {
    const savedCategory = localStorage.getItem('currentCategory');
    return savedCategory ? savedCategory : 'all';
  });
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('isDarkMode');
    return savedTheme === 'true' ? true : false;
  });
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [inventoryError, setInventoryError] = useState('');
  const [wishlist] = useState(INITIAL_WISHLIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState(() => {
    const savedView = localStorage.getItem('currentView');
    return savedView ? savedView : 'login';
  });
  const [selectedPlace, setSelectedPlace] = useState(() => {
    const savedPlace = localStorage.getItem('selectedPlace');
    return savedPlace ? JSON.parse(savedPlace) : null;
  });
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    localStorage.setItem('currentView', view);
  }, [view]);
  
  useEffect(() => {
    if (selectedPlace) {
      localStorage.setItem('selectedPlace', JSON.stringify(selectedPlace));
    } else {
      localStorage.removeItem('selectedPlace');
    }
  }, [selectedPlace]);
  useEffect(() => {
    localStorage.setItem('currentCategory', currentCategory);
  }, [currentCategory]);

  useEffect(() => {
    localStorage.setItem('isDarkMode', isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && view === 'login') {
        setView(selectedPlace ? 'dashboard' : 'place-select');
      } else if (!data.session && view !== 'login' && view !== 'signup') {
        setView('login');
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && view === 'login') {
        setView(selectedPlace ? 'dashboard' : 'place-select');
      } else if (!session && view !== 'login' && view !== 'signup') {
        setView('login');
      }
    });

  

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [selectedPlace, view]);

  const loadInventory = async (place = selectedPlace) => {
    try {
      setInventoryError('');
      const data = place ? await fetchInventory(place) : [];
      setInventory(data);
    } catch (error) {
      console.error('재고 불러오기 실패:', error);
      setInventoryError('재고 데이터를 불러오지 못했습니다.');
    }
  };

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // inventories 테이블에 있는 모든 데이터 가져오기
        const { data, error } = await supabase
          .from('inventories')
          .select('*');

        if (error) {
          console.error('데이터 불러오기 에러:', error.message);
          return;
        }

        // 통신에 성공해서 데이터를 받았다면 State 업데이트
        if (data) {
          setInventory(data);
        }
      } catch (error) {
        console.error('수퍼베이스 서버 통신 중 오류 발생:', error);
      }
    };
  
    fetchInventory(); 
  }, []); // 빈 배열을 넣어서 컴포넌트가 처음 화면에 렌더링될 때 딱 한 번만 실행되게 만듦

  useEffect(() => {
    const place = selectedPlace;

    Promise.resolve().then(async () => {
      try {
        setInventoryError('');
        const data = place ? await fetchInventory(place) : [];
        setInventory(data);
      } catch (error) {
        console.error('재고 불러오기 실패:', error);
        setInventoryError('재고 데이터를 불러오지 못했습니다.');
      }
    });
  }, [selectedPlace]);

 //다크모드
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const checkCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
      }
    };
    checkCurrentUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && session.user) {
        setUserEmail(session.user.email);
      } else {
        setUserEmail(""); // 로그아웃 시 바구니 비우기
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  // 뷰 전환 함수
  const navigateTo = (newView, category = null) => {
    if (category) setCurrentCategory(category);
    setView(newView);
    setIsSidePanelOpen(false);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(`로그아웃 실패: ${error.message}`);
      return;
    }

    setSelectedPlace(null);
    setInventory([]);
    setInventoryError('');
    setIsSidePanelOpen(false);
    localStorage.removeItem('selectedPlace');
    localStorage.setItem('currentView', 'login');
    setView('login');
  };


   if (view === 'login') {
     return <LoginPage setView={setView} />;
    }
  
  // 회원가입 화면
  if (view === 'signup') {
    return (
      <SignupPage 
        setView={setView} 
        onSignupSuccess={() => {
          // 실제 개발 시에는 여기에 회원가입 API 연동 로직이 들어감
          alert('가입이 완료되었습니다! 로그인해주세요.');
          setView('login');
        }} 
      />
    );
  }

  if (view === 'place-select') {
    return (
      <PlaceSelectPage 
        setSelectedPlace={setSelectedPlace} 
        setView={setView} 
        PLACES={PLACES} 
      />
    );
  }
   // 대시보드, 리스트 등 여러 화면에서 똑같은 Props를 반복해서 적지 않도록 객체로 묶어줍니다.
  const layoutProps = {
    view,
    setView,
    navigateTo,
    selectedPlace,
    isDarkMode,
    setIsDarkMode,
    isSidePanelOpen,
    setIsSidePanelOpen,
    searchQuery,
    setSearchQuery,
    currentCategory,
    onInventoryCreated: loadInventory,
    onLogout: handleLogout
  };
  
  const userStatusUI = (
    <div className="mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow text-center">
      {userEmail ? (
        <p className="font-bold text-green-600 dark:text-green-400">🟢 현재 접속중: {userEmail}</p>
      ) : (
        <p className="font-bold text-red-500">🔴 로그인이 필요합니다.</p>
      )}
    </div>
  );
  
  // 2. Layout(사이드바)이 필요한 화면들
  if (view === 'dashboard') {
    return (
      <>
        <Layout {...layoutProps}>
          <DashboardPage 
            inventory={inventory}
            currentCategory={currentCategory}
            selectedPlace={selectedPlace} setView={setView} />
        </Layout>

        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
        />
      </>
    );
  }

  if (view === 'list') {
    return (
      <>
      <Layout {...layoutProps}>
        {currentCategory === '식료품' && (
          <GroceryPage inventory={inventory} inventoryError={inventoryError} setIsSidePanelOpen={setIsSidePanelOpen} />
        )}
        {currentCategory === '생필품' && (
          <EssentialsPage inventory={inventory} inventoryError={inventoryError} setIsSidePanelOpen={setIsSidePanelOpen} />
        )}
        {currentCategory === '화장품' && (
          <CosmeticsPage inventory={inventory} inventoryError={inventoryError} setIsSidePanelOpen={setIsSidePanelOpen} />
        )}
      </Layout>

      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        currentCategory={currentCategory}
        setInventory={setInventory}
        inventory={inventory}
       />
      </>
    );
  }

  if (view === 'wishlist') {
    return (
      <Layout {...layoutProps}>
        <WishlistPage 
          wishlist={wishlist} 
          PLACES={PLACES} 
          setIsSidePanelOpen={setIsSidePanelOpen} 
        />
      </Layout>
    );
  }


  if (view === 'profile') {
    return (
      <Layout {...layoutProps }>
        <ProfilePage setView={setView} />
      </Layout>
    );
  }
  
  return (
    <Layout {...layoutProps}>
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
