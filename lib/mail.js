import nodemailer from 'nodemailer';

// Khởi tạo cấu hình kết nối sử dụng tài khoản Gmail của bạn
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // true cho port 465, false cho các port khác (587)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Hệ Thống Quản Trị" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("Email đã gửi thành công: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    return false;
  }
}