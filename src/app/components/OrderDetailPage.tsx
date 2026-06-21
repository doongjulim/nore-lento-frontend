import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Package,
  MapPin,
  Truck,
  CreditCard,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { orderApi, paymentApi } from '@/app/api';
import type {
  FindOrderDetailResponse,
  FindPaymentResponse,
  OrderStatus,
  PaymentStatus,
  DeliveryStatus,
} from '@/app/api';

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: '결제 대기',
  PAID: '결제 완료',
  SHIPPING: '배송 중',
  DELIVERED: '배송 완료',
  CANCELLED: '취소됨',
};

const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  PAID: 'bg-blue-50 text-blue-700 border-blue-200',
  SHIPPING: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  DELIVERED: 'bg-green-50 text-green-700 border-green-200',
  CANCELLED: 'bg-gray-50 text-gray-500 border-gray-200',
};

const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  PENDING: '결제 대기',
  COMPLETED: '결제 완료',
  FAILED: '결제 실패',
  REFUNDED: '환불 완료',
};

const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  PREPARING: '배송 준비 중',
  SHIPPED: '배송 중',
  DELIVERED: '배송 완료',
  RETURNED: '반품',
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<FindOrderDetailResponse | null>(null);
  const [payment, setPayment] = useState<FindPaymentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    if (!id) return;
    const orderId = Number(id);
    setLoading(true);
    setError(null);

    Promise.all([
      orderApi.findOrderDetail(orderId),
      paymentApi.findPayments({ page: 0, size: 50 }).then((p) =>
        p.content.find((pay) => pay.orderId === orderId) ?? null,
      ),
    ])
      .then(([orderData, paymentData]) => {
        setOrder(orderData);
        setPayment(paymentData);
      })
      .catch(() => setError('주문 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    if (!order || !window.confirm('주문을 취소하시겠습니까?')) return;
    setCancelling(true);
    try {
      await orderApi.cancelOrder(order.orderId);
      setOrder((prev) => prev ? { ...prev, status: 'CANCELLED' } : prev);
      toast.success('주문이 취소되었습니다.');
    } catch {
      toast.error('주문 취소에 실패했습니다.');
    } finally {
      setCancelling(false);
    }
  }

  async function handleRefund() {
    if (!payment || !window.confirm('환불을 신청하시겠습니까?')) return;
    setRefunding(true);
    try {
      await paymentApi.refundPayment(payment.paymentId);
      setPayment((prev) => prev ? { ...prev, status: 'REFUNDED' } : prev);
      toast.success('환불 신청이 완료되었습니다.');
    } catch {
      toast.error('환불 신청에 실패했습니다.');
    } finally {
      setRefunding(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle size={40} className="text-gray-300" />
        <p className="text-gray-500">{error ?? '주문을 찾을 수 없습니다.'}</p>
        <button onClick={() => navigate('/orders')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
          주문 목록으로
        </button>
      </div>
    );
  }

  const canCancel = order.status === 'PENDING' || order.status === 'PAID';
  const canRefund = payment?.status === 'COMPLETED' && order.status === 'DELIVERED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto pb-12 space-y-5"
    >
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/orders')} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">주문 상세</h2>
          <p className="text-sm text-gray-500 mt-0.5">주문번호 #{order.orderId}</p>
        </div>
        <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full border ${ORDER_STATUS_COLOR[order.status]}`}>
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </div>

      {/* 주문 상품 */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package size={16} className="text-indigo-500" />
          <h3 className="font-bold text-gray-900">주문 상품</h3>
        </div>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.orderItemId} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
              <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Package size={16} className="text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                <p className="text-xs text-gray-500">{item.priceSnapshot.toLocaleString()}원 × {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {item.totalPrice.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-bold text-gray-900">
          <span>합계</span>
          <span className="text-indigo-600">{order.totalPrice.toLocaleString()}원</span>
        </div>
      </section>

      {/* 배송 정보 */}
      {order.delivery && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Truck size={16} className="text-indigo-500" />
            <h3 className="font-bold text-gray-900">배송 정보</h3>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-20 text-gray-500 flex-shrink-0">배송 상태</dt>
              <dd className="font-medium text-gray-900">{DELIVERY_STATUS_LABEL[order.delivery.status]}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-20 text-gray-500 flex-shrink-0">배송지</dt>
              <dd className="font-medium text-gray-900">{order.delivery.address}</dd>
            </div>
            {order.delivery.trackingNumber && (
              <div className="flex gap-2">
                <dt className="w-20 text-gray-500 flex-shrink-0">운송장</dt>
                <dd className="font-medium text-gray-900">{order.delivery.trackingNumber}</dd>
              </div>
            )}
          </dl>
        </section>
      )}

      {/* 배송지 (delivery 없을 때 주소 표시 생략 – 필요 시 추가) */}
      {!order.delivery && order.status !== 'CANCELLED' && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-indigo-500" />
            <h3 className="font-bold text-gray-900">배송 준비 중</h3>
          </div>
          <p className="text-sm text-gray-500 mt-2">배송 정보가 아직 등록되지 않았습니다.</p>
        </section>
      )}

      {/* 결제 정보 */}
      {payment && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-indigo-500" />
            <h3 className="font-bold text-gray-900">결제 정보</h3>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="w-24 text-gray-500 flex-shrink-0">결제 상태</dt>
              <dd className="font-medium text-gray-900">{PAYMENT_STATUS_LABEL[payment.status]}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 text-gray-500 flex-shrink-0">결제 수단</dt>
              <dd className="font-medium text-gray-900">
                {{ CARD: '신용카드', BANK_TRANSFER: '계좌이체', VIRTUAL_ACCOUNT: '가상계좌' }[payment.method]}
              </dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 text-gray-500 flex-shrink-0">결제 금액</dt>
              <dd className="font-bold text-indigo-600">{payment.amount.toLocaleString()}원</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-24 text-gray-500 flex-shrink-0">결제 일시</dt>
              <dd className="font-medium text-gray-900">
                {new Date(payment.createAt).toLocaleString('ko-KR')}
              </dd>
            </div>
          </dl>
        </section>
      )}

      {/* 액션 버튼 */}
      {(canCancel || canRefund) && (
        <div className="flex gap-3">
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex-1 py-3 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {cancelling ? <Loader2 size={15} className="animate-spin" /> : null}
              주문 취소
            </button>
          )}
          {canRefund && (
            <button
              onClick={handleRefund}
              disabled={refunding}
              className="flex-1 py-3 border-2 border-orange-200 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {refunding ? <Loader2 size={15} className="animate-spin" /> : null}
              환불 신청
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
