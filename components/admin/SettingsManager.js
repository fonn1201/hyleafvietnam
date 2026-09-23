'use client';

import { useEffect, useState } from 'react';
import WithPermission from '@/components/WithPermission';
import { ORDER_STATUSES } from '@/lib/orderStatus';

export default function SettingsManager({ initialSettings, userPermissions = [] }) {
  const [formData, setFormData] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [bankList, setBankList] = useState([]);

  // Lấy danh sách ngân hàng + mã BIN trực tiếp từ VietQR (luôn cập nhật,
  // tránh phải tự gõ tay mã BIN dễ sai). Nếu không tải được (mất mạng...)
  // vẫn cho nhập tay bình thường.
  useEffect(() => {
    fetch('https://api.vietqr.io/v2/banks')
      .then((r) => r.json())
      .then((d) => Array.isArray(d?.data) && setBankList(d.data))
      .catch(() => {});
  }, []);

  const handleBankSelect = (bin) => {
    const bank = bankList.find((b) => b.bin === bin);
    setFormData({
      ...formData,
      bankBin: bin,
      bankName: bank ? bank.shortName : formData.bankName,
    });
  };

  const toggleNotifyStatus = (statusValue) => {
    const current = formData.emailNotifyStatuses.split(',').map((s) => s.trim()).filter(Boolean);
    const next = current.includes(statusValue)
      ? current.filter((s) => s !== statusValue)
      : [...current, statusValue];
    setFormData({ ...formData, emailNotifyStatuses: next.join(',') });
  };

  const notifyStatusList = formData.emailNotifyStatuses.split(',').map((s) => s.trim());

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

  return (
    <WithPermission permission="settings" userPermissions={userPermissions}>
      <div className="p-6 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">QUẢN LÝ THÔNG TIN WEBSITE</h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
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
                  <span className="text-sm text-gray-500">
                    Nếu bật: Web cho phép đặt hàng và hiển thị giá. Nếu tắt: Tất cả sản phẩm hiển thị &quot;Liên hệ&quot;, ẩn giỏ hàng/đặt hàng.
                  </span>
                </div>
              </label>
            </div>

            {/* Thông tin website */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Tên Website</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Hotline</label>
                <input
                  type="text"
                  value={formData.hotline}
                  onChange={(e) => setFormData({ ...formData, hotline: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Link Zalo</label>
                <input
                  type="text"
                  value={formData.zaloUrl}
                  onChange={(e) => setFormData({ ...formData, zaloUrl: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Link Fanpage</label>
                <input
                  type="text"
                  value={formData.fanpage}
                  onChange={(e) => setFormData({ ...formData, fanpage: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Địa chỉ cửa hàng</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1">Về chúng tôi (Mô tả ngắn)</label>
              <textarea
                value={formData.aboutUs}
                onChange={(e) => setFormData({ ...formData, aboutUs: e.target.value })}
                className="w-full border rounded px-3 py-2 text-sm"
                rows="3"
              ></textarea>
            </div>
          </div>

          {/* Thông tin ngân hàng cho QR chuyển khoản */}
          <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-base font-bold text-gray-800">Tài Khoản Ngân Hàng (dùng tạo QR chuyển khoản)</h2>
            <p className="text-sm text-gray-500 -mt-2">
              Áp dụng cho phương thức thanh toán &quot;Chuyển khoản&quot; ở trang đặt hàng. Bỏ trống nếu chưa muốn dùng.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-1">Ngân hàng</label>
                {bankList.length > 0 ? (
                  <select
                    value={formData.bankBin}
                    onChange={(e) => handleBankSelect(e.target.value)}
                    className="w-full border rounded px-3 py-2 text-sm"
                  >
                    <option value="">-- Chọn ngân hàng --</option>
                    {bankList.map((b) => (
                      <option key={b.bin} value={b.bin}>{b.shortName} - {b.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Mã BIN (VD: 970422 cho MB Bank)"
                    value={formData.bankBin}
                    onChange={(e) => setFormData({ ...formData, bankBin: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-sm"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Số tài khoản</label>
                <input
                  type="text"
                  value={formData.bankAccountNumber}
                  onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-bold mb-1">Tên chủ tài khoản (không dấu)</label>
                <input
                  type="text"
                  value={formData.bankAccountHolder}
                  onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value.toUpperCase() })}
                  className="w-full border rounded px-3 py-2 text-sm"
                  placeholder="VD: NGUYEN QUOC HAO"
                />
              </div>
            </div>
          </div>

          {/* Cấu hình gửi email theo trạng thái đơn hàng */}
          <div className="bg-white p-6 rounded-lg shadow space-y-3">
            <h2 className="text-base font-bold text-gray-800">Gửi Email Theo Trạng Thái Đơn Hàng</h2>
            <p className="text-sm text-gray-500 -mt-2">
              Chọn những trạng thái sẽ gửi email tự động cho khách (nếu khách có để lại email lúc đặt hàng).
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ORDER_STATUSES.map((s) => (
                <label key={s.value} className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer bg-gray-50 rounded-lg p-2.5 border hover:bg-gray-100">
                  <input
                    type="checkbox"
                    checked={notifyStatusList.includes(s.value)}
                    onChange={() => toggleNotifyStatus(s.value)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
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
    </WithPermission>
  );
}
