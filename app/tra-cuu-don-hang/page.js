'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { ORDER_STATUSES, getStatusInfo, getPaymentMethodLabel } from '@/lib/orderStatus';

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [code, setCode] = useState(initialCode);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(!!(initialCode && initialPhone));
  const [bankInfo, setBankInfo] = useState(null);
  const [justOrdered] = useState(!!initialCode && !!initialPhone);

  const lookupOrder = async (searchCode, searchPhone) => {
    if (!searchCode?.trim() || !searchPhone?.trim()) {
      setError('Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/lookup?code=${encodeURIComponent(searchCode.trim())}&phone=${encodeURIComponent(searchPhone.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Không tìm thấy đơn hàng.');
        setOrder(null);
        return;
      }
      setOrder(data.order);
    } catch (err) {
      setError('Không kết nối được tới server, vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Nếu đến từ trang checkout (có sẵn code + phone trên URL), tự động
  // tra cứu ngay. Gọi fetch trực tiếp bằng .then() ở đây (thay vì gọi hàm
  // lookupOrder dùng async/await) để setState chỉ xảy ra trong callback
  // của promise, không phải "trực tiếp" trong thân effect.
  useEffect(() => {
    if (!initialCode || !initialPhone) return;
    fetch(`/api/orders/lookup?code=${encodeURIComponent(initialCode.trim())}&phone=${encodeURIComponent(initialPhone.trim())}`)
      .then((res) => res.json().then((data) => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error || 'Không tìm thấy đơn hàng.');
          return;
        }
        setOrder(data.order);
      })
      .catch(() => setError('Không kết nối được tới server, vui lòng thử lại.'))
      .finally(() => setLoading(false));
  }, [initialCode, initialPhone]);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (d?.bankBin && d?.bankAccountNumber) {
          setBankInfo(d);
        }
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    lookupOrder(code, phone);
  };

  const statusIndex = order ? ORDER_STATUSES.findIndex((s) => s.value === order.status) : -1;
  const isCancelled = order?.status === 'cancelled';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-[#12412C] uppercase mb-2">Tra Cứu Đơn Hàng</h1>

      {justOrdered && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 mb-6 text-sm font-semibold">
          🎉 Đặt hàng thành công! Vui lòng lưu lại mã đơn hàng bên dưới để tra cứu sau này.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#12412C]/10 shadow-sm p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          type="text"
          placeholder="Mã đơn hàng (VD: HL20260921-003)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="sm:col-span-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#12412C]"
        />
        <input
          type="tel"
          placeholder="Số điện thoại đã đặt"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="sm:col-span-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#12412C]"
        />
        <button
          type="submit"
          disabled={loading}
          className="sm:col-span-1 bg-[#12412C] hover:bg-emerald-900 text-[#FFFBF3] font-bold rounded-xl text-sm transition disabled:opacity-50"
        >
          {loading ? 'Đang tra cứu...' : 'Tra Cứu'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-4 text-sm font-medium mb-6">{error}</div>
      )}

      {order && (
        <div className="space-y-5">
          {/* Trạng thái đơn hàng */}
          <div className="bg-white rounded-2xl border border-[#12412C]/10 shadow-sm p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500">Mã đơn hàng</p>
                <p className="text-lg font-black text-[#12412C]">{order.orderCode}</p>
              </div>
              <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${isCancelled ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                {getStatusInfo(order.status).label}
              </span>
            </div>

            {!isCancelled && (
              <div className="flex items-center justify-between">
                {ORDER_STATUSES.filter((s) => s.value !== 'cancelled').map((s, idx) => (
                  <React.Fragment key={s.value}>
                    <div className="flex flex-col items-center flex-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${idx <= statusIndex ? 'bg-[#12412C] text-[#FFFBF3]' : 'bg-gray-200 text-gray-400'}`}>
                        {idx + 1}
                      </div>
                      <span className={`text-[11px] mt-1 text-center ${idx <= statusIndex ? 'text-[#12412C] font-bold' : 'text-gray-400'}`}>{s.label}</span>
                    </div>
                    {idx < 3 && <div className={`h-0.5 flex-1 -mt-5 ${idx < statusIndex ? 'bg-[#12412C]' : 'bg-gray-200'}`} />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>

          {/* QR chuyển khoản nếu chọn bank_transfer và đơn chưa bị hủy */}
          {order.paymentMethod === 'bank_transfer' && !isCancelled && bankInfo && (
            <div className="bg-white rounded-2xl border border-[#12412C]/10 shadow-sm p-5 text-center">
              <h2 className="text-sm font-bold text-gray-700 uppercase mb-3">Quét mã để chuyển khoản</h2>
              <Image
                src={`https://img.vietqr.io/image/${bankInfo.bankBin}-${bankInfo.bankAccountNumber}-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(order.orderCode)}&accountName=${encodeURIComponent(bankInfo.bankAccountHolder || '')}`}
                alt="Mã QR chuyển khoản"
                width={280}
                height={380}
                unoptimized
                className="mx-auto rounded-xl border"
              />
              <p className="text-sm text-gray-600 mt-3">
                {bankInfo.bankName} - STK: <strong>{bankInfo.bankAccountNumber}</strong> - {bankInfo.bankAccountHolder}
              </p>
              <p className="text-sm text-gray-400 mt-1">Nội dung chuyển khoản: {order.orderCode}</p>
            </div>
          )}

          {/* Chi tiết sản phẩm */}
          <div className="bg-white rounded-2xl border border-[#12412C]/10 shadow-sm p-5">
            <h2 className="text-sm font-bold text-gray-700 uppercase mb-3">Chi tiết đơn hàng</h2>
            <div className="divide-y divide-gray-100">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 py-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image src={item.productImage || '/placeholder.jpg'} alt={item.productName} fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{item.productName}</p>
                    <p className="text-sm text-gray-500">SL: {item.quantity} × {item.price.toLocaleString('vi-VN')} đ</p>
                  </div>
                  <span className="text-sm font-bold text-[#12412C]">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 mt-2 flex justify-between items-center">
              <span className="text-sm font-bold text-gray-600">Tổng cộng</span>
              <span className="text-lg font-black text-[#12412C]">{order.totalAmount.toLocaleString('vi-VN')} đ</span>
            </div>
          </div>

          {/* Thông tin giao hàng */}
          <div className="bg-white rounded-2xl border border-[#12412C]/10 shadow-sm p-5 text-sm text-gray-600 space-y-1">
            <p><strong className="text-gray-800">Người nhận:</strong> {order.customerName} - {order.customerPhone}</p>
            <p><strong className="text-gray-800">Địa chỉ:</strong> {order.customerAddress}</p>
            {order.note && <p><strong className="text-gray-800">Ghi chú:</strong> {order.note}</p>}
            <p><strong className="text-gray-800">Thanh toán:</strong> {getPaymentMethodLabel(order.paymentMethod)}</p>
          </div>

          <Link href="/products" className="text-sm text-[#12412C] font-bold hover:underline inline-block">← Tiếp tục mua sắm</Link>
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-400">Đang tải...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
