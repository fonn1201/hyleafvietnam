'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import WithPermission from '@/components/WithPermission';

// Hàm chuẩn hóa slug tiếng Việt sạch sẽ không bị lỗi dấu gạch ngang
function generateSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/([^0-9a-z-\s])/g, '')
    .replace(/(\s+)/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function PostsManager({ initialPosts = [], userPermissions = [] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const initialForm = {
    id: null,
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: '',
    published: true,
  };

  const [formData, setFormData] = useState(initialForm);

  const refreshPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
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
      const res = await fetch('/api/posts', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert(formData.id ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
        setFormData(initialForm);
        refreshPosts();
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
    if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
    try {
      const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        refreshPosts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <WithPermission permission="posts" userPermissions={userPermissions}>
      <div>
        <h1 className="text-2xl font-bold mb-6 text-[#003B46] uppercase">Quản Lý Bài Viết (Blog / SEO)</h1>

        {/* FORM THÊM / SỬA */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4">
            {formData.id ? '✏️ CHỈNH SỬA BÀI VIẾT' : '➕ THÊM BÀI VIẾT MỚI'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Tiêu Đề Bài Viết (*)</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border rounded-xl text-sm"
                placeholder="Cách Pha Trà Oolong Thượng Hạng..."
                value={formData.title}
                onChange={(e) => {
                  const titleVal = e.target.value;
                  setFormData({
                    ...formData,
                    title: titleVal,
                    slug: formData.id ? formData.slug : generateSlug(titleVal),
                  });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Slug (Đường dẫn URL SEO)</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 font-mono text-sm"
                placeholder="cach-pha-tra-oolong-thuong-hang"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Hình Ảnh Bài Viết</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
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
              <label className="block text-sm font-bold text-gray-600 mb-1">Tóm Tắt Bài Viết</label>
              <textarea
                rows={2}
                className="w-full p-2.5 border rounded-xl text-sm"
                placeholder="Mô tả ngắn hiển thị ở danh sách bài viết..."
                value={formData.excerpt || ''}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">Nội Dung Bài Viết</label>
              <textarea
                rows={6}
                required
                className="w-full p-2.5 border rounded-xl text-sm"
                placeholder="Nội dung chi tiết bài viết..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
              />
              <label htmlFor="published" className="text-sm font-bold text-gray-700">Cho phép hiển thị lên website</label>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#003B46] text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-opacity-90"
              >
                {submitting ? 'Đang lưu...' : formData.id ? 'Cập Nhật Bài Viết' : 'Tạo Bài Viết Mới'}
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

        {/* DANH SÁCH BÀI VIẾT */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4">DANH SÁCH BÀI VIẾT ({posts.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-3">HÌNH ẢNH</th>
                  <th className="p-3">TIÊU ĐỀ</th>
                  <th className="p-3">TRẠNG THÁI</th>
                  <th className="p-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">Chưa có bài viết nào</td>
                  </tr>
                ) : (
                  posts.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3">
                        {item.image ? (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <Image src={item.image} alt={item.title} fill sizes="48px" className="object-cover" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">Không ảnh</div>
                        )}
                      </td>
                      <td className="p-3 font-bold text-gray-800">{item.title}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded-full text-sm font-bold ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
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
        </div>
      </div>
    </WithPermission>
  );
}
