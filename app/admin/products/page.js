'use client';

import React, { useState, useEffect, useRef } from 'react';
import { generateSlug } from '@/lib/slugify';
import * as XLSX from 'xlsx';
import WithPermission from '@/components/WithPermission';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  
  const fileInputRef = useRef(null);
  const [isManualSlug, setIsManualSlug] = useState(false);

  const initialForm = {
    id: null,
    code: '',
    slug: '',
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
      const [resProd, resCat, resProfile] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/admin/profile'), // Lấy thông tin quyền của admin hiện tại
      ]);

      const dataProd = await resProd.json();
      const dataCat = await resCat.json();
      const dataProfile = await resProfile.json();

      setProducts(Array.isArray(dataProd) ? dataProd : []);
      setCategories(Array.isArray(dataCat) ? dataCat : []);

      // Xử lý chuyển đổi permissions từ chuỗi (hoặc mảng) sang mảng chuẩn
      const perms = typeof dataProfile.permissions === 'string'
        ? dataProfile.permissions.split(',').map(p => p.trim())
        : (dataProfile.permissions || []);
      setUserPermissions(perms);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const newName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: newName,
      slug: isManualSlug ? prev.slug : generateSlug(newName),
    }));
  };

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
    setIsManualSlug(true);
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

  // --- TÍNH NĂNG EXPORT EXCEL ---
  const handleExportExcel = () => {
    const dataFormatted = products.map((p) => ({
      'Mã SP (Key)': p.code,
      'Tên Sản Phẩm': p.name,
      'Slug': p.slug,
      'Giá Bán': p.price,
      'Đường Dẫn Ảnh': p.image || '',
      'Mã Danh Mục (ID, cách nhau bởi dấu phẩy)': p.categories ? p.categories.map(c => c.id).join(',') : '',
      'Mô Tả': p.description || '',
      'Hiển Thị (TRUE/FALSE)': p.isVisible ? 'TRUE' : 'FALSE',
      'Bán Chạy (TRUE/FALSE)': p.isBestSeller ? 'TRUE' : 'FALSE',
      'Quà Tặng (TRUE/FALSE)': p.isGift ? 'TRUE' : 'FALSE',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataFormatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachSanPham');
    XLSX.writeFile(workbook, 'Danh_Sach_SanPham.xlsx');
  };

  // --- TẢI FILE MẪU EXCEL ---
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'Mã SP (Key)': 'SP001',
        'Tên Sản Phẩm': 'Trà Oolong Mẫu',
        'Slug': 'tra-oolong-mau',
        'Giá Bán': 150000,
        'Đường Dẫn Ảnh': '/uploads/ten-anh.jpg',
        'Mã Danh Mục (ID, cách nhau bởi dấu phẩy)': '1',
        'Mô Tả': 'Mô tả mẫu cho sản phẩm',
        'Hiển Thị (TRUE/FALSE)': 'TRUE',
        'Bán Chạy (TRUE/FALSE)': 'FALSE',
        'Quà Tặng (TRUE/FALSE)': 'FALSE',
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'File_Mau_Nhap_SanPham.xlsx');
  };

  // --- TÍNH NĂNG IMPORT EXCEL ---
  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setImporting(true);
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const formattedData = data.map((row) => ({
          code: String(row['Mã SP (Key)'] || '').trim(),
          name: row['Tên Sản Phẩm'],
          slug: row['Slug'],
          price: row['Giá Bán'],
          image: row['Đường Dẫn Ảnh'],
          categoryIds: row['Mã Danh Mục (ID, cách nhau bởi dấu phẩy)'],
          description: row['Mô Tả'],
          isVisible: String(row['Hiển Thị (TRUE/FALSE)'] || '').toUpperCase() !== 'FALSE',
          isBestSeller: String(row['Bán Chạy (TRUE/FALSE)'] || '').toUpperCase() === 'TRUE',
          isGift: String(row['Quà Tặng (TRUE/FALSE)'] || '').toUpperCase() === 'TRUE',
        })).filter(item => item.code && item.name);

        if (formattedData.length === 0) {
          alert('File Excel không có dữ liệu hợp lệ (cần có Mã SP và Tên Sản Phẩm)!');
          return;
        }

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData),
        });

        const result = await res.json();
        if (res.ok) {
          alert(`Import thành công! Thêm/Cập nhật thành công ${result.successCount} sản phẩm.`);
          fetchData();
        } else {
          alert('Có lỗi xảy ra khi import!');
        }
      } catch (error) {
        console.error(error);
        alert('Lỗi đọc file Excel!');
      } finally {
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  if (loading) {
    return <div className="p-6 text-gray-400">Đang tải dữ liệu và kiểm tra quyền...</div>;
  }

  return (
    <WithPermission permission="products" userPermissions={userPermissions}>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-[#003B46] uppercase">Quản Lý Sản Phẩm</h1>
          
          {/* KHU VỰC NÚT EXCEL */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="bg-gray-100 text-gray-700 border px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-200"
            >
              📥 Tải File Mẫu
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-xl text-xs font-bold hover:bg-emerald-100"
            >
              📊 Xuất Excel
            </button>
            <label className="bg-blue-600 text-white px-3 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-700">
              {importing ? 'Đang xử lý...' : '📤 Nhập Excel (Upsert)'}
              <input
                type="file"
                accept=".xlsx, .xls"
                ref={fileInputRef}
                className="hidden"
                onChange={handleImportExcel}
                disabled={importing}
              />
            </label>
          </div>
        </div>

        {/* FORM THÊM / SỬA SẢN PHẨM */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8 border border-gray-100">
          <h2 className="text-sm font-bold text-gray-700 mb-4">
            {formData.id ? '✏️ CHỈNH SỬA SẢN PHẨM' : '➕ THÊM SẢN PHẨM MỚI'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Mã Sản Phẩm (*) (Key chính)</label>
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
                      {cat.name} ({cat.id})
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
              <span className="text-[10px] text-gray-400 mt-1 block">
                Gợi ý: Upload ảnh vào thư mục <code>public/uploads/</code> rồi điền tên dạng <code>/uploads/ten-anh.jpg</code> để dùng cho file Excel.
              </span>
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
                          ? item.categories.map((c) => `${c.name} (ID:${c.id})`).join(', ')
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
        </div>
      </div>
    </WithPermission>
  );
}