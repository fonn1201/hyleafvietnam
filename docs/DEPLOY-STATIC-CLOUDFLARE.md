# Đăng website bản TĨNH lên Cloudflare Pages

Hướng dẫn này dành cho giai đoạn **chỉ quảng bá, chưa bán online**. Bản tĩnh chỉ gồm file HTML/CSS/JS/ảnh làm sẵn nên hosting miễn phí, rất nhanh và gần như không có gì để hacker tấn công (không server, không database, không trang đăng nhập trên mạng).

> Mã nguồn gốc (`main`) **không bị đổi**. Bản tĩnh được tạo bằng lệnh riêng `npm run build:static`; `npm run dev`, `npm run build`, `npm start` vẫn chạy như cũ. Khi muốn bán online, bạn chuyển sang bản đầy đủ mà không phải gộp nhánh hay sửa code.

## 1. Bản tĩnh có và không có gì

| Có | Không có |
|---|---|
| Trang chủ, banner, danh mục, sản phẩm (giá hiện "Liên hệ"), tin tức, bài viết | Trang admin online (chỉ chạy trên máy bạn) |
| Tìm kiếm, lọc Bán chạy / Quà tặng, phân trang (chạy ngay trên trình duyệt) | Giỏ hàng, đặt hàng, tra cứu đơn |
| Nút Zalo, Fanpage ở chân trang, `sitemap.xml`, `robots.txt` | Gửi email, thanh toán |

Bản tĩnh **luôn** hiện giá "Liên hệ" và ẩn giỏ hàng, kể cả khi trong Cài đặt bạn đang bật "Mở bán online".

## 2. Quy trình cập nhật nội dung (lặp lại mỗi lần sửa web)

1. **Nhập/sửa nội dung** trên máy: chạy `npm run dev`, mở `http://localhost:3000/admin` (sản phẩm, tin tức, bài viết, banner, Cài đặt...).
2. **Build bản tĩnh:** `npm run build:static`. Kết quả nằm trong thư mục `out`.
3. **Xem thử trên máy (nên làm):** tắt `npm run dev`, rồi chạy `npx serve out` và mở địa chỉ nó in ra.
4. **Đăng lên Cloudflare Pages** (mục 4 hoặc mục 6 bên dưới).

Trước lần build đầu tiên, hãy điền **Cài đặt** trong admin: Tên website, Hotline, Link Zalo, Link Fanpage, Địa chỉ, Về chúng tôi. Chân trang lấy dữ liệu từ đó, ô nào để trống thì dòng đó tự ẩn.

## 3. Chuẩn bị một lần

- Cài Node.js 20 trở lên, chạy `npm install` trong thư mục dự án.
- Trong file `.env` đặt tên miền thật của bạn (dùng cho sitemap):
  `NEXT_PUBLIC_SITE_URL=https://ten-mien-cua-ban.com`
  (hoặc truyền khi build: `npm run build:static -- --site-url=https://ten-mien-cua-ban.com`)
- **Nén ảnh trước khi tải lên admin** (nên dưới khoảng 300–500KB mỗi ảnh). Bản tĩnh không tự thu nhỏ ảnh nên ảnh quá nặng sẽ làm web chậm.
- **Backup thường xuyên** hai thứ này, vì chúng là toàn bộ nội dung của bạn và chỉ nằm trên máy bạn (không có trên GitHub):
  - `prisma/dev.db` (database)
  - `public/uploads` (ảnh đã tải lên)

## 4. Đăng bản đầu tiên lên Cloudflare Pages

1. Tạo tài khoản miễn phí tại cloudflare.com và đăng nhập.
2. Vào **Workers & Pages** → **Create** (hoặc "Create application") → chọn **Pages** → chọn **Upload assets / Use direct upload** (đừng chọn "Connect to Git").
3. Đặt tên dự án (ví dụ `hyleaf`), bấm **Create project**.
4. Kéo thả **thư mục `out`** vào ô tải lên (hoặc nén nội dung bên trong `out` thành file .zip rồi thả vào; file `index.html` phải nằm ngay ở gốc). Bấm **Deploy site**.
5. Xong, bạn có địa chỉ dạng `ten-du-an.pages.dev`. Mở lên xem thử: trang chủ, một sản phẩm, ô tìm kiếm.

Lưu ý: tên các nút của Cloudflare thay đổi khá thường xuyên, nếu không thấy đúng chữ thì tìm nút có ý nghĩa tương tự. Một dự án tạo kiểu "Direct upload" không chuyển sang kiểu kết nối Git được về sau. Điều này không sao với dự án này, vì database không nằm trên GitHub nên Cloudflare không thể tự build thay bạn.

## 5. Gắn tên miền riêng

1. Mua tên miền ở nơi bạn muốn (chi phí riêng, tính theo năm).
2. Khuyến nghị: thêm tên miền vào Cloudflare (**Add a site**, chọn gói **Free**), rồi vào trang quản lý tên miền ở nơi bạn mua và **đổi Nameserver** sang 2 địa chỉ Cloudflare cung cấp. Theo hướng dẫn hiện tại của Cloudflare, tên miền gốc (không có `www`) cần dùng DNS của Cloudflare để gắn vào Pages.
3. Vào dự án Pages → **Custom domains** → **Set up a custom domain** → nhập `ten-mien-cua-ban.com`, làm tương tự cho `www.ten-mien-cua-ban.com`. Cloudflare tự tạo bản ghi DNS và chứng chỉ HTTPS.
4. Chờ từ vài phút đến vài giờ, rồi mở `https://ten-mien-cua-ban.com`.
5. Trong Cloudflare, bật **SSL/TLS → Edge Certificates → Always Use HTTPS**.

## 6. Cập nhật web sau này

Lặp lại mục 2 (sửa nội dung → `npm run build:static`), rồi vào dự án Pages → **Deployments** → **Create deployment** và tải lại thư mục `out`. Mỗi lần tải là một bản mới, các bản cũ vẫn nằm trong danh sách Deployments.

(Tuỳ chọn cho người quen dòng lệnh: `npx wrangler pages deploy out --project-name=ten-du-an` sau khi đăng nhập bằng `npx wrangler login`.)

## 7. Kiểm tra sau khi lên mạng

- Mở thử trang chủ, sản phẩm, tin tức, bài viết, tìm kiếm trên cả điện thoại.
- Kiểm tra header bảo mật: `curl.exe -I https://ten-mien-cua-ban.com` (PowerShell) phải thấy `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`... File `_headers` trong `out` lo việc này.
- Đăng ký **Google Search Console**, thêm tên miền và gửi `https://ten-mien-cua-ban.com/sitemap.xml`.

## 8. Khi muốn bán online

Bản đầy đủ chính là `main` hiện tại (admin online, giỏ hàng, đặt hàng, tra cứu đơn), cần chạy trên một máy chủ (VPS). Bản tĩnh và bản đầy đủ dùng chung một mã nguồn, nên không có gì phải gộp hay làm lại. Mình sẽ hướng dẫn triển khai VPS riêng khi bạn cần.

## 9. Xử lý sự cố

| Hiện tượng | Cách xử lý |
|---|---|
| "Không tìm thấy database tại ..." | Chạy build trên máy đang có file `prisma/dev.db` (máy bạn dùng admin) |
| Build lỗi | Chạy lại `npm run build:static -- --keep`, chụp/copy toàn bộ lỗi gửi người hỗ trợ (thư mục `.static-build` được giữ lại để kiểm tra) |
| Sitemap trỏ về `localhost` | Chưa đặt `NEXT_PUBLIC_SITE_URL`, xem mục 3 |
| Muốn thử quy trình mà chưa có dữ liệu | `npm run build:static -- --stub-db` (dùng dữ liệu mẫu, không đụng database thật) |
| Sau khi sửa admin web vẫn cũ | Bản tĩnh chỉ đổi khi bạn build lại và tải lại `out` (mục 6) |
