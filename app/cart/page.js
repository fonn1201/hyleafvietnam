'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalAmount } = useCart();
  const router = useRouter();
  const [isOnlineSales, setIsOnlineSales] = useState(null); // null = đang tải

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => setIsOnlineSales(!!d?.isOnlineSales));
  }, []);

  if (isOnlineSales === false) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <h1 className="text-xl font-bold text-[#12412C] mb-2">Website hiện chưa mở bán online</h1>
        <p className="text-sm text-gray-500 mb-6">
          Vui lòng liên hệ trực tiếp qua Zalo hoặc hotline để được tư vấn và đặt hàng.
        </p>
        <Link href="/" className="bg-[#12412C] text-[#FFFBF3] font-bold text-sm px-6 py-3 rounded-full inline-block">
          Về Trang Chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-[#12412C] uppercase mb-6">Giỏ Hàng Của Bạn</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#12412C]/10 shadow-sm">
          <div className="text-5xl mb-4">🛒</div>
          <p className="text-gray-500 text-base mb-4">Giỏ hàng của bạn đang trống.</p>
          <Link href="/products" className="bg-[#12412C] text-[#FFFBF3] text-sm font-bold px-5 py-2.5 rounded-full inline-block">
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#12412C]/10 shadow-sm divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 p-4">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.slug}`} className="font-bold text-sm text-gray-800 hover:underline line-clamp-1">
                    {item.name}
                  </Link>
                  <p className="text-sm text-gray-500">Mã: {item.code}</p>
                  <p className="text-sm font-bold text-[#12412C] mt-1">{item.price.toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="flex items-center border border-gray-200 rounded-lg flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="text-red-500 hover:text-red-700 text-sm font-bold flex-shrink-0"
                  aria-label="Xóa sản phẩm"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-2xl border border-[#12412C]/10 shadow-sm p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tổng cộng ({items.reduce((s, it) => s + it.quantity, 0)} sản phẩm)</p>
              <p className="text-xl font-black text-[#12412C]">{totalAmount.toLocaleString('vi-VN')} đ</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/checkout')}
              className="bg-[#12412C] hover:bg-emerald-900 text-[#FFFBF3] font-bold px-6 py-3 rounded-full transition text-sm"
            >
              Tiến Hành Đặt Hàng →
            </button>
          </div>

          <Link href="/products" className="text-sm text-[#12412C] font-bold hover:underline inline-block">
            ← Tiếp tục mua sắm
          </Link>
        </div>
      )}
    </div>
  );
}
