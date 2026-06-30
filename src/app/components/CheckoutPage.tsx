import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  Landmark,
  Wallet,
  CheckCircle2,
  Loader2,
  Star,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { cartApi, orderApi, paymentApi, shippingAddressApi } from '@/app/api';
import type { CartItemResponse, FindCartResponse, PaymentMethod, ShippingAddressResponse } from '@/app/api';

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: 'CARD', label: '신용카드', icon: CreditCard },
  { value: 'BANK_TRANSFER', label: '계좌이체', icon: Landmark },
  { value: 'VIRTUAL_ACCOUNT', label: '가상계좌', icon: Wallet },
];

const SHIPPING_THRESHOLD = 30_000;
const SHIPPING_FEE = 3_000;

function OrderItemRow({ item }: { item: CartItemResponse }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <Package size={18} className="text-gray-300" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
        <p className="text-xs text-gray-500">{item.productPrice.toLocaleString()}원 × {item.quantity}</p>
      </div>
      <span className="text-sm font-semibold text-gray-900 flex-shrink-0">
        {item.totalPrice.toLocaleString()}원
      </span>
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<FindCartResponse | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<ShippingAddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [done, setDone] = useState(false);

  useEffect(() => {
    Promise.all([
      cartApi.findCart(),
      shippingAddressApi.findShippingAddresses().catch(() => [] as ShippingAddressResponse[]),
    ])
      .then(([cartData, addrs]) => {
        setCart(cartData);
        setSavedAddresses(addrs);
        const def = addrs.find((a) => a.isDefault);
        if (def) {
          setSelectedAddressId(def.id);
          const full = [def.address, def.detailAddress].filter(Boolean).join(' ');
          setAddress(full);
        }
      })
      .catch(() => toast.error('장바구니를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, []);

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, i) => s + i.totalPrice, 0);
  const shipping = subtotal > 0 && subtotal < SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
  const total = subtotal + shipping;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('배송지 주소를 입력해 주세요.');
      return;
    }
    if (items.length === 0) {
      toast.error('장바구니가 비어있습니다.');
      return;
    }
    setSubmitting(true);
    try {
      // 1. 주문 생성
      await orderApi.saveOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        deliveryAddress: address.trim(),
      });

      // 2. 가장 최근 주문 조회 후 결제
      const ordersPage = await import('@/app/api').then((m) =>
        m.orderApi.findOrders({ page: 0, size: 1, sort: 'orderId,desc' }),
      );
      const latestOrder = ordersPage.content[0];
      if (latestOrder) {
        await paymentApi.payOrder(latestOrder.orderId, { paymentMethod });
      }

      setDone(true);
      toast.success('주문이 완료되었습니다!');

      // 장바구니 비우기
      await cartApi.clearCart().catch(() => null);

      setTimeout(() => navigate('/orders'), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : '주문에 실패했습니다.';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[480px] gap-5 text-center"
      >
        <CheckCircle2 size={72} className="text-green-500" />
        <h2 className="text-2xl font-bold text-gray-900">주문 완료!</h2>
        <p className="text-gray-500 text-sm">잠시 후 주문 내역 페이지로 이동합니다.</p>
      </motion.div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* 헤더 */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">주문/결제</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
        {/* 왼쪽 섹션 */}
        <div className="space-y-5">
          {/* 주문 상품 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-gray-900 mb-3">주문 상품 ({items.length}개)</h3>
            {items.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">장바구니가 비어있습니다.</p>
            ) : (
              items.map((item) => <OrderItemRow key={item.cartItemId} item={item} />)
            )}
          </section>

          {/* 배송지 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-indigo-500" />
                <h3 className="font-bold text-gray-900">배송지 정보</h3>
              </div>
              {savedAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddressPicker((v) => !v)}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:underline font-medium"
                >
                  저장된 배송지
                  <ChevronDown size={12} className={showAddressPicker ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>
              )}
            </div>

            {/* 저장된 배송지 선택 */}
            {showAddressPicker && savedAddresses.length > 0 && (
              <div className="mb-3 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                {savedAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      const full = [addr.address, addr.detailAddress].filter(Boolean).join(' ');
                      setAddress(full);
                      setShowAddressPicker(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                      selectedAddressId === addr.id
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold">{addr.recipientName}</span>
                      <span className="text-gray-400 text-xs">{addr.phone}</span>
                      {addr.isDefault && (
                        <span className="text-xs text-indigo-600 font-medium flex items-center gap-0.5">
                          <Star size={10} className="fill-indigo-600" />기본
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      ({addr.zipCode}) {addr.address}{addr.detailAddress ? ` ${addr.detailAddress}` : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}

            <textarea
              value={address}
              onChange={(e) => { setAddress(e.target.value); setSelectedAddressId(null); }}
              placeholder="배송받으실 주소를 입력해 주세요."
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              required
            />
            {savedAddresses.length === 0 && (
              <p className="mt-1.5 text-xs text-gray-400">
                배송지를 미리 저장하려면{' '}
                <button type="button" onClick={() => navigate('/settings')} className="text-indigo-500 hover:underline">
                  설정 &gt; 배송지 관리
                </button>
                에서 추가하세요.
              </p>
            )}
          </section>

          {/* 결제 수단 */}
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-indigo-500" />
              <h3 className="font-bold text-gray-900">결제 수단</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => {
                const selected = paymentMethod === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 text-sm font-medium transition-all ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={22} />
                    {label}
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* 오른쪽 요약 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5 lg:sticky lg:top-4"
        >
          <h3 className="font-bold text-gray-900 text-base">결제 요약</h3>
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
              <span>최종 결제금액</span>
              <span className="text-indigo-600 text-base">{total.toLocaleString()}원</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || items.length === 0}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors active:scale-[0.99] text-sm flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                결제 처리 중...
              </>
            ) : (
              `${total.toLocaleString()}원 결제하기`
            )}
          </button>
          <p className="text-xs text-gray-400 text-center leading-relaxed">
            주문 내용을 확인하였으며,<br />결제에 동의합니다.
          </p>
        </motion.div>
      </form>
    </div>
  );
}
