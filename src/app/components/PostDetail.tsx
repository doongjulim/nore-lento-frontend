import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ThumbsUp,
  Share2,
  MoreHorizontal,
  Clock,
  Eye,
  Send,
  LogIn
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { useBoard } from '../context/BoardContext';

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts, comments, addComment, currentUser } = useBoard();
  const [commentText, setCommentText] = useState('');

  const post = posts.find(p => p.id === id);
  const postComments = comments.filter(c => c.postId === id);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <h2 className="text-xl font-bold mb-2">게시글을 찾을 수 없습니다.</h2>
        <button 
          onClick={() => navigate(-1)}
          className="text-indigo-600 hover:underline"
        >
          돌아가기
        </button>
      </div>
    );
  }


  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!id) return;

    addComment(id, commentText);
    setCommentText('');
    toast.success('댓글이 등록되었습니다.');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/board')}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">목록으로</span>
        </button>
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <Share2 size={20} />
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide">
              {post.category}
            </span>
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Clock size={14} />
              {format(new Date(post.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-10 h-10 rounded-full border border-gray-100" 
              />
              <div>
                <p className="font-medium text-gray-900">{post.author.name}</p>
                <p className="text-xs text-gray-500">Level 5 · Developer</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-gray-400 text-sm">
              <span className="flex items-center gap-1">
                <Eye size={16} />
                {post.viewCount}
              </span>
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <ThumbsUp size={16} />
                {post.likes}
              </span>
            </div>
          </div>

          <div className="mt-8 prose prose-indigo max-w-none text-gray-700 leading-relaxed min-h-[200px] whitespace-pre-wrap">
            {post.content}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-8 py-4 flex items-center justify-center gap-4 border-t border-gray-100">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            <ThumbsUp size={18} />
            <span className="font-medium">좋아요 {post.likes}</span>
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
            <Share2 size={18} />
            <span className="font-medium">공유하기</span>
          </button>
        </div>
      </article>

      {/* Comments Section */}
      <section className="bg-gray-50 rounded-2xl p-8 border border-gray-200/50">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          댓글 <span className="text-indigo-600">{postComments.length}</span>
        </h3>

        <div className="space-y-6 mb-8">
          {postComments.map((comment) => (
            <div key={comment.id} className="flex gap-4 group">
              <img 
                src={comment.author.avatar} 
                alt={comment.author.name} 
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-900">
                    {comment.author.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {format(new Date(comment.createdAt), 'MM.dd HH:mm', { locale: ko })}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed bg-white p-3 rounded-r-xl rounded-bl-xl shadow-sm border border-gray-100 inline-block">
                  {comment.content}
                </p>
                <button className="text-xs text-gray-400 hover:text-gray-600 block pt-1">
                  답글 달기
                </button>
              </div>
            </div>
          ))}
          {postComments.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">첫 댓글을 남겨보세요.</p>
          )}
        </div>

        {/* Comment Input */}
        {currentUser ? (
          <form onSubmit={handleAddComment} className="relative">
            <div className="flex items-start gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full mt-1"
              />
              <div className="flex-1 relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="댓글을 입력하세요..."
                  className="w-full min-h-[80px] p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none shadow-sm text-sm"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-xs text-gray-400">{commentText.length}/500</span>
                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="flex items-center justify-center gap-3 py-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">댓글을 작성하려면 로그인이 필요합니다.</p>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <LogIn size={15} />
              로그인
            </button>
          </div>
        )}
      </section>
    </motion.div>
  );
}
