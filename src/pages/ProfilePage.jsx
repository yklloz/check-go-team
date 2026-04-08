import React, { useState } from 'react';
import { Camera, ArrowLeft, User, Mail, PenLine } from 'lucide-react'; // 아이콘 추가됨

const ProfilePage = ({ setView }) => {
  const [profileImage, setProfileImage] = useState(null); 
  const [nickname, setNickname] = useState(''); 
  const [name, setName] = useState('김첵고'); // 가입 시 입력한 이름이라 가정
  const [email, setEmail] = useState('user@chekgo.com'); // 가입 이메일이라 가정

  const handleImageUpload = (e) => {
    // 사진을 업로드하는 로직 (다음 단계에서 구현)
    alert('사진 업로드 기능은 준비 중입니다!');
  };

  const handleSave = () => {
    console.log('저장된 데이터:', { profileImage, nickname, name, email });
    alert('프로필 수정 완료');
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      {/* 뒤로 가기 버튼 */}
      <button 
        onClick={() => setView('dashboard')}
        className="mb-8 flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors font-bold"
      >
        <ArrowLeft size={16} /> 대시보드로 돌아가기
      </button>

      <h1 className="text-3xl font-black tracking-tight mb-8 text-gray-900 dark:text-white">프로필 설정</h1>
      
      {/* 폼 전체를 감싸는 하얀색(다크모드에선 어두운) 박스 */}
      <div className="space-y-8 bg-white dark:bg-[#1E1E1E] p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-100/20 dark:shadow-none">

        {/* 1. 프로필 사진 영역 */}
        <div className="flex flex-col items-center justify-center gap-4">
          {/* 사진 동그라미 */}
          <div onClick={handleImageUpload} className="relative group cursor-pointer">
            <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-[#121212] shadow-lg flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-100 dark:group-hover:border-blue-900">
              {profileImage ? (
                <img src={profileImage} alt="프로필" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-gray-300 dark:text-gray-600" />
              )}
            </div>
            {/* 우측 하단 카메라 아이콘 */}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white dark:border-[#121212] group-hover:scale-110 transition-transform">
              <Camera size={14} />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-400">프로필 사진등록</p>
        </div>

        {/* 2. 정보 입력 영역 */}
        <div className="space-y-5">
          
          {/* 이메일 (읽기 전용) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">이메일 (계정)</label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={18} />
              <input 
                type="email" 
                value={email} 
                readOnly //  이 속성이 입력창을 수정 불가 상태로 만들어줌
                className="w-full p-4 pl-12 text-sm rounded-2xl border border-gray-100 bg-gray-50 dark:bg-[#2A2A2A]/50 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-bold cursor-not-allowed outline-none" 
              />
            </div>
          </div>

          {/* 이름 (수정 가능) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">이름</label>
            <div className="relative">
              <User className="absolute left-4 top-4 text-gray-400" size={18} />
              <input 
                type="text" 
                value={name} //  화면에 보여줄 값은 무조건 name State
                onChange={(e) => setName(e.target.value)} // 사용자가 타자를 치면 발동!
                placeholder="이름을 입력하세요" 
                className="w-full p-4 pl-12 text-sm rounded-2xl border border-gray-100 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-gray-900 dark:text-white" 
              />
            </div>
          </div>

          {/* 닉네임 (선택 사항) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">닉네임 (선택)</label>
            <div className="relative">
              <PenLine className="absolute left-4 top-4 text-gray-400" size={18} />
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

        {/* 3. 저장 버튼 */}
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
};

export default ProfilePage;