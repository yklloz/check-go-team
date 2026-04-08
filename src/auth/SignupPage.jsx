import React, { useState } from 'react';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from './supabaseClient'; 

const SignupPage = ({ setView, onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 회원가입 로직 (중복 제거 및 최적화)
  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    try {
      // 가장 기본적인 정보만 보내서 DB 에러 방지
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) {
        alert("회원가입 실패: " + error.message);
      } else {
        alert("회원가입 성공! 가입하신 메일함에서 인증 링크를 꼭 클릭해주세요.");
        if (onSignupSuccess) onSignupSuccess();
      }
    } catch (error) {
      console.error("통신 에러:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900 dark:bg-[#121212] dark:text-white transition-colors duration-300">
      <div className="max-w-md w-full p-8 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800">
        
        <button 
          onClick={() => setView('login')}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 hover:text-black dark:hover:text-white transition-colors font-bold"
        >
          <ArrowLeft size={16} /> 로그인으로 돌아가기
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 pl-10 rounded-xl border border-gray-200 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="email" 
              placeholder="이메일" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 pl-10 rounded-xl border border-gray-200 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
            <input 
              type="password" 
              placeholder="비밀번호" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 pl-10 rounded-xl border border-gray-200 dark:bg-[#2A2A2A] dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm" 
            />
          </div>

          <button 
            onClick={handleSignup}
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