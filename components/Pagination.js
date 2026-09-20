import Link from 'next/link';

/**
 * Phân trang dạng server component (chỉ render các <Link>, không cần
 * client JS). `buildHref(page)` do trang cha truyền vào để tự quyết định
 * cách giữ lại các query param khác (VD: ?search=...&page=2).
 */
export default function Pagination({ currentPage, totalPages, buildHref }) {
  if (totalPages <= 1) return null;

  // Rút gọn danh sách số trang khi có quá nhiều trang, dạng: 1 … 4 5 6 … 20
  const pageNumbers = [];
  const delta = 1;
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== '...') {
      pageNumbers.push('...');
    }
  }

  const linkClass = (active) =>
    `min-w-[2.25rem] h-9 px-2 flex items-center justify-center rounded-lg text-sm font-bold transition ${
      active
        ? 'bg-[#12412C] text-[#FFFBF3]'
        : 'bg-white text-[#12412C] border border-[#12412C]/15 hover:bg-[#12412C]/5'
    }`;

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      {currentPage > 1 && (
        <Link href={buildHref(currentPage - 1)} className={linkClass(false)} aria-label="Trang trước">
          ‹
        </Link>
      )}

      {pageNumbers.map((p, idx) =>
        p === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm select-none">…</span>
        ) : (
          <Link key={p} href={buildHref(p)} className={linkClass(p === currentPage)}>
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages && (
        <Link href={buildHref(currentPage + 1)} className={linkClass(false)} aria-label="Trang sau">
          ›
        </Link>
      )}
    </nav>
  );
}
