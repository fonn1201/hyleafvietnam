'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';
import { PAYMENT_METHODS } from '@/lib/orderStatus';

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const router = useRouter();

  const [isOnlineSales, setIsOnlineSales] = useState(null);
  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    note: '',
    paymentMethod: 'cod',
    website: '', // honeypot - trường ẩn, người dùng thật không điền
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setIsOnlineSales(!!d?.isOnlineSales));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Giỏ hàng đang trống.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          items: items.map((it) => ({ productId: it.productId, quantity: it.quantity, name: it.name })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Đặt hàng thất bại, vui lòng thử lại.');
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/tra-cuu-don-hang?code=${encodeURIComponent(data.orderCode)}&phone=${encodeURIComponent(form.customerPhone.replace(/\D/g, ''))}`);
    } catch (err) {
      setError('Không kết nối được tới server, vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  if (isOnlineSales === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#12412C] mb-2">Website hiện chưa mở bán online</h1>
        <p className="text-sm text-gray-500 mb-6">Vui lòng liên hệ trực tiếp qua Zalo hoặc hotline để được tư vấn và đặt hàng.</p>
        <Link href="/" className="bg-[#12412C] text-[#FFFBF3] font-bold text-sm px-6 py-3 rounded-full inline-block">Về Trang Chủ</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-bold text-[#12412C] mb-2">Giỏ hàng đang trống</h1>
        <p className="text-sm text-gray-500 mb-6">Hãy chọn thêm sản phẩm trước khi đặt hàng nhé.</p>
        <Link href="/products" className="bg-[#12412C] text-[#FFFBF3] font-bold text-sm px-6 py-3 rounded-full inline-block">Xem Sản Phẩm</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-[#12412C] uppercase mb-6">Thông Tin Đặt Hàng</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-3 bg-white rounded-2xl border border-[#12412C]/10 shadow-sm p-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3 text-sm font-medium">{error}</div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Họ và tên *</label>
            <input
              type="text"
              required
              value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#12412C]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Số điện thoại *</label>
            <input
              type="tel"
              required
              value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#12412C]"
            />
            <p className="text-sm text-gray-400 mt-1">Dùng để tra cứu đơn hàng sau này, vui lòng nhập chính xác.</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Email (không bắt buộc)</label>
            <input
              type="email"
              value={form.customerEmail}
              onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#12412C]"
              placeholder="Nhận email xác nhận đơn hàng (nếu có)"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Địa chỉ nhận hàng *</label>
            <textarea
              required
              rows={2}
              value={form.customerAddress}
              onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#12412C]"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-1">Ghi chú đơn hàng</label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-[#12412C]"
              placeholder="Ví dụ: giao giờ hành chính, gọi trước khi giao..."
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2">Phương thức thanh toán *</label>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((pm) => (
                <label key={pm.value} className="flex items-center gap-2.5 border border-gray-200 rounded-xl p-3 cursor-pointer has-[:checked]:border-[#12412C] has-[:checked]:bg-[#12412C]/5">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={pm.value}
                    checked={form.paymentMethod === pm.value}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                  />
                  <span className="text-sm font-semibold text-gray-700">{pm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Honeypot chống bot - ẩn khỏi mắt người dùng thật nhưng bot tự
              động điền form thường vẫn điền vào */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="website">Website</label>
            <input
              type="text"
              id="website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#12412C] hover:bg-emerald-900 text-[#FFFBF3] font-bold py-3.5 rounded-xl transition text-sm disabled:opacity-50"
          >
            {submitting ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
          </button>
        </form>

        <div className="md:col-span-2 bg-white rounded-2xl border border-[#12412C]/10 shadow-sm p-5 h-fit">
          <h2 className="text-sm font-bold text-gray-700 uppercase mb-3">Đơn hàng của bạn</h2>
          <div className="space-y-3 mb-4">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.name} × {item.quantity}</span>
                <span className="font-bold text-gray-800">{(item.price * item.quantity).toLocaleString('vi-VN')} đ</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 flex justify-between items-center">
            <span className="text-sm font-bold text-gray-600">Tổng cộng</span>
            <span className="text-lg font-black text-[#12412C]">{totalAmount.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      </div>
    </div>
  );
}
