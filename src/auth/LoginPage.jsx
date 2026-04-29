import React from 'react';
import { Mail, Lock } from 'lucide-react'; // 아이콘 import 필수!

const LoginPage = ({ setView }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 dark:bg-[#121212] dark:text-white transition-colors duration-300">
      <div className="max-w-md w-full p-8 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black tracking-tighter mb-2 italic tracking-tight">Chekgo</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-sm italic">Smart Inventory Solution</p>
        </div>

        {/* 이메일/비밀번호 로그인 */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="text" 
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
            onClick={() => setView('place-select')} 
            className="w-full py-3.5 bg-black dark:bg-white dark:text-black text-white rounded-xl font-bold hover:opacity-90 transition-opacity mt-2"
          >
            로그인
          </button>
        </div>

        {/* 소셜 로그인 섹션 */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold">
            <span className="bg-white dark:bg-[#1E1E1E] px-2 text-gray-400">또는</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <button className="flex justify-center items-center py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          </button>
          <button className="flex justify-center items-center py-3 bg-[#FEE500] rounded-xl hover:opacity-90 transition-all">
            <span className="text-[#3C1E1E] font-bold text-xs tracking-tighter">TALK</span>
          </button>
          <button className="flex justify-center items-center py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 transition-all">
            <span className="font-bold text-sm"></span>
          </button>
        </div>

        <div className="text-sm text-center text-gray-500 font-medium">
          계정이 없으신가요?{" "}
          <button 
            onClick={() => setView('signup')} 
            className="text-blue-500 cursor-pointer hover:underline font-bold"
          >
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;