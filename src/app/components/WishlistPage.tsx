import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  ArrowLeft,
  Package,
  ShoppingCart,
  Loader2,
  HeartOff,
} from 'lucide-react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { wishlistApi, cartApi } from '@/app/api';
import type { WishlistResponse } from '@/app/api';

const CATEGORY_LABEL: Record<string, string> = {
  FOOD: '식품',
  CLOTHING: '의류',
  ELECTRONICS: '전자제품',
};

function WishlistCard({
  item,
  onRemove,
  onAddToCart,
  addingToCart,
}: {
  item: WishlistResponse;
  onRemove: (productId: number) => void;
  onAddToCart: (productId: number) => void;
  addingToCart: number | null;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
    >
      <Link to={`/shop/${item.productId}`} className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
        <Package size={24} className="text-gray-300" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/shop/${item.productId}`} className="text-sm font-semibold text-gray-900 hover:text-indigo-600 truncate block">
          {item.productName}
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">{CATEGORY_LABEL[item.productCategory] ?? item.productCategory}</p>
        <p className="text-sm font-bold text-indigo-600 mt-1">{item.productPrice.toLocaleString()}원</p>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <button
          onClick={() => onAddToCart(item.productId)}
          disabled={addingToCart === item.productId}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {addingToCart === item.productId
            ? <Loader2 size={12} className="animate-spin" />
            : <ShoppingCart size={12} />}
          담기
        </button>
        <button
          onClick={() => onRemove(item.productId)}
          className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 text-xs font-medium rounded-lg transition-colors"
        >
          <Heart size={12} className="fill-red-400 text-red-400" />
          삭제
        </button>
      </div>
    </motion.div>
  );
}

export function WishlistPage() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState<WishlistResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await wishlistApi.findWishlists();
      setWishlist(data);
    } catch {
      setError('위시리스트를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRemove = async (productId: number) => {
    try {
      await wishlistApi.removeWishlist(productId);
      setWishlist((prev) => prev.filter((w) => w.productId !== productId));
      toast.success('위시리스트에서 삭제했습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleAddToCart = async (productId: number) => {
    setAddingToCart(productId);
    try {
      await cartApi.addCartItem({ productId, quantity: 1 });
      toast.success('장바구니에 담았습니다.');
    } catch {
      toast.error('장바구니 추가에 실패했습니다.');
    } finally {
      setAddingToCart(null);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Heart size={20} className="text-red-400 fill-red-400" />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">위시리스트</h2>
        </div>
        <span className="ml-auto text-sm text-gray-400">{wishlist.length}개</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-28">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-gray-500">{error}</p>
          <button onClick={fetchWishlist} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            다시 시도
          </button>
        </div>
      ) : wishlist.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-28 gap-4 text-center"
        >
          <HeartOff size={56} className="text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700">위시리스트가 비어있어요</h3>
          <p className="text-sm text-gray-400">마음에 드는 상품을 위시리스트에 추가해 보세요!</p>
          <button
            onClick={() => navigate('/')}
            className="mt-2 px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
          >
            쇼핑하러 가기
          </button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {wishlist.map((item) => (
            <WishlistCard
              key={item.wishlistId}
              item={item}
              onRemove={handleRemove}
              onAddToCart={handleAddToCart}
              addingToCart={addingToCart}
            />
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
