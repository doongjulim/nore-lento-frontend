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
import { CartPage } from './components/CartPage';
import { CheckoutPage } from './components/CheckoutPage';
import { OrdersPage } from './components/OrdersPage';
import { OrderDetailPage } from './components/OrderDetailPage';
import { NotificationsPage } from './components/NotificationsPage';
import { WishlistPage } from './components/WishlistPage';
import { MyPage } from './components/MyPage';
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
      { path: "/board", element: <Navigate to="/notice" replace /> },
      { path: "/notice", element: <PostList category="notice" /> },
      { path: "/qna", element: <PostList category="qna" /> },
      { path: "/free", element: <PostList category="free" /> },
      { path: "/post/:id", Component: PostDetail },
      // 로그인 필요 라우트
      {
        element: <RequireAuth />,
        children: [
          { path: "/cart", Component: CartPage },
          { path: "/checkout", Component: CheckoutPage },
          { path: "/orders", Component: OrdersPage },
          { path: "/orders/:id", Component: OrderDetailPage },
          { path: "/notifications", Component: NotificationsPage },
          { path: "/wishlist", Component: WishlistPage },
          { path: "/mypage", Component: MyPage },
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
