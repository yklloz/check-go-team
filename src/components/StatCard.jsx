import React from 'react';
// 대시보드 통계카드

export default function StatCard({ title, value, color, description }) {
  return (
    <div className="bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/20 dark:shadow-none transition-all hover:-translate-y-2 hover:shadow-2xl">
      <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-[0.2em]">{title}</p>
      <p className={`text-4xl font-black ${color} mb-3 tracking-tighter`}>{value}</p>
      <p className="text-[11px] text-gray-500 font-bold leading-none">{description}</p>
    </div>
  );
}
