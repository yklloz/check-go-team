import React from 'react';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react'; // 아이콘 import 필수!

// --- 2. 회원가입 페이지 컴포넌트 ---
const SignupPage = ({ setView, onSignupSuccess }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 dark:bg-[#121212] dark:text-white transition-colors duration-300">
      <div className="max-w-md w-full p-8 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <button 
          onClick={() => setView('login')}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors font-bold"
        >
          <ArrowLeft size={16} /> 로그인
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-tight mb-2">계정 생성</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">이름, 이메일, 비밀번호를 입력해주세요.</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="이름" 
              className="w-full p-3.5 pl-10 rounded-xl border border-gray-200 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="email" 
              placeholder="이메일" 
              className="w-full p-3.5 pl-10 rounded-xl border border-gray-200 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="비밀번호" 
              className="w-full p-3.5 pl-10 rounded-xl border border-gray-200 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>

          <button 
            onClick={onSignupSuccess}
            className="w-full py-4 bg-black text-white rounded-xl font-black hover:bg-gray-900 transition-all mt-4 shadow-lg shadow-black/20 uppercase tracking-widest"
        >
            회원 가입
        </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;