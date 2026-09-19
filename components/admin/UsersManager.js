'use client';

import React, { useState } from 'react';

const AVAILABLE_PERMISSIONS = [
  { id: 'products', label: '📦 Quản Lý Sản Phẩm' },
  { id: 'slides', label: '🖼️ Quản Lý Slide Banner' },
  { id: 'categories', label: '🏷️ Quản Lý Danh Mục' },
  { id: 'posts', label: '✍️ Quản Lý Bài Viết (Blog)' },
  { id: 'news', label: '📰 Quản Lý Tin Tức' },
  { id: 'users', label: '👥 Quản Lý Admins & Phân Quyền' },
  { id: 'settings', label: '⚙️ Cấu Hình Thông Tin' },
];

// Nhận danh sách ban đầu từ server (page.js) qua props, KHÔNG tự fetch khi
// mount nữa -> không còn cảnh báo ESLint "setState trong effect" và cũng
// không còn màn hình "Đang tải dữ liệu..." mỗi lần mở trang.
export default function UsersManager({ initialUsers = [] }) {
  const [users, setUsers] = useState(initialUsers);
  const [refreshing, setRefreshing] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null = Thêm mới, object = Sửa

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    permissions: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Chỉ gọi lại API để làm mới danh sách SAU khi người dùng thao tác
  // (thêm/sửa/xóa) — đây là setState trong callback sự kiện, không phải
  // trong effect, nên không vi phạm quy tắc react-hooks/set-state-in-effect.
  const refreshUsers = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error('Lỗi tải danh sách:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCheckboxChange = (permId) => {
    const currentPerms = formData.permissions;
    if (currentPerms.includes(permId)) {
      setFormData({ ...formData, permissions: currentPerms.filter((p) => p !== permId) });
    } else {
      setFormData({ ...formData, permissions: [...currentPerms, permId] });
    }
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({ name: '', email: '', permissions: [] });
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      permissions: user.permissions || [],
    });
    setMessage({ type: '', text: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const url = editingUser ? `/api/admin/users/${editingUser.id}` : '/api/admin/users';
      const method = editingUser ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');

      setMessage({
        type: 'success',
        text: editingUser ? 'Cập nhật thông tin thành công!' : 'Thêm tài khoản thành công! Mật khẩu đã được gửi qua email.',
      });
      setShowModal(false);
      refreshUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (userId, userEmail) => {
    if (!confirm(`Bạn có chắc chắn muốn reset mật khẩu cho tài khoản (${userEmail})? Mật khẩu mới sẽ tự động được gửi qua email của nhân sự này.`)) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset thất bại');

      setMessage({ type: 'success', text: `Đã cấp mật khẩu mới và gửi thành công tới email: ${userEmail}` });
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tài khoản quản trị này?')) return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Xóa thất bại');

      setMessage({ type: 'success', text: 'Đã xóa tài khoản thành công!' });
      refreshUsers();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-[#003B46]">Quản Lý Tài Khoản & Phân Quyền</h1>
          <p className="text-sm text-gray-500 mt-1">Cấp quyền truy cập chi tiết và quản lý nhân sự hệ thống.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition shadow-sm shadow-blue-200"
        >
          + Thêm Admin Mới
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      {/* Danh sách Admins */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase">
              <th className="p-4">Họ và Tên</th>
              <th className="p-4">Email Đăng Nhập</th>
              <th className="p-4">Quyền Hạn Được Phép Truy Cập</th>
              <th className="p-4">Ngày Tạo</th>
              <th className="p-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {refreshing ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-400">Đang cập nhật...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-400">Chưa có tài khoản nào.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4 font-semibold text-gray-800">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {u.permissions && u.permissions.length > 0 ? (
                        u.permissions.map((p) => {
                          const matched = AVAILABLE_PERMISSIONS.find((item) => item.id === p);
                          return (
                            <span key={p} className="bg-blue-50 text-blue-700 text-sm font-medium px-2.5 py-1 rounded-lg border border-blue-100">
                              {matched ? matched.label : p}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-gray-400 italic text-sm">Chưa được cấp quyền nào</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(u)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleResetPassword(u.id, u.email)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-sm font-semibold transition"
                      title="Reset mật khẩu và gửi mail tự động"
                    >
                      Reset Pass
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-semibold transition"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Thêm / Sửa Admin */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <h3 className="text-lg font-bold text-gray-800">
              {editingUser ? 'Cập Nhật Thông Tin & Phân Quyền' : 'Thêm Quản Trị Viên & Phân Quyền'}
            </h3>
            <p className="text-sm text-gray-500">
              {editingUser ? 'Chỉnh sửa thông tin tài khoản hoặc quyền hạn truy cập.' : 'Hệ thống sẽ sinh mật khẩu ngẫu nhiên và gửi thẳng qua email của nhân sự.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase mb-1">Họ và Tên</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase mb-1">Email Đăng Nhập</label>
                <input
                  type="email"
                  required
                  disabled={!!editingUser} // Khi sửa không cho đổi email để tránh lệch định danh
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nhansu@gmail.com"
                  className={`w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-500 ${editingUser ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Phần Tick Chọn Quyền */}
              <div>
                <label className="block text-sm font-bold text-gray-600 uppercase mb-2">Phân Quyền Truy Cập Module</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  {AVAILABLE_PERMISSIONS.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-700 hover:text-black">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handleCheckboxChange(perm.id)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium">{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
                >
                  {submitting ? 'Đang xử lý...' : (editingUser ? 'Lưu Thay Đổi' : 'Tạo & Gửi Mật Khẩu')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
