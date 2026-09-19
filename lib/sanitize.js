import DOMPurify from 'isomorphic-dompurify';

/**
 * Làm sạch chuỗi HTML trước khi render bằng dangerouslySetInnerHTML,
 * loại bỏ <script>, onXxx handlers, javascript: URL... nhằm chống XSS
 * lưu trữ (stored XSS) khi nội dung tin tức/bài viết được hiển thị công khai.
 */
export function sanitizeHtml(html) {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    // Cho phép các thẻ định dạng nội dung cơ bản của rich text editor,
    // không cho phép script/iframe/form...
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 's', 'blockquote',
      'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li',
      'a', 'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'target', 'rel', 'class', 'style'],
  });
}
