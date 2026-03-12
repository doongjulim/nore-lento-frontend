import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, Loader2, ArrowRight, User } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { toast } from 'sonner';

interface LoginFormData {
  email: string;
}

export function LoginPage() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useBoard();
  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onEmailSubmit = async (data: LoginFormData) => {
    setEmail(data.email);
    setStep('password');
  };

  const onFinalSubmit = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    login(email);
    toast.success(`${email}님 환영합니다!`);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          {/* Header */}
          <div className="px-8 py-10 text-center bg-indigo-600">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
            >
              <User className="text-white" size={32} />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">Nore Lento 로그인</h1>
            <p className="text-indigo-100 text-sm">
              커뮤니티에 참여하고 지식을 공유하세요.
            </p>
          </div>

          {/* Form */}
          <div className="p-8 pt-10">
            {step === 'email' ? (
              <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    이메일 주소
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      {...register('email', { 
                        required: '이메일을 입력해주세요.',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "유효한 이메일 주소를 입력해주세요"
                        }
                      })}
                      className={`
                        w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none
                        ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200'}
                      `}
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
                >
                  다음으로
                  <ArrowRight size={18} />
                </button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-400">간편 로그인</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  </button>
                  <button type="button" className="flex items-center justify-center py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo_no_text.svg" alt="Kakao" className="w-5 h-5" />
                  </button>
                </div>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <button 
                    onClick={() => setStep('email')}
                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1"
                  >
                    <ArrowRight className="rotate-180" size={14} />
                    이메일 변경
                  </button>
                  <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {email}
                  </span>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    비밀번호
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                  <p className="mt-2 text-right">
                    <button type="button" className="text-xs text-indigo-600 hover:underline">
                      비밀번호를 잊으셨나요?
                    </button>
                  </p>
                </div>

                <button
                  onClick={onFinalSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    '로그인하기'
                  )}
                </button>
              </motion.div>
            )}
          </div>
          
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              계정이 없으신가요?{' '}
              <Link to="/signup" className="text-indigo-600 font-medium hover:underline">
                회원가입
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
