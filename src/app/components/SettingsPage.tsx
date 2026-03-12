import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Settings, 
  Bell, 
  Shield, 
  Moon, 
  Globe, 
  LogOut, 
  ChevronRight,
  Camera,
  Mail,
  Lock,
  Download,
  Database
} from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { toast } from 'sonner';

type Tab = 'profile' | 'account' | 'notifications' | 'appearance' | 'data';

export function SettingsPage() {
  const { currentUser, updateUser, logout, posts, comments } = useBoard();
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  // Profile Form
  const { register: registerProfile, handleSubmit: handleProfileSubmit, formState: { isSubmitting: isProfileSubmitting } } = useForm({
    defaultValues: {
      name: currentUser?.name || '',
      bio: '안녕하세요! 개발자입니다.', // Mock bio since it's not in User type yet, but we can simulate
    }
  });

  const onProfileSubmit = async (data: any) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    updateUser({ name: data.name });
    toast.success('프로필이 업데이트되었습니다.');
  };

  const handleDownload = () => {
    const data = {
      user: currentUser,
      posts: posts.filter(p => p.author.id === currentUser.id), // Only user's posts
      comments: comments.filter(c => c.author.id === currentUser.id), // Only user's comments
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('데이터가 다운로드되었습니다.');
  };

  const tabs = [
    { id: 'profile', label: '프로필 편집', icon: User },
    { id: 'account', label: '계정 설정', icon: Shield },
    { id: 'notifications', label: '알림', icon: Bell },
    { id: 'appearance', label: '테마 및 언어', icon: Moon },
    { id: 'data', label: '데이터 관리', icon: Database },
  ];

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500 text-sm mt-1">계정 정보와 앱 설정을 관리하세요.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <nav className="lg:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`
                w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activeTab === tab.id 
                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <motion.div layoutId="active-indicator">
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </button>
          ))}
          
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => {
                if (window.confirm('정말 로그아웃 하시겠습니까?')) {
                  logout();
                }
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              로그아웃
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* Profile Settings */}
              {activeTab === 'profile' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">프로필 편집</h2>
                  
                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                      <img 
                        src={currentUser.avatar} 
                        alt={currentUser.name} 
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50"
                      />
                      <button className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                        <Camera size={24} />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">프로필 사진</h3>
                      <p className="text-sm text-gray-500 mb-3">JPG, GIF or PNG. 최대 1MB.</p>
                      <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        새 이미지 업로드
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                      <input
                        {...registerProfile('name', { required: true })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
                      <textarea
                        {...registerProfile('bio')}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                        placeholder="자신을 간단히 소개해 주세요."
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isProfileSubmitting}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-100"
                      >
                        {isProfileSubmitting ? '저장 중...' : '변경사항 저장'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">계정 보안</h2>
                  
                  <div className="space-y-8 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이메일 주소</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="email"
                            value="user@example.com"
                            disabled
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">이메일 변경은 고객센터에 문의해주세요.</p>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">비밀번호 변경</h3>
                      <div className="space-y-4">
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="password"
                            placeholder="현재 비밀번호"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                          />
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="password"
                            placeholder="새 비밀번호"
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                          />
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                          비밀번호 업데이트
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-medium text-red-600 mb-2">계정 삭제</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                      </p>
                      <button 
                        onClick={() => toast.error('관리자에게 문의해주세요.')}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        계정 삭제하기
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">알림 설정</h2>
                  
                  <div className="space-y-6">
                    <div className="flex items-start justify-between pb-6 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium text-gray-900">이메일 알림</h3>
                        <p className="text-sm text-gray-500 mt-1">주요 업데이트 및 활동 내역을 이메일로 받습니다.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-start justify-between pb-6 border-b border-gray-100">
                      <div>
                        <h3 className="font-medium text-gray-900">댓글 알림</h3>
                        <p className="text-sm text-gray-500 mt-1">내 게시글에 새로운 댓글이 달리면 알림을 받습니다.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>

                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">마케팅 정보 수신</h3>
                        <p className="text-sm text-gray-500 mt-1">새로운 기능 및 이벤트 소식을 받습니다.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeTab === 'appearance' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">테마 및 언어</h2>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">테마 설정</h3>
                      <div className="grid grid-cols-3 gap-4 max-w-lg">
                        <button className="relative p-4 border-2 border-indigo-600 bg-white rounded-xl flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200"></div>
                          <span className="text-sm font-medium text-indigo-700">라이트</span>
                          <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full"></div>
                        </button>
                        <button className="p-4 border border-gray-200 bg-gray-900 rounded-xl flex flex-col items-center gap-2 hover:opacity-90 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600"></div>
                          <span className="text-sm font-medium text-white">다크</span>
                        </button>
                        <button className="p-4 border border-gray-200 bg-gray-50 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border border-gray-200"></div>
                          <span className="text-sm font-medium text-gray-700">시스��</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="font-medium text-gray-900 mb-4">언어 (Language)</h3>
                      <div className="max-w-xs">
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <select className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none outline-none">
                            <option value="ko">한국어</option>
                            <option value="en">English</option>
                            <option value="ja">日本語</option>
                          </select>
                          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Data Management */}
              {activeTab === 'data' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">데이터 관리</h2>
                  
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Download size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">내 데이터 내보내기</h3>
                          <p className="text-sm text-gray-500 mt-1 mb-4">
                            작성한 모든 게시글, 댓글, 프로필 정보를 JSON 파일로 다운로드합니다.
                            이 데이터는 개인 백업 용도로 사용할 수 있습니다.
                          </p>
                          <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                          >
                            <Download size={16} />
                            데이터 다운로드 (.json)
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Shield size={14} />
                        <span>다운로드된 파일에는 개인정보가 포함될 수 있으므로 보관에 주의해주세요.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
