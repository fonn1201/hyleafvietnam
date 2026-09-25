'use client';

import React, { useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { validateImageFile } from '@/lib/uploadValidation';

function ToolbarButton({ onClick, active, disabled, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition disabled:opacity-30 disabled:cursor-not-allowed ${
        active ? 'bg-[#12412C] text-white' : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Trình soạn thảo nội dung dạng rich text (TipTap) dùng chung cho form
 * Tin Tức và Bài Viết - thay cho <textarea> chữ thường trước đây (khiến
 * xuống dòng bị "dính liền" khi hiển thị, vì nội dung render ra là HTML).
 * Hỗ trợ: in đậm/nghiêng/gạch chân, tiêu đề, danh sách, link, và CHÈN ẢNH
 * ngay tại vị trí con trỏ (không giới hạn số lượng ảnh trong bài).
 */
export default function RichTextEditor({ value, onChange }) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = React.useState(false);

  const editor = useEditor({
    // Bắt buộc với Next.js App Router để tránh lệch nội dung giữa server/
    // client lúc hydrate (TipTap khuyến nghị chính thức)
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[220px] px-3 py-2.5 focus:outline-none',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  const handleInsertLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Nhập đường dẫn (URL):', previousUrl || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  const handleImageButtonClick = () => fileInputRef.current?.click();

  const handleImageFileChange = async (e) => {
    const file = e.target.files[0];
    e.target.value = ''; // reset để chọn lại cùng 1 file vẫn kích hoạt onChange
    if (!file || !editor) return;

    const { valid, error } = validateImageFile(file);
    if (!valid) {
      alert(error);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert(data.error || 'Tải ảnh lên thất bại');
      }
    } catch (err) {
      alert('Lỗi tải ảnh lên server');
    } finally {
      setUploading(false);
    }
  };

  if (!editor) {
    return <div className="border border-gray-200 rounded-xl p-3 text-sm text-gray-400">Đang tải trình soạn thảo...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
        <ToolbarButton label="In đậm" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>B</ToolbarButton>
        <ToolbarButton label="In nghiêng" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><em>I</em></ToolbarButton>
        <ToolbarButton label="Gạch chân" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><span className="underline">U</span></ToolbarButton>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton label="Tiêu đề lớn" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</ToolbarButton>
        <ToolbarButton label="Tiêu đề vừa" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</ToolbarButton>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton label="Danh sách gạch đầu dòng" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>•≡</ToolbarButton>
        <ToolbarButton label="Danh sách đánh số" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1.≡</ToolbarButton>
        <ToolbarButton label="Trích dẫn" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&quot;</ToolbarButton>
        <span className="w-px h-5 bg-gray-200 mx-1" />
        <ToolbarButton label="Chèn link" active={editor.isActive('link')} onClick={handleInsertLink}>🔗</ToolbarButton>
        <ToolbarButton label="Chèn ảnh vào bài" onClick={handleImageButtonClick} disabled={uploading}>
          {uploading ? '⏳' : '🖼️'}
        </ToolbarButton>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFileChange} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
