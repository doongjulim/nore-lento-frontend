import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package,
  ArrowLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { orderApi } from '@/app/api';
import type { OrderResponse, OrderStatus } from '@/app/api';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  SHIPPING: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
};

const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700',
  PAID: 'bg-blue-50 text-blue-700',
  SHIPPING: 'bg-indigo-50 text-indigo-700',
  DELIVERED: 'bg-green-50 text-green-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
};

function OrderCard({ order, onCancel }: { order: OrderResponse; onCancel: (id: number) => void }) {
  const canCancel = order.status === 'PENDING' || order.status === 'PAID';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4"
    >
      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <Package size={22} className="text-gray-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${ORDER_STATUS_COLOR[order.status]}`}>
            {ORDER_STATUS_LABEL[order.status]}
          </span>
          <span className="text-xs text-gray-400">#{order.orderId}</span>
        </div>
        <p className="text-sm font-semibold text-gray-900">
          상품 {order.itemCount}개
        </p>
        <p className="text-sm text-indigo-600 font-bold mt-0.5">
          {order.totalPrice.toLocaleString()}원
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {new Date(order.createAt).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        <Link
          to={`/orders/${order.orderId}`}
          className="flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium"
        >
          상세보기 <ChevronRight size={13} />
        </Link>
        {canCancel && (
          <button
            onClick={() => onCancel(order.orderId)}
            className="text-xs text-red-500 hover:text-red-700 font-medium"
          >
            주문 취소
          </button>
        )}
      </div>
    </motion.div>
  );
}

export function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchOrders = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true);
      setPage(0);
    } else {
      setLoadingMore(true);
    }
    setError(null);
    try {
      const currentPage = reset ? 0 : page;
      const data = await orderApi.findOrders({ page: currentPage, size: 10 });
      setOrders((prev) => reset ? data.content : [...prev, ...data.content]);
      setTotalPages(data.totalPages);
      if (!reset) setPage((p) => p + 1);
    } catch {
      setError('주문 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCancel(orderId: number) {
    if (!window.confirm('주문을 취소하시겠습니까?')) return;
    try {
      await orderApi.cancelOrder(orderId);
      setOrders((prev) =>
        prev.map((o) => o.orderId === orderId ? { ...o, status: 'CANCELLED' } : o),
      );
      toast.success('주문이 취소되었습니다.');
    } catch {
      toast.error('주문 취소에 실패했습니다.');
    }
  }

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">주문 내역</h2>
          <p className="text-sm text-gray-500 mt-0.5">나의 주문 목록</p>
        </div>
        <button
          onClick={() => fetchOrders(true)}
          className="ml-auto p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="새로고침"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-28">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-gray-500">{error}</p>
          <button onClick={() => fetchOrders(true)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            다시 시도
          </button>
        </div>
      ) : orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-28 gap-4 text-center"
        >
          <ShoppingBag size={60} className="text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700">주문 내역이 없어요</h3>
          <p className="text-sm text-gray-400">상품을 주문하면 여기에 표시됩니다.</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            쇼핑하러 가기
          </button>
        </motion.div>
      ) : (
        <>
          <AnimatePresence mode="popLayout">
            {orders.map((order) => (
              <OrderCard key={order.orderId} order={order} onCancel={handleCancel} />
            ))}
          </AnimatePresence>

          {page < totalPages && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => fetchOrders(false)}
                disabled={loadingMore}
                className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
              >
                {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
                더 불러오기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
