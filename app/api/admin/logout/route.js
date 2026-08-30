import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  // Xóa cả token lẫn cookie phân quyền để làm sạch phiên đăng nhập cũ
  response.cookies.delete('admin_token');
  response.cookies.delete('admin_permissions');
  return response;
}