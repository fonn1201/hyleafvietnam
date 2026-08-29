'use client';
import { useState, useEffect } from 'react';

export default function AdminSettingsPage() {
  const [formData, setFormData] = useState({
    siteName: '',
    hotline: '',
    zaloUrl: '',
    fanpage: '',
    address: '',
    aboutUs: '',
    isOnlineSales: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFormData({
            siteName: data.siteName || '',
            hotline: data.hotline || '',
            zaloUrl: data.zaloUrl || '',
            fanpage: data.fanpage || '',
            address: data.address || '',
            aboutUs: data.aboutUs || '',
            isOnlineSales: !!data.isOnlineSales,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert('Đã lưu cấu hình thành công!');
      } else {
        alert('Có lỗi xảy ra khi lưu.');
      }
    } catch (err) {
      alert('Lỗi kết nối server!');
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6">Đang tải cấu hình...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">QUẢN LÝ THÔNG TIN WEBSITE</h1>
      
      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow space-y-4">
        
        {/* Tính năng Mở bán */}
        <div className="border-b pb-4 mb-4">
          <label className="flex items-center gap-3 cursor-pointer p-3 bg-gray-50 rounded border hover:bg-gray-100 transition">
            <input
              type="checkbox"
              checked={formData.isOnlineSales}
              onChange={(e) => setFormData({ ...formData, isOnlineSales: e.target.checked })}
              className="w-5 h-5"
            />
            <div>
              <span className="font-bold text-gray-800 text-sm block">Mở bán online</span>
              <span className="text-xs text-gray-500">
                Nếu bật: Web cho phép đặt hàng và hiển thị giá. Nếu tắt: Tất cả sản phẩm hiển thị "Liên hệ".
              </span>
            </div>
          </label>
        </div>

        {/* Thông tin website */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold mb-1">Tên Website</label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Hotline</label>
            <input
              type="text"
              value={formData.hotline}
              onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Link Zalo</label>
            <input
              type="text"
              value={formData.zaloUrl}
              onChange={(e) => setFormData({ ...formData, zaloUrl: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-1">Link Fanpage</label>
            <input
              type="text"
              value={formData.fanpage}
              onChange={(e) => setFormData({ ...formData, fanpage: e.target.value })}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Địa chỉ cửa hàng</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-bold mb-1">Về chúng tôi (Mô tả ngắn)</label>
          <textarea
            value={formData.aboutUs}
            onChange={(e) => setFormData({ ...formData, aboutUs: e.target.value })}
            className="w-full border rounded px-3 py-2 text-sm"
            rows="3"
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-900 text-white px-6 py-2 rounded font-medium hover:bg-blue-800 transition"
        >
          {saving ? 'Đang lưu...' : 'Cập nhật Cài đặt'}
        </button>
      </form>
    </div>
  );
}