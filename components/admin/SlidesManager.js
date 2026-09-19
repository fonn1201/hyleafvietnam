'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import WithPermission from '@/components/WithPermission';

export default function SlidesManager({ initialSlides = [], userPermissions = [] }) {
  const [slides, setSlides] = useState(initialSlides);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const initialForm = {
    id: null,
    title: '',
    image: '',
    link: '/products',
    order: 0,
    active: true,
  };

  const [formData, setFormData] = useState(initialForm);

  const refreshSlides = async () => {
    try {
      const res = await fetch('/api/slides');
      const data = await res.json();
      setSlides(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);

    const bodyData = new FormData();
    bodyData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: bodyData,
      });
      const data = await res.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, image: data.url }));
      } else {
        alert('Tải ảnh thất bại!');
      }
    } catch (err) {
      alert('Lỗi tải ảnh banner!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const method = formData.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/slides', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {}

      if (res.ok) {
        alert(formData.id ? 'Cập nhật banner thành công!' : 'Tạo banner mới thành công!');
        setFormData(initialForm);
        refreshSlides();
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
    setFormData({
      id: item.id,
      title: item.title || '',
      image: item.image || '',
      link: item.link || '/products',
      order: item.order ?? 0,
      active: Boolean(item.active),
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa slide banner này?')) return;
    try {
      const res = await fetch(`/api/slides?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        refreshSlides();
      } else {
        alert('Không thể xóa banner này!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WithPermission permission="slides" userPermissions={userPermissions}>
      <div>
        <h1 className="text-2xl font-bold mb-6 text-[#003B46] uppercase">Quản Lý Slide Banner Trang Chủ</h1>

        {/* FORM THÊM / SỬA SLIDE BANNER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4">
            {formData.id ? '✏️ CHỈNH SỬA BANNER' : '➕ THÊM BANNER MỚI'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Tiêu Đề Banner (Title - Tùy chọn)</label>
                <input
                  type="text"
                  className="w-full p-2.5 border rounded-xl text-sm"
                  placeholder="Ví dụ: Hương Vị Trà Việt Thượng Hạng..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-1">Thứ Tự Hiển Thị (Order)</label>
                <input
                  type="number"
                  className="w-full p-2.5 border rounded-xl text-sm"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Hình Ảnh Banner (*)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  required
                  className="w-full p-2.5 border rounded-xl text-sm"
                  placeholder="Đường dẫn ảnh (/uploads/... hoặc URL)"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
                <label className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer whitespace-nowrap hover:bg-blue-100">
                  {uploading ? 'Đang tải...' : '📁 Chọn ảnh'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Đường Dẫn Khi Click (Link)</label>
              <input
                type="text"
                className="w-full p-2.5 border rounded-xl text-sm"
                placeholder="/products hoặc https://..."
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="active_slide"
                checked={Boolean(formData.active)}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              />
              <label htmlFor="active_slide" className="text-sm font-bold text-gray-700 cursor-pointer">
                Cho phép hiển thị banner này trên trang chủ
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#003B46] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-opacity-90 disabled:opacity-50"
              >
                {submitting ? 'Đang lưu...' : formData.id ? 'Cập Nhật Banner' : 'Tạo Banner Mới'}
              </button>
              {formData.id && (
                <button
                  type="button"
                  onClick={() => setFormData(initialForm)}
                  className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-300"
                >
                  Hủy Chỉnh Sửa
                </button>
              )}
            </div>
          </form>
        </div>

        {/* DANH SÁCH SLIDE BANNER */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4">DANH SÁCH SLIDE BANNER ({slides.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-3">HÌNH ẢNH</th>
                  <th className="p-3">TIÊU ĐỀ</th>
                  <th className="p-3">THỨ TỰ</th>
                  <th className="p-3">TRẠNG THÁI</th>
                  <th className="p-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {slides.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center text-gray-400">Chưa có banner nào</td>
                  </tr>
                ) : (
                  slides.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        {item.image ? (
                          <div className="relative w-20 h-10 rounded-lg overflow-hidden bg-gray-100">
                            <Image src={item.image} alt={item.title || 'Banner'} fill sizes="80px" className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-20 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">Không ảnh</div>
                        )}
                      </td>
                      <td className="p-3 font-bold text-gray-800">{item.title || '---'}</td>
                      <td className="p-3 font-mono text-gray-600">{item.order}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-sm font-bold ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {item.active ? 'Hiển thị' : 'Ẩn'}
                        </span>
                      </td>
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
        </div>
      </div>
    </WithPermission>
  );
}
