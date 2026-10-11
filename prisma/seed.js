const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

// Quyền của tài khoản admin đầu tiên: toàn bộ các module hiện có.
const ALL_PERMISSIONS = 'products,orders,slides,categories,posts,news,users,settings';

async function main() {
  // KHÔNG còn tài khoản/mật khẩu mặc định cố định trong code (repo này public,
  // ai cũng đọc được). Email bắt buộc truyền qua biến môi trường; mật khẩu có
  // thể truyền qua SEED_ADMIN_PASSWORD, nếu không sẽ tự sinh ngẫu nhiên và in
  // ra MỘT LẦN duy nhất ở đây.
  const email = process.env.SEED_ADMIN_EMAIL;
  if (!email) {
    throw new Error(
      'Thiếu SEED_ADMIN_EMAIL. Ví dụ (PowerShell): $env:SEED_ADMIN_EMAIL="ban@tenmien.com"; npx prisma db seed'
    );
  }

  const providedPassword = process.env.SEED_ADMIN_PASSWORD;
  if (providedPassword && providedPassword.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD phải có ít nhất 8 ký tự.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Tài khoản ${email} đã tồn tại, giữ nguyên (không đổi mật khẩu/quyền).`);
    return;
  }

  const password = providedPassword || crypto.randomBytes(12).toString('base64url');
  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name: 'Administrator',
      password: hashedPassword,
      permissions: ALL_PERMISSIONS,
    },
  });

  console.log(`Đã tạo tài khoản admin: ${email}`);
  if (!providedPassword) {
    console.log(`Mật khẩu tạm (chỉ hiện 1 lần, hãy đăng nhập và đổi ngay): ${password}`);
  }
}

main()
  .catch((e) => {
    console.error(e.message || e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
