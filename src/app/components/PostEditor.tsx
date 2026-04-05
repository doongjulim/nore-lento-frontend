import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft, Save, Loader2, Image as ImageIcon,
  Link as LinkIcon, Paperclip, X, FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { categories } from '../mockData';
import { useBoard } from '../context/BoardContext';
import { Attachment } from '../types';
import { API_BASE_URL } from '../config/api';

interface PostFormData {
  title: string;
  category: string;
  content: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PostEditor() {
  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<PostFormData>();
  const navigate = useNavigate();
  const { addPost } = useBoard();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [attachedImages, setAttachedImages] = useState<Array<{ name: string; url: string }>>([]);
  const [attachedFiles, setAttachedFiles] = useState<Array<Attachment & { size?: number }>>([]);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const contentRegister = register('content', { required: '내용을 입력해주세요.' });

  function insertAtCursor(text: string) {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart ?? 0;
    const end = ta.selectionEnd ?? 0;
    const next = ta.value.slice(0, start) + text + ta.value.slice(end);
    setValue('content', next, { shouldValidate: true });
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + text.length;
      ta.focus();
    });
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const newImages = files.map(f => ({ name: f.name, url: URL.createObjectURL(f) }));
    setAttachedImages(prev => [...prev, ...newImages]);
    e.target.value = '';
  }

  function removeImage(index: number) {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const newAttachments = files.map(f => ({
      name: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
    }));
    setAttachedFiles(prev => [...prev, ...newAttachments]);
    e.target.value = '';
  }

  function handleInsertLink() {
    if (!linkUrl) return;
    const label = linkText.trim() || linkUrl;
    insertAtCursor(`[${label}](${linkUrl})`);
    setLinkUrl('');
    setLinkText('');
    setShowLinkDialog(false);
  }

  function removeAttachment(index: number) {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  }

  const onSubmit = async (data: PostFormData) => {
    const token = localStorage.getItem('nore_lento_token');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v2/notice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          category: data.category,
        }),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        toast.error(resData.message ?? '게시글 등록에 실패했습니다.');
        return;
      }

      const attachments: Attachment[] = [
        ...attachedImages.map(({ name, url }) => ({ name, url, type: 'image' as const })),
        ...attachedFiles.map(({ name, url }) => ({ name, url, type: 'file' as const })),
      ];

      addPost(data.title, data.content, data.category, attachments);
      toast.success('게시글이 성공적으로 작성되었습니다.');
      navigate('/board');
    } catch {
      toast.error('서버에 연결할 수 없습니다.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Hidden inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">새 글 작성</h2>
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title & Category */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">제목</label>
            <input
              id="title"
              type="text"
              placeholder="제목을 입력하세요"
              {...register('title', { required: '제목은 필수입니다.' })}
              className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm ${errors.title ? 'border-red-300' : 'border-gray-200'}`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
            <select
              id="category"
              {...register('category', { required: '카테고리를 선택해주세요.' })}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm appearance-none"
            >
              <option value="">선택</option>
              {categories.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1 p-2 bg-gray-50 border border-gray-200 rounded-t-xl border-b-0">
          {/* Image */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors"
            title="이미지 첨부"
          >
            <ImageIcon size={18} />
          </button>

          {/* Link */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLinkDialog(v => !v)}
              className={`p-2 rounded text-gray-600 transition-colors ${showLinkDialog ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-200'}`}
              title="링크 추가"
            >
              <LinkIcon size={18} />
            </button>

            {showLinkDialog && (
              <div className="absolute top-10 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-xl p-4 w-72">
                <p className="text-sm font-semibold text-gray-800 mb-3">링크 삽입</p>
                <input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInsertLink()}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-2 focus:outline-none focus:border-indigo-500"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="표시 텍스트 (선택)"
                  value={linkText}
                  onChange={e => setLinkText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleInsertLink()}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-3 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => { setShowLinkDialog(false); setLinkUrl(''); setLinkText(''); }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={handleInsertLink}
                    disabled={!linkUrl}
                    className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    삽입
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* File */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors"
            title="파일 첨부"
          >
            <Paperclip size={18} />
          </button>

          <div className="w-px h-4 bg-gray-300 mx-2" />
          <button type="button" className="px-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">B</button>
          <button type="button" className="px-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors italic">I</button>
          <button type="button" className="px-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline">U</button>
        </div>

        {/* Content */}
        <div className="-mt-6">
          <textarea
            {...contentRegister}
            ref={(el) => {
              contentRegister.ref(el);
              textareaRef.current = el;
            }}
            placeholder="내용을 입력하세요..."
            className={`w-full min-h-[400px] p-4 bg-white border rounded-b-xl border-t-0 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-y ${errors.content ? 'border-red-300' : 'border-gray-200'}`}
          />
          {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
        </div>

        {/* Attached Images */}
        {attachedImages.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              이미지 ({attachedImages.length})
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {attachedImages.map((img, i) => (
                <div key={i} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img
                      src={img.url}
                      alt={img.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
                  >
                    <X size={12} />
                  </button>
                  <p className="text-xs text-gray-400 truncate mt-1 text-center">{img.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attached Files */}
        {attachedFiles.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">첨부 파일 ({attachedFiles.length})</p>
            {attachedFiles.map((file, i) => (
              <div key={i} className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm">
                <FileText size={16} className="text-indigo-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 flex-1 truncate">{file.name}</span>
                {file.size !== undefined && (
                  <span className="text-xs text-gray-400">{formatSize(file.size)}</span>
                )}
                <button
                  type="button"
                  onClick={() => removeAttachment(i)}
                  className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save size={18} />
                게시글 등록
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
