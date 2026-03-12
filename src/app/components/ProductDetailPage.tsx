import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Star, ShoppingCart, Zap, Minus, Plus, Package, RotateCcw, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { productCategories } from '../mockProducts';
import { useBoard } from '../context/BoardContext';

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
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={16}
          className={i <= Math.round(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useBoard();
  const [quantity, setQuantity] = useState(1);

  const product = products.find((p) => p.id === id);

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

  const handleAddToCart = () => {
    toast.success(`${product.name} ${quantity}개를 장바구니에 담았습니다.`);
  };

  const handleBuyNow = () => {
    toast.success(`${product.name} 구매를 시작합니다.`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-5xl mx-auto space-y-10 pb-20"
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-500 hover:text-gray-900 transition-colors gap-2"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">쇼핑으로</span>
      </button>

      {/* Product Main */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100 aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
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
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
              {productCategories.find((c) => c.id === product.category)?.label}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 leading-snug">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-sm font-semibold text-gray-900">{product.rating}</span>
            <span className="text-sm text-gray-400">({product.reviewCount.toLocaleString()}개 리뷰)</span>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            {product.originalPrice && (
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-400 line-through">
                  {product.originalPrice.toLocaleString()}원
                </p>
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

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>

          {/* Stock */}
          <p className={`text-sm font-medium ${product.stock <= 10 ? 'text-orange-500' : 'text-gray-500'}`}>
            {product.stock <= 10
              ? `⚠ 재고 ${product.stock}개 남음`
              : `재고 있음 (${product.stock}개)`}
          </p>

          {/* Quantity */}
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

          {/* CTA Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors active:scale-95"
            >
              <ShoppingCart size={18} />
              장바구니
            </button>
            <button
              onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors active:scale-95 shadow-sm shadow-indigo-200"
            >
              <Zap size={18} />
              바로 구매
            </button>
          </div>

          {/* Trust Badges */}
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

      {/* Related Products */}
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
