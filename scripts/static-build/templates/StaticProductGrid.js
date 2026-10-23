'use client';

// BẢN DÙNG CHO BUILD TĨNH. Bản tĩnh không có server nên tìm kiếm, lọc
// (Bán chạy / Quà tặng) và phân trang được xử lý ngay trong trình duyệt,
// dữ liệu sản phẩm đã được nhúng sẵn lúc build.
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

const PAGE_SIZE = 12;

const FILTERS = {
  bestseller: { field: 'isBestSeller', title: 'SẢN PHẨM BÁN CHẠY' },
  gift: { field: 'isGift', title: 'GIẢI PHÁP & QUÀ TẶNG' },
};

function removeAccents(str) {
  return String(str).normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-2xl border border-[#12412C]/10 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
      <div>
        <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 bg-gray-100">
          <Image
            src={product.image || '/placeholder.jpg'}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {product.isBestSeller && (
            <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">Bán Chạy</span>
          )}
          {product.isGift && (
            <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">Quà Biếu</span>
          )}
        </div>
        <h3 className="font-bold text-base text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
        {product.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
        )}
      </div>
      <div className="mt-4 space-y-2">
        <span className="text-base font-black text-[#12412C] block">{formatPrice(product.price, false)}</span>
        <Link
          href={`/products/${product.slug}`}
          className="block bg-[#12412C] text-[#FFFBF3] text-sm font-bold px-3 py-1.5 rounded-full hover:bg-emerald-900 transition text-center"
        >
          Chi tiết
        </Link>
      </div>
    </div>
  );
}

function Pager({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const numbers = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) numbers.push(i);
    else if (numbers[numbers.length - 1] !== '...') numbers.push('...');
  }
  const cls = (active) =>
    `min-w-[2.25rem] h-9 px-2 flex items-center justify-center rounded-lg text-sm font-bold transition ${
      active ? 'bg-[#12412C] text-[#FFFBF3]' : 'bg-white text-[#12412C] border border-[#12412C]/15 hover:bg-[#12412C]/5'
    }`;
  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-2 mt-8 flex-wrap">
      {page > 1 && <button type="button" className={cls(false)} onClick={() => onChange(page - 1)} aria-label="Trang trước">‹</button>}
      {numbers.map((n, idx) =>
        n === '...' ? (
          <span key={`e${idx}`} className="px-1 text-gray-400 text-sm select-none">…</span>
        ) : (
          <button key={n} type="button" className={cls(n === page)} onClick={() => onChange(n)}>{n}</button>
        )
      )}
      {page < totalPages && <button type="button" className={cls(false)} onClick={() => onChange(page + 1)} aria-label="Trang sau">›</button>}
    </nav>
  );
}

function Grid({ products, mode, category, search, filter }) {
  const [page, setPage] = useState(1);

  const term = search.trim();
  const normalizedTerm = removeAccents(term).toLowerCase();
  const filterField = filter ? FILTERS[filter].field : null;

  const filtered = products.filter((p) => {
    if (filterField && !p[filterField]) return false;
    if (!term) return true;
    const matchName = p.name && removeAccents(p.name).toLowerCase().includes(normalizedTerm);
    const matchCode = p.code && String(p.code).toLowerCase().includes(term.toLowerCase());
    return matchName || matchCode;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const changePage = (n) => {
    setPage(n);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  let title = 'DANH SÁCH TẤT CẢ SẢN PHẨM';
  if (mode === 'category') title = category.name;
  else if (search) title = `KẾT QUẢ TÌM KIẾM: "${search}"`;
  else if (filter) title = FILTERS[filter].title;

  return (
    <>
      <div className="mb-6 border-b border-[#12412C]/10 pb-4">
        {mode === 'category' ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/" className="hover:underline">Trang chủ</Link>
            <span>/</span>
            <Link href="/products" className="hover:underline">Sản phẩm</Link>
            <span>/</span>
            <span className="text-[#12412C] font-bold">{category.name}</span>
          </div>
        ) : (
          filter && !search && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/" className="hover:underline">Trang chủ</Link>
              <span>/</span>
              <Link href="/products" className="hover:underline">Tất cả sản phẩm</Link>
              <span>/</span>
              <span className="text-[#12412C] font-bold">{FILTERS[filter].title}</span>
            </div>
          )
        )}
        <h1 className="text-2xl font-black text-[#12412C] uppercase">{title}</h1>
        {mode === 'category' && category.description && (
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          {mode === 'category'
            ? `Hiển thị ${filtered.length} sản phẩm trong danh mục này`
            : `Tìm thấy ${filtered.length} sản phẩm phù hợp`}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#12412C]/10 shadow-sm">
          <p className="text-gray-500 text-base mb-4">
            {mode === 'category' ? 'Danh mục này hiện chưa có sản phẩm nào.' : 'Không tìm thấy sản phẩm nào phù hợp.'}
          </p>
          <Link href="/products" className="bg-[#12412C] text-[#FFFBF3] text-sm font-bold px-5 py-2.5 rounded-full inline-block">
            Xem Tất Cả Sản Phẩm
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {visible.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pager page={safePage} totalPages={totalPages} onChange={changePage} />
        </>
      )}
    </>
  );
}

// Trang /products: đọc ?search= và ?filter= từ thanh địa chỉ ngay ở trình duyệt
function ProductsWithQuery({ products }) {
  const params = useSearchParams();
  const search = params.get('search') || '';
  const rawFilter = params.get('filter') || '';
  const filter = FILTERS[rawFilter] ? rawFilter : '';
  // key: đổi từ khóa/bộ lọc thì tạo lại Grid để số trang về lại 1
  return <Grid key={`${search}|${filter}`} products={products} mode="products" category={null} search={search} filter={filter} />;
}

export default function StaticProductGrid({ products, mode = 'products', category = null }) {
  if (mode === 'category') {
    return <Grid products={products} mode="category" category={category} search="" filter="" />;
  }
  return <ProductsWithQuery products={products} />;
}
