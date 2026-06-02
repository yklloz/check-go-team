import React, { useState, useRef, useEffect } from 'react';
import { Camera, ArrowLeft, User, Mail, PenLine } from 'lucide-react';

// 🚨 중요: supabaseClient 파일 경로가 맞는지 꼭 확인해줘! (예: '../supabaseClient' 또는 './supabaseClient')
import { supabase } from '../supabaseClient'; 

export default function ProfilePage({ setView }) {
  const [profileImage, setProfileImage] = useState(null); 
  const [imageFile, setImageFile] = useState(null); 
  const [nickname, setNickname] = useState(''); 
  const [fullName, setName] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [isLoading, setIsLoading] = useState(false); // 저장 중 버튼 잠금을 위한 상태

  // 숨겨진 input 태그를 조종
  const fileInputRef = useRef(null); 
 
  // --- 1. 수퍼베이스에서 내 정보 불러오기 ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // 수퍼베이스에 로그인된 유저 정보 가져오기
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) throw error;

        if (user) {
          setEmail(user.email);
          // user_metadata 안에 저장된 이름, 닉네임, 사진 URL을 꺼내옵니다.
          setName(user.user_metadata?.full_name || user.user_metadata?.name || '');
          setNickname(user.user_metadata?.nickname || '');

          if (user.user_metadata?.avatar_url) {
            setProfileImage(user.user_metadata?.avatar_url);
          }
        }
      } catch (error) {
        console.error('프로필 정보를 불러오는 중 오류 발생:', error);
      }
    };

    fetchUserProfile();
  }, []);

  // --- 2. 로직 함수 ---
 
  // 사진 변경 버튼을 클릭했을 때 실행되는 함수
  const handleProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]; 
    
    if (file) {
      // 1. 나중에 수퍼베이스 Storage에 올릴 진짜 파일 보관
      setImageFile(file);

      // 2. 화면에 바로 띄워주기 위해 미리보기 임시 주소 생성
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  // 🚀 수퍼베이스에 변경사항 진짜 저장하기
 // 🚀 수퍼베이스에 변경사항 진짜 저장하기
  const handleSave = async () => {
    try {
      setIsLoading(true); // 저장 시작! 버튼 비활성화
      let avatarUrlToSave = profileImage; // 기본적으로 기존 이미지 유지

      // 🚨 1. 새로 선택한 사진(imageFile)이 있다면, Auth가 아니라 Storage에 먼저 올린다!
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
        
        // 'avatars' 보관함에 사진 파일 업로드
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, imageFile);

        if (uploadError) {
          throw new Error(`이미지 업로드 실패: ${uploadError.message}`);
        }

        // 업로드 성공 후, 짧은 인터넷 주소(URL) 가져오기
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
          
        // 데이터베이스에 저장할 주소를 이 짧은 주소로 바꿔줌!
        avatarUrlToSave = data.publicUrl; 
      }

      // 🚨 2. 사진 주소(URL)와 닉네임을 Auth에 저장한다! (이제 용량 초과 안 됨)
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
          nickname: nickname,
          avatar_url: avatarUrlToSave, // 무거운 이미지 파일이 아니라 짧은 주소가 들어감
        }
      });

      if (updateError) throw updateError;

      alert('프로필 수정 완료 🎉');
      setImageFile(null); // 저장 성공했으니 파일 보관함 비우기

    } catch (error) {
      console.error('저장 중 오류:', error);
      alert(error.message);
    } finally {
      setIsLoading(false); // 저장 끝! 버튼 활성화
    }
  };

  // --- 3. UI 렌더링 ---
  return (
    <div className="max-w-2xl mx-auto p-8">
      
      {/* 뒤로가기 버튼 */}
      <button 
        onClick={() => setView('dashboard')}
        className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors font-bold"
      >
        <ArrowLeft size={20}/> 대시보드로 돌아가기
      </button>

      <h1 className="text-3xl font-black tracking-tight mb-8 text-gray-900 dark:text-white">프로필 설정</h1>
      
      <div className="space-y-8 bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/20 dark:shadow-none">

        {/* 프로필 이미지 섹션 */}
        <div className="flex flex-col items-center justify-center gap-4">
          <input 
            type="file" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            disabled={isLoading}
          />

          <div onClick={handleProfileClick} className={`relative group ${isLoading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-[#121212] shadow-lg flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-100 dark:group-hover:border-blue-900">
              {profileImage ? (
                <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-300 dark:text-gray-600"/>
              )}
            </div>
            
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-[#121212] group-hover:scale-110 transition-transform">
              <Camera size={16}/>
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400">사진 변경 (선택)</p>
        </div>

        {/* 입력 폼 섹션 */}
        <div className="space-y-5">
          
          {/* 이메일 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">이메일 (계정)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input 
                type="email" 
                value={email} 
                readOnly 
                className="w-full p-4 pl-12 text-sm rounded-2xl border border-gray-100 bg-gray-50 dark:bg-[#2A2A2A]/50 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold cursor-not-allowed outline-none" 
              />
            </div>
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">이름</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input 
                type="text" 
                value={fullName} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="이름을 입력하세요" 
                disabled={isLoading}
                className="w-full p-4 pl-12 text-sm rounded-2xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-900 dark:text-white" 
              />
            </div>
          </div>

          {/* 닉네임 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">닉네임 (선택)</label>
            <div className="relative">
              <PenLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
              <input 
                type="text" 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                placeholder="사용할 닉네임을 입력하세요" 
                disabled={isLoading}
                className="w-full p-4 pl-12 text-sm rounded-2xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-900 dark:text-white" 
              />
            </div>
          </div>

        </div>

        {/* 저장 버튼 */}
        <div className="pt-4">
          <button 
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-4 bg-black dark:bg-white dark:text-black text-white rounded-xl font-black hover:bg-gray-900 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/20 uppercase tracking-widest text-sm disabled:opacity-50"
          >
            {isLoading ? '저장 중...' : '변경사항 저장'}
          </button>
        </div>

      </div>
    </div>
  );
}