import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  Megaphone,
  MessageSquare,
  Settings,
  Menu,
  X,
  Bell,
  HelpCircle,
  LogOut,
  LogIn,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  ClipboardList,
  Heart,
  User,
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useBoard } from '../context/BoardContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function BoardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { currentUser, logout } = useBoard();
  const navigate = useNavigate();

  const shopItems = [
    { icon: ShoppingBag, label: '쇼핑', path: '/shop' },
  ];

  const boardItems = [
    { icon: Megaphone, label: '공지사항', path: '/notice' },
    { icon: HelpCircle, label: 'Q&A', path: '/qna' },
    { icon: MessageSquare, label: '자유게시판', path: '/free' },
  ];

  const myItems = [
    { icon: User, label: '마이페이지', path: '/mypage' },
    { icon: ClipboardList, label: '주문 내역', path: '/orders' },
    { icon: Heart, label: '위시리스트', path: '/wishlist' },
    { icon: Bell, label: '알림', path: '/notifications' },
  ];

  const bottomItems = [
    { icon: Settings, label: '설정', path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative z-50 w-64 h-full bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <Link to="/" onClick={() => setIsSidebarOpen(false)} className="text-2xl font-bold text-indigo-600 tracking-tight hover:opacity-80 transition-opacity">Nore Lento</Link>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="lg:hidden p-1 hover:bg-gray-100 rounded-md"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto space-y-5">
          {/* 쇼핑 섹션 */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">쇼핑</p>
            <div className="space-y-0.5">
              {shopItems.map((item) => {
                const isActive = location.pathname === '/' || location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-100" />

          {/* 게시판 섹션 */}
          <div>
            <p className="px-3 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">게시판</p>
            <div className="space-y-0.5">
              {boardItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 구분선 */}
          <div className="border-t border-gray-100" />

          {/* 내 계정 (로그인 시에만) */}
          {currentUser && (
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">내 계정</p>
              <div className="space-y-0.5">
                {myItems.map((item) => {
                  const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 구분선 */}
          <div className="border-t border-gray-100" />

          {/* 관리자 (로그인 시에만) */}
          {currentUser && (
            <div>
              <p className="px-3 mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">관리자</p>
              <div className="space-y-0.5">
                {[{ icon: ShieldCheck, label: '상품 관리', path: '/admin' }].map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-indigo-50 text-indigo-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      )}
                      onClick={() => setIsSidebarOpen(false)}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* 구분선 */}
          <div className="border-t border-gray-100" />

          {/* 설정 */}
          <div className="space-y-0.5">
            {bottomItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  onClick={(e) => {
                    if (!currentUser) {
                      e.preventDefault();
                      setIsSidebarOpen(false);
                      toast.error('로그인 후 이용할 수 있습니다.');
                      navigate('/login');
                      return;
                    }
                    setIsSidebarOpen(false);
                  }}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-200">
          {currentUser ? (
            <div className="flex items-center gap-3 px-3 py-2">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.id === 'u1' ? 'admin@board.io' : 'user@example.com'}</p>
              </div>
              <button
                onClick={logout}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="로그아웃"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors active:scale-95"
            >
              <LogIn size={16} />
              로그인
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* 장바구니 아이콘 – 항상 표시 */}
            <button
              onClick={() => navigate('/cart')}
              className={cn(
                "relative p-2 rounded-full transition-colors",
                location.pathname === '/cart'
                  ? "text-indigo-600 bg-indigo-50"
                  : "text-gray-500 hover:bg-gray-100"
              )}
              title="장바구니"
            >
              <ShoppingCart size={20} />
            </button>

            {currentUser ? (
              <>
                {/* 알림 아이콘 – 알림 페이지로 이동 */}
                <button
                  ref={notifRef as React.RefObject<HTMLButtonElement>}
                  onClick={() => navigate('/notifications')}
                  className={cn(
                    "relative p-2 rounded-full transition-colors",
                    location.pathname === '/notifications'
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-500 hover:bg-gray-100"
                  )}
                  title="알림"
                >
                  <Bell size={20} />
                </button>
                <div className="hidden sm:flex items-center gap-2 pl-1 border-l border-gray-200">
                  <button onClick={() => navigate('/mypage')} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm font-medium text-gray-700 hidden md:block">{currentUser.name}</span>
                  </button>
                  <button
                    onClick={logout}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="로그아웃"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors active:scale-95"
              >
                <LogIn size={16} />
                로그인
              </button>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
