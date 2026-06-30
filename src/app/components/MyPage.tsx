import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Coins,
  Ticket,
  User,
  TrendingUp,
  TrendingDown,
  Clock,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { pointApi, couponApi } from '@/app/api';
import { useBoard } from '../context/BoardContext';
import type {
  MyMyCouponResponse,
  PointHistoryResponse,
  PointHistoryType,
} from '@/app/api';

const POINT_HISTORY_ICON: Record<PointHistoryType, React.ElementType> = {
  EARN: TrendingUp,
  USE: TrendingDown,
  EXPIRE: Clock,
  REFUND: TrendingUp,
};

const POINT_HISTORY_COLOR: Record<PointHistoryType, string> = {
  EARN: 'text-green-600',
  USE: 'text-red-500',
  EXPIRE: 'text-gray-400',
  REFUND: 'text-blue-500',
};

const POINT_HISTORY_SIGN: Record<PointHistoryType, string> = {
  EARN: '+',
  USE: '-',
  EXPIRE: '-',
  REFUND: '+',
};

function PointHistoryRow({ item }: { item: PointHistoryResponse }) {
  const Icon = POINT_HISTORY_ICON[item.type];
  const color = POINT_HISTORY_COLOR[item.type];
  const sign = POINT_HISTORY_SIGN[item.type];

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
        item.type === 'USE' || item.type === 'EXPIRE' ? 'bg-red-50' : 'bg-green-50'
      }`}>
        <Icon size={15} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.description}</p>
        <p className="text-xs text-gray-400">{new Date(item.createAt).toLocaleDateString('ko-KR')}</p>
      </div>
      <span className={`text-sm font-bold flex-shrink-0 ${color}`}>
        {sign}{item.amount.toLocaleString()}P
      </span>
    </div>
  );
}

function CouponCard({ coupon }: { coupon: MyCouponResponse }) {
  const expired = coupon.expiresAt ? new Date(coupon.expiresAt) < new Date() : false;
  const unavailable = coupon.isUsed || expired;
  const discountLabel =
    coupon.discountType === 'RATE'
      ? `${coupon.discountValue}% 할인`
      : `${coupon.discountValue.toLocaleString()}원 할인`;

  return (
    <div className={`rounded-xl border-2 p-4 relative overflow-hidden ${
      unavailable
        ? 'border-gray-200 bg-gray-50 opacity-60'
        : 'border-indigo-200 bg-indigo-50'
    }`}>
      {unavailable && (
        <span className="absolute top-2 right-2 text-xs font-bold text-gray-400 bg-gray-200 rounded px-1.5 py-0.5">
          {coupon.isUsed ? '사용됨' : '만료'}
        </span>
      )}
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          unavailable ? 'bg-gray-200' : 'bg-indigo-100'
        }`}>
          <Ticket size={18} className={unavailable ? 'text-gray-400' : 'text-indigo-600'} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-900">{coupon.name}</p>
          <p className={`text-lg font-extrabold mt-0.5 ${unavailable ? 'text-gray-400' : 'text-indigo-600'}`}>
            {discountLabel}
          </p>
          {coupon.minOrderAmount != null && (
            <p className="text-xs text-gray-500 mt-1">
              {coupon.minOrderAmount.toLocaleString()}원 이상 구매 시 사용 가능
            </p>
          )}
          {coupon.expiresAt && (
            <p className="text-xs text-gray-400 mt-0.5">
              만료일: {new Date(coupon.expiresAt).toLocaleDateString('ko-KR')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function MyPage() {
  const navigate = useNavigate();
  const { currentUser } = useBoard();
  const [point, setPoint] = useState<number | null>(null);
  const [history, setHistory] = useState<PointHistoryResponse[]>([]);
  const [coupons, setCoupons] = useState<MyCouponResponse[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      pointApi.findMyPoint(),
      pointApi.findPointHistory({ page: 0, size: 20 }),
      couponApi.findMyCoupons(),
    ])
      .then(([pointData, historyPage, couponList]) => {
        setPoint(pointData.point);
        setHistory(historyPage.content);
        setCoupons(couponList);
      })
      .catch(() => setError('정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const visibleHistory = showAllHistory ? history : history.slice(0, 5);
  const availableCoupons = coupons.filter((c) => !c.isUsed && (!c.expiresAt || new Date(c.expiresAt) >= new Date()));
  const unavailableCoupons = coupons.filter((c) => c.isUsed || (c.expiresAt != null && new Date(c.expiresAt) < new Date()));

  return (
    <div className="max-w-xl mx-auto pb-12 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">마이페이지</h2>
      </div>

      {/* 프로필 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <User size={28} className="text-indigo-400" />
            )}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{currentUser?.name ?? '사용자'}</p>
            <p className="text-sm text-gray-500 mt-0.5">{currentUser?.grade === 'VIP' ? 'VIP 회원' : currentUser?.grade === 'VVIP' ? 'VVIP 회원' : '일반 회원'}</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="ml-auto text-xs text-indigo-600 hover:underline font-medium"
          >
            정보 수정
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <AlertCircle size={36} className="text-gray-300" />
          <p className="text-gray-500">{error}</p>
        </div>
      ) : (
        <>
          {/* 포인트 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-violet-500 p-5">
              <div className="flex items-center gap-2 text-white/80 mb-1">
                <Coins size={16} />
                <span className="text-sm font-medium">보유 포인트</span>
              </div>
              <p className="text-3xl font-extrabold text-white">
                {(point ?? 0).toLocaleString()}
                <span className="text-lg font-bold ml-1">P</span>
              </p>
            </div>

            {history.length > 0 && (
              <div className="p-5">
                <h4 className="text-sm font-bold text-gray-700 mb-3">포인트 내역</h4>
                {visibleHistory.map((item) => (
                  <PointHistoryRow key={item.historyId} item={item} />
                ))}
                {history.length > 5 && (
                  <button
                    onClick={() => setShowAllHistory((v) => !v)}
                    className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showAllHistory ? (
                      <><ChevronUp size={13} /> 접기</>
                    ) : (
                      <><ChevronDown size={13} /> {history.length - 5}개 더 보기</>
                    )}
                  </button>
                )}
              </div>
            )}

            {history.length === 0 && (
              <div className="p-5 text-center text-sm text-gray-400">
                포인트 내역이 없습니다.
              </div>
            )}
          </section>

          {/* 쿠폰 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Ticket size={16} className="text-indigo-500" />
              <h3 className="font-bold text-gray-900">쿠폰</h3>
              {availableCoupons.length > 0 && (
                <span className="text-xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5 ml-1">
                  {availableCoupons.length}
                </span>
              )}
            </div>

            {coupons.length === 0 ? (
              <div className="text-center text-sm text-gray-400 py-6">
                보유한 쿠폰이 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {availableCoupons.map((c) => (
                  <CouponCard key={c.couponId} coupon={c} />
                ))}
                {unavailableCoupons.length > 0 && (
                  <>
                    <p className="text-xs text-gray-400 pt-2 font-medium">사용/만료된 쿠폰</p>
                    {unavailableCoupons.map((c) => (
                      <CouponCard key={c.couponId} coupon={c} />
                    ))}
                  </>
                )}
              </div>
            )}
          </section>

          {/* 빠른 이동 */}
          <section className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/orders')}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
            >
              <p className="text-sm font-bold text-gray-900">주문 내역</p>
              <p className="text-xs text-gray-500 mt-0.5">내 주문 확인하기</p>
            </button>
            <button
              onClick={() => navigate('/wishlist')}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-left hover:border-red-200 hover:bg-red-50/40 transition-colors"
            >
              <p className="text-sm font-bold text-gray-900">위시리스트</p>
              <p className="text-xs text-gray-500 mt-0.5">찜한 상품 보기</p>
            </button>
          </section>
        </>
      )}
    </div>
  );
}
