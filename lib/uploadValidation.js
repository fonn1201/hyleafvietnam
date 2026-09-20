// Giữ đồng bộ với danh sách ALLOWED_TYPES và MAX_FILE_SIZE ở
// app/api/upload/route.js — validate phía client chỉ để báo lỗi sớm,
// server vẫn là nơi kiểm tra thật sự (không tin tưởng riêng client).
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateImageFile(file) {
  if (!file) return { valid: false, error: 'Chưa chọn tệp ảnh nào' };
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return { valid: false, error: 'Chỉ chấp nhận ảnh định dạng JPG, PNG, WEBP hoặc GIF' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'Kích thước ảnh vượt quá giới hạn cho phép (tối đa 5MB)' };
  }
  return { valid: true, error: null };
}
