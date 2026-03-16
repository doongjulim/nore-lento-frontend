import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useBoard } from '../context/BoardContext';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mockNotifications = [
  { id: 1, message: '새 댓글이 달렸습니다.', time: '방금 전', read: false },
  { id: 2, message: '새 게시글이 등록되었습니다.', time: '5분 전', read: false },
  { id: 3, message: '문의하신 상품이 입고되었습니다.', time: '1시간 전', read: true },
];

export function BoardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { currentUser, logout } = useBoard();
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  function markAllRead() {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }

  const shopItems = [
    { icon: ShoppingBag, label: '쇼핑', path: '/shop' },
  ];

  const boardItems = [
    { icon: Megaphone, label: '공지사항', path: '/notice' },
    { icon: HelpCircle, label: 'Q&A', path: '/qna' },
    { icon: MessageSquare, label: '자유게시판', path: '/free' },
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
            {currentUser ? (
              <>
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setIsNotifOpen(prev => !prev)}
                    className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-sm font-semibold text-gray-900">알림</span>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllRead}
                            className="text-xs text-indigo-600 hover:underline"
                          >
                            모두 읽음
                          </button>
                        )}
                      </div>
                      <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                          <li className="px-4 py-6 text-center text-sm text-gray-400">알림이 없습니다.</li>
                        ) : (
                          notifications.map(n => (
                            <li
                              key={n.id}
                              className={cn(
                                "flex items-start gap-3 px-4 py-3 text-sm",
                                !n.read ? "bg-indigo-50/50" : "bg-white"
                              )}
                            >
                              <span className={cn("mt-1.5 w-2 h-2 rounded-full flex-shrink-0", !n.read ? "bg-indigo-500" : "bg-gray-200")} />
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-800">{n.message}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{n.time}</p>
                              </div>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-1 border-l border-gray-200">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-700 hidden md:block">{currentUser.name}</span>
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
