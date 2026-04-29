import React from 'react';
import { 
  Apple, 
  Package, 
  Sparkles
} from 'lucide-react';
// 리스트 뷰 (공용)
  export default function InventoryListPage({ inventory, currentCategory, setIsSidePanelOpen }) {
    const filteredData = inventory.filter(item => item.category === currentCategory);
    return (
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
    );
  }