'use client';

import React, { useState, useEffect } from 'react';
import WithPermission from '@/components/WithPermission';

export default function AdminNewsPage() {
  const [newsList, setNewsList] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const initialForm = {
    id: null,
    title: '',
    slug: '',
    summary: '',
    content: '',
    image: '',
    source: '',
    published: true,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchNews();
    fetchProfile();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch('/api/news');
      const data = await res.json();
      setNewsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile');
      const data = await res.json();
      const perms = typeof data.permissions === 'string'
        ? data.permissions.split(',').map(p => p.trim())
        : (data.permissions || []);
      setUserPermissions(perms);
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
      }
    } catch (err) {
      alert('Lỗi tải ảnh lên server!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const method = formData.id ? 'PUT' : 'POST';
    try {
      const res = await fetch('/api/news', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(formData.id ? 'Cập nhật tin tức thành công!' : 'Tạo tin tức thành công!');
        setFormData(initialForm);
        fetchNews();
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tin tức này?')) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchNews();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WithPermission permission="news" userPermissions={userPermissions}>
      <div>
        <h1 className="text-2xl font-bold mb-6 text-[#003B46] uppercase">Quản Lý Tin Tức & Sự Kiện</h1>

        {/* FORM THÊM / SỬA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4">
            {formData.id ? '✏️ CHỈNH SỬA TIN TỨC' : '➕ ĐĂNG TIN TỨC MỚI'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Tiêu Đề Tin Tức (*)</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border rounded-xl text-sm"
                placeholder="Khai Trương Showroom Trà Mới Tại TP.HCM..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Hình Ảnh Tin Tức</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  className="w-full p-2.5 border rounded-xl text-sm"
                  placeholder="Đường dẫn ảnh (/uploads/... hoặc URL)"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
                <label className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer whitespace-nowrap hover:bg-blue-100">
                  {uploading ? 'Đang tải...' : '📁 Chọn ảnh'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Tóm Tắt Nhanh (Summary)</label>
              <textarea
                rows={2}
                className="w-full p-2.5 border rounded-xl text-sm"
                placeholder="Mô tả tóm tắt sự kiện/tin tức..."
                value={formData.summary || ''}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Nội Dung Chi Tiết Tin Tức</label>
              <textarea
                rows={6}
                required
                className="w-full p-2.5 border rounded-xl text-sm"
                placeholder="Chi tiết bản tin..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published_news"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              <label htmlFor="published_news" className="text-xs font-bold text-gray-700 cursor-pointer">Cho phép hiển thị tin tức</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#003B46] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90"
              >
                {submitting ? 'Đang lưu...' : formData.id ? 'Cập Nhật Tin Tức' : 'Đăng Tin Tức'}
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

        {/* DANH SÁCH TIN TỨC */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4">DANH SÁCH TIN TỨC ({newsList.length})</h2>
          {loading ? (
            <p className="text-xs text-gray-400">Đang tải dữ liệu...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-600">
                    <th className="p-3">HÌNH ẢNH</th>
                    <th className="p-3">TIÊU ĐỀ TIN</th>
                    <th className="p-3">TRẠNG THÁI</th>
                    <th className="p-3 text-right">THAO TÁC</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {newsList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-gray-400">Chưa có tin tức nào</td>
                    </tr>
                  ) : (
                    newsList.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          {item.image ? (
                            <img src={item.image} alt={item.title} className="w-12 h-12 object-cover rounded-lg" />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-[10px]">Không ảnh</div>
                          )}
                        </td>
                        <td className="p-3 font-bold text-gray-800">{item.title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            {item.published ? 'Hiển thị' : 'Ẩn'}
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
          )}
        </div>
      </div>
    </WithPermission>
  );
}