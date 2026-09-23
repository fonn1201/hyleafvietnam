'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import WithPermission from '@/components/WithPermission';
import { ORDER_STATUSES, getStatusInfo, getPaymentMethodLabel } from '@/lib/orderStatus';

const STATUS_BADGE_CLASS = {
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
};

export default function OrdersManager({ initialOrders = [], userPermissions = [] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filterStatus) qs.set('status', filterStatus);
      if (search.trim()) qs.set('search', search.trim());
      const res = await fetch(`/api/admin/orders?${qs.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Cập nhật thất bại');
        return;
      }
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: updated.status } : o)));
    } catch (err) {
      alert('Lỗi kết nối server');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <WithPermission permission="orders" userPermissions={userPermissions}>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-[#003B46] uppercase">Quản Lý Đơn Hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi và cập nhật trạng thái đơn hàng của khách.</p>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap gap-3 items-center">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm"
          >
            <option value="">Tất cả trạng thái</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && refreshOrders()}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm flex-1 min-w-[200px]"
          />
          <button
            onClick={refreshOrders}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Lọc'}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase">
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Tổng tiền</th>
                <th className="p-4">Thanh toán</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Ngày đặt</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {orders.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-gray-400">Chưa có đơn hàng nào.</td></tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50/50 transition">
                      <td className="p-4 font-mono font-bold text-gray-800">{order.orderCode}</td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                        <p className="text-gray-500">{order.customerPhone}</p>
                      </td>
                      <td className="p-4 font-bold text-[#12412C]">{order.totalAmount.toLocaleString('vi-VN')} đ</td>
                      <td className="p-4 text-gray-600">{getPaymentMethodLabel(order.paymentMethod)}</td>
                      <td className="p-4">
                        <select
                          value={order.status}
                          disabled={updatingId === order.id}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-sm font-bold px-2.5 py-1.5 rounded-lg border-0 ${STATUS_BADGE_CLASS[getStatusInfo(order.status).color]}`}
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-gray-400">{new Date(order.createdAt).toLocaleString('vi-VN')}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                          className="text-blue-600 font-bold hover:underline"
                        >
                          {expandedId === order.id ? 'Thu gọn' : 'Chi tiết'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === order.id && (
                      <tr>
                        <td colSpan={7} className="p-4 bg-gray-50/70">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-bold text-gray-600 uppercase mb-2">Sản phẩm</h4>
                              <div className="space-y-2">
                                {order.items.map((item) => (
                                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100">
                                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                      <Image src={item.productImage || '/placeholder.jpg'} alt={item.productName} fill sizes="40px" className="object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-gray-800 truncate">{item.productName}</p>
                                      <p className="text-gray-500">SL: {item.quantity} × {item.price.toLocaleString('vi-VN')} đ</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-gray-600 uppercase mb-2">Thông tin giao hàng</h4>
                              <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-1 text-gray-700">
                                <p><strong>Địa chỉ:</strong> {order.customerAddress}</p>
                                {order.customerEmail && <p><strong>Email:</strong> {order.customerEmail}</p>}
                                {order.note && <p><strong>Ghi chú:</strong> {order.note}</p>}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </WithPermission>
  );
}
