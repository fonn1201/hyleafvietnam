'use client';
import React from 'react';

export default function WithPermission({ permission, userPermissions = [], children }) {
  // Nếu tài khoản có quyền 'all' hoặc chứa quyền của module đó thì cho hiển thị nội dung
  const hasAccess = userPermissions.includes('all') || userPermissions.includes(permission);

  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center space-y-3">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-2xl font-bold mb-2">
          🔒
        </div>
        <h2 className="text-xl font-bold text-gray-800">Truy Cập Bị Từ Chối</h2>
        <p className="text-sm text-gray-500 max-w-md">
          Bạn không có quyền quản lý chức năng này. Vui lòng liên hệ quản trị viên cấp cao để được cấp quyền truy cập.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}