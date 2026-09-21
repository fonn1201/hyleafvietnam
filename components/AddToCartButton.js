'use client';

import React, { useState } from 'react';
import { useCart } from './CartProvider';

export default function AddToCartButton({ product, quantity = 1, className = '', fullLabel = false }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={
        className ||
        `text-sm font-bold px-3.5 py-1.5 rounded-full transition ${
          justAdded
            ? 'bg-emerald-600 text-white'
            : 'bg-white text-[#12412C] border border-[#12412C]/20 hover:bg-[#12412C]/5'
        }`
      }
    >
      {justAdded ? '✓ Đã thêm' : fullLabel ? 'Thêm vào giỏ hàng' : '🛒 Thêm giỏ'}
    </button>
  );
}
