'use client';

import React from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

export default function ProductBlock({ 
  title, 
  subtitle, 
  products = [], 
  isDarkBg = false, 
  bannerImg, 
  viewAllLink = "/products",
  isOnlineSales = false // Nhận prop từ cha
}) {
  if (!products || products.length === 0) return null;

  const bgStyle = isDarkBg ? 'bg-[#12412C] text-[#FFFBF3]' : 'bg-[#FFFBF3] text-[#12412C]';
  const cardBgStyle = isDarkBg ? 'bg-[#FFFBF3] text-[#12412C]' : 'bg-white text-[#12412C] border border-[#12412C]/10';

  return (
    <section className={`py-12 px-4 border-b border-[#12412C]/10 ${bgStyle}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold uppercase tracking-wide">{title}</h2>
            {subtitle && <p className={`text-xs mt-1 ${isDarkBg ? 'text-amber-100' : 'text-gray-600'}`}>{subtitle}</p>}
          </div>
          <Link href={viewAllLink} className={`text-xs font-bold underline ${isDarkBg ? 'hover:text-amber-200' : 'hover:text-emerald-700'}`}>
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {bannerImg && (
            <div className="lg:col-span-1 rounded-2xl overflow-hidden shadow-md hidden lg:block relative min-h-[320px]">
              <img src={bannerImg} alt={title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${bannerImg ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
            {products.map((item) => (
              <Link 
                key={item.id} 
                href={`/products/${item.slug}`} 
                className={`rounded-2xl p-4 shadow-sm hover:shadow-xl transition flex flex-col justify-between group ${cardBgStyle}`}
              >
                <div>
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3">
                    <img 
                      src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                    />
                  </div>
                  <span className="text-[10px] font-mono text-[#12412C] font-bold block mb-1">Mã: {item.code}</span>
                  <h3 className="font-bold text-sm line-clamp-2 leading-tight">{item.name}</h3>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[#D9381E] font-extrabold text-sm">
                    {formatPrice(item.price, isOnlineSales)}
                  </span>
                  <span className="text-[11px] bg-[#12412C] text-[#FFFBF3] font-semibold px-2.5 py-1 rounded-lg">
                    Chi tiết
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}