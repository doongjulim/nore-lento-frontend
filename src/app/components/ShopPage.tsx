import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingCart, Star, ChevronDown, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { productCategories } from '../mockProducts';
import { Product } from '../types';
import { useBoard } from '../context/BoardContext';
import { cartApi, wishlistApi } from '@/app/api';

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'rating';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'popular', label: '인기순' },
  { value: 'rating', label: '평점순' },
  { value: 'price-asc', label: '낮은 가격순' },
  { value: 'price-desc', label: '높은 가격순' },
];

const badgeStyle: Record<string, string> = {
  sale: 'bg-red-500 text-white',
  hot: 'bg-orange-500 text-white',
  new: 'bg-indigo-500 text-white',
};

const badgeLabel: Record<string, string> = {
  sale: 'SALE',
  hot: 'HOT',
  new: 'NEW',
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  isAdding: boolean;
  wishlisted: boolean;
  onWishlistToggle: (p: Product) => void;
  isWishlisting: boolean;
}

function ProductCard({
  product,
  onAddToCart,
  isAdding,
  wishlisted,
  onWishlistToggle,
  isWishlisting,
}: ProductCardProps) {
  const navigate = useNavigate();
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(`/shop/${product.id}`)}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group overflow-hidden"
    >
      <div className="relative overflow-hidden aspect-[4/3]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.badge && (
          <span className={`absolute top-3 left-3 px-2 py-0.5 text-[10px] font-bold rounded-md ${badgeStyle[product.badge]}`}>
            {badgeLabel[product.badge]}
          </span>
        )}
        {discount && (
          <span className="absolute top-3 right-10 px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-50 text-red-600 border border-red-100">
            -{discount}%
          </span>
        )}
        {/* 위시리스트 하트 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onWishlistToggle(product);
          }}
          disabled={isWishlisting}
          className="absolute top-2.5 right-2.5 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors disabled:opacity-50"
          title={wishlisted ? '위시리스트에서 삭제' : '위시리스트에 추가'}
        >
          <Heart
            size={14}
            className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
      </div>

      <div className="p-4 space-y-2">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
          {productCategories.find((c) => c.id === product.category)?.label}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-500">
            {product.rating} ({product.reviewCount.toLocaleString()})
          </span>
        </div>

        <div className="flex items-end justify-between pt-1">
          <div>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">
                {product.originalPrice.toLocaleString()}원
              </p>
            )}
            <p className="text-base font-bold text-gray-900">
              {product.price.toLocaleString()}원
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={isAdding}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-medium rounded-lg transition-colors active:scale-95"
          >
            {isAdding ? (
              <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShoppingCart size={13} />
            )}
            담기
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function ShopPage() {
  const { products, isAuthenticated } = useBoard();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('popular');
  const [addingId, setAddingId] = useState<string | null>(null);

  // ── 위시리스트 상태 ──
  const [wishlistedIds, setWishlistedIds] = useState<Set<number>>(new Set());
  const [wishlistingId, setWishlistingId] = useState<string | null>(null);

  // 로그인 시 위시리스트 로드
  useEffect(() => {
    if (!isAuthenticated) {
      setWishlistedIds(new Set());
      return;
    }
    wishlistApi.findWishlists()
      .then((list) => setWishlistedIds(new Set(list.map((w) => w.productId))))
      .catch(() => null);
  }, [isAuthenticated]);

  const filtered = products
    .filter((p) => selectedCategory === 'all' || p.category === selectedCategory)
    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('로그인 후 이용할 수 있습니다.');
      navigate('/login');
      return;
    }
    const productId = parseInt(product.id.replace(/\D/g, ''), 10);
    if (isNaN(productId)) { toast.error('상품 정보를 확인할 수 없습니다.'); return; }
    setAddingId(product.id);
    try {
      await cartApi.addCartItem({ productId, quantity: 1 });
      toast.success(`${product.name}을(를) 장바구니에 담았습니다.`, {
        action: { label: '장바구니 보기', onClick: () => navigate('/cart') },
      });
    } catch {
      toast.error('장바구니 담기에 실패했습니다.');
    } finally {
      setAddingId(null);
    }
  };

  const handleWishlistToggle = async (product: Product) => {
    if (!isAuthenticated) {
      toast.error('로그인 후 이용할 수 있습니다.');
      navigate('/login');
      return;
    }
    const productId = parseInt(product.id.replace(/\D/g, ''), 10);
    if (isNaN(productId) || wishlistingId === product.id) return;
    const isWishlisted = wishlistedIds.has(productId);
    setWishlistingId(product.id);
    try {
      if (isWishlisted) {
        await wishlistApi.removeWishlist(productId);
        setWishlistedIds((prev) => {
          const s = new Set(prev);
          s.delete(productId);
          return s;
        });
        toast.success('위시리스트에서 삭제했습니다.');
      } else {
        await wishlistApi.addWishlist(productId);
        setWishlistedIds((prev) => new Set([...prev, productId]));
        toast.success('위시리스트에 추가했습니다.');
      }
    } catch {
      toast.error('위시리스트 처리에 실패했습니다.');
    } finally {
      setWishlistingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">쇼핑</h2>
          <p className="text-gray-500 text-sm mt-1">다양한 상품을 만나보세요.</p>
        </div>
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm font-medium shadow-sm hover:bg-gray-50 transition-colors"
        >
          <ShoppingCart size={16} />
          장바구니
        </button>
      </div>

      {/* 검색 + 정렬 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="상품명 검색..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
        {productCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
              selectedCategory === cat.id
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 상품 그리드 */}
      <div>
        <p className="text-sm text-gray-500 mb-4">
          총 <span className="font-semibold text-gray-900">{filtered.length}</span>개의 상품
        </p>
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filtered.map((product) => {
                const numericId = parseInt(product.id.replace(/\D/g, ''), 10);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    isAdding={addingId === product.id}
                    wishlisted={wishlistedIds.has(numericId)}
                    onWishlistToggle={handleWishlistToggle}
                    isWishlisting={wishlistingId === product.id}
                  />
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center text-gray-400"
            >
              <ShoppingCart size={40} className="mx-auto mb-3 opacity-30" />
              <p>검색 결과가 없습니다.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
