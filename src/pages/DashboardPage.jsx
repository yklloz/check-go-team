import React from 'react';
import { Sparkles, Share2, Users } from 'lucide-react';
import StatCard from '../components/StatCard';

export default function DashboardPage({ selectedPlace }) {
  return (
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
  );
}