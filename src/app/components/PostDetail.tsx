import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ThumbsUp,
  Share2,
  Clock,
  Send,
  LogIn,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from 'sonner';
import { useBoard } from '../context/BoardContext';
import { noticeApi } from '@/app/api';
import type { FindNoticeDetailResponse } from '@/app/api';

const CATEGORY_LABEL: Record<string, string> = {
  NOTICE: '공지사항',
  QA: 'Q&A',
  FREE: '자유게시판',
};

export function PostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { comments, addComment, currentUser } = useBoard();
  const [commentText, setCommentText] = useState('');

  // ── 백엔드에서 게시글 조회 ──
  const [notice, setNotice] = useState<FindNoticeDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── 좋아요 상태 ──
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);

  // ── 댓글 (로컬 컨텍스트 사용) ──
  const postComments = comments.filter((c) => c.postId === id);

  const numericId = id ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (isNaN(numericId)) {
      setError('유효하지 않은 게시글 ID입니다.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    noticeApi
      .findNoticeDetail(numericId)
      .then((data) => {
        setNotice(data);
        setLikeCount(data.likeCount);
      })
      .catch((err) => {
        setError(err?.message ?? '게시글을 불러오지 못했습니다.');
      })
      .finally(() => setLoading(false));
  }, [numericId]);

  // ── 좋아요 토글 ──
  const handleLike = async () => {
    if (!currentUser) {
      toast.error('로그인 후 이용할 수 있습니다.');
      navigate('/login');
      return;
    }
    if (liking || isNaN(numericId)) return;
    setLiking(true);
    try {
      if (liked) {
        await noticeApi.unlikeNotice(numericId);
        setLikeCount((n) => Math.max(0, n - 1));
        setLiked(false);
      } else {
        await noticeApi.likeNotice(numericId);
        setLikeCount((n) => n + 1);
        setLiked(true);
      }
    } catch {
      toast.error('좋아요 처리에 실패했습니다.');
    } finally {
      setLiking(false);
    }
  };

  // ── 공유 ──
  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('링크가 복사되었습니다.');
    } catch {
      toast.info('주소창의 URL을 복사해 공유하세요.');
    }
  };

  // ── 댓글 등록 ──
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id) return;
    addComment(id, commentText);
    setCommentText('');
    toast.success('댓글이 등록되었습니다.');
  };

  // ── 로딩 ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // ── 에러 ──
  if (error || !notice) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4 text-gray-500">
        <AlertCircle size={40} className="text-gray-300" />
        <h2 className="text-xl font-bold">{error ?? '게시글을 찾을 수 없습니다.'}</h2>
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline text-sm">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      {/* 헤더 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">목록으로</span>
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
            title="공유하기"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* 게시글 본문 */}
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-100">
          {/* 카테고리 + 날짜 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wide">
              {CATEGORY_LABEL[notice.category] ?? notice.category}
            </span>
            <span className="text-gray-400 text-sm flex items-center gap-1">
              <Clock size={14} />
              {format(new Date(notice.createAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
            </span>
          </div>

          {/* 제목 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {notice.title}
          </h1>

          {/* 작성자 + 좋아요 수 */}
          <div className="flex items-center justify-between pb-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                {(notice.createBy ?? '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{notice.createBy}</p>
                <p className="text-xs text-gray-500">
                  {notice.updateAt && notice.updateAt !== notice.createAt
                    ? `수정됨 · ${format(new Date(notice.updateAt), 'yyyy.MM.dd', { locale: ko })}`
                    : ''}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-indigo-600 font-semibold">
              <ThumbsUp size={16} />
              {likeCount}
            </div>
          </div>

          {/* 본문 */}
          <div className="mt-8 text-gray-700 leading-relaxed whitespace-pre-wrap min-h-[160px] text-[15px]">
            {notice.content}
          </div>
        </div>

        {/* 좋아요 / 공유 액션 */}
        <div className="bg-gray-50 px-8 py-4 flex items-center justify-center gap-4 border-t border-gray-100">
          <button
            onClick={handleLike}
            disabled={liking}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border font-medium transition-all shadow-sm disabled:opacity-60 ${
              liked
                ? 'bg-indigo-600 border-indigo-600 text-white'
                : 'bg-white border-gray-200 text-gray-600 hover:bg-indigo-50 hover:border-indigo-300'
            }`}
          >
            {liking ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <ThumbsUp size={18} />
            )}
            좋아요 {likeCount}
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <Share2 size={18} />
            공유하기
          </button>
        </div>
      </article>

      {/* 댓글 섹션 */}
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
              </div>
            </div>
          ))}
          {postComments.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">첫 댓글을 남겨보세요.</p>
          )}
        </div>

        {/* 댓글 입력 */}
        {currentUser ? (
          <form onSubmit={handleAddComment} className="relative">
            <div className="flex items-start gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full mt-1 flex-shrink-0"
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
