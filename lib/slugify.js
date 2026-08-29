// lib/slugify.js
export function generateSlug(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD') // Tách các dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu sau khi tách
    .replace(/[đĐ]/g, 'd') // Thay thế chữ đ/Đ
    .replace(/([^0-9a-z-\s])/g, '') // Xóa ký tự đặc biệt
    .replace(/(\s+)/g, '-') // Thay khoảng trắng bằng dấu gạch ngang
    .replace(/-+/g, '-') // Thu gọn nhiều dấu gạch ngang liên tiếp
    .replace(/^-+|-+$/g, ''); // Cắt bỏ dấu gạch ngang thừa ở đầu/cuối
}