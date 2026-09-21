'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'hyleaf_cart';

function readInitialCart() {
  // Chạy trong lazy initializer của useState, không phải trong effect ->
  // tránh lỗi lint 'setState trong effect'. Trên server (SSR) window chưa
  // tồn tại nên trả về mảng rỗng; khi hydrate ở client sẽ đọc đúng giá trị
  // đã lưu ngay trong lần render đầu tiên phía client, không cần chờ effect.
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Không đọc được giỏ hàng đã lưu:', err);
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readInitialCart);

  // Lưu lại localStorage mỗi khi giỏ hàng thay đổi (đây chỉ là ghi ra hệ
  // thống bên ngoài, không setState, nên không vi phạm quy tắc lint)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Không lưu được giỏ hàng:', err);
    }
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id ? { ...it, quantity: it.quantity + quantity } : it
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          slug: product.slug,
          code: product.code,
          name: product.name,
          price: Number(product.price) || 0,
          image: product.image || null,
          quantity,
        },
      ];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((prev) => prev.map((it) => (it.productId === productId ? { ...it, quantity } : it)));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, it) => sum + it.quantity, 0);
  const totalAmount = items.reduce((sum, it) => sum + it.price * it.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart phải dùng bên trong <CartProvider>');
  return ctx;
}
