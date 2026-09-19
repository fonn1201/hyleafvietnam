'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function Header() {
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => Array.isArray(d) && setCategories(d));
  }, []);

  // Tự động xóa trắng từ khóa, đóng gợi ý và đóng menu mobile mỗi khi chuyển trang
  useEffect(() => {
    setSearchQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Lọc danh sách gợi ý khi gõ từ khóa
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      try {
        const res = await fetch('/api/products');
        const products = await res.json();
        const term = searchQuery.trim();

        const removeAccents = (str) => {
          return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
        };
        const normalizedTerm = removeAccents(term).toLowerCase();

        // Lọc theo tên có dấu (hoặc không dấu tùy ý) và mã sản phẩm
        const filtered = products.filter((p) => {
          const matchName = p.name && removeAccents(p.name).toLowerCase().includes(normalizedTerm);
          const matchCode = p.code && p.code.toLowerCase().includes(term.toLowerCase());
          return matchName || matchCode;
        });

        setSuggestions(filtered);
        setIsOpen(true);
      } catch (error) {
        console.error('Lỗi gợi ý tìm kiếm:', error);
      }
    };

    const delayDebounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Đóng hộp gợi ý khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-[#12412C] text-[#FFFBF3] sticky top-0 z-50 shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div className="md:col-span-1 flex items-center justify-between md:justify-center">
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt="HYLEAF"
                width={160}
                height={56}
                priority
                className="h-12 md:h-14 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              className="md:hidden p-2 text-[#FFFBF3] text-2xl focus:outline-none"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          <div className="hidden md:flex md:col-span-3 items-center justify-between gap-4">
            {/* Thanh tìm kiếm có khung gợi ý */}
            <div className="relative flex-1 max-w-xs" ref={searchRef}>
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim() && suggestions.length > 0) setIsOpen(true);
                  }}
                  className="w-full bg-[#FFFBF3] text-[#12412C] placeholder-gray-500 text-sm rounded-full py-2.5 pl-4 pr-9 focus:outline-none focus:ring-2 focus:ring-amber-300"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#12412C]">
                  🔍
                </button>
              </form>

              {/* Khung gợi ý sản phẩm hiển thị phía dưới */}
              {isOpen && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-[#FFFBF3] text-[#12412C] rounded-xl shadow-2xl border border-[#12412C]/10 max-h-80 overflow-y-auto z-50">
                  {suggestions.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-amber-100/60 border-b border-gray-100 last:border-none transition"
                    >
                      {product.image ? (
                        <Image src={product.image} alt={product.name} width={40} height={40} className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-[11px] text-gray-500 flex-shrink-0">Ảnh</div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold text-[#12412C] truncate">{product.name}</p>
                        <p className="text-xs text-amber-800 font-semibold">
                          Mã: {product.code} - {Number(product.price).toLocaleString('vi-VN')} đ
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Thông báo khi không tìm thấy */}
              {isOpen && searchQuery.trim() !== '' && suggestions.length === 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-[#FFFBF3] text-[#12412C] rounded-xl shadow-2xl border border-[#12412C]/10 p-3 text-center text-sm text-gray-600 z-50">
                  Không tìm thấy sản phẩm phù hợp
                </div>
              )}
            </div>

            <nav className="flex items-center space-x-5 text-sm font-bold uppercase tracking-wider">
              <Link href="/" className="hover:text-amber-200 transition">Trang Chủ</Link>
              <div className="relative group py-2">
                <Link href="/products" className="hover:text-amber-200 transition">Sản Phẩm ▾</Link>
                {categories.length > 0 && (
                  <div className="absolute top-full left-0 hidden group-hover:block bg-[#FFFBF3] text-[#12412C] shadow-xl rounded-xl py-2 w-48 border border-[#12412C]/10 normal-case">
                    {categories.map((cat) => (
                      <Link key={cat.slug} href={`/categories/${cat.slug}`} className="block px-4 py-2 text-sm font-bold hover:bg-[#12412C] hover:text-[#FFFBF3]">
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

            <a href="https://zalo.me" target="_blank" rel="noreferrer" className="bg-[#FFFBF3] text-[#12412C] font-bold text-sm px-4 py-2.5 rounded-full shadow hover:bg-amber-100 transition">
              💬 Chat Zalo
            </a>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Hiển thị khi bấm icon ☰) */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-[#FFFBF3]/20 flex flex-col gap-3 pb-2">
            {/* Thanh tìm kiếm trên mobile */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFFBF3] text-[#12412C] placeholder-gray-500 text-sm rounded-full py-2.5 pl-4 pr-9 focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#12412C]">
                🔍
              </button>
            </form>

            <Link href="/" className="text-sm font-bold uppercase py-1 hover:text-amber-200">Trang Chủ</Link>
            <Link href="/products" className="text-sm font-bold uppercase py-1 hover:text-amber-200">Tất Cả Sản Phẩm</Link>
            
            {/* Danh mục trên mobile */}
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/categories/${cat.slug}`} className="text-sm pl-3 py-1 text-amber-200 hover:text-white">
                - {cat.name}
              </Link>
            ))}

            <Link href="/news" className="text-sm font-bold uppercase py-1 hover:text-amber-200">Tin Tức Shop</Link>
            <Link href="/posts" className="text-sm font-bold uppercase py-1 hover:text-amber-200">Góc Thưởng Trà</Link>
            <Link href="/#about" className="text-sm font-bold uppercase py-1 hover:text-amber-200">Giới Thiệu</Link>

            <a href="https://zalo.me" target="_blank" rel="noreferrer" className="bg-[#FFFBF3] text-[#12412C] font-bold text-sm px-4 py-2.5 rounded-full text-center shadow mt-1">
              💬 Chat Zalo
            </a>
          </div>
        )}
      </div>
    </header>
  );
}