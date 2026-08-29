'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [settings, setSettings] = useState({ hotline: '0900000000', zaloUrl: 'https://zalo.me', isOnlineSales: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${params.code}`)
      .then(async (res) => {
        // Kiểm tra xem phản hồi có phải là JSON không trước khi parse
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          return res.json();
        }
        throw new Error("Phản hồi không phải là JSON");
      })
      .then((data) => {
        if (data && !data.error) setProduct(data);
      })
      .catch((err) => {
        console.error("Lỗi khi tải sản phẩm:", err);
        setProduct(null);
      })
      .finally(() => setLoading(false));

    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => data && setSettings(data));
  }, [params.code]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">Đang tải sản phẩm...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-sm text-red-500">Sản phẩm không tồn tại hoặc đã bị ẩn.</div>;

  const cleanPhone = settings.hotline.replace(/\D/g, '');
  const zaloMessage = encodeURIComponent(`Chào shop, tôi muốn hỏi mua sản phẩm: ${product.name} (Mã: ${product.code})`);
  const zaloLink = `https://zalo.me/${cleanPhone}?text=${zaloMessage}`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      {/* Header đơn giản */}
      <header className="bg-white border-b py-4 px-6 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <a href="/" className="text-sm font-bold text-blue-600">← Quay lại trang chủ</a>
          <span className="text-xs font-mono font-bold bg-gray-100 px-3 py-1 rounded-full">Mã SP: {product.code}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ảnh SP */}
          <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border">
            <img src={product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Thông tin SP */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.categories?.map((c) => (
                  <span key={c.id} className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                    {c.name}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                <span className="text-xs text-red-500 block font-semibold mb-1">Giá bán:</span>
                <span className="text-2xl font-black text-red-600">
                  {formatPrice(product.price, settings.isOnlineSales)}
                </span>
              </div>

              {/* Mô tả chi tiết sản phẩm */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2 border-b pb-1">Mô tả sản phẩm</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
                </p>
              </div>
            </div>

            {/* Các nút tương tác */}
            <div className="space-y-3 pt-4 border-t">
              <a
                href={zaloLink}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-center block shadow-md transition"
              >
                💬 Nhắn Zalo Đặt Hàng Ngay
              </a>
              <a
                href={`tel:${settings.hotline}`}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl text-center block transition text-sm"
              >
                📞 Gọi Hotline: {settings.hotline}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}