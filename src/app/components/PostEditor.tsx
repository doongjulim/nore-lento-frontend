import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Loader2, Image as ImageIcon, Link as LinkIcon, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { categories } from '../mockData';
import { useBoard } from '../context/BoardContext';

interface PostFormData {
  title: string;
  category: string;
  content: string;
}

export function PostEditor() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PostFormData>();
  const navigate = useNavigate();
  const { addPost } = useBoard();

  const onSubmit = async (data: PostFormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addPost(data.title, data.content, data.category);
    
    toast.success('게시글이 성공적으로 작성되었습니다.');
    navigate('/board');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-6"
    >
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
              className={`
                w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm
                ${errors.title ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'}
              `}
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
        <div className="flex items-center gap-2 p-2 bg-gray-50 border border-gray-200 rounded-t-xl border-b-0">
          <button type="button" className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="이미지 첨부">
            <ImageIcon size={18} />
          </button>
          <button type="button" className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="링크 추가">
            <LinkIcon size={18} />
          </button>
          <button type="button" className="p-2 hover:bg-gray-200 rounded text-gray-600 transition-colors" title="파일 첨부">
            <Paperclip size={18} />
          </button>
          <div className="w-px h-4 bg-gray-300 mx-2" />
          <button type="button" className="px-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            B
          </button>
          <button type="button" className="px-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors italic">
            I
          </button>
          <button type="button" className="px-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline">
            U
          </button>
        </div>

        {/* Content */}
        <div className="-mt-6">
          <textarea
            {...register('content', { required: '내용을 입력해주세요.' })}
            placeholder="내용을 입력하세요..."
            className={`
              w-full min-h-[400px] p-4 bg-white border rounded-b-xl border-t-0 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-y
              ${errors.content ? 'border-red-300' : 'border-gray-200'}
            `}
          />
          {errors.content && <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>}
        </div>

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
