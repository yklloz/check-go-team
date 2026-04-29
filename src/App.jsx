import React, { useState, useEffect } from 'react';
import { Settings } from 'lucide-react';

import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import ProfilePage from './pages/ProfilePage';
import SidePanel from './components/SidePanel';
import Layout from './components/Layout';
import StatCard from './components/StatCard';
import InventoryTable from './components/InventoryTable';
import DashboardPage from './pages/DashboardPage';
import InventoryListPage from './pages/InventoryListPage';
import WishlistPage from './pages/WishlistPage';
import PlaceSelectPage from './pages/PlaceSelectPage';

import { PLACES, INITIAL_INVENTORY, INITIAL_WISHLIST } from './data/mockData';



// --- 메인 컴포넌트 ---
export default function App() {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('식료품');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [wishlist, setWishlist] = useState(INITIAL_WISHLIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState('login'); // 'login', 'signup', 'place-select', 'dashboard', 'list', 'wishlist', 'profile' 등


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
    setSearchQuery
  };

  // 2. Layout(사이드바)이 필요한 화면들
  if (view === 'dashboard') {
    return (
      <Layout {...layoutProps}>
        <DashboardPage selectedPlace={selectedPlace} setView={setView} />
      </Layout>
    );
  }

  if (view === 'list') {
    return (
      <Layout {...layoutProps}>
        <InventoryListPage 
          inventory={inventory} 
          currentCategory={currentCategory} 
          setIsSidePanelOpen={setIsSidePanelOpen} 
        />
      </Layout>
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
      <Layout>
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

