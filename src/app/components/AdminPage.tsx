import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Pencil, Trash2, X, Save, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useBoard } from '../context/BoardContext';
import { Product } from '../types';
import { productCategories } from '../mockProducts';

type ProductForm = Omit<Product, 'id'>;

const emptyForm: ProductForm = {
  name: '',
  price: 0,
  originalPrice: undefined,
  category: 'electronics',
  image: '',
  rating: 5.0,
  reviewCount: 0,
  description: '',
  stock: 0,
  badge: undefined,
};

const badgeOptions = [
  { value: '', label: '없음' },
  { value: 'new', label: 'NEW' },
  { value: 'hot', label: 'HOT' },
  { value: 'sale', label: 'SALE' },
];

const categoryOptions = productCategories.filter(c => c.id !== 'all');

function FormPanel({
  title,
  form,
  onChange,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  title: string;
  form: ProductForm;
  onChange: (f: ProductForm) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const set = (key: keyof ProductForm, value: any) =>
    onChange({ ...form, [key]: value });

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* 상품명 */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">상품명 *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="상품 이름을 입력하세요"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* 카테고리 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">카테고리 *</label>
          <select
            value={form.category}
            onChange={e => set('category', e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none bg-white"
          >
            {categoryOptions.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* 뱃지 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">뱃지</label>
          <select
            value={form.badge ?? ''}
            onChange={e => set('badge', e.target.value || undefined)}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none bg-white"
          >
            {badgeOptions.map(b => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>

        {/* 판매가 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">판매가 (원) *</label>
          <input
            type="number"
            min={0}
            value={form.price}
            onChange={e => set('price', Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* 정가 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">정가 (원, 선택)</label>
          <input
            type="number"
            min={0}
            value={form.originalPrice ?? ''}
            onChange={e => set('originalPrice', e.target.value ? Number(e.target.value) : undefined)}
            placeholder="할인 전 가격"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* 재고 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">재고 수량 *</label>
          <input
            type="number"
            min={0}
            value={form.stock}
            onChange={e => set('stock', Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* 평점 */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">초기 평점</label>
          <input
            type="number"
            min={1}
            max={5}
            step={0.1}
            value={form.rating}
            onChange={e => set('rating', Number(e.target.value))}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* 이미지 URL */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">이미지 URL *</label>
          <input
            type="text"
            value={form.image}
            onChange={e => set('image', e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {form.image && (
            <img src={form.image} alt="preview" className="mt-2 h-20 w-32 object-cover rounded-lg border border-gray-200" />
          )}
        </div>

        {/* 설명 */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-gray-600 mb-1">상품 설명 *</label>
          <textarea
            rows={3}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="상품 설명을 입력하세요"
            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={onCancel}
          className="px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
        >
          취소
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 active:scale-95"
        >
          <Save size={15} />
          저장
        </button>
      </div>
    </motion.div>
  );
}

const badgeStyle: Record<string, string> = {
  sale: 'bg-red-100 text-red-600',
  hot: 'bg-orange-100 text-orange-600',
  new: 'bg-indigo-100 text-indigo-600',
};

export function AdminPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useBoard();
  const [mode, setMode] = useState<'idle' | 'add' | 'edit'>('idle');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setMode('add');
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      image: product.image,
      rating: product.rating,
      reviewCount: product.reviewCount,
      description: product.description,
      stock: product.stock,
      badge: product.badge,
    });
    setEditingId(product.id);
    setMode('edit');
  };

  const handleCancel = () => {
    setMode('idle');
    setEditingId(null);
  };

  const validate = () => {
    if (!form.name.trim()) { toast.error('상품명을 입력하세요.'); return false; }
    if (form.price <= 0) { toast.error('판매가를 입력하세요.'); return false; }
    if (!form.image.trim()) { toast.error('이미지 URL을 입력하세요.'); return false; }
    if (!form.description.trim()) { toast.error('상품 설명을 입력하세요.'); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 400));
    if (mode === 'add') {
      addProduct(form);
      toast.success('상품이 등록되었습니다.');
    } else if (mode === 'edit' && editingId) {
      updateProduct(editingId, form);
      toast.success('상품이 수정되었습니다.');
    }
    setIsSubmitting(false);
    setMode('idle');
    setEditingId(null);
  };

  const handleDelete = (product: Product) => {
    if (!window.confirm(`"${product.name}"을(를) 삭제하시겠습니까?`)) return;
    deleteProduct(product.id);
    toast.success('상품이 삭제되었습니다.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">상품 관리</h2>
          <p className="text-gray-500 text-sm mt-1">
            총 <span className="font-semibold text-gray-900">{products.length}</span>개의 상품
          </p>
        </div>
        {mode === 'idle' && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm active:scale-95"
          >
            <Plus size={16} />
            새 상품 등록
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      <AnimatePresence>
        {(mode === 'add' || mode === 'edit') && (
          <FormPanel
            title={mode === 'add' ? '새 상품 등록' : '상품 수정'}
            form={form}
            onChange={setForm}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500">
              <tr>
                <th className="px-5 py-4 w-16">이미지</th>
                <th className="px-5 py-4">상품명</th>
                <th className="px-5 py-4 w-28 text-center">카테고리</th>
                <th className="px-5 py-4 w-32 text-right">판매가</th>
                <th className="px-5 py-4 w-24 text-center">재고</th>
                <th className="px-5 py-4 w-20 text-center">뱃지</th>
                <th className="px-5 py-4 w-28 text-center">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <AnimatePresence>
                {products.map((product) => (
                  <motion.tr
                    key={product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`hover:bg-gray-50 transition-colors ${editingId === product.id ? 'bg-indigo-50/40' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                      />
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{product.description}</p>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md font-medium">
                        {productCategories.find(c => c.id === product.category)?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <p className="font-semibold text-gray-900">{product.price.toLocaleString()}원</p>
                      {product.originalPrice && (
                        <p className="text-xs text-gray-400 line-through">{product.originalPrice.toLocaleString()}원</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`font-medium ${product.stock <= 10 ? 'text-orange-500' : 'text-gray-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {product.badge ? (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${badgeStyle[product.badge]}`}>
                          {product.badge}
                        </span>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="수정"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="py-24 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p>등록된 상품이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
