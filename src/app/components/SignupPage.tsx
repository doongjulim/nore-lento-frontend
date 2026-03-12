import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, User, Loader2, UserPlus } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { toast } from 'sonner';

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignupPage() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupFormData>();
  const navigate = useNavigate();
  const { login, isAuthenticated } = useBoard();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: SignupFormData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    login(data.email);
    toast.success(`${data.name}님, 환영합니다!`);
    navigate('/');
  };

  const password = watch('password');

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
              <UserPlus className="text-white" size={32} />
            </motion.div>
            <h1 className="text-2xl font-bold text-white mb-2">회원가입</h1>
            <p className="text-indigo-100 text-sm">
              Nore Lento와 함께 시작하세요.
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* 이름 */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="name"
                    type="text"
                    placeholder="홍길동"
                    {...register('name', { required: '이름을 입력해주세요.' })}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${errors.name ? 'border-red-300' : 'border-gray-200'}`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              {/* 이메일 */}
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
                        message: '유효한 이메일 주소를 입력해주세요.',
                      },
                    })}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${errors.email ? 'border-red-300' : 'border-gray-200'}`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* 비밀번호 */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="password"
                    type="password"
                    placeholder="8자 이상 입력해주세요"
                    {...register('password', {
                      required: '비밀번호를 입력해주세요.',
                      minLength: { value: 8, message: '비밀번호는 최소 8자 이상이어야 합니다.' },
                    })}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${errors.password ? 'border-red-300' : 'border-gray-200'}`}
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>

              {/* 비밀번호 확인 */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword', {
                      required: '비밀번호 확인을 입력해주세요.',
                      validate: value => value === password || '비밀번호가 일치하지 않습니다.',
                    })}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'}`}
                  />
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 mt-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 active:scale-[0.98] disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : '가입하기'}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
