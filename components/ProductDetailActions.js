'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartProvider';

export default function ProductDetailActions({ product, isOnlineSales }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const canOrder = isOnlineSales && (product.stock ?? 0) > 0;
  const outOfStock = isOnlineSales && (product.stock ?? 0) <= 0;

  const handleAddToCart = () => {
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push('/checkout');
  };

  if (!isOnlineSales) {
    // Chưa mở bán online -> không hiển thị giỏ hàng, chỉ liên hệ (đã có
    // nút Zalo/hotline riêng bên dưới component này)
    return null;
  }

  return (
    <div className="space-y-3">
      {outOfStock ? (
        <div className="bg-gray-100 text-gray-500 font-bold text-center py-3 rounded-xl text-sm">
          Sản phẩm tạm hết hàng
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-gray-600">Số lượng:</span>
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Giảm số lượng"
              >
                −
              </button>
              <span className="w-10 text-center text-sm font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-50"
                aria-label="Tăng số lượng"
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className={`w-full font-bold py-3 rounded-xl text-center transition text-sm ${
                justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border-2 border-[#12412C] text-[#12412C] hover:bg-[#12412C]/5'
              }`}
            >
              {justAdded ? '✓ Đã thêm vào giỏ' : '🛒 Thêm vào giỏ'}
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              className="w-full bg-[#12412C] hover:bg-emerald-900 text-white font-bold py-3 rounded-xl text-center transition text-sm"
            >
              Mua Ngay
            </button>
          </div>
        </>
      )}
    </div>
  );
}
