'use client';

import React, { useState, useEffect } from 'react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    id: null,
    name: '',
    slug: '',
    description: '',
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Tự động tạo slug chuẩn từ tên danh mục nếu chưa có
    const generatedSlug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-');

    const payload = {
      ...formData,
      slug: formData.slug || generatedSlug,
    };

    const method = formData.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        // Phòng hờ response trả về không phải JSON
      }

      if (res.ok) {
        alert(formData.id ? 'Cập nhật danh mục thành công!' : 'Tạo danh mục mới thành công!');
        setFormData(initialForm);
        fetchCategories();
      } else {
        alert('Lỗi từ Server: ' + (data.error || data.message || res.statusText || 'Không rõ nguyên nhân'));
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối mạng hoặc server không phản hồi!');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      } else {
        alert('Không thể xóa danh mục này!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#003B46] uppercase">Quản Lý Danh Mục Sản Phẩm</h1>

      {/* FORM THÊM / SỬA DANH MỤC */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-4">
          {formData.id ? '✏️ CHỈNH SỬA DANH MỤC' : '➕ THÊM DANH MỤC MỚI'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Tên Danh Mục (*)</label>
            <input
              type="text"
              required
              className="w-full p-2.5 border rounded-xl text-sm"
              placeholder="Ví dụ: Trà Pha Chế, Trà Thưởng Thức..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Mô Tả Danh Mục</label>
            <textarea
              rows={3}
              className="w-full p-2.5 border rounded-xl text-sm"
              placeholder="Mô tả danh mục sản phẩm..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#003B46] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : formData.id ? 'Cập Nhật Danh Mục' : 'Tạo Danh Mục'}
            </button>
            {formData.id && (
              <button
                type="button"
                onClick={() => setFormData(initialForm)}
                className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-300"
              >
                Hủy Chỉnh Sửa
              </button>
            )}
          </div>
        </form>
      </div>

      {/* DANH SÁCH DANH MỤC */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-4">DANH SÁCH DANH MỤC ({categories.length})</h2>
        {loading ? (
          <p className="text-xs text-gray-400">Đang tải dữ liệu...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-3">ID</th>
                  <th className="p-3">TÊN DANH MỤC</th>
                  <th className="p-3">SLUG</th>
                  <th className="p-3">MÔ TẢ</th>
                  <th className="p-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">Chưa có danh mục nào</td>
                  </tr>
                ) : (
                  categories.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono text-gray-400">#{item.id}</td>
                      <td className="p-3 font-bold text-gray-800">{item.name}</td>
                      <td className="p-3 text-gray-500 font-mono">{item.slug}</td>
                      <td className="p-3 text-gray-500">{item.description || '---'}</td>
                      <td className="p-3 text-right space-x-2">
                        <button onClick={() => handleEdit(item)} className="text-blue-600 font-bold hover:underline">Sửa</button>
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 font-bold hover:underline">Xóa</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}