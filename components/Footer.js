'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Footer() {
  const [settings, setSettings] = useState({
    siteName: 'MY BRAND',
    hotline: '0900000000',
    address: 'Hà Nội, Việt Nam',
    zaloUrl: 'https://zalo.me',
    fanpage: 'https://facebook.com',
  });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => data && data.siteName && setSettings(data));
  }, []);

  return (
    <footer className="bg-[#12412C] text-[#FFFBF3] pt-12 pb-8 border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-3">{settings.siteName}</h3>
          <p className="text-sm text-gray-400 leading-relaxed mb-4">
            Chuyên cung cấp các sản phẩm chất lượng cao, tư vấn tận tình, giao hàng toàn quốc.
          </p>
          <p className="text-sm">📍 <strong>Địa chỉ:</strong> {settings.address}</p>
          <p className="text-sm mt-1">📞 <strong>Hotline:</strong> <a href={`tel:${settings.hotline}`} className="text-blue-400 font-bold">{settings.hotline}</a></p>
        </div>
        <div>
          <h4 className="text-base font-bold text-white uppercase tracking-wider mb-3">Liên Kết Nhanh</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:text-white transition">Trang Chủ</Link></li>
            <li><Link href="/products" className="hover:text-white transition">Tất Cả Sản Phẩm</Link></li>
            <li><Link href="/posts" className="hover:text-white transition">Tin Tức & Kinh Nghiệm</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-base font-bold text-white uppercase tracking-wider mb-3">Tư Vấn & Hỗ Trợ</h4>
          <div className="space-y-2">
            <a href={settings.zaloUrl} target="_blank" rel="noreferrer" className="block w-full bg-[#FFFBF3] hover:bg-[#E1E8C2] text-[#12412C] font-bold text-sm py-2.5 px-4 rounded text-center transition">
              Nhắn Tin Qua Zalo
            </a>
            <a href={settings.fanpage} target="_blank" rel="noreferrer" className="block w-full bg-[#FFFBF3] hover:bg-[#E1E8C2] text-[#12412C] font-bold text-sm py-2.5 px-4 rounded text-center transition">
              Theo Dõi Fanpage Facebook
            </a>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} {settings.siteName}. All rights reserved.
      </div>
    </footer>
  );
}