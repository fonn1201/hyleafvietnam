'use client';

import React, { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [resProd, resCat] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);
        const dataProd = await resProd.json();
        const dataCat = await resCat.json();
        setStats({
          products: Array.isArray(dataProd) ? dataProd.length : 0,
          categories: Array.isArray(dataCat) ? dataCat.length : 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-[#003B46] uppercase mb-2">Trang Tổng Quan Quản Trị</h1>
        <p className="text-sm text-gray-600">
          Chào mừng bạn quay trở lại hệ thống quản lý. Vui lòng chọn các chức năng ở thanh menu bên trái để bắt đầu làm việc.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Tổng số sản phẩm</p>
            <h2 className="text-3xl font-extrabold text-[#003B46] mt-1">
              {loading ? '...' : stats.products}
            </h2>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xl font-bold">
            📦
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Tổng số danh mục</p>
            <h2 className="text-3xl font-extrabold text-[#003B46] mt-1">
              {loading ? '...' : stats.categories}
            </h2>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold">
            📁
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase">Trạng thái hệ thống</p>
            <h2 className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Hoạt động ổn định
            </h2>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl font-bold">
            ⚡
          </div>
        </div>
      </div>
    </div>
  );
}