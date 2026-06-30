import React, { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Bell,
  Shield,
  Moon,
  Globe,
  LogOut,
  ChevronRight,
  Camera,
  Mail,
  Lock,
  Download,
  Database,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  X,
} from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import { userApi, shippingAddressApi } from '@/app/api';
import type { ShippingAddressResponse, SaveShippingAddressRequest } from '@/app/api';
import { toast } from 'sonner';

type Tab = 'profile' | 'account' | 'shipping' | 'notifications' | 'appearance' | 'data';

const emptyAddressForm: SaveShippingAddressRequest = {
  recipientName: '',
  phone: '',
  address: '',
  detailAddress: '',
  zipCode: '',
  isDefault: false,
};

function ShippingAddressForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial: SaveShippingAddressRequest;
  onSave: (v: SaveShippingAddressRequest) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof SaveShippingAddressRequest, v: string | boolean) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <div className="border border-indigo-200 rounded-xl p-4 bg-indigo-50/40 space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">받는 분 *</label>
          <input
            value={form.recipientName}
            onChange={(e) => set('recipientName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="홍길동"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">연락처 *</label>
          <input
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="010-0000-0000"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">주소 *</label>
        <input
          value={form.address}
          onChange={(e) => set('address', e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          placeholder="서울특별시 강남구 테헤란로 123"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">상세 주소</label>
          <input
            value={form.detailAddress ?? ''}
            onChange={(e) => set('detailAddress', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="101호"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">우편번호 *</label>
          <input
            value={form.zipCode}
            onChange={(e) => set('zipCode', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="06234"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.isDefault}
          onChange={(e) => set('isDefault', e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
        <span className="text-sm text-gray-700">기본 배송지로 설정</span>
      </label>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => {
            if (!form.recipientName || !form.phone || !form.address || !form.zipCode) {
              toast.error('필수 항목을 모두 입력해주세요.');
              return;
            }
            onSave(form);
          }}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : null}
          저장
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  const { currentUser, updateUser, logout, posts, comments } = useBoard();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // ── 배송지 상태 ──
  const [addresses, setAddresses] = useState<ShippingAddressResponse[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (activeTab !== 'shipping') return;
    setAddressLoading(true);
    shippingAddressApi.findShippingAddresses()
      .then(setAddresses)
      .catch(() => toast.error('배송지를 불러오지 못했습니다.'))
      .finally(() => setAddressLoading(false));
  }, [activeTab]);

  const handleAddAddress = async (form: SaveShippingAddressRequest) => {
    setSavingAddress(true);
    try {
      await shippingAddressApi.saveShippingAddress(form);
      const updated = await shippingAddressApi.findShippingAddresses();
      setAddresses(updated);
      setShowAddForm(false);
      toast.success('배송지가 추가되었습니다.');
    } catch {
      toast.error('배송지 추가에 실패했습니다.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleUpdateAddress = async (id: number, form: SaveShippingAddressRequest) => {
    setSavingAddress(true);
    try {
      await shippingAddressApi.updateShippingAddress(id, {
        recipientName: form.recipientName,
        phone: form.phone,
        address: form.address,
        detailAddress: form.detailAddress,
        zipCode: form.zipCode,
      });
      if (form.isDefault) {
        await shippingAddressApi.setDefaultShippingAddress(id);
      }
      const updated = await shippingAddressApi.findShippingAddresses();
      setAddresses(updated);
      setEditingId(null);
      toast.success('배송지가 수정되었습니다.');
    } catch {
      toast.error('배송지 수정에 실패했습니다.');
    } finally {
      setSavingAddress(false);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('배송지를 삭제하시겠습니까?')) return;
    try {
      await shippingAddressApi.deleteShippingAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      toast.success('배송지가 삭제되었습니다.');
    } catch {
      toast.error('배송지 삭제에 실패했습니다.');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await shippingAddressApi.setDefaultShippingAddress(id);
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === id })),
      );
      toast.success('기본 배송지가 변경되었습니다.');
    } catch {
      toast.error('기본 배송지 변경에 실패했습니다.');
    }
  };

  // ── 비밀번호 변경 상태 ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);

  // ── 계정 삭제 상태 ──
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // ── 프로필 폼 ──
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { isSubmitting: isProfileSubmitting },
  } = useForm({
    defaultValues: {
      name: currentUser?.name ?? '',
      bio: '',
    },
  });

  const onProfileSubmit = async (data: { name: string; bio: string }) => {
    await new Promise((r) => setTimeout(r, 400));
    updateUser({ name: data.name });
    toast.success('프로필이 업데이트되었습니다.');
  };

  // ── 아바타 업로드 ──
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error('이미지 크기는 1MB 이하여야 합니다.');
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
    updateUser({ avatar: url });
    toast.success('프로필 사진이 변경되었습니다.');
  };

  // ── 비밀번호 변경 ──
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('모든 필드를 입력해 주세요.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    setIsPasswordChanging(true);
    try {
      // 백엔드 비밀번호 변경 API가 추가되면 여기서 호출합니다.
      await new Promise((r) => setTimeout(r, 600));
      toast.success('비밀번호가 변경되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('비밀번호 변경에 실패했습니다.');
    } finally {
      setIsPasswordChanging(false);
    }
  };

  // ── 계정 삭제 ──
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '계정삭제') {
      toast.error('"계정삭제"를 정확히 입력해 주세요.');
      return;
    }
    if (!window.confirm('정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) return;
    setIsDeletingAccount(true);
    try {
      // 사용자 목록에서 현재 사용자를 찾아 삭제
      const users = await userApi.findUsers();
      const found = users.find(
        (u) => u.username === currentUser?.email || u.name === currentUser?.name,
      );
      if (found) {
        await userApi.deleteUser(found.id);
      }
      toast.success('계정이 삭제되었습니다.');
      logout();
    } catch {
      toast.error('계정 삭제에 실패했습니다. 관리자에게 문의해 주세요.');
    } finally {
      setIsDeletingAccount(false);
    }
  };

  // ── 데이터 다운로드 ──
  const handleDownload = () => {
    const data = {
      user: currentUser,
      posts: posts.filter((p) => p.author.id === currentUser?.id),
      comments: comments.filter((c) => c.author.id === currentUser?.id),
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('데이터가 다운로드되었습니다.');
  };

  const tabs = [
    { id: 'profile', label: '프로필 편집', icon: User },
    { id: 'account', label: '계정 설정', icon: Shield },
    { id: 'shipping', label: '배송지 관리', icon: MapPin },
    { id: 'notifications', label: '알림', icon: Bell },
    { id: 'appearance', label: '테마 및 언어', icon: Moon },
    { id: 'data', label: '데이터 관리', icon: Database },
  ];

  if (!currentUser) return null;

  const displayAvatar = avatarPreview ?? currentUser.avatar;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500 text-sm mt-1">계정 정보와 앱 설정을 관리하세요.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* 사이드 탭 */}
        <nav className="lg:w-64 flex-shrink-0 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                {tab.label}
              </div>
              {activeTab === tab.id && (
                <motion.div layoutId="active-indicator">
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <button
              onClick={() => {
                if (window.confirm('정말 로그아웃 하시겠습니까?')) logout();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              로그아웃
            </button>
          </div>
        </nav>

        {/* 컨텐츠 영역 */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              {/* ── 프로필 ── */}
              {activeTab === 'profile' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">프로필 편집</h2>

                  <div className="flex items-center gap-6 mb-8">
                    <div className="relative group">
                      <img
                        src={displayAvatar}
                        alt={currentUser.name}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-gray-50"
                      />
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                      >
                        <Camera size={24} />
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleAvatarFileChange}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">프로필 사진</h3>
                      <p className="text-sm text-gray-500 mb-3">JPG, GIF or PNG. 최대 1MB.</p>
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        새 이미지 업로드
                      </button>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                      <input
                        {...registerProfile('name', { required: true })}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">소개</label>
                      <textarea
                        {...registerProfile('bio')}
                        rows={4}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none resize-none"
                        placeholder="자신을 간단히 소개해 주세요."
                      />
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isProfileSubmitting}
                        className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2"
                      >
                        {isProfileSubmitting && <Loader2 size={15} className="animate-spin" />}
                        {isProfileSubmitting ? '저장 중...' : '변경사항 저장'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── 계정 보안 ── */}
              {activeTab === 'account' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">계정 보안</h2>

                  <div className="space-y-8 max-w-lg">
                    {/* 이메일 */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">이메일 주소</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                          type="email"
                          value={currentUser.email ?? ''}
                          disabled
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">이메일 변경은 고객센터에 문의해주세요.</p>
                    </div>

                    {/* 비밀번호 변경 */}
                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="text-sm font-medium text-gray-900 mb-4">비밀번호 변경</h3>
                      <div className="space-y-3">
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type={showCurrentPw ? 'text' : 'password'}
                            placeholder="현재 비밀번호"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type={showNewPw ? 'text' : 'password'}
                            placeholder="새 비밀번호 (8자 이상)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPw((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="password"
                            placeholder="새 비밀번호 확인"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                          />
                        </div>
                        {newPassword && confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-xs text-red-500">새 비밀번호가 일치하지 않습니다.</p>
                        )}
                        <button
                          type="button"
                          onClick={handlePasswordChange}
                          disabled={isPasswordChanging}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          {isPasswordChanging && <Loader2 size={14} className="animate-spin" />}
                          비밀번호 업데이트
                        </button>
                      </div>
                    </div>

                    {/* 계정 삭제 */}
                    <div className="border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-red-500" />
                        <h3 className="text-sm font-medium text-red-600">계정 삭제</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">
                        계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                        확인을 위해 아래에 <strong className="text-gray-700">계정삭제</strong>를 입력하세요.
                      </p>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="계정삭제"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none text-sm"
                        />
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount || deleteConfirmText !== '계정삭제'}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-100 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                          {isDeletingAccount && <Loader2 size={14} className="animate-spin" />}
                          계정 삭제하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 배송지 관리 ── */}
              {activeTab === 'shipping' && (
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">배송지 관리</h2>
                    {!showAddForm && (
                      <button
                        onClick={() => { setShowAddForm(true); setEditingId(null); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        <Plus size={14} />
                        배송지 추가
                      </button>
                    )}
                  </div>

                  {showAddForm && (
                    <div className="mb-4">
                      <ShippingAddressForm
                        initial={emptyAddressForm}
                        onSave={handleAddAddress}
                        onCancel={() => setShowAddForm(false)}
                        saving={savingAddress}
                      />
                    </div>
                  )}

                  {addressLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    </div>
                  ) : addresses.length === 0 && !showAddForm ? (
                    <div className="text-center py-12 text-gray-400">
                      <MapPin size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">등록된 배송지가 없습니다.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {addresses.map((addr) => (
                        <div key={addr.id}>
                          {editingId === addr.id ? (
                            <ShippingAddressForm
                              initial={{
                                recipientName: addr.recipientName,
                                phone: addr.phone,
                                address: addr.address,
                                detailAddress: addr.detailAddress ?? '',
                                zipCode: addr.zipCode,
                                isDefault: addr.isDefault,
                              }}
                              onSave={(form) => handleUpdateAddress(addr.id, form)}
                              onCancel={() => setEditingId(null)}
                              saving={savingAddress}
                            />
                          ) : (
                            <div className={`border rounded-xl p-4 transition-colors ${
                              addr.isDefault
                                ? 'border-indigo-300 bg-indigo-50/50'
                                : 'border-gray-200 bg-white'
                            }`}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-bold text-gray-900">{addr.recipientName}</p>
                                    <span className="text-xs text-gray-400">{addr.phone}</span>
                                    {addr.isDefault && (
                                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                                        <Star size={10} className="fill-indigo-600" />
                                        기본
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-700">
                                    ({addr.zipCode}) {addr.address}
                                    {addr.detailAddress && ` ${addr.detailAddress}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {!addr.isDefault && (
                                    <button
                                      onClick={() => handleSetDefault(addr.id)}
                                      className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                      title="기본 배송지로 설정"
                                    >
                                      <Star size={14} />
                                    </button>
                                  )}
                                  <button
                                    onClick={() => { setEditingId(addr.id); setShowAddForm(false); }}
                                    className="p-1.5 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="수정"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAddress(addr.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="삭제"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── 알림 설정 ── */}
              {activeTab === 'notifications' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">알림 설정</h2>
                  <div className="space-y-6">
                    {[
                      { label: '이메일 알림', desc: '주요 업데이트 및 활동 내역을 이메일로 받습니다.', defaultChecked: true },
                      { label: '댓글 알림', desc: '내 게시글에 새로운 댓글이 달리면 알림을 받습니다.', defaultChecked: true },
                      { label: '마케팅 정보 수신', desc: '새로운 기능 및 이벤트 소식을 받습니다.', defaultChecked: false },
                    ].map(({ label, desc, defaultChecked }) => (
                      <div key={label} className="flex items-start justify-between pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                        <div>
                          <h3 className="font-medium text-gray-900">{label}</h3>
                          <p className="text-sm text-gray-500 mt-1">{desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                          <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600" />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── 테마 및 언어 ── */}
              {activeTab === 'appearance' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">테마 및 언어</h2>
                  <div className="space-y-8">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">테마 설정</h3>
                      <div className="grid grid-cols-3 gap-4 max-w-lg">
                        <button className="relative p-4 border-2 border-indigo-600 bg-white rounded-xl flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" />
                          <span className="text-sm font-medium text-indigo-700">라이트</span>
                          <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-600 rounded-full" />
                        </button>
                        <button className="p-4 border border-gray-200 bg-gray-900 rounded-xl flex flex-col items-center gap-2 hover:opacity-90 transition-opacity">
                          <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600" />
                          <span className="text-sm font-medium text-white">다크</span>
                        </button>
                        <button className="p-4 border border-gray-200 bg-gray-50 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-100 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border border-gray-200" />
                          <span className="text-sm font-medium text-gray-700">시스템</span>
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <h3 className="font-medium text-gray-900 mb-4">언어 (Language)</h3>
                      <div className="max-w-xs">
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <select className="w-full pl-10 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none outline-none">
                            <option value="ko">한국어</option>
                            <option value="en">English</option>
                            <option value="ja">日本語</option>
                          </select>
                          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 rotate-90" size={16} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 데이터 관리 ── */}
              {activeTab === 'data' && (
                <div className="p-8">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">데이터 관리</h2>
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Download size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-semibold text-gray-900">내 데이터 내보내기</h3>
                          <p className="text-sm text-gray-500 mt-1 mb-4">
                            작성한 게시글, 댓글, 프로필 정보를 JSON 파일로 다운로드합니다.
                          </p>
                          <button
                            onClick={handleDownload}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                          >
                            <Download size={16} />
                            데이터 다운로드 (.json)
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Shield size={14} />
                        <span>다운로드된 파일에는 개인정보가 포함될 수 있으므로 보관에 주의해주세요.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
