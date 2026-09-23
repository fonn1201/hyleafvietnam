'use client';

import React, { useState } from 'react';
import WithPermission from '@/components/WithPermission';

export default function CustomersManager({ initialCustomers = [], userPermissions = [] }) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const qs = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      const res = await fetch(`/api/admin/customers${qs}`);
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <WithPermission permission="orders" userPermissions={userPermissions}>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-[#003B46] uppercase">Khách Hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Danh sách khách hàng đã từng đặt hàng, tự động ghi nhận theo số điện thoại.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-3">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Đang tìm...' : 'Tìm kiếm'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase">
                <th className="p-4">Họ tên</th>
                <th className="p-4">Số điện thoại</th>
                <th className="p-4">Email</th>
                <th className="p-4">Địa chỉ</th>
                <th className="p-4 text-center">Số đơn</th>
                <th className="p-4 text-right">Tổng chi tiêu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {customers.length === 0 ? (
                <tr><td colSpan={6} className="p-6 text-center text-gray-400">Chưa có khách hàng nào.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4 font-semibold text-gray-800">{c.name}</td>
                    <td className="p-4 font-mono text-gray-600">{c.phone}</td>
                    <td className="p-4 text-gray-600">{c.email || '—'}</td>
                    <td className="p-4 text-gray-500 max-w-xs truncate">{c.address || '—'}</td>
                    <td className="p-4 text-center font-bold text-gray-700">{c.orderCount}</td>
                    <td className="p-4 text-right font-bold text-[#12412C]">{c.totalSpent.toLocaleString('vi-VN')} đ</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </WithPermission>
  );
}
