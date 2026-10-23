#!/usr/bin/env node
/**
 * Xuất website thành bản TĨNH (thư mục out/ chỉ gồm HTML/CSS/JS/ảnh) để đăng
 * lên hosting miễn phí như Cloudflare Pages.
 *
 * Cách dùng:   npm run build:static
 * Thử không cần database thật:   npm run build:static -- --stub-db
 *
 * Script KHÔNG sửa mã nguồn gốc. Nó chép dự án sang thư mục tạm
 * .static-build/, bỏ các phần cần server (admin, API, giỏ hàng, thanh toán,
 * tra cứu đơn), thay vài file bằng bản phù hợp với web tĩnh (lấy từ
 * scripts/static-build/templates), build ở đó rồi chép kết quả ra out/.
 * Vì vậy npm run build / npm start bình thường hoàn toàn không bị ảnh hưởng.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TPL = path.join(__dirname, 'static-build', 'templates');
const TMP = path.join(ROOT, '.static-build');
const OUT = path.join(ROOT, 'out');

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(`--${name}`);
const getOpt = (name) => {
  const found = args.find((a) => a.startsWith(`--${name}=`));
  return found ? found.slice(name.length + 3) : undefined;
};

const log = (msg) => console.log(`▸ ${msg}`);
const warn = (msg) => console.warn(`⚠️  ${msg}`);
function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

const useStub = hasFlag('stub-db');
const stubEmpty = hasFlag('stub-empty');
const keepTmp = hasFlag('keep');

// ---------- 1. Kiểm tra điều kiện ----------
const dbPath = path.join(ROOT, 'prisma', 'dev.db');
if (!useStub && !fs.existsSync(dbPath)) {
  fail(
    `Không tìm thấy database tại ${dbPath}.\n` +
      '   Bản tĩnh được dựng từ database trên máy bạn. Hãy chạy build trên máy đang có dữ liệu thật.'
  );
}

function readEnvFileVar(name) {
  try {
    const text = fs.readFileSync(path.join(ROOT, '.env'), 'utf8');
    const match = text.match(new RegExp(`^\\s*${name}\\s*=\\s*(.*)\\s*$`, 'm'));
    return match ? match[1].replace(/^["']|["']$/g, '').trim() : undefined;
  } catch {
    return undefined;
  }
}

let siteUrl = getOpt('site-url') || process.env.NEXT_PUBLIC_SITE_URL || readEnvFileVar('NEXT_PUBLIC_SITE_URL');
if (!siteUrl) {
  siteUrl = 'http://localhost:3000';
  warn(
    'Chưa có NEXT_PUBLIC_SITE_URL nên sitemap.xml sẽ trỏ về localhost. ' +
      'Đặt trong file .env hoặc chạy: npm run build:static -- --site-url=https://ten-mien.com'
  );
}
siteUrl = siteUrl.replace(/\/+$/, '');

// ---------- 2. Chép dự án sang thư mục tạm ----------
log('Chuẩn bị thư mục build tạm (.static-build)...');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(TMP, { recursive: true });

for (const item of ['app', 'components', 'lib', 'public', 'jsconfig.json', 'postcss.config.mjs', 'package.json']) {
  const src = path.join(ROOT, item);
  if (!fs.existsSync(src)) fail(`Thiếu "${item}" trong dự án, không thể build tĩnh.`);
  fs.cpSync(src, path.join(TMP, item), { recursive: true });
}

// ---------- 3. Bỏ các phần cần server ----------
for (const rel of ['app/admin', 'app/api', 'app/cart', 'app/checkout', 'app/tra-cuu-don-hang', 'components/admin']) {
  fs.rmSync(path.join(TMP, rel), { recursive: true, force: true });
}

// ---------- 4. Thay các file bằng bản phù hợp web tĩnh ----------
function applyTemplate(templateName, destRel, { mustExist }) {
  const dest = path.join(TMP, destRel);
  if (mustExist && !fs.existsSync(dest)) {
    fail(
      `File "${destRel}" không còn trong dự án (có thể đã đổi tên/di chuyển).\n` +
        `   Cần cập nhật script build tĩnh cho khớp (template: ${templateName}).`
    );
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(TPL, templateName), dest);
}

applyTemplate(useStub ? 'prisma.stub.js' : 'prisma.real.js', 'lib/prisma.js', { mustExist: true });
applyTemplate('search-client.js', 'lib/searchClient.js', { mustExist: true });
applyTemplate('products-page.js', 'app/products/page.js', { mustExist: true });
applyTemplate('category-page.js', 'app/categories/[slug]/page.js', { mustExist: true });
applyTemplate('StaticProductGrid.js', 'components/StaticProductGrid.js', { mustExist: false });
applyTemplate(path.join('search-index', 'route.js'), 'app/search-index.json/route.js', { mustExist: false });

// Các trang chi tiết cần khai báo trước danh sách đường dẫn (generateStaticParams)
const DYNAMIC_PAGES = [
  { file: 'app/products/[code]/page.js', model: 'product', where: '{ isVisible: true }', param: 'code' },
  { file: 'app/news/[slug]/page.js', model: 'news', where: '{ published: true }', param: 'slug' },
  { file: 'app/posts/[slug]/page.js', model: 'post', where: '{ published: true }', param: 'slug' },
];
for (const { file, model, where, param } of DYNAMIC_PAGES) {
  const full = path.join(TMP, file);
  if (!fs.existsSync(full)) fail(`Không thấy "${file}" để thêm generateStaticParams.`);
  const code = fs.readFileSync(full, 'utf8');
  if (!/import\s+\{\s*prisma\s*\}\s+from\s+["']@\/lib\/prisma["']/.test(code)) {
    fail(`"${file}" không import { prisma } như dự kiến, cần cập nhật script build tĩnh.`);
  }
  const extra = `

// ---- Thêm tự động bởi build tĩnh (scripts/build-static.mjs) ----
export const dynamicParams = false;

export async function generateStaticParams() {
  const rows = await prisma.${model}.findMany({ where: ${where}, select: { slug: true } });
  const params = rows.filter((r) => r.slug).map((r) => ({ ${param}: r.slug }));
  // Bản xuất tĩnh bắt buộc có ít nhất 1 đường dẫn; chưa có nội dung nào thì
  // tạo 1 đường dẫn giữ chỗ (trang này trả về 404).
  return params.length ? params : [{ ${param}: '__empty__' }];
}
`;
  fs.writeFileSync(full, code + extra);
}

// ---------- 5. Cấu hình build tĩnh ----------
fs.writeFileSync(
  path.join(TMP, 'next.config.mjs'),
  `// Tự sinh bởi scripts/build-static.mjs - không chỉnh tay.
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  poweredByHeader: false,
  turbopack: { root: ${JSON.stringify(ROOT)} },
};
export default nextConfig;
`
);
fs.writeFileSync(path.join(TMP, '.env'), `NEXT_PUBLIC_SITE_URL=${siteUrl}\n`);
fs.copyFileSync(path.join(TPL, 'headers.txt'), path.join(TMP, 'public', '_headers'));

// Thư mục build tạm bị .gitignore nên cần chỉ rõ cho Tailwind nơi quét class
fs.appendFileSync(
  path.join(TMP, 'app', 'globals.css'),
  '\n\n/* Thêm bởi build tĩnh: chỉ rõ nơi Tailwind quét class */\n@source "../app";\n@source "../components";\n'
);

// ---------- 6. Chạy next build ----------
log('Đang build (có thể mất 1-3 phút)...');
const require = createRequire(import.meta.url);
const nextBin = require.resolve('next/dist/bin/next');
const env = {
  ...process.env,
  STATIC_EXPORT: '1',
  STATIC_DATABASE_URL: `file:${dbPath.replace(/\\/g, '/')}`,
  STUB_EMPTY: stubEmpty ? '1' : '',
};
delete env.NODE_ENV;

const result = spawnSync(process.execPath, [nextBin, 'build'], { cwd: TMP, stdio: 'inherit', env });
if (result.status !== 0) {
  fail(
    'Build bản tĩnh thất bại, xem lỗi phía trên.\n' +
      '   Thư mục .static-build được giữ lại để kiểm tra. Hãy gửi lỗi cho người hỗ trợ.'
  );
}

// ---------- 7. Chép kết quả ra out/ ----------
const builtOut = path.join(TMP, 'out');
if (!fs.existsSync(builtOut)) fail('Build xong nhưng không thấy thư mục out/.');

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(builtOut, OUT, { recursive: true });

// ---------- 8. Kiểm tra kết quả ----------
function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

const allFiles = walk(OUT);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const totalBytes = allFiles.reduce((sum, f) => sum + fs.statSync(f).size, 0);

// Liên kết trỏ tới các trang không có trong bản tĩnh sẽ dẫn tới lỗi 404
const BROKEN_LINK = /href="\/(cart|checkout|admin|api|tra-cuu-don-hang)(\/|"|\?|#)/;
const brokenIn = htmlFiles.filter((f) => BROKEN_LINK.test(fs.readFileSync(f, 'utf8')));

if (!keepTmp) fs.rmSync(TMP, { recursive: true, force: true });

console.log('\n✅ Build bản tĩnh thành công!');
console.log(`   Thư mục kết quả : ${OUT}`);
console.log(`   Số trang HTML   : ${htmlFiles.length}`);
console.log(`   Tổng dung lượng : ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);
if (brokenIn.length > 0) {
  warn(`Có ${brokenIn.length} trang chứa liên kết tới trang không tồn tại trong bản tĩnh:`);
  for (const f of brokenIn.slice(0, 10)) console.warn(`     - ${path.relative(OUT, f)}`);
}
console.log('\nBước tiếp theo: tải thư mục "out" lên Cloudflare Pages (xem docs/DEPLOY-STATIC-CLOUDFLARE.md).\n');
