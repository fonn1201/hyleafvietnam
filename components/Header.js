'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCategories(d));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-[#12412C] text-[#FFFBF3] sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-1 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.png" 
                alt="HYLEAF" 
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105" 
              />
            </Link>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-[#FFFBF3]">
              ☰
            </button>
          </div>

          <div className="hidden md:flex md:col-span-3 items-center justify-between gap-4">
            <form onSubmit={handleSearch} className="relative flex-1 max-w-xs">
              <input
                type="text"
                placeholder="Tìm kiếm trà..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFFBF3] text-[#12412C] placeholder-gray-500 text-xs rounded-full py-2 pl-4 pr-9 focus:outline-none focus:ring-2 focus:ring-amber-300"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#12412C]">
                🔍
              </button>
            </form>

            <nav className="flex items-center space-x-5 text-xs font-bold uppercase tracking-wider">
              <Link href="/" className="hover:text-amber-200 transition">Trang Chủ</Link>
              <div className="relative group py-2">
                <Link href="/products" className="hover:text-amber-200 transition">Sản Phẩm ▾</Link>
                {categories.length > 0 && (
                  <div className="absolute top-full left-0 hidden group-hover:block bg-[#FFFBF3] text-[#12412C] shadow-xl rounded-xl py-2 w-48 border border-[#12412C]/10 normal-case">
                    {categories.map((cat) => (
                      <Link key={cat.slug} href={`/categories/${cat.slug}`} className="block px-4 py-2 text-xs font-bold hover:bg-[#12412C] hover:text-[#FFFBF3]">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link href="/news" className="hover:text-amber-200 transition">Tin Tức Shop</Link>
              <Link href="/posts" className="hover:text-amber-200 transition">Góc Thưởng Trà</Link>
              <Link href="/#about" className="hover:text-amber-200 transition">Giới Thiệu</Link>
            </nav>

            <a href="https://zalo.me" target="_blank" rel="noreferrer" className="bg-[#FFFBF3] text-[#12412C] font-bold text-xs px-4 py-2 rounded-full shadow hover:bg-amber-100 transition">
              💬 Chat Zalo
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}