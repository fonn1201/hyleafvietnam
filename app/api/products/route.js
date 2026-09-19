import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/slugify';

// Bỏ dấu tiếng Việt để so khớp không phân biệt có dấu/không dấu
function removeAccents(str) {
  return String(str)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

// GET: Lấy danh sách sản phẩm. Hỗ trợ ?search=... để lọc theo tên/mã
// (dùng cho gợi ý tìm kiếm) và ?limit=... để giới hạn số lượng trả về,
// tránh phải tải toàn bộ sản phẩm về trình duyệt mỗi lần gõ phím.
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();
    const limitParam = Number(searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : undefined;

    const products = await prisma.product.findMany({
      include: { categories: true },
      orderBy: { id: 'desc' },
    });

    let result = products;
    if (search) {
      const normalizedTerm = removeAccents(search).toLowerCase();
      result = products.filter((p) => {
        const matchName = p.name && removeAccents(p.name).toLowerCase().includes(normalizedTerm);
        const matchCode = p.code && p.code.toLowerCase().includes(search.toLowerCase());
        return matchName || matchCode;
      });
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tạo sản phẩm mới hoặc Xử lý Import Hàng Loạt (nếu gửi lên dạng mảng)
export async function POST(request) {
  try {
    const body = await request.json();

    // KIỂM TRA NẾU LÀ IMPORT HÀNG LOẠT (DẠNG MẢNG)
    if (Array.isArray(body)) {
      let successCount = 0;
      let errorCount = 0;

      for (const item of body) {
        try {
          if (!item.code || !item.name) continue;

          const slug = item.slug ? generateSlug(item.slug) : generateSlug(item.name);
          const priceStr = item.price !== undefined && item.price !== null ? String(item.price) : "0";
          const stockVal = item.stock !== undefined && item.stock !== null ? Number(item.stock) : 0; // Xử lý trường tồn kho

          // Chuẩn bị danh mục nếu có truyền vào (dạng chuỗi ID ngăn cách bởi dấu phẩy hoặc mảng số)
          let catConnect = [];
          if (item.categoryIds) {
            if (Array.isArray(item.categoryIds)) {
              catConnect = item.categoryIds.map((id) => ({ id: Number(id) }));
            } else if (typeof item.categoryIds === 'string') {
              catConnect = item.categoryIds.split(',').map(id => ({ id: Number(id.trim()) })).filter(c => !isNaN(c.id));
            }
          }

          // Kiểm tra xem mã sản phẩm (code) đã tồn tại chưa để Upsert thủ công chính xác
          const existing = await prisma.product.findUnique({
            where: { code: String(item.code) },
          });

          if (existing) {
            // Cập nhật nếu đã có code
            await prisma.product.update({
              where: { code: String(item.code) },
              data: {
                name: item.name,
                slug: slug,
                price: priceStr,
                stock: isNaN(stockVal) ? 0 : stockVal, // Lưu tồn kho khi update hàng loạt
                description: item.description || null,
                image: item.image || null,
                isVisible: item.isVisible !== undefined ? Boolean(item.isVisible) : true,
                isBestSeller: Boolean(item.isBestSeller),
                isGift: Boolean(item.isGift),
                ...(catConnect.length > 0 && {
                  categories: { set: catConnect }
                }),
              },
            });
          } else {
            // Tạo mới nếu chưa có code
            await prisma.product.create({
              data: {
                code: String(item.code),
                name: item.name,
                slug: slug,
                price: priceStr,
                stock: isNaN(stockVal) ? 0 : stockVal, // Lưu tồn kho khi tạo mới hàng loạt
                description: item.description || null,
                image: item.image || null,
                isVisible: item.isVisible !== undefined ? Boolean(item.isVisible) : true,
                isBestSeller: Boolean(item.isBestSeller),
                isGift: Boolean(item.isGift),
                categories: {
                  connect: catConnect,
                },
              },
            });
          }
          successCount++;
        } catch (err) {
          console.error("Lỗi khi import dòng:", item.code, err);
          errorCount++;
        }
      }

      return NextResponse.json({ success: true, successCount, errorCount }, { status: 200 });
    }

    // XỬ LÝ POST THÔNG THƯỜNG (1 SẢN PHẨM)
    const { id, ...restBody } = body;
    const slug = restBody.slug ? generateSlug(restBody.slug) : generateSlug(restBody.name);
    const stockVal = restBody.stock !== undefined && restBody.stock !== null ? Number(restBody.stock) : 0;

    const newProduct = await prisma.product.create({
      data: {
        code: restBody.code,
        name: restBody.name,
        slug: slug,
        price: restBody.price ? String(restBody.price) : "0",
        stock: isNaN(stockVal) ? 0 : stockVal, // Lưu số lượng tồn kho
        description: restBody.description || null,
        isVisible: restBody.isVisible !== undefined ? Boolean(restBody.isVisible) : true,
        image: restBody.image || null,
        isBestSeller: Boolean(restBody.isBestSeller),
        isGift: Boolean(restBody.isGift),
        categories: {
          connect: (restBody.categoryIds || []).map((catId) => ({ id: Number(catId) })),
        },
      },
      include: { categories: true },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("LỖI API PRODUCTS:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật sản phẩm
export async function PUT(request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID sản phẩm cần cập nhật' }, { status: 400 });
    }

    const slug = body.slug ? generateSlug(body.slug) : generateSlug(body.name);
    const stockVal = body.stock !== undefined && body.stock !== null ? Number(body.stock) : 0;

    const updatedProduct = await prisma.product.update({
      where: { id: Number(body.id) },
      data: {
        code: body.code,
        name: body.name,
        slug: slug,
        price: String(body.price),
        stock: isNaN(stockVal) ? 0 : stockVal, // Cập nhật số lượng tồn kho
        description: body.description || null,
        isVisible: body.isVisible !== undefined ? Boolean(body.isVisible) : true,
        image: body.image || null,
        isBestSeller: Boolean(body.isBestSeller),
        isGift: Boolean(body.isGift),
        categories: {
          set: (body.categoryIds || []).map((id) => ({ id: Number(id) })),
        },
      },
      include: { categories: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa sản phẩm
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID sản phẩm' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}