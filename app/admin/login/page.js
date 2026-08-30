'use client';

import React, { useState } from 'react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {}

      if (res.ok) {
        // Dùng window.location.href để ép trình duyệt tải lại hoàn toàn, 
        // giúp cập nhật chính xác thông tin user mới đăng nhập ở thanh menu bên trái
        window.location.href = '/admin';
      } else {
        setError(data.error || 'Đăng nhập thất bại, vui lòng kiểm tra lại thông tin!');
        setSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối mạng hoặc server không phản hồi!');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-blue-50 text-[#003B46] rounded-2xl mb-3 text-xl">
            🔒
          </div>
          <h1 className="text-2xl font-black text-[#003B46] tracking-tight uppercase">Admin Portal</h1>
          <p className="text-xs text-gray-500 mt-1">Đăng nhập hệ thống quản trị nội dung</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3.5 rounded-xl mb-6 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">Email quản trị</label>
            <input
              type="email"
              required
              placeholder="Nhập email (ví dụ: admin@gmail.com)..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#003B46] transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 block mb-1.5 uppercase tracking-wider">Mật khẩu</label>
            <input
              type="password"
              required
              placeholder="Nhập mật khẩu..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 bg-gray-50/50 p-3.5 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#003B46] transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#003B46] hover:bg-opacity-90 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#003B46]/20 disabled:opacity-50 cursor-pointer mt-2"
          >
            {submitting ? 'Đang xác thực hệ thống...' : 'Đăng Nhập'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 pt-4">
          <a href="/" className="text-xs font-semibold text-gray-400 hover:text-gray-600 transition">
            ← Quay lại trang chủ website
          </a>
        </div>
      </div>
    </div>
  );
}