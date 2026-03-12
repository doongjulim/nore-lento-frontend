import React from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router';
import { BoardLayout } from './components/BoardLayout';
import { PostList } from './components/PostList';
import { PostDetail } from './components/PostDetail';
import { PostEditor } from './components/PostEditor';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { SettingsPage } from './components/SettingsPage';
import { ShopPage } from './components/ShopPage';
import { ProductDetailPage } from './components/ProductDetailPage';
import { AdminPage } from './components/AdminPage';
import { useBoard } from './context/BoardContext';

function RequireAuth() {
  const { isAuthenticated } = useBoard();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    element: (
      <BoardLayout>
        <Outlet />
      </BoardLayout>
    ),
    children: [
      { path: "/", Component: ShopPage },
      { path: "/shop", element: <Navigate to="/" replace /> },
      { path: "/shop/:id", Component: ProductDetailPage },
      { path: "/board", Component: PostList },
      { path: "/post/:id", Component: PostDetail },
      { path: "/free", element: <Navigate to="/board" replace /> },
      { path: "/qna", element: <Navigate to="/board" replace /> },
      { path: "/tech", element: <Navigate to="/board" replace /> },
      // 로그인 필요 라우트
      {
        element: <RequireAuth />,
        children: [
          { path: "/write", Component: PostEditor },
          { path: "/settings", Component: SettingsPage },
          { path: "/admin", Component: AdminPage },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);
