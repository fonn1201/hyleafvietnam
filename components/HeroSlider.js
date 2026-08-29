'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch('/api/slides?active=true')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setSlides(d.sort((a, b) => (a.order || 0) - (b.order || 0)));
        }
      })
      .catch((err) => console.error(err));
  }, []);

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
        <h1 className="text-3xl font-black mb-2">TINH HOA TRÀ OOLONG</h1>
        <p className="text-xs text-amber-100 mb-4">Đặc sản Trà Oolong Bảo Lộc nguyên chất</p>
        <Link href="/products" className="bg-[#FFFBF3] text-[#12412C] font-bold text-xs px-5 py-2.5 rounded-full w-fit">
          Khám Phá Ngay
        </Link>
      </div>
    );
  }

  const current = slides[currentIndex];

  return (
    <div className="relative w-full h-[320px] md:h-[360px] rounded-2xl overflow-hidden shadow-md group">
      <Link href={current.link || '/products'}>
        <img 
          src={current.image} 
          alt={current.title || "Banner"} 
          className="w-full h-full object-cover transition-all duration-700" 
        />
        {current.title && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-6 flex flex-col justify-end">
            <h2 className="text-white text-xl md:text-2xl font-bold">{current.title}</h2>
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
              className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-[#FFFBF3] w-6' : 'bg-white/50'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}