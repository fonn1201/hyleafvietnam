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

  // Tự động xóa trắng từ khóa, đóng gợi ý và đóng menu mobile mỗi khi chuyển trang.
  // Dùng pattern "điều chỉnh state khi prop thay đổi" ngay trong lúc render
  // (theo khuyến nghị chính thức của React) thay vì trong useEffect, để tránh
  // một vòng render + effect thừa và lỗi lint "setState trong effect".
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setSearchQuery('');
    setSuggestions([]);
    setIsOpen(false);
    setIsMobileMenuOpen(false);
  }

  // Lọc danh sách gợi ý khi gõ từ khóa — tìm kiếm được lọc ngay tại server
  // (xem app/api/products/route.js), chỉ giới hạn 6 gợi ý mỗi lần gõ.
  useEffect(() => {
    const controller = new AbortController();

    const fetchSuggestions = async () => {
      if (!searchQuery.trim()) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=6`,
          { signal: controller.signal }
        );
        const products = await res.json();
        setSuggestions(Array.isArray(products) ? products : []);
        setIsOpen(true);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Lỗi gợi ý tìm kiếm:', error);
        }
      }
    };

    const delayDebounce = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(delayDebounce);
      controller.abort();
    };
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
            <div className="relative flex-1 max-w-sm" ref={searchRef}>
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

              {/* Khung gợi ý sản phẩm hiển thị phía dưới — chiều rộng cố định để
                  không bị bóp méo theo ô tìm kiếm (vốn khá hẹp) */}
              {isOpen && suggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-80 max-w-[90vw] bg-[#FFFBF3] text-[#12412C] rounded-xl shadow-2xl border border-[#12412C]/10 max-h-96 overflow-y-auto z-50">
                  {suggestions.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex flex-row items-center gap-3 px-3.5 py-2.5 hover:bg-amber-100/60 border-b border-gray-100 last:border-none transition"
                    >
                      <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        {product.image ? (
                          <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">Ảnh</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
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
                <div className="absolute left-0 top-full mt-2 w-80 max-w-[90vw] bg-[#FFFBF3] text-[#12412C] rounded-xl shadow-2xl border border-[#12412C]/10 p-3 text-center text-sm text-gray-600 z-50">
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