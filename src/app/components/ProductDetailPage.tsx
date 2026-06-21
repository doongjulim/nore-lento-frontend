import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  Zap,
  Minus,
  Plus,
  Package,
  RotateCcw,
  Shield,
  Heart,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { productCategories } from '../mockProducts';
import { useBoard } from '../context/BoardContext';
import { cartApi, wishlistApi, reviewApi } from '@/app/api';
import type { ReviewResponse } from '@/app/api';

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

function StarRating({ rating, interactive = false, onRate }: {
  rating: number;
  interactive?: boolean;
  onRate?: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={interactive ? 24 : 16}
          onClick={() => interactive && onRate?.(i)}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          className={`transition-colors ${interactive ? 'cursor-pointer' : ''} ${
            i <= Math.round(interactive ? hover || rating : rating)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-200 fill-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

// ── 리뷰 카드 ──────────────────────────────────────────
function ReviewCard({ review }: { review: ReviewResponse }) {
  return (
    <div className="py-4 border-b border-gray-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs flex-shrink-0">
            {review.userName[0].toUpperCase()}
          </div>
          <span className="text-sm font-semibold text-gray-900">{review.userName}</span>
        </div>
        <div className="flex items-center gap-2">
          <StarRating rating={review.rating} />
          <span className="text-xs text-gray-400">
            {format(new Date(review.createAt), 'yyyy.MM.dd', { locale: ko })}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed pl-9">{review.content}</p>
    </div>
  );
}

// ── 리뷰 작성 폼 ──────────────────────────────────────
function ReviewForm({
  productId,
  onSubmitted,
}: {
  productId: number;
  onSubmitted: () => void;
}) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { toast.error('별점을 선택해 주세요.'); return; }
    if (!content.trim()) { toast.error('리뷰 내용을 입력해 주세요.'); return; }
    setSubmitting(true);
    try {
      await reviewApi.saveReview({ productId, content: content.trim(), rating });
      toast.success('리뷰가 등록되었습니다.');
      setRating(0);
      setContent('');
      onSubmitted();
    } catch {
      toast.error('리뷰 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-xl p-4 space-y-3">
      <p className="text-sm font-semibold text-gray-900">리뷰 작성</p>
      <StarRating rating={rating} interactive onRate={setRating} />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="상품에 대한 솔직한 의견을 남겨주세요."
        rows={3}
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        {submitting && <Loader2 size={13} className="animate-spin" />}
        등록하기
      </button>
    </form>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────
export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, isAuthenticated } = useBoard();
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // ── 위시리스트 ──
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // ── 리뷰 ──
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [canReview, setCanReview] = useState(false);

  const product = products.find((p) => p.id === id);
  const numericProductId = id ? parseInt(id.replace(/\D/g, ''), 10) : NaN;

  // ── 위시리스트 초기 로드 ──
  useEffect(() => {
    if (!isAuthenticated || isNaN(numericProductId)) return;
    wishlistApi.findWishlists()
      .then((list) => setWishlisted(list.some((w) => w.productId === numericProductId)))
      .catch(() => null);
  }, [isAuthenticated, numericProductId]);

  // ── 리뷰 로드 ──
  const fetchReviews = () => {
    if (isNaN(numericProductId)) return;
    setReviewsLoading(true);
    reviewApi.findReviews(numericProductId)
      .then((page) => setReviews(page.content))
      .catch(() => null)
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [numericProductId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 리뷰 작성 가능 여부 ──
  useEffect(() => {
    if (!isAuthenticated || isNaN(numericProductId)) return;
    reviewApi.checkReviewEligibility(numericProductId)
      .then((res) => setCanReview(res.eligible))
      .catch(() => null);
  }, [isAuthenticated, numericProductId]);

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <h2 className="text-xl font-bold mb-2">상품을 찾을 수 없습니다.</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline">
          돌아가기
        </button>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  const relatedProducts = products
    .filter((p: any) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // ── 장바구니 담기 ──
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('로그인 후 이용할 수 있습니다.');
      navigate('/login');
      return;
    }
    if (isNaN(numericProductId)) { toast.error('상품 정보를 확인할 수 없습니다.'); return; }
    setAddingToCart(true);
    try {
      await cartApi.addCartItem({ productId: numericProductId, quantity });
      toast.success(`${product.name} ${quantity}개를 장바구니에 담았습니다.`, {
        action: { label: '장바구니 보기', onClick: () => navigate('/cart') },
      });
    } catch {
      toast.error('장바구니 담기에 실패했습니다.');
    } finally {
      setAddingToCart(false);
    }
  };

  // ── 바로 구매 ──
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast.error('로그인 후 이용할 수 있습니다.');
      navigate('/login');
      return;
    }
    if (isNaN(numericProductId)) { toast.error('상품 정보를 확인할 수 없습니다.'); return; }
    setBuyingNow(true);
    try {
      await cartApi.addCartItem({ productId: numericProductId, quantity });
      navigate('/checkout');
    } catch {
      toast.error('상품 추가에 실패했습니다.');
    } finally {
      setBuyingNow(false);
    }
  };

  // ── 위시리스트 토글 ──
  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('로그인 후 이용할 수 있습니다.');
      navigate('/login');
      return;
    }
    if (isNaN(numericProductId) || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        await wishlistApi.removeWishlist(numericProductId);
        setWishlisted(false);
        toast.success('위시리스트에서 삭제했습니다.');
      } else {
        await wishlistApi.addWishlist(numericProductId);
        setWishlisted(true);
        toast.success('위시리스트에 추가했습니다.');
      }
    } catch {
      toast.error('위시리스트 처리에 실패했습니다.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating.toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-10 pb-20"
    >
      {/* 뒤로가기 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors gap-2"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">쇼핑으로</span>
      </button>

      {/* 상품 메인 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* 이미지 */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          {product.badge && (
            <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-lg ${badgeStyle[product.badge]}`}>
              {badgeLabel[product.badge]}
            </span>
          )}
          {discount && (
            <span className="absolute top-4 right-4 px-3 py-1 text-xs font-bold rounded-lg bg-red-50 text-red-600 border border-red-100">
              -{discount}%
            </span>
          )}
          {/* 위시리스트 버튼 */}
          <button
            onClick={handleWishlist}
            disabled={wishlistLoading}
            className="absolute bottom-4 right-4 p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow disabled:opacity-50"
            title={wishlisted ? '위시리스트에서 삭제' : '위시리스트에 추가'}
          >
            {wishlistLoading ? (
              <Loader2 size={18} className="animate-spin text-gray-400" />
            ) : (
              <Heart
                size={18}
                className={wishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}
              />
            )}
          </button>
        </div>

        {/* 상품 정보 */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
              {productCategories.find((c) => c.id === product.category)?.label}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>
          </div>

          {/* 평점 */}
          <div className="flex items-center gap-3">
            <StarRating rating={parseFloat(avgRating)} />
            <span className="text-sm font-semibold text-gray-900">{avgRating}</span>
            <span className="text-sm text-gray-400">({reviews.length || product.reviewCount}개 리뷰)</span>
          </div>

          {/* 가격 */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            {product.originalPrice && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400 line-through">{product.originalPrice.toLocaleString()}원</p>
                <span className="text-xs font-bold text-red-500">-{discount}%</span>
              </div>
            )}
            <p className="text-3xl font-bold text-gray-900">
              {product.price.toLocaleString()}
              <span className="text-base font-normal text-gray-500 ml-1">원</span>
            </p>
            {discount && (
              <p className="text-sm text-green-600 font-medium">
                {(product.originalPrice! - product.price).toLocaleString()}원 절약
              </p>
            )}
          </div>

          {/* 설명 */}
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

          {/* 재고 */}
          <p className={`text-sm font-medium ${product.stock <= 10 ? 'text-orange-500' : 'text-gray-500'}`}>
            {product.stock <= 10 ? `⚠ 재고 ${product.stock}개 남음` : `재고 있음 (${product.stock}개)`}
          </p>

          {/* 수량 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">수량</span>
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Minus size={14} />
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[40px] text-center border-x border-gray-200">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Plus size={14} />
              </button>
            </div>
            <span className="text-sm text-gray-500 ml-auto font-semibold">
              합계: {(product.price * quantity).toLocaleString()}원
            </span>
          </div>

          {/* CTA 버튼 */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors active:scale-95"
            >
              {addingToCart ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={18} />}
              장바구니
            </button>
            <button
              onClick={handleBuyNow}
              disabled={buyingNow}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors active:scale-95 shadow-sm shadow-indigo-200"
            >
              {buyingNow ? <Loader2 size={16} className="animate-spin" /> : <Zap size={18} />}
              바로 구매
            </button>
          </div>

          {/* 신뢰 배지 */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              { icon: Package, text: '무료 배송', sub: '3만원 이상' },
              { icon: RotateCcw, text: '30일 반품', sub: '무료 환불' },
              { icon: Shield, text: '정품 보장', sub: '공식 인증' },
            ].map(({ icon: Icon, text, sub }) => (
              <div key={text} className="flex flex-col items-center gap-1 p-3 bg-gray-50 rounded-xl text-center">
                <Icon size={18} className="text-indigo-500" />
                <p className="text-xs font-semibold text-gray-800">{text}</p>
                <p className="text-[10px] text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 리뷰 섹션 ── */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">리뷰</h3>
            <span className="text-sm text-gray-400">{reviews.length}개</span>
          </div>
          {reviews.length > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating rating={parseFloat(avgRating)} />
              <span className="text-sm font-bold text-gray-900">{avgRating}</span>
            </div>
          )}
        </div>

        {/* 리뷰 작성 폼 */}
        {isAuthenticated && canReview && (
          <div className="mb-5">
            <ReviewForm productId={numericProductId} onSubmitted={fetchReviews} />
          </div>
        )}

        {/* 리뷰 목록 */}
        {reviewsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해 보세요!</p>
        ) : (
          <>
            {visibleReviews.map((r) => (
              <ReviewCard key={r.reviewId} review={r} />
            ))}
            {reviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews((v) => !v)}
                className="mt-3 w-full flex items-center justify-center gap-1 text-sm text-indigo-600 hover:underline"
              >
                {showAllReviews ? (
                  <><ChevronUp size={15} /> 접기</>
                ) : (
                  <><ChevronDown size={15} /> {reviews.length - 3}개 더 보기</>
                )}
              </button>
            )}
          </>
        )}
      </section>

      {/* 관련 상품 */}
      {relatedProducts.length > 0 && (
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4">관련 상품</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/shop/${p.id}`)}
                className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer group overflow-hidden"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium text-gray-900 line-clamp-2 mb-1">{p.name}</p>
                  <p className="text-sm font-bold text-indigo-600">{p.price.toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
}
