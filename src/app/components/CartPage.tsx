import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  Package,
  Tag,
  Truck,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useBoard } from '../context/BoardContext';
import { cartApi } from '@/app/api';
import type { CartItemResponse, FindCartResponse } from '@/app/api';

// ─── 개별 아이템 행 ────────────────────────────────────────────────
interface CartItemRowProps {
  item: CartItemResponse;
  selected: boolean;
  onSelect: (id: number) => void;
  onQuantityChange: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
  isUpdating: boolean;
}

function CartItemRow({
  item,
  selected,
  onSelect,
  onQuantityChange,
  onRemove,
  isUpdating,
}: CartItemRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
      className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
    >
      {/* 체크박스 */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(item.cartItemId)}
        className="w-4 h-4 rounded accent-indigo-600 flex-shrink-0 cursor-pointer"
      />

      {/* 이미지 플레이스홀더 */}
      <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Package size={22} className="text-gray-300" />
      </div>

      {/* 상품 정보 */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
        <p className="text-xs text-gray-500 mt-0.5">{item.productPrice.toLocaleString()}원</p>
      </div>

      {/* 수량 조절 */}
      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
        <button
          disabled={isUpdating || item.quantity <= 1}
          onClick={() => onQuantityChange(item.cartItemId, item.quantity - 1)}
          className="px-2.5 py-2 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Minus size={12} />
        </button>
        <span className="px-3 py-2 text-sm font-semibold text-gray-900 min-w-[36px] text-center border-x border-gray-200 select-none">
          {isUpdating ? (
            <span className="inline-block w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            item.quantity
          )}
        </span>
        <button
          disabled={isUpdating}
          onClick={() => onQuantityChange(item.cartItemId, item.quantity + 1)}
          className="px-2.5 py-2 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-40"
        >
          <Plus size={12} />
        </button>
      </div>

      {/* 소계 */}
      <div className="text-right w-24 flex-shrink-0">
        <p className="text-sm font-bold text-gray-900">{item.totalPrice.toLocaleString()}원</p>
      </div>

      {/* 삭제 */}
      <button
        onClick={() => onRemove(item.cartItemId)}
        disabled={isUpdating}
        className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
      >
        <Trash2 size={15} />
      </button>
    </motion.div>
  );
}

// ─── 장바구니 페이지 ──────────────────────────────────────────────
const SHIPPING_THRESHOLD = 30_000;
const SHIPPING_FEE = 3_000;

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useBoard();

  const [cart, setCart] = useState<FindCartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // 장바구니 조회
  const fetchCart = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await cartApi.findCart();
      setCart(data);
      setSelectedIds(new Set(data.items.map((i) => i.cartItemId)));
    } catch {
      setError('장바구니를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchCart();
    else setLoading(false);
  }, [isAuthenticated, fetchCart]);

  // 수량 변경
  const handleQuantityChange = async (cartItemId: number, quantity: number) => {
    if (quantity < 1) return;
    setUpdatingId(cartItemId);
    try {
      await cartApi.updateCartItem(cartItemId, { quantity });
      setCart((prev) => {
        if (!prev) return prev;
        const items = prev.items.map((i) =>
          i.cartItemId === cartItemId
            ? { ...i, quantity, totalPrice: i.productPrice * quantity }
            : i
        );
        return { ...prev, items, totalAmount: items.reduce((s, i) => s + i.totalPrice, 0) };
      });
    } catch {
      toast.error('수량 변경에 실패했습니다.');
    } finally {
      setUpdatingId(null);
    }
  };

  // 단건 삭제
  const handleRemove = async (cartItemId: number) => {
    setUpdatingId(cartItemId);
    try {
      await cartApi.removeCartItems([cartItemId]);
      setCart((prev) => {
        if (!prev) return prev;
        const items = prev.items.filter((i) => i.cartItemId !== cartItemId);
        return { ...prev, items, totalAmount: items.reduce((s, i) => s + i.totalPrice, 0) };
      });
      setSelectedIds((prev) => {
        const s = new Set(prev);
        s.delete(cartItemId);
        return s;
      });
      toast.success('상품을 삭제했습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    } finally {
      setUpdatingId(null);
    }
  };

  // 선택 삭제
  const handleRemoveSelected = async () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    try {
      await cartApi.removeCartItems(ids);
      setCart((prev) => {
        if (!prev) return prev;
        const items = prev.items.filter((i) => !selectedIds.has(i.cartItemId));
        return { ...prev, items, totalAmount: items.reduce((s, i) => s + i.totalPrice, 0) };
      });
      setSelectedIds(new Set());
      toast.success('선택한 상품을 삭제했습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  // 전체 비우기
  const handleClearCart = async () => {
    if (!window.confirm('장바구니를 모두 비우시겠습니까?')) return;
    try {
      await cartApi.clearCart();
      setCart((prev) => prev ? { ...prev, items: [], totalAmount: 0 } : prev);
      setSelectedIds(new Set());
      toast.success('장바구니를 비웠습니다.');
    } catch {
      toast.error('장바구니 비우기에 실패했습니다.');
    }
  };

  // 전체 선택 토글
  const handleToggleAll = (checked: boolean) => {
    if (!cart) return;
    setSelectedIds(checked ? new Set(cart.items.map((i) => i.cartItemId)) : new Set());
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ── 비로그인 상태 ──
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center gap-4">
        <ShoppingCart size={52} className="text-gray-200" />
        <h2 className="text-xl font-bold text-gray-900">로그인이 필요합니다</h2>
        <p className="text-sm text-gray-500">장바구니를 이용하려면 먼저 로그인해 주세요.</p>
        <button
          onClick={() => navigate('/login')}
          className="mt-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors active:scale-95"
        >
          로그인하러 가기
        </button>
      </div>
    );
  }

  // ── 로딩 ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">장바구니 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // ── 에러 ──
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-gray-500">{error}</p>
        <button
          onClick={fetchCart}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
        >
          다시 시도
        </button>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const selectedItems = items.filter((i) => selectedIds.has(i.cartItemId));
  const subtotal = selectedItems.reduce((s, i) => s + i.totalPrice, 0);
  const shipping = subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">장바구니</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              총 <span className="font-semibold text-gray-900">{items.length}</span>개 상품
            </p>
          </div>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            전체 삭제
          </button>
        )}
      </div>

      {/* 빈 장바구니 */}
      {items.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-28 gap-4 text-center"
        >
          <ShoppingCart size={60} className="text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700">장바구니가 비어있어요</h3>
          <p className="text-sm text-gray-400">원하는 상품을 장바구니에 담아보세요!</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors active:scale-95"
          >
            쇼핑 시작하기
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* 아이템 목록 */}
          <div className="space-y-3">
            {/* 전체 선택 바 */}
            <div className="flex items-center justify-between px-1 py-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => handleToggleAll(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
                />
                <span className="text-sm text-gray-600">
                  전체 선택{' '}
                  <span className="text-gray-400">
                    ({selectedIds.size}/{items.length})
                  </span>
                </span>
              </label>
              {selectedIds.size > 0 && (
                <button
                  onClick={handleRemoveSelected}
                  className="text-sm text-red-500 hover:text-red-700 transition-colors"
                >
                  선택 삭제
                </button>
              )}
            </div>

            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <CartItemRow
                  key={item.cartItemId}
                  item={item}
                  selected={selectedIds.has(item.cartItemId)}
                  onSelect={toggleOne}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  isUpdating={updatingId === item.cartItemId}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* 주문 요약 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 lg:sticky lg:top-4"
          >
            <h3 className="font-bold text-gray-900 text-base">주문 요약</h3>

            {/* 무료 배송 프로그레스 */}
            {subtotal > 0 && subtotal < SHIPPING_THRESHOLD && (
              <div className="bg-indigo-50 rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-medium">
                  <Truck size={13} />
                  <span>
                    {(SHIPPING_THRESHOLD - subtotal).toLocaleString()}원 더 담으면 무료배송!
                  </span>
                </div>
                <div className="w-full bg-indigo-100 rounded-full h-1.5">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((subtotal / SHIPPING_THRESHOLD) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>상품 금액</span>
                <span>{subtotal.toLocaleString()}원</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>배송비</span>
                <span className={shipping === 0 && subtotal > 0 ? 'text-green-600 font-medium' : ''}>
                  {subtotal === 0 ? '-' : shipping === 0 ? '무료' : `${shipping.toLocaleString()}원`}
                </span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-gray-900">
                <div className="flex items-center gap-1">
                  <Tag size={14} className="text-indigo-500" />
                  <span>합계</span>
                </div>
                <span className="text-indigo-600 text-base">{total.toLocaleString()}원</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                disabled={selectedIds.size === 0}
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors active:scale-[0.99] text-sm"
              >
                {selectedIds.size > 0
                  ? `${selectedIds.size}개 상품 주문하기`
                  : '상품을 선택해 주세요'}
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                쇼핑 계속하기
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
