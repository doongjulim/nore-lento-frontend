import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  ArrowLeft,
  Trash2,
  CheckCheck,
  Loader2,
  BellOff,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { notificationApi } from '@/app/api';
import type { NotificationResponse } from '@/app/api';

function NotifItem({
  notif,
  onRead,
  onDelete,
}: {
  notif: NotificationResponse;
  onRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${
        notif.isRead
          ? 'bg-white border-gray-100'
          : 'bg-indigo-50/60 border-indigo-100'
      }`}
    >
      <span
        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
          notif.isRead ? 'bg-gray-200' : 'bg-indigo-500'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{notif.title}</p>
        <p className="text-sm text-gray-600 mt-0.5 leading-relaxed">{notif.content}</p>
        <p className="text-xs text-gray-400 mt-1">
          {new Date(notif.createAt).toLocaleString('ko-KR')}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 flex-shrink-0">
        {!notif.isRead && (
          <button
            onClick={() => onRead(notif.notificationId)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="읽음 처리"
          >
            <CheckCheck size={14} />
          </button>
        )}
        <button
          onClick={() => onDelete(notif.notificationId)}
          className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="삭제"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}

export function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await notificationApi.findNotifications({ page: 0, size: 50 });
      setNotifications(data.content);
    } catch {
      setError('알림을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => n.notificationId === id ? { ...n, isRead: true } : n),
      );
    } catch {
      toast.error('읽음 처리에 실패했습니다.');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationApi.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
      toast.success('알림을 삭제했습니다.');
    } catch {
      toast.error('삭제에 실패했습니다.');
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await notificationApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('모든 알림을 읽음 처리했습니다.');
    } catch {
      toast.error('전체 읽음 처리에 실패했습니다.');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-xl mx-auto pb-12 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Bell size={20} className="text-indigo-500" />
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">알림</h2>
          {unreadCount > 0 && (
            <span className="text-xs font-bold bg-red-500 text-white rounded-full px-2 py-0.5 ml-1">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            disabled={markingAll}
            className="ml-auto flex items-center gap-1.5 text-xs text-indigo-600 hover:underline font-medium disabled:opacity-50"
          >
            {markingAll ? <Loader2 size={12} className="animate-spin" /> : <CheckCheck size={13} />}
            모두 읽음
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-28">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <p className="text-gray-500">{error}</p>
          <button onClick={fetchNotifications} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            다시 시도
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-28 gap-4 text-center"
        >
          <BellOff size={56} className="text-gray-200" />
          <h3 className="text-lg font-semibold text-gray-700">알림이 없어요</h3>
          <p className="text-sm text-gray-400">새로운 알림이 오면 여기에 표시됩니다.</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {notifications.map((n) => (
              <NotifItem
                key={n.notificationId}
                notif={n}
                onRead={handleRead}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
