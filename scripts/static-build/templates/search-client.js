// BẢN DÙNG CHO BUILD TĨNH (chép đè lên lib/searchClient.js). Bản tĩnh không
// có API, nên gợi ý tìm kiếm lọc ngay trong trình duyệt từ file
// /search-index.json được dựng sẵn lúc build.
let indexPromise = null;

function loadIndex() {
  if (!indexPromise) {
    indexPromise = fetch('/search-index.json')
      .then((r) => r.json())
      .catch(() => []);
  }
  return indexPromise;
}

function removeAccents(str) {
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

export async function fetchProductSuggestions(query) {
  const index = await loadIndex();
  const term = removeAccents(query).toLowerCase();
  const rawTerm = query.toLowerCase();
  return index
    .filter((p) => {
      const matchName = p.name && removeAccents(p.name).toLowerCase().includes(term);
      const matchCode = p.code && String(p.code).toLowerCase().includes(rawTerm);
      return matchName || matchCode;
    })
    .slice(0, 6);
}
