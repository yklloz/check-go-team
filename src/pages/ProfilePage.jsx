import React, { useState, useRef } from 'react';
import { Camera, ArrowLeft, User, Mail, PenLine } from 'lucide-react';


export default function ProfilePage({ setView }) {
  const [profileImage, setProfileImage] = useState(null); 
  const [imageFile, setImageFile] = useState(null); 
  const [nickname, setNickname] = useState(''); 
  const [fullName, setName] = useState('김첵고'); 
  const [email, setEmail] = useState('user@chekgo.com'); 

  // 숨겨진 input 태그를 조종
  const fileInputRef = useRef(null); 

  // --- 2. 로직 함수 ---

  // 버튼을 클릭했을 때 실행되는 함수
  const handleProfileClick = () => {
    // 리모컨(fileInputRef)을 통해 숨겨진 input을 클릭.
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    // 사용자가 선택한 첫 번째 파일 가져오기
    const file = e.target.files[0]; 
    
    if (file) {
      // 1. 나중에 백엔드(수퍼베이스)로 보낼 진짜 파일을 State에 얌전히 보관해둠
      setImageFile(file);

      // 2. 화면에 바로 띄워주기 위해 파일을 브라우저가 읽을 수 있는 '임시 주소'로 변환
      const reader = new FileReader();
      reader.onloadend = () => {
        // 변환이 끝나면 profileImage State에 임시 주소를 넣음
        setProfileImage(reader.result); 
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // 나중에 백엔드로 보낼 때 imageFile을 같이 보내면 됨.
    console.log('저장된 데이터:', { 
      imageFile: imageFile, // 실제 파일 (이걸 수퍼베이스 Storage에 올림)
      nickname, 
      full_name: fullName, 
      email 
    });
    alert('프로필 수정 완료');
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
          />

          <div onClick={handleProfileClick} className="relative group cursor-pointer">
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
                className="w-full p-4 pl-12 text-sm rounded-2xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-900 dark:text-white" 
              />
            </div>
          </div>

        </div>

        {/* 저장 버튼 */}
        <div className="pt-4">
          <button 
            onClick={handleSave}
            className="w-full py-4 bg-black dark:bg-white dark:text-black text-white rounded-xl font-black hover:bg-gray-900 dark:hover:bg-gray-200 transition-all shadow-lg shadow-black/20 uppercase tracking-widest text-sm"
          >
            변경사항 저장
          </button>
        </div>

      </div>
    </div>
  );
}