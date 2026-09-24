import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import AddToCartButton from './AddToCartButton';

// Component hiển thị 1 khối sản phẩm trên trang chủ (VD: "Sản Phẩm Bán Chạy",
// "Giải Pháp & Quà Tặng"). Không cần 'use client' vì không dùng state/effect
// -> có thể render ngay ở server, nhẹ hơn cho trang chủ.
export default function ProductBlock({
  title,
  subtitle,
  products = [],
  isDarkBg = false,
  bannerImg,
  viewAllLink = "/products",
  isOnlineSales = false,
}) {
  if (!products || products.length === 0) return null;

  const bgStyle = isDarkBg ? 'bg-[#12412C] text-[#FFFBF3]' : 'bg-[#FFFBF3] text-[#12412C]';
  const cardBgStyle = isDarkBg ? 'bg-[#FFFBF3] text-[#12412C]' : 'bg-white text-[#12412C] border border-[#12412C]/10';

  return (
    <section className={`py-12 px-4 border-b border-[#12412C]/10 rounded-2xl ${bgStyle}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wide">{title}</h2>
            {subtitle && <p className={`text-sm mt-1 ${isDarkBg ? 'text-amber-100' : 'text-gray-600'}`}>{subtitle}</p>}
          </div>
          <Link href={viewAllLink} className={`text-sm font-bold underline shrink-0 self-start sm:self-auto ${isDarkBg ? 'hover:text-amber-200' : 'hover:text-emerald-700'}`}>
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {bannerImg && (
            <div className="lg:col-span-1 rounded-2xl overflow-hidden shadow-md hidden lg:block relative min-h-[320px]">
              <Image src={bannerImg} alt={title} fill sizes="25vw" className="object-cover" />
            </div>
          )}

          <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${bannerImg ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {products.map((item, index) => (
              <Link
                key={item.id}
                href={`/products/${item.slug}`}
                className={`rounded-2xl p-4 shadow-sm hover:shadow-xl transition flex flex-col justify-between group ${cardBgStyle}`}
              >
                <div>
                  <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
                    <Image
                      src={item.image || '/placeholder.jpg'}
                      alt={item.name}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <span className="text-xs font-mono text-[#12412C] font-bold block mb-1">Mã: {item.code}</span>
                  <h3 className="font-bold text-sm line-clamp-2 leading-tight">{item.name}</h3>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                  <span className="text-[#D9381E] font-extrabold text-sm block">
                    {formatPrice(item.price, isOnlineSales)}
                  </span>
                  {isOnlineSales && (
                    <AddToCartButton
                      product={item}
                      className="w-full text-center text-xs bg-[#12412C] text-[#FFFBF3] font-semibold px-2.5 py-1.5 rounded-lg hover:bg-emerald-900 transition"
                    />
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
