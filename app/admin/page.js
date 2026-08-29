'use client';

import React, { useState, useEffect } from 'react';
import { generateSlug } from '@/lib/slugify';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Trạng thái kiểm soát việc người dùng có tự ý sửa slug thủ công hay không
  const [isManualSlug, setIsManualSlug] = useState(false);

  const initialForm = {
    id: null,
    code: '',
    slug: '', // Thêm trường slug
    name: '',
    price: '',
    description: '',
    image: '',
    categoryIds: [],
    isVisible: true,
    isBestSeller: false,
    isGift: false,
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resProd, resCat] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      const dataProd = await resProd.json();
      const dataCat = await resCat.json();
      setProducts(Array.isArray(dataProd) ? dataProd : []);
      setCategories(Array.isArray(dataCat) ? dataCat : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi gõ Tên Sản Phẩm -> Tự động sinh Slug nếu chưa sửa thủ công
  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: isManualSlug ? prev.slug : generateSlug(newName),
    }));
  };

  // Xử lý khi người dùng chủ động sửa Slug
  const handleSlugChange = (e) => {
    setIsManualSlug(true);
    setFormData((prev) => ({ ...prev, slug: e.target.value }));
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
      alert('Lỗi tải ảnh!');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const method = formData.id ? 'PUT' : 'POST';

    // Đảm bảo slug luôn có giá trị (nếu bỏ trống tự động tạo từ tên)
    const finalSlug = formData.slug ? generateSlug(formData.slug) : generateSlug(formData.name);

    const payload = {
      ...formData,
      slug: finalSlug,
      categoryIds: formData.categoryIds || [],
    };

    try {
      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(formData.id ? 'Cập nhật thành công!' : 'Tạo mới sản phẩm thành công!');
        setFormData(initialForm);
        setIsManualSlug(false);
        fetchData();
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
    const catIds = item.categories ? item.categories.map((c) => c.id) : [];
    setIsManualSlug(true); // Khi sửa sản phẩm cũ, bật cờ manual để không tự ghi đè slug cũ
    setFormData({
      ...item,
      slug: item.slug || '',
      categoryIds: catIds,
    });
  };

  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategoryCheckboxChange = (catId) => {
    setFormData((prev) => {
      const currentIds = prev.categoryIds || [];
      if (currentIds.includes(catId)) {
        return { ...prev, categoryIds: currentIds.filter((id) => id !== catId) };
      } else {
        return { ...prev, categoryIds: [...currentIds, catId] };
      }
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#003B46] uppercase">Quản Lý Sản Phẩm</h1>

      {/* FORM THÊM / SỬA SẢN PHẨM */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-4">
          {formData.id ? '✏️ CHỈNH SỬA SẢN PHẨM' : '➕ THÊM SẢN PHẨM MỚI'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Mã Sản Phẩm (*)</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border rounded-xl text-sm font-mono"
                placeholder="SP001..."
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Tên Sản Phẩm (*)</label>
              <input
                type="text"
                required
                className="w-full p-2.5 border rounded-xl text-sm"
                placeholder="Trà Oolong Tứ Quý..."
                value={formData.name}
                onChange={handleNameChange}
              />
            </div>
          </div>

          {/* Ô nhập Slug tự động sinh từ Tên */}
          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Đường dẫn thân thiện (Slug URL)</label>
            <input
              type="text"
              className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 font-mono text-gray-600"
              placeholder="tra-oolong-tu-quy..."
              value={formData.slug}
              onChange={handleSlugChange}
            />
            <span className="text-[10px] text-gray-400 mt-1 block">
              Hệ thống tự động tạo theo tên sản phẩm, bạn có thể chỉnh sửa lại tùy ý.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Giá Bán (*) (VND)</label>
              <input
                type="number"
                min="0"
                required
                placeholder="Chỉ nhập số, ví dụ: 150000"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full border rounded-xl px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Danh Mục Sản Phẩm (Chọn nhiều)</label>
              <div className="grid grid-cols-2 gap-2 p-3 border rounded-xl bg-gray-50 max-h-40 overflow-y-auto">
                {categories.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(formData.categoryIds || []).includes(cat.id)}
                      onChange={() => handleCategoryCheckboxChange(cat.id)}
                      className="rounded border-gray-300 text-[#003B46] focus:ring-[#003B46]"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-600 mb-1">Hình Ảnh Sản Phẩm</label>
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
            <label className="block text-xs font-bold text-gray-600 mb-1">Mô Tả Chi Tiết</label>
            <textarea
              rows={4}
              className="w-full p-2.5 border rounded-xl text-sm"
              placeholder="Thông tin thành phần, hương vị, cách đóng gói..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
              />
              👁️ Hiển thị sản phẩm trên web
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.isBestSeller}
                onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
              />
              🔥 Hiển thị ở khối "SẢN PHẨM BÁN CHẠY"
            </label>

            <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={!!formData.isGift}
                onChange={(e) => setFormData({ ...formData, isGift: e.target.checked })}
              />
              🎁 Hiển thị ở khối "GIẢI PHÁP & QUÀ TẶNG"
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#003B46] text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-opacity-90"
            >
              {submitting ? 'Đang lưu...' : formData.id ? 'Cập Nhật Sản Phẩm' : 'Tạo Sản Phẩm Mới'}
            </button>
            {formData.id && (
              <button
                type="button"
                onClick={() => {
                  setFormData(initialForm);
                  setIsManualSlug(false);
                }}
                className="bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-300"
              >
                Hủy Chỉnh Sửa
              </button>
            )}
          </div>
        </form>
      </div>

      {/* DANH SÁCH SẢN PHẨM */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-sm font-bold text-gray-700 mb-4">DANH SÁCH SẢN PHẨM ({products.length})</h2>
        {loading ? (
          <p className="text-xs text-gray-400">Đang tải dữ liệu...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600">
                  <th className="p-3">MÃ SP / SLUG</th>
                  <th className="p-3">HÌNH ẢNH</th>
                  <th className="p-3">TÊN SẢN PHẨM</th>
                  <th className="p-3">GIÁ BÁN</th>
                  <th className="p-3">DANH MỤC</th>
                  <th className="p-3 text-right">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-gray-400">Chưa có sản phẩm nào</td>
                  </tr>
                ) : (
                  products.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="p-3 font-mono">
                        <div className="font-bold text-gray-700">{item.code}</div>
                        <div className="text-[10px] text-blue-600">{item.slug}</div>
                      </td>
                      <td className="p-3">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-[10px]">Không ảnh</div>
                        )}
                      </td>
                      <td className="p-3 font-bold text-gray-800">{item.name}</td>
                      <td className="p-3 font-bold text-emerald-600">{item.price}</td>
                      <td className="p-3 text-gray-500">
                        {item.categories && item.categories.length > 0
                          ? item.categories.map((c) => c.name).join(', ')
                          : '---'}
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
  );
}