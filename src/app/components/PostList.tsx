import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router';
import { useBoard } from '../context/BoardContext';
import { toast } from 'sonner';
import { noticeApi } from '@/app/api';
import type { FindNoticeResponse, NoticeCategory } from '@/app/api';

type BoardCategory = 'notice' | 'qna' | 'free';

const boardMeta: Record<BoardCategory, { title: string; description: string }> = {
  notice: { title: '공지사항', description: '서비스 관련 공지사항을 확인하세요.' },
  qna: { title: 'Q&A', description: '궁금한 점을 질문하고 답변을 받아보세요.' },
  free: { title: '자유게시판', description: '자유롭게 소통하고 지식을 공유하세요.' },
};

// 프론트 category → 백엔드 NoticeCategory 변환 ('qna' → 'QA')
const toApiCategory: Record<BoardCategory, NoticeCategory> = {
  notice: 'NOTICE',
  qna: 'QA',
  free: 'FREE',
};

const categoryBadge: Record<NoticeCategory, string> = {
  NOTICE: 'bg-red-50 text-red-600 border-red-100',
  QA: 'bg-green-50 text-green-600 border-green-100',
  FREE: 'bg-gray-100 text-gray-600 border-gray-200',
};

const categoryLabel: Record<NoticeCategory, string> = {
  NOTICE: '공지',
  QA: 'Q&A',
  FREE: '자유',
};

const PAGE_SIZE = 10;

interface PostListProps {
  category: BoardCategory;
}

export function PostList({ category }: PostListProps) {
  const { isAuthenticated } = useBoard();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FindNoticeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0); // 0-based (백엔드)
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchPosts = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await noticeApi.findNotices({
        category: toApiCategory[category],
        page: pageNum,
        size: PAGE_SIZE,
        sort: 'id,desc',
      });
      setPosts(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setError((err as Error).message ?? '불러오기 실패');
    } finally {
      setLoading(false);
    }
  }, [category]);

  // category 변경 시 첫 페이지부터 다시 로드
  useEffect(() => {
    setPage(0);
    fetchPosts(0);
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages || loading) return;
    setPage(newPage);
    fetchPosts(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      toast.error('로그인 후 이용할 수 있습니다.');
      navigate('/login');
      return;
    }
    navigate('/write');
  };

  const meta = boardMeta[category];
  // 역순 행 번호: 첫 번째 게시글 = totalElements - page * PAGE_SIZE
  const startNum = totalElements - page * PAGE_SIZE;

  // 표시할 페이지 번호 윈도우 (최대 5개)
  const pageWindowSize = 5;
  const halfWindow = Math.floor(pageWindowSize / 2);
  const windowStart = Math.max(0, Math.min(page - halfWindow, totalPages - pageWindowSize));
  const windowEnd = Math.min(totalPages, windowStart + pageWindowSize);
  const pageNumbers = Array.from({ length: windowEnd - windowStart }, (_, i) => windowStart + i);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{meta.title}</h2>
          <p className="text-gray-500 text-sm mt-1">{meta.description}</p>
        </div>
        {category !== 'notice' && (
          <button
            onClick={handleWriteClick}
            className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            새 글 작성
          </button>
        )}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      )}

      {/* 에러 */}
      {!loading && error && (
        <div className="flex flex-col items-center py-20 gap-3">
          <p className="text-red-500 text-sm">{error}</p>
          <button
            onClick={() => fetchPosts(page)}
            className="text-sm text-indigo-600 hover:underline"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 목록 */}
      {!loading && !error && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-medium text-gray-500">
                <tr>
                  <th className="px-6 py-4 w-16 text-center">No</th>
                  <th className="px-6 py-4">제목</th>
                  <th className="px-6 py-4 w-32 text-center">작성자</th>
                  <th className="px-6 py-4 w-36 text-center">작성일</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {posts.map((post, index) => (
                    <motion.tr
                      key={post.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.03 }}
                      onClick={() => navigate(`/post/${post.id}`)}
                      className="hover:bg-gray-50/80 cursor-pointer group transition-colors"
                    >
                      <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">
                        {startNum - index}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border flex-shrink-0 ${categoryBadge[post.category]}`}>
                            {categoryLabel[post.category]}
                          </span>
                          <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                            {post.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-gray-900 font-medium truncate max-w-[80px] block mx-auto">
                          {post.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-gray-500 whitespace-nowrap text-xs">
                        {formatDistanceToNow(new Date(post.createAt), { addSuffix: true, locale: ko })}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>

            {posts.length === 0 && (
              <div className="py-20 text-center text-gray-500">
                <p>게시글이 없습니다.</p>
              </div>
            )}
          </div>

          {/* 페이지네이션 */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              총 <span className="font-medium text-gray-900">{totalElements.toLocaleString()}</span>개의 게시글
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0 || loading}
                  className="p-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={15} />
                </button>

                {pageNumbers.map((p) => (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    disabled={loading}
                    className={`min-w-[32px] py-1 rounded border text-sm font-medium transition-colors ${
                      p === page
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {p + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1 || loading}
                  className="p-1.5 rounded border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
