import React, { useState } from "react"; 
import { Minus, ShoppingCart, X } from 'lucide-react';
//재고 리스트 표

export default function InventoryTable({ data, onAddWishlist, onUpdateItem, onConsumeItem }) {
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    brand: '',
    quantity: '',
    shop: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (item) => {
    setEditingItem(item);
    setEditForm({
      name: item.name || '',
      brand: item.brand || '',
      quantity: item.quantity?.toString() || '0',
      shop: item.shop || '',
    });
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setIsSaving(false);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!editingItem) return;

    setIsSaving(true);

    try {
      await onUpdateItem?.({
        item: editingItem,
        updates: editForm,
      });
      closeEditModal();
    } finally {
      setIsSaving(false);
    }
  };

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
            <th className="p-5 pr-8 text-right">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-[#2F2F2F]">
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => openEditModal(item)}
              className="hover:bg-gray-50/50 dark:hover:bg-[#1E1E1E] transition-colors group cursor-pointer"
            >
              <td className="p-5 pl-8">
                <input
                  type="checkbox"
                  onClick={(event) => event.stopPropagation()}
                  className="rounded-md border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                />
              </td>
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
              <td className="p-5 pr-8 text-right">
                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onConsumeItem?.(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-[#252525] text-gray-500 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-300 rounded-xl text-[10px] font-black transition-all"
                  >
                    <Minus size={14} />
                    소진
                  </button>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onAddWishlist?.(item);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-[#252525] text-gray-500 dark:text-gray-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 rounded-xl text-[10px] font-black transition-all"
                  >
                    <ShoppingCart size={14} />
                    위시
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#181818] border border-gray-100 dark:border-[#2F2F2F] rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-[#2F2F2F] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black tracking-tight">상품 정보 수정</h2>
                <p className="text-xs text-gray-400 font-bold mt-1">행을 클릭해서 연 수정 화면입니다.</p>
              </div>
              <button onClick={closeEditModal} className="p-2 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                <X size={22} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <EditInput
                  label="브랜드"
                  value={editForm.brand}
                  onChange={(event) => handleEditChange('brand', event.target.value)}
                  placeholder="브랜드"
                />
                <EditInput
                  label="상품명"
                  value={editForm.name}
                  onChange={(event) => handleEditChange('name', event.target.value)}
                  placeholder="상품명"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <EditInput
                  label="현재 수량"
                  type="number"
                  min="0"
                  value={editForm.quantity}
                  onChange={(event) => handleEditChange('quantity', event.target.value)}
                  placeholder="0"
                />
                <EditInput
                  label="구매처"
                  value={editForm.shop}
                  onChange={(event) => handleEditChange('shop', event.target.value)}
                  placeholder="예: 이마트"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <button
                  onClick={closeEditModal}
                  className="py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all text-sm uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-xl shadow-blue-500/20 text-sm uppercase tracking-widest"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditInput({ label, value, onChange, placeholder, type = 'text', min }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</label>
      <input
        type={type}
        min={min}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full p-3.5 text-sm rounded-xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-bold shadow-inner"
      />
    </div>
  );
}
