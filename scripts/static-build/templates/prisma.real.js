import { PrismaClient } from '@prisma/client';

// BẢN DÙNG CHO BUILD TĨNH (được script build-static.mjs chép đè lên lib/prisma.js
// trong thư mục build tạm). Dùng đường dẫn tuyệt đối tới prisma/dev.db để
// không phụ thuộc thư mục đang chạy.
const base = new PrismaClient({ datasourceUrl: process.env.STATIC_DATABASE_URL });

// Bản tĩnh không có giỏ hàng/đặt hàng, nên LUÔN coi như "Mở bán online" đang
// tắt (giá hiện "Liên hệ", ẩn giỏ hàng) dù trong database đang bật.
export const prisma = base.$extends({
  query: {
    setting: {
      async findUnique({ args, query }) {
        const result = await query(args);
        return result ? { ...result, isOnlineSales: false } : result;
      },
    },
  },
});

export default prisma;
