import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

import { supabase } from './supabaseClient';

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
import LowStockPage from './LowStockPage';
import { consumeInventoryItem, fetchInventory, updateInventoryItem } from './services/inventoryService';
import { addWishlistItem } from './services/wishlistService';

import { PLACES } from './data/mockData';



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
  const [wishlistRefreshKey, setWishlistRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState(() => {
    const savedView = localStorage.getItem('currentView');
    return savedView ? savedView : 'login';
  });
  const [selectedPlace, setSelectedPlace] = useState(() => {
    const savedPlace = localStorage.getItem('selectedPlace');
    return savedPlace ? JSON.parse(savedPlace) : null;
  });

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
      setInventoryError(`재고 데이터를 불러오지 못했습니다. ${error.message || ''}`);
    }
  };

  const handleAddInventoryItemToWishlist = async (item) => {
    if (!item.placeId || !item.productId) {
      alert('위시리스트에 추가할 상품 정보를 찾지 못했습니다.');
      return;
    }

    try {
      await addWishlistItem({
        placeId: item.placeId,
        productId: item.productId,
        desiredQuantity: 1,
      });
      setWishlistRefreshKey(prev => prev + 1);
      alert('위시리스트에 추가했습니다!');
    } catch (error) {
      console.error('위시리스트 추가 실패:', error);
      alert(`위시리스트 추가 중 오류가 발생했습니다.\n${error.message || ''}`);
    }
  };

  const handleUpdateInventoryItem = async ({ item, updates }) => {
    try {
      const nextInventory = await updateInventoryItem({
        item,
        updates,
        selectedPlace,
      });
      setInventory(nextInventory);
      alert('상품 정보를 수정했습니다!');
    } catch (error) {
      console.error('상품 수정 실패:', error);
      alert(`상품 수정 중 오류가 발생했습니다.\n${error.message || ''}`);
      throw error;
    }
  };

  const handleConsumeInventoryItem = async (item) => {
    try {
      const nextInventory = await consumeInventoryItem({
        item,
        amount: 1,
        selectedPlace,
      });
      setInventory(nextInventory);
      alert('재고 1개를 소진했습니다.');
    } catch (error) {
      console.error('수량 소진 실패:', error);
      alert(`수량 소진 중 오류가 발생했습니다.\n${error.message || ''}`);
    }
  };

  useEffect(() => {
    const place = selectedPlace;

    Promise.resolve().then(async () => {
      try {
        setInventoryError('');
        const data = place ? await fetchInventory(place) : [];
        setInventory(data);
      } catch (error) {
        console.error('재고 불러오기 실패:', error);
        setInventoryError(`재고 데이터를 불러오지 못했습니다. ${error.message || ''}`);
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
    onWishlistCreated: () => setWishlistRefreshKey(prev => prev + 1),
    onLogout: handleLogout
  };

  // 2. Layout(사이드바)이 필요한 화면들
  if (view === 'dashboard') {
    return (
      <Layout {...layoutProps}>
        <DashboardPage 
          inventory={inventory}
          currentCategory={currentCategory}
          selectedPlace={selectedPlace} setView={setView} />
      </Layout>
    );
  }

  if (view === 'list') {
    return (
      <Layout {...layoutProps}>
        {currentCategory === '식료품' && (
          <GroceryPage
            inventory={inventory}
            inventoryError={inventoryError}
            setIsSidePanelOpen={setIsSidePanelOpen}
            onAddWishlist={handleAddInventoryItemToWishlist}
            onUpdateItem={handleUpdateInventoryItem}
            onConsumeItem={handleConsumeInventoryItem}
          />
        )}
        {currentCategory === '생필품' && (
          <EssentialsPage
            inventory={inventory}
            inventoryError={inventoryError}
            setIsSidePanelOpen={setIsSidePanelOpen}
            onAddWishlist={handleAddInventoryItemToWishlist}
            onUpdateItem={handleUpdateInventoryItem}
            onConsumeItem={handleConsumeInventoryItem}
          />
        )}
        {currentCategory === '화장품' && (
          <CosmeticsPage
            inventory={inventory}
            inventoryError={inventoryError}
            setIsSidePanelOpen={setIsSidePanelOpen}
            onAddWishlist={handleAddInventoryItemToWishlist}
            onUpdateItem={handleUpdateInventoryItem}
            onConsumeItem={handleConsumeInventoryItem}
          />
        )}
      </Layout>
    );
  }

  if (view === 'wishlist') {
    return (
      <Layout {...layoutProps}>
        <WishlistPage 
          PLACES={PLACES} 
          wishlistRefreshKey={wishlistRefreshKey}
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

  if (view === 'low-stock') {
    return (
      <Layout {...layoutProps}>
        <LowStockPage setView={setView} />
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
