// Lấy danh sách gợi ý sản phẩm cho ô tìm kiếm trên Header.
// Tách thành module riêng để bản xuất tĩnh (npm run build:static) có thể
// thay thế bằng phiên bản tìm trong file JSON dựng sẵn, vì bản tĩnh không
// có server/API để gọi. Bản chạy bình thường vẫn gọi API như cũ.
export async function fetchProductSuggestions(query, signal) {
  const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`, { signal });
  const products = await res.json();
  return Array.isArray(products) ? products : [];
}
