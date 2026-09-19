'use client';

import React, { useState } from 'react';

export default function ProfileManager({ initialProfile = { name: '', email: '' } }) {
  const [profile, setProfile] = useState(initialProfile);

  // State form đổi mật khẩu
  const [passData, setPassData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // State form đổi tên
  const [nameData, setNameData] = useState({ name: initialProfile.name });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [submittingPass, setSubmittingPass] = useState(false);
  const [submittingName, setSubmittingName] = useState(false);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    setSubmittingName(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameData.name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');

      setMessage({ type: 'success', text: 'Cập nhật tên hiển thị thành công!' });
      setProfile((prev) => ({ ...prev, name: nameData.name }));
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmittingName(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.newPassword !== passData.confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp!' });
      return;
    }

    setSubmittingPass(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/admin/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldPassword: passData.oldPassword,
          newPassword: passData.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Đổi mật khẩu thất bại');

      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công! Vui lòng sử dụng mật khẩu mới cho lần đăng nhập tiếp theo.' });
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmittingPass(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-[#003B46]">Hồ Sơ Cá Nhân & Bảo Mật</h1>
        <p className="text-sm text-gray-500 mt-1">Quản lý thông tin tài khoản đăng nhập hiện tại của bạn.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium transition ${
          message.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cập nhật thông tin */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">Thông Tin Chung</h3>
          <form onSubmit={handleUpdateName} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 uppercase mb-1">Email (Định danh)</label>
              <input
                type="email"
                disabled
                value={profile.email}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-500 cursor-not-allowed"
              />
              <span className="text-sm text-gray-400 mt-1 block">Email đăng nhập hệ thống không thể thay đổi trực tiếp tại đây.</span>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 uppercase mb-1">Họ và Tên</label>
              <input
                type="text"
                required
                value={nameData.name}
                onChange={(e) => setNameData({ name: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingName}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
            >
              {submittingName ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </form>
        </div>

        {/* Đổi mật khẩu */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h3 className="text-base font-bold text-gray-800 border-b border-gray-100 pb-3">Bảo Mật & Đổi Mật Khẩu</h3>
          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-sm font-bold text-gray-600 uppercase mb-1">Mật Khẩu Cũ</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passData.oldPassword}
                onChange={(e) => setPassData({ ...passData, oldPassword: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 uppercase mb-1">Mật Khẩu Mới</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passData.newPassword}
                onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 uppercase mb-1">Xác Nhận Mật Khẩu Mới</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passData.confirmPassword}
                onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingPass}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-semibold transition disabled:opacity-50 mt-2"
            >
              {submittingPass ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
