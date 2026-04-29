import React from "react"; 
//재고 리스트 표

export default function InventoryTable({ data }) {
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
