'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HeroSlider({ slides = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides]);

  if (slides.length === 0) {
    return (
      <div className="bg-[#12412C] text-[#FFFBF3] rounded-2xl p-8 min-h-[320px] flex flex-col justify-center">
        <h1 className="text-3xl md:text-4xl font-black mb-2">TINH HOA TRÀ OOLONG</h1>
        <p className="text-sm text-amber-100 mb-4">Đặc sản Trà Oolong Bảo Lộc nguyên chất</p>
        <Link href="/products" className="bg-[#FFFBF3] text-[#12412C] font-bold text-sm px-5 py-2.5 rounded-full w-fit">
          Khám Phá Ngay
        </Link>
      </div>
    );
  }

  const current = slides[currentIndex];

  return (
    <div className="relative w-full h-[320px] md:h-[360px] rounded-2xl overflow-hidden shadow-md group">
      <Link href={current.link || '/products'}>
        <Image
          src={current.image}
          alt={current.title || "Banner"}
          fill
          priority={currentIndex === 0}
          sizes="(min-width: 768px) 75vw, 100vw"
          className="object-cover transition-all duration-700"
        />
        {current.title && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-6 flex flex-col justify-end">
            <h2 className="text-white text-2xl md:text-3xl font-bold">{current.title}</h2>
          </div>
        )}
      </Link>

      {/* Dấu chấm chuyển slide */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Chuyển đến banner ${idx + 1}`}
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-[#FFFBF3] w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
