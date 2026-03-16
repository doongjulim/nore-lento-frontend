import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  MessageCircle,
  Loader2,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { categories } from '../mockData';
import { useNavigate } from 'react-router';
import { useBoard } from '../context/BoardContext';
import { toast } from 'sonner';
import { Post } from '../types';
import { API_BASE_URL } from '../config/api';

type BoardCategory = 'notice' | 'qna' | 'free';

const boardMeta: Record<BoardCategory, { title: string; description: string }> = {
  notice: { title: '공지사항', description: '서비스 관련 공지사항을 확인하세요.' },
  qna: { title: 'Q&A', description: '궁금한 점을 질문하고 답변을 받아보세요.' },
  free: { title: '자유게시판', description: '자유롭게 소통하고 지식을 공유하세요.' },
};

const categoryBadge: Record<BoardCategory, string> = {
  notice: 'bg-red-50 text-red-600 border-red-100',
  qna: 'bg-green-50 text-green-600 border-green-100',
  free: 'bg-gray-100 text-gray-600 border-gray-200',
};

interface PostListProps {
  category: BoardCategory;
}

export function PostList({ category }: PostListProps) {
  const { isAuthenticated } = useBoard();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const fetchPosts = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v2/notice?category=${category}`);
        if (!res.ok) throw new Error(`서버 오류 (${res.status})`);
        const json = await res.json();
        const data: Post[] = Array.isArray(json) ? json : (json?.data ?? json?.content ?? []);
        if (!cancelled) setPosts(data);
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      }
      if (!cancelled) setLoading(false);
    };

    fetchPosts();
    return () => { cancelled = true; };
  }, [category]);

  const handleWriteClick = () => {
    if (!isAuthenticated) {
      toast.error('로그인 후 이용할 수 있습니다.');
      navigate('/login');
      return;
    }
    navigate('/write');
  };

  const meta = boardMeta[category];

  return (
    <div className="space-y-6">
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
            <span>새 글 작성</span>
          </button>
        )}
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span className="text-sm">불러오는 중...</span>
        </div>
      )}
      {!loading && error && (
        <div className="py-20 text-center text-red-500 text-sm">{error}</div>
      )}

      {/* List */}
      {!loading && !error && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-medium text-gray-500">
              <tr>
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4">제목</th>
                <th className="px-6 py-4 w-32 text-center">작성자</th>
                <th className="px-6 py-4 w-32 text-center">작성일</th>
                <th className="px-6 py-4 w-24 text-center">조회</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {posts.map((post, index) => (
                  <motion.tr
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    onClick={() => navigate(`/post/${post.id}`)}
                    className="hover:bg-gray-50/80 cursor-pointer group transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-gray-400 font-mono text-xs">
                      {posts.length - index}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${categoryBadge[post.category]}`}>
                          {categories.find(c => c.id === post.category)?.label}
                        </span>
                        <span className="font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {post.title}
                        </span>
                        {post.commentCount > 0 && (
                          <span className="flex items-center text-xs text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded-full">
                            <MessageCircle size={10} className="mr-1" />
                            {post.commentCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <img
                          src={post.author.avatar}
                          alt={post.author.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-gray-900 font-medium truncate max-w-[80px]">
                          {post.author.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 whitespace-nowrap">
                      {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ko })}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-500 font-mono text-xs">
                      {post.viewCount.toLocaleString()}
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

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            총 <span className="font-medium text-gray-900">{posts.length}</span>개의 게시글
          </div>
          <div className="flex gap-1">
            <button className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 text-sm hover:bg-gray-50 disabled:opacity-50">이전</button>
            <button className="px-3 py-1 rounded border border-indigo-600 bg-indigo-600 text-white text-sm font-medium">1</button>
            <button className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-600 text-sm hover:bg-gray-50">다음</button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
