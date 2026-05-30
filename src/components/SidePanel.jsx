import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Sparkles, ImagePlus, Trash2, Plus } from 'lucide-react';
import { uploadReceipt } from '../receipt/receipt';
import { supabase } from '../supabaseClient';

export default function SidePanel({ isOpen, onClose, isDarkMode, setInventory, inventory }) {
  const receiptInputRef = useRef(null); 
  const cameraInputRef = useRef(null); 
  const [isScanning, setIsScanning] = useState(false); 
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("사용자");
  const [avatarUrl, setAvatarUrl] = useState(null);

  const [commonData, setCommonData] = useState({
    shop: '',
    purchasedAt: new Date().toISOString().split('T')[0],
  });

  const [items, setItems] = useState([
    {
      id: Date.now(),
      name: '',
      brand: '',
      category: '식료품',
      quantity: '',
      unit: '개',
      unitPrice: '',
      lineTotal: ''
    }
  ]);

  const handleOcrClick = () => receiptInputRef.current.click();
  const handleCameraClick = () => cameraInputRef.current.click();

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);

    try {
      const result = await uploadReceipt(file);
      console.log('백엔드에서 받은 실제 데이터:', result);

      setCommonData({
        shop: result.shop || '', 
        purchasedAt: result.purchasedAt || new Date().toISOString().split('T')[0]
      });

      if (result.items && result.items.length > 0) {
        const formattedItems = result.items.map((item, index) => ({
          id: Date.now() + index,
          name: item.name || '',
          brand: item.brand || '',
          category: item.category || '식료품',
          quantity: item.quantity?.toString() || '1',
          unit: item.unit || '개',
          unitPrice: item.price?.toString() || '',
          lineTotal: ((item.quantity || 1) * (item.price || 0)).toString()
        }));
        setItems(formattedItems);
      }

      alert('영수증 분석 완료!');
    } catch (error) {
      alert('영수증 분석 중 서버 오류가 발생함.');
    } finally {
      setIsScanning(false); 
    }
  };

  const handleCommonChange = (field, value) => {
    setCommonData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prevItems => {
      const newItems = [...prevItems]; 
      newItems[index] = { ...newItems[index], [field]: value }; 
      
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = Number(field === 'quantity' ? value : prevItems[index].quantity) || 0;
        const price = Number(field === 'unitPrice' ? value : prevItems[index].unitPrice) || 0;
        newItems[index].lineTotal = (qty * price).toString();
      }
      
      return newItems;
    });
  };

  const addItem = () => {
    setItems(prev => [
      ...prev, 
      { id: Date.now(), name: '', brand: '', category: '식료품', quantity: '', unit: '개', unitPrice: '', lineTotal: '' }
    ]);
  };

  const removeItem = (indexToRemove) => {
    setItems(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const grandTotal = items.reduce((sum, item) => sum + (Number(item.lineTotal) || 0), 0);

  const handleRegisterAll = async () => {
    try {
      const insertData = items.map(item => ({
        name: item.name,
        brand: item.brand,
        category: item.category,
        quantity: Number(item.quantity) || 1,
        unit: item.unit,
        price: Number(item.unitPrice) || 0,
        shop: commonData.shop,
        purchased_at: commonData.purchasedAt,
      }));

      const { data, error } = await supabase
        .from('inventories')
        .insert(insertData)
        .select();

      if (error) throw error;
    
      const newItemsForScreen = items.map((item, index) => ({
        id: Date.now() + index, 
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        shop: commonData.shop
      }));

      setInventory(prev => [...prev, ...newItemsForScreen]);

      alert(`${items.length}개의 물품 등록 완료!`);
      onClose();

    } catch (error) {
      console.error('등록 에러:', error);
      alert('데이터 저장 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserEmail(user.email);
        const savedName = user.user_metadata?.name || user.user_metadata?.full_name;
        
        const savedAvatar = user.user_metadata?.avatar_url; 
        if (savedAvatar) setAvatarUrl(savedAvatar);

        if (savedName) {
          setUserName(savedName);
        } else {
          setUserName(user.email.split('@')[0]);
        }
      }
    };
    
    if (isOpen) {
      fetchUser();
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-y-0 right-0 w-[500px] bg-white dark:bg-[#181818] shadow-[0_0_50px_rgba(0,0,0,0.1)] dark:shadow-none z-50 transform transition-transform duration-500 ease-in-out border-l border-gray-100 dark:border-[#2F2F2F] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      <div className="flex items-center justify-between p-8 pb-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight">품목 스마트 등록</h2>
          <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-widest">New Inventory Entry</p>
        </div>
        <button onClick={onClose} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-full transition-all active:scale-90">
          <X size={24} className="text-gray-400 hover:text-black dark:hover:text-white" />
        </button>
      </div>
      
      <div className="px-8 pb-6 border-b border-gray-50 dark:border-[#2F2F2F] flex items-center gap-4">
        {avatarUrl ? (
          <img 
            src={avatarUrl} 
            alt="profile"
            className="w-12 h-12 rounded-full object-cover shadow-sm border border-gray-100 dark:border-gray-700"
          />
        ) : (

        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-black text-xl shadow-sm">
          {userName.charAt(0).toUpperCase()}
        </div>
        )}
        <div className="flex flex-col">
          <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight">
            {userName}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {userEmail}
          </span>
        </div>
      </div>

      <div className="p-8 overflow-y-auto h-[calc(100%-180px)] space-y-8 custom-scrollbar">
        
        <input type="file" accept="image/*" className="hidden" ref={receiptInputRef} onChange={handleReceiptUpload} />
        <input type="file" accept="image/*" capture="environment" className="hidden" ref={cameraInputRef} onChange={handleReceiptUpload} />

        <div className={`p-10 border-3 border-dashed rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all shadow-sm relative overflow-hidden ${isScanning ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-100 dark:border-gray-800 hover:border-blue-400 hover:bg-blue-50/20 dark:hover:bg-blue-900/10 group'}`}>
          {isScanning ? (
            <>
              <div className="w-16 h-16 rounded-[1.5rem] bg-blue-600 flex items-center justify-center text-white shadow-xl animate-pulse">
                <Sparkles size={32} className="animate-spin-slow" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-blue-600 dark:text-blue-400">AI가 영수증을 분석 중입니다...</p>
                <p className="text-[11px] mt-1 font-medium text-gray-500">잠시만 기다려주세요</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-[1.5rem] bg-gray-50 dark:bg-gray-800 flex items-center justify-center transition-all shadow-xl group-hover:scale-110">
                <Camera size={32} className="text-gray-400 dark:text-gray-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-gray-600 dark:text-gray-300">영수증 촬영/업로드</p>
                <p className="text-[11px] mt-1 font-medium text-gray-500">한 장의 영수증에서 다수의 물품을 읽어냅니다</p>
              </div>
              <div className="flex gap-3 mt-2 z-10">
                <button onClick={handleCameraClick} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                  <Camera size={14} /> 바로 촬영
                </button>
                <button onClick={handleOcrClick} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm active:scale-95">
                  <ImagePlus size={14} /> 갤러리
                </button>
              </div>
            </>
          )}
        </div>

        <div className="p-6 bg-gray-50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-blue-500" />
            <h3 className="font-black text-sm tracking-tight">영수증 공통 정보</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="구매 쇼핑몰(스토어)" placeholder="예: 이마트" value={commonData.shop} onChange={(e) => handleCommonChange('shop', e.target.value)} />
            <InputGroup label="구매 일자" type="date" value={commonData.purchasedAt} onChange={(e) => handleCommonChange('purchasedAt', e.target.value)} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-sm tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span> 등록할 물품 목록 ({items.length}개)
            </h3>
          </div>

          {items.map((item, index) => (
            <div key={item.id} className="relative p-6 border-2 border-gray-100 dark:border-gray-800 rounded-3xl space-y-5 bg-white dark:bg-transparent group">
              
              {items.length > 1 && (
                <button 
                  onClick={() => removeItem(index)} 
                  className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2">
                <InputGroup label="브랜드 (선택)" placeholder="예: N사" value={item.brand} onChange={(e) => handleItemChange(index, 'brand', e.target.value)} />
                <InputGroup label="상품 이름" placeholder="예: 닭가슴살" value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <InputGroup label="수량" type="number" placeholder="0" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} />
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">단위</label>
                  <select value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="w-full p-3.5 text-sm rounded-xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-bold transition-all">
                    <option>개</option>
                    <option>팩</option>
                    <option>g</option>
                    <option>ml</option>
                  </select>
                </div>
                <div className="col-span-1 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">카테고리</label>
                  <select value={item.category} onChange={(e) => handleItemChange(index, 'category', e.target.value)} className="w-full p-3.5 text-sm rounded-xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-bold transition-all">
                    <option>식료품</option>
                    <option>생필품</option>
                    <option>화장품</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-2">
                <InputGroup label="개당 가격(단가)" type="number" placeholder="₩ 0" value={item.unitPrice} onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)} />
                <InputGroup label="해당 상품 총액" type="number" placeholder="₩ 0" value={item.lineTotal} onChange={(e) => handleItemChange(index, 'lineTotal', e.target.value)} />
              </div>
            </div>
          ))}

          <button 
            onClick={addItem}
            className="w-full py-4 border-2 border-dashed border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold rounded-3xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-blue-500 hover:border-blue-200 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            <span>품목 수동 추가</span>
          </button>
        </div>

        {/* 👇 날아갔던 하단 영역(버튼 등) 복구 👇 */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-end mb-6 px-2">
            <span className="text-sm font-black text-gray-400">총 영수증 결제액</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter">₩ {grandTotal.toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={onClose} className="py-4 bg-gray-50 dark:bg-gray-800 text-gray-500 font-black rounded-2xl hover:bg-gray-100 transition-all text-sm uppercase tracking-widest">Cancel</button>
            <button 
              onClick={handleRegisterAll}
              className="py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 text-sm uppercase tracking-widest"
            >
              Register All
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// 👇 날아갔던 InputGroup 헬퍼 함수 복구 👇
function InputGroup({ label, placeholder, type = "text", value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value}        
        onChange={onChange}   
        className="w-full p-3.5 text-sm rounded-xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600 font-bold shadow-inner" 
      />
    </div>
  );
}