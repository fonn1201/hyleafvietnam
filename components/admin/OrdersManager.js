'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import WithPermission from '@/components/WithPermission';
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  getStatusInfo,
  getPaymentMethodLabel,
  isStatusChangeAllowed,
} from '@/lib/orderStatus';

const STATUS_BADGE_CLASS = {
  amber: 'bg-amber-100 text-amber-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-gray-100 text-gray-600',
};

// Hộp thoại xác nhận dùng chung cho: đổi trạng thái 1 đơn, xác nhận thanh
// toán, và cập nhật hàng loạt - tránh bấm nhầm làm sai lệch dữ liệu.
function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading, confirmLabel = 'Xác nhận' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
        <h3 className="text-base font-bold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{message}</p>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-100 transition"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// Panel chi tiết 1 đơn hàng: sửa thông tin, đổi trạng thái, xác nhận
// thanh toán. Tách riêng component cho gọn, dùng lại state cục bộ của
// từng đơn (không ảnh hưởng các đơn khác đang mở cùng lúc).
function OrderDetailPanel({ order, onUpdated }) {
  const [editForm, setEditForm] = useState({
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerAddress: order.customerAddress,
    paymentMethod: order.paymentMethod,
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const [pendingStatus, setPendingStatus] = useState(order.status);
  const [confirmStatusOpen, setConfirmStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [confirmPaymentOpen, setConfirmPaymentOpen] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMessage('');
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');
      setInfoMessage('✓ Đã lưu thông tin đơn hàng');
      onUpdated(data);
    } catch (err) {
      setInfoMessage(err.message);
    } finally {
      setSavingInfo(false);
    }
  };

  const handleConfirmStatusChange = async () => {
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: pendingStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');
      onUpdated(data);
      setConfirmStatusOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleConfirmPayment = async () => {
    setUpdatingPayment(true);
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/payment-confirm`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: !order.paymentConfirmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');
      onUpdated(data);
      setConfirmPaymentOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingPayment(false);
    }
  };

  const isBankTransfer = order.paymentMethod === 'bank_transfer';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Sản phẩm */}
      <div>
        <h4 className="text-sm font-bold text-gray-600 uppercase mb-2">Sản phẩm</h4>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100">
              <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <Image src={item.productImage || '/placeholder.jpg'} alt={item.productName} fill sizes="40px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 truncate text-sm">{item.productName}</p>
                <p className="text-gray-500 text-sm">SL: {item.quantity} × {item.price.toLocaleString('vi-VN')} đ</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sửa thông tin đơn hàng */}
      <div>
        <h4 className="text-sm font-bold text-gray-600 uppercase mb-2">Thông tin giao hàng</h4>
        <form onSubmit={handleSaveInfo} className="bg-white rounded-xl p-3 border border-gray-100 space-y-2.5">
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">Họ tên</label>
            <input
              type="text"
              value={editForm.customerName}
              onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">Số điện thoại</label>
            <input
              type="text"
              value={editForm.customerPhone}
              onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
            />
            <p className="text-sm text-gray-400 mt-1">Đổi SĐT sẽ tự gắn đơn sang đúng hồ sơ khách hàng tương ứng.</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">Địa chỉ</label>
            <textarea
              rows={2}
              value={editForm.customerAddress}
              onChange={(e) => setEditForm({ ...editForm, customerAddress: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-500 mb-1">Thanh toán</label>
            <select
              value={editForm.paymentMethod}
              onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option
                  key={pm.value}
                  value={pm.value}
                  disabled={pm.value !== order.paymentMethod && !(order.paymentMethod === 'bank_transfer' && pm.value === 'cod')}
                >
                  {pm.label}
                </option>
              ))}
            </select>
            {isBankTransfer && <p className="text-sm text-gray-400 mt-1">Chỉ đổi được từ Chuyển khoản sang COD.</p>}
          </div>
          {infoMessage && <p className="text-sm font-semibold text-blue-700">{infoMessage}</p>}
          <button
            type="submit"
            disabled={savingInfo}
            className="w-full bg-gray-800 hover:bg-black text-white text-sm font-bold py-2 rounded-lg transition disabled:opacity-50"
          >
            {savingInfo ? 'Đang lưu...' : 'Lưu Thông Tin'}
          </button>
        </form>
      </div>

      {/* Trạng thái & xác nhận thanh toán */}
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-bold text-gray-600 uppercase mb-2">Trạng thái đơn hàng</h4>
          <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
            <select
              value={pendingStatus}
              onChange={(e) => setPendingStatus(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm"
            >
              {ORDER_STATUSES.map((s) => (
                <option key={s.value} value={s.value} disabled={!isStatusChangeAllowed(order, s.value)}>
                  {s.label}{!isStatusChangeAllowed(order, s.value) ? ' (chưa xác nhận thanh toán)' : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={pendingStatus === order.status}
              onClick={() => setConfirmStatusOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-2 rounded-lg transition disabled:opacity-40"
            >
              Cập Nhật Trạng Thái
            </button>
          </div>
        </div>

        {isBankTransfer && (
          <div>
            <h4 className="text-sm font-bold text-gray-600 uppercase mb-2">Xác nhận thanh toán</h4>
            <div className="bg-white rounded-xl p-3 border border-gray-100 space-y-2">
              <p className="text-sm text-gray-600">
                Trạng thái: {order.paymentConfirmed ? (
                  <span className="font-bold text-emerald-600">Đã xác nhận nhận tiền</span>
                ) : (
                  <span className="font-bold text-amber-600">Chưa xác nhận</span>
                )}
              </p>
              <button
                type="button"
                onClick={() => setConfirmPaymentOpen(true)}
                className={`w-full text-white text-sm font-bold py-2 rounded-lg transition ${order.paymentConfirmed ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {order.paymentConfirmed ? 'Hủy Xác Nhận Thanh Toán' : 'Xác Nhận Đã Chuyển Khoản'}
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmStatusOpen}
        title="Xác nhận đổi trạng thái đơn hàng"
        message={`Chuyển đơn ${order.orderCode} sang trạng thái "${getStatusInfo(pendingStatus).label}"?`}
        onConfirm={handleConfirmStatusChange}
        onCancel={() => setConfirmStatusOpen(false)}
        loading={updatingStatus}
      />

      <ConfirmDialog
        open={confirmPaymentOpen}
        title={order.paymentConfirmed ? 'Hủy xác nhận thanh toán' : 'Xác nhận đã nhận chuyển khoản'}
        message={
          order.paymentConfirmed
            ? `Đơn ${order.orderCode} sẽ chuyển lại thành CHƯA xác nhận thanh toán, khách sẽ thấy lại mã QR.`
            : `Xác nhận đã nhận được chuyển khoản cho đơn ${order.orderCode}? Khách sẽ không còn thấy mã QR nữa và có thể tiếp tục xử lý đơn.`
        }
        onConfirm={handleConfirmPayment}
        onCancel={() => setConfirmPaymentOpen(false)}
        loading={updatingPayment}
        confirmLabel={order.paymentConfirmed ? 'Hủy xác nhận' : 'Xác nhận'}
      />
    </div>
  );
}

export default function OrdersManager({ initialOrders = [], userPermissions = [] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const [bulkStatus, setBulkStatus] = useState('');
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkError, setBulkError] = useState('');

  const refreshOrders = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filterStatus) qs.set('status', filterStatus);
      if (search.trim()) qs.set('search', search.trim());
      const res = await fetch(`/api/admin/orders?${qs.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setOrders(data);
      setSelectedIds([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdated = (updatedOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o)));
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map((o) => o.id));
    }
  };

  const selectedOrders = orders.filter((o) => selectedIds.includes(o.id));
  const selectedStatuses = new Set(selectedOrders.map((o) => o.status));
  const canBulkUpdate = selectedOrders.length > 0 && selectedStatuses.size === 1;

  const handleBulkUpdate = async () => {
    setBulkUpdating(true);
    setBulkError('');
    try {
      const res = await fetch('/api/admin/orders/bulk-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedIds, status: bulkStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cập nhật thất bại');
      setOrders((prev) => prev.map((o) => (selectedIds.includes(o.id) ? { ...o, status: bulkStatus } : o)));
      setSelectedIds([]);
      setConfirmBulkOpen(false);
    } catch (err) {
      setBulkError(err.message);
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <WithPermission permission="orders" userPermissions={userPermissions}>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-[#003B46] uppercase">Quản Lý Đơn Hàng</h1>
          <p className="text-sm text-gray-500 mt-1">Theo dõi đơn hàng; bấm &quot;Chi tiết&quot; để sửa thông tin hoặc đổi trạng thái.</p>
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

        {/* Thanh cập nhật hàng loạt - chỉ xuất hiện khi có đơn được chọn */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-wrap items-center gap-3">
            <span className="text-sm font-bold text-blue-800">Đã chọn {selectedIds.length} đơn</span>
            {canBulkUpdate ? (
              <>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="border border-blue-200 rounded-xl px-3 py-2 text-sm bg-white"
                >
                  <option value="">-- Chọn trạng thái mới --</option>
                  {ORDER_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                <button
                  onClick={() => setConfirmBulkOpen(true)}
                  disabled={!bulkStatus}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition disabled:opacity-40"
                >
                  Cập Nhật Hàng Loạt
                </button>
              </>
            ) : (
              <span className="text-sm text-red-600 font-semibold">
                Các đơn đã chọn đang không cùng trạng thái, không thể cập nhật hàng loạt.
              </span>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-sm font-bold text-gray-500 uppercase">
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedIds.length === orders.length}
                    onChange={toggleSelectAll}
                  />
                </th>
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
                <tr><td colSpan={8} className="p-6 text-center text-gray-400">Chưa có đơn hàng nào.</td></tr>
              ) : (
                orders.map((order) => (
                  <React.Fragment key={order.id}>
                    <tr className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(order.id)}
                          onChange={() => toggleSelect(order.id)}
                        />
                      </td>
                      <td className="p-4 font-mono font-bold text-gray-800">{order.orderCode}</td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{order.customerName}</p>
                        <p className="text-gray-500">{order.customerPhone}</p>
                      </td>
                      <td className="p-4 font-bold text-[#12412C]">{order.totalAmount.toLocaleString('vi-VN')} đ</td>
                      <td className="p-4 text-gray-600">
                        {getPaymentMethodLabel(order.paymentMethod)}
                        {order.paymentMethod === 'bank_transfer' && (
                          <span className={`block text-sm font-bold mt-0.5 ${order.paymentConfirmed ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {order.paymentConfirmed ? '✓ Đã thanh toán' : 'Chưa xác nhận TT'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-bold px-2.5 py-1.5 rounded-lg ${STATUS_BADGE_CLASS[getStatusInfo(order.status).color]}`}>
                          {getStatusInfo(order.status).label}
                        </span>
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
                        <td colSpan={8} className="p-4 bg-gray-50/70">
                          <OrderDetailPanel order={order} onUpdated={handleOrderUpdated} />
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

      <ConfirmDialog
        open={confirmBulkOpen}
        title="Xác nhận cập nhật hàng loạt"
        message={`Chuyển ${selectedIds.length} đơn hàng đã chọn sang trạng thái "${getStatusInfo(bulkStatus).label}"? Hành động này áp dụng cho tất cả đơn đã chọn.`}
        onConfirm={handleBulkUpdate}
        onCancel={() => setConfirmBulkOpen(false)}
        loading={bulkUpdating}
      />
      {bulkError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm font-medium shadow-lg z-50 max-w-sm">
          {bulkError}
          <button onClick={() => setBulkError('')} className="block mt-2 text-red-500 underline text-sm">Đóng</button>
        </div>
      )}
    </WithPermission>
  );
}
