import React from 'react'; // JSX(<.../>)를 사용하므로 반드시 필요함
import { Home, School, Briefcase } from 'lucide-react';

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

export { PLACES, INITIAL_INVENTORY, INITIAL_WISHLIST };