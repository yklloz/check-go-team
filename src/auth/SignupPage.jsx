import React, { useState } from 'react';
import { User, Mail, Lock, ArrowLeft } from 'lucide-react';
import { supabase } from '../supabaseClient'; 

const SignupPage = ({ setView, onSignupSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthProvider, setOauthProvider] = useState('');

  // 회원가입 로직 (중복 제거 및 최적화)
  const handleSignup = async () => {
    if (!name || !email || !password) {
      alert("모든 정보를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        alert("회원가입 실패: " + error.message);
      } else {
        if (data.session) {
          alert("회원가입과 로그인이 완료되었습니다.");
          setView('place-select');
        } else {
          alert("회원가입 성공! 가입하신 메일함에서 인증 링크를 클릭한 뒤 로그인해주세요.");
          if (onSignupSuccess) onSignupSuccess();
        }
      }
    } catch (error) {
      console.error("통신 에러:", error);
      alert("서버 연결에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignup = async (provider) => {
    setOauthProvider(provider);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error('OAuth 이동 URL을 받지 못했습니다. Supabase Provider 설정을 확인해주세요.');
      }

      window.location.assign(data.url);
    } catch (error) {
      console.error(`${provider} 회원가입 오류:`, error);
      alert(`${provider} 회원가입 실패: ${error.message}`);
      setOauthProvider('');
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
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">소셜 계정 또는 이메일로 시작하세요.</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => handleOAuthSignup('google')}
            disabled={!!oauthProvider}
            className="flex justify-center items-center py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            aria-label="Google 회원가입"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="" />
          </button>
          <button
            onClick={() => handleOAuthSignup('kakao')}
            disabled={!!oauthProvider}
            className="flex justify-center items-center py-3 bg-[#FEE500] rounded-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            aria-label="Kakao 회원가입"
          >
            <span className="text-[#3C1E1E] font-bold text-xs tracking-tighter">TALK</span>
          </button>
          <button
            onClick={() => handleOAuthSignup('apple')}
            disabled={!!oauthProvider}
            className="flex justify-center items-center py-3 bg-black text-white dark:bg-white dark:text-black rounded-xl hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            aria-label="Apple 회원가입"
          >
            <span className="font-bold text-sm"></span>
          </button>
        </div>

        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase font-bold">
            <span className="bg-white dark:bg-[#1E1E1E] px-2 text-gray-400">또는</span>
          </div>
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
            disabled={isSubmitting}
            className="w-full py-4 bg-black text-white rounded-xl font-black hover:bg-gray-900 transition-all mt-4 shadow-lg shadow-black/20 uppercase tracking-widest"
          >
            {isSubmitting ? '가입 중...' : '이메일로 회원 가입'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
