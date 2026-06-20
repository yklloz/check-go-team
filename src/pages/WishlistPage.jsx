import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Users, 
  Check, 
  X, 
  Trash2, 
  Edit2 
} from 'lucide-react';
import { supabase } from '../supabaseClient'; 

export default function WishlistPage({ PLACES }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  
  // UI 상태 관리
  const [addingToPlace, setAddingToPlace] = useState(null); 
  const [editingId, setEditingId] = useState(null);         
  const [formData, setFormData] = useState({ name: '', price: '', shop: '' }); 

  // 1. 데이터 불러오기
  const fetchWishlist = async () => {
    const { data, error } = await supabase.from('wishlist_items').select('*').order('created_at', { ascending: true });
    if (error) console.error('위시리스트 불러오기 실패:', error);
    else setWishlistItems(data || []);
  };

  useEffect(() => {
    let isMounted = true;

    supabase
      .from('wishlist_items')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (!isMounted) return;
        if (error) console.error('위시리스트 불러오기 실패:', error);
        else setWishlistItems(data || []);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. 폼 열기 (추가 모드)
  const handleOpenAdd = (placeId) => {
    setAddingToPlace(placeId);
    setEditingId(null);
    setFormData({ name: '', price: '', shop: '' });
  };

  // 3. 폼 열기 (수정 모드)
  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setAddingToPlace(null);
    setFormData({ name: item.name, price: item.price, shop: item.shop });
  };

  // 4. 입력 취소
  const handleCancel = () => {
    setAddingToPlace(null);
    setEditingId(null);
    setFormData({ name: '', price: '', shop: '' });
  };

  // 5. 저장 (추가 & 수정)
  const handleSave = async (placeId) => {
    if (!formData.name.trim()) return alert('상품명을 입력해주세요!');

    const { data: { user } } = await supabase.auth.getUser();

    const payload = {
      place_id: placeId,
      name: formData.name,
      price: Number(formData.price) || 0,
      shop: formData.shop,
      user_id: user?.id
    };

    if (editingId) {
      // 수정 (UPDATE)
      const { error } = await supabase.from('wishlist_items').update(payload).eq('id', editingId);
      if (error) alert('수정 실패: ' + error.message);
    } else {
      // 새로 추가 (INSERT)
      const { error } = await supabase.from('wishlist_items').insert([payload]);
      if (error) alert('추가 실패: ' + error.message);
    }
    
    handleCancel(); 
    fetchWishlist(); 
  };

  // 6. 삭제 (DELETE)
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('wishlist_items').delete().eq('id', id);
    if (error) alert('삭제 실패: ' + error.message);
    else fetchWishlist();
  };

  // 🚨 수정된 부분: 컴포넌트가 아닌 일반 렌더링 함수로 변경하여 포커스 및 한글 깨짐 방지
  const renderForm = (placeId) => (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl flex flex-col gap-3 animate-fade-in">
      <input 
        type="text" 
        placeholder="상품명 입력" 
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold outline-none focus:border-blue-500"
        autoFocus={!editingId} // 새로 추가할 때만 자동 포커스
      />
      <div className="flex gap-2">
        <input 
          type="number" 
          placeholder="금액(수량)" 
          value={formData.price}
          min="0" // 음수 방지 1: 속성으로 방지
          onKeyDown={(e) => {
            // 음수 방지 2: 키보드에서 마이너스(-), e, 플러스(+) 입력 원천 차단
            if (e.key === '-' || e.key === 'e' || e.key === '+') {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            // 음수 방지 3: 혹시라도 0보다 작은 값이 들어오면 무시
            const val = e.target.value;
            if (val >= 0) setFormData({ ...formData, price: val });
          }}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-1/2 outline-none focus:border-blue-500"
        />
        <input 
          type="text" 
          placeholder="구매처" 
          value={formData.shop}
          onChange={(e) => setFormData({ ...formData, shop: e.target.value })}
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm w-1/2 outline-none focus:border-blue-500"
        />
      </div>
      <div className="flex justify-end gap-2 mt-1">
        <button onClick={handleCancel} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <X size={16} />
        </button>
        <button onClick={() => handleSave(placeId)} className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Check size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
          <ShoppingCart size={36} className="text-blue-600" /> 위시리스트
        </h1>
        <p className="text-gray-400 font-medium ml-1">각 장소에서 필요한 모든 물품을 한눈에 관리하고 추가하세요</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {PLACES.map(place => {
          const placeItems = wishlistItems.filter(item => item.place_id === place.id);
          
          return (
            <div key={place.id} className="bg-white dark:bg-[#1E1E1E] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/30 dark:shadow-none flex flex-col overflow-hidden transition-all hover:border-blue-100 dark:hover:border-blue-900 group">
              {/* 블록 헤더 */}
              <div className={`p-6 ${place.color} text-white flex items-center justify-between relative`}>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl">
                    {place.smallIcon}
                  </div>
                  <h3 className="font-black text-lg tracking-tight">{place.name} </h3>
                </div>
                <button 
                  onClick={() => handleOpenAdd(place.id)}
                  className="w-9 h-9 bg-white text-black dark:bg-[#121212] dark:text-white rounded-full flex items-center justify-center shadow-lg transform active:scale-90 transition-transform hover:scale-110"
                >
                  <Plus size={20} />
                </button>
              </div>

              {/* 블록 내용 (아이템 리스트) */}
              <div className="p-4 flex-1 space-y-3 min-h-[250px] bg-gray-50/20 dark:bg-transparent overflow-y-auto max-h-[400px]">
                
                {/* 새 아이템 추가 중일 때 폼 띄우기 */}
                {addingToPlace === place.id && renderForm(place.id)}

                {placeItems.length > 0 ? (
                  placeItems.map(item => (
                    <div key={item.id}>
                      {/* 수정 중인 아이템이면 폼을 보여주고, 아니면 기존 디자인 보여주기 */}
                      {editingId === item.id ? (
                        renderForm(place.id)
                      ) : (
                        <div className="p-4 bg-white dark:bg-[#252525] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between group/item hover:shadow-md transition-all">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 border-2 border-gray-200 dark:border-gray-700 rounded-md flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"></div>
                            <div>
                              <p className="font-bold text-sm tracking-tight">{item.name}</p>
                              <p className="text-[10px] text-gray-400 font-medium tracking-tight">
                                ₩{Number(item.price).toLocaleString()} · {item.shop || '구매처 미정'}
                              </p>
                            </div>
                          </div>
                          
                          {/* 마우스를 올리면 수정/삭제 버튼 등장 */}
                          <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenEdit(item)} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md">
                              <Edit2 size={14} />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // 추가 중이지 않고, 데이터도 없을 때 빈 화면
                  addingToPlace !== place.id && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-700 space-y-2 opacity-50">
                      <Plus size={32} className="mb-1" />
                      <p className="text-xs font-black uppercase tracking-widest">No Items</p>
                    </div>
                  )
                )}
              </div>

              {/* 블록 하단 푸터 */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total {placeItems.length} Items</span>
                {place.isShared && <Users size={14} className="text-blue-500" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
