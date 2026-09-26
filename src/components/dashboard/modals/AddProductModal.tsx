import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { db, Product } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
  onProductSaved?: () => void;
}

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  productToEdit,
  onProductSaved,
}) => {
  const { isDark } = useTheme();

  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [minStockAlert, setMinStockAlert] = useState('5');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setName(productToEdit.name);
        setCategory(productToEdit.category);
        setSellingPrice(`${productToEdit.sellingPrice}`);
        setCostPrice(productToEdit.costPrice !== null && productToEdit.costPrice !== undefined ? `${productToEdit.costPrice}` : '');
        setStock(`${productToEdit.stock}`);
        setMinStockAlert(`${productToEdit.minStockAlert}`);
      } else {
        setName('');
        setCategory('General');
        setSellingPrice('');
        setCostPrice('');
        setStock('10');
        setMinStockAlert('5');
      }
      setError('');
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required.');
      return;
    }
    const parsedSelling = parseFloat(sellingPrice);
    if (!parsedSelling || parsedSelling <= 0) {
      setError('Please provide a valid selling price.');
      return;
    }

    const parsedCost = costPrice.trim() !== '' ? parseFloat(costPrice) : null;
    const parsedStock = parseInt(stock) || 0;
    const parsedMinStock = parseInt(minStockAlert) || 5;

    if (productToEdit) {
      db.updateProduct(productToEdit.id, {
        name: name.trim(),
        category: category.trim() || 'General',
        sellingPrice: parsedSelling,
        costPrice: parsedCost,
        stock: parsedStock,
        minStockAlert: parsedMinStock,
      });
    } else {
      db.addProduct({
        name: name.trim(),
        category: category.trim() || 'General',
        sellingPrice: parsedSelling,
        costPrice: parsedCost,
        stock: parsedStock,
        minStockAlert: parsedMinStock,
      });
    }

    onProductSaved?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
          isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DEE3DE] dark:border-[#1A2E27]">
          <div>
            <h2 className="text-lg font-heading font-medium tracking-tight">
              {productToEdit ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-[#69746F] dark:text-slate-400">
              Manage product pricing, cost data, and inventory stock
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
              Product name
            </label>
            <input
              type="text"
              placeholder="e.g. Black Linen Shirt"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
              Category
            </label>
            <input
              type="text"
              placeholder="e.g. Shirts, Traditional, Accessories"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
                Selling price (₦)
              </label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 15000"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                  isDark
                    ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                    : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                }`}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-[#111916] dark:text-slate-300">
                  Cost price (₦)
                </label>
                <span className="text-[10px] text-[#69746F] dark:text-slate-400">Optional</span>
              </div>
              <input
                type="number"
                min="0"
                placeholder="Leave blank if unknown"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                  isDark
                    ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                    : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                }`}
              />
            </div>
          </div>
          <p className="text-[11px] text-[#69746F] dark:text-slate-400">
            If cost price is left blank, Kopa will display <strong className="text-amber-500">Cost not set</strong> and exclude this item from profit metrics until cost is provided.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
                Current stock
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                  isDark
                    ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                    : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
                Low-stock threshold
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                  isDark
                    ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                    : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                }`}
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer"
            >
              <span>{productToEdit ? 'Save Changes' : 'Add to Inventory'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
