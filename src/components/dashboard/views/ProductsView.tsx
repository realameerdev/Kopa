import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Search,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { db, Product } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { AddProductModal } from '../modals/AddProductModal';

export const ProductsView: React.FC = () => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const settings = db.getSettings();
  const currencySymbol = settings.currencySymbol || '₦';
  const products = db.getProducts();

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this product from inventory?')) {
      db.deleteProduct(id);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-medium tracking-tight">
            Products & Inventory
          </h1>
          <p className="text-xs sm:text-sm text-[#69746F] dark:text-slate-400">
            Catalog, stock levels, unit costs, and profit margin analysis
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#B8F36B] text-[#08110F] hover:bg-[#A5E852] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69746F] dark:text-slate-400" />
        <input
          type="text"
          placeholder="Search products by name or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
            isDark
              ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
              : 'bg-white border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
          }`}
        />
      </div>

      {/* Products Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-[#10251E]/30 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead
              className={`border-b text-[11px] font-mono uppercase tracking-wider ${
                isDark ? 'bg-[#08110F] border-[#1C382E] text-slate-400' : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#69746F]'
              }`}
            >
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Cost Price</th>
                <th className="py-3 px-4 text-center">Stock</th>
                <th className="py-3 px-4 text-right">Sales / Rev</th>
                <th className="py-3 px-4 text-right">Gross Profit</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE3DE] dark:divide-[#1A2E27]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => {
                  const hasCost = p.costPrice !== null && p.costPrice !== undefined;
                  const unitMargin = hasCost ? p.sellingPrice - (p.costPrice || 0) : null;
                  const totalProfit = hasCost && unitMargin ? unitMargin * p.salesCount : null;
                  const isLowStock = p.stock <= p.minStockAlert;

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{p.name}</span>
                          {isLowStock && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500 font-mono">
                              Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#69746F] dark:text-slate-400">
                        {p.category}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium">
                        {currencySymbol}
                        {p.sellingPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        {hasCost ? (
                          <span>
                            {currencySymbol}
                            {p.costPrice?.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-amber-500 text-[11px] font-sans">
                            Cost not set
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono px-2 py-0.5 rounded text-xs ${
                            isLowStock
                              ? 'bg-amber-500/10 text-amber-400 font-bold'
                              : 'text-slate-300'
                          }`}
                        >
                          {p.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div>
                          <span>
                            {currencySymbol}
                            {p.totalRevenue.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-[#69746F] dark:text-slate-400 block font-sans">
                            ({p.salesCount} sold)
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        {totalProfit !== null ? (
                          <span className="text-[#B8F36B] font-semibold">
                            +{currencySymbol}
                            {totalProfit.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-500 font-sans">
                            Cost not set
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleEdit(p)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 mr-1 cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id)}
                          className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#69746F] dark:text-slate-400">
                    <p className="font-medium text-sm text-[#111916] dark:text-slate-200">
                      Your business activity will appear here once you start recording it.
                    </p>
                    <p className="text-[11px] mt-1 text-[#69746F] dark:text-slate-400">
                      No products recorded yet. Click "Add Product" to add your first item to inventory.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        productToEdit={editingProduct}
      />
    </div>
  );
};
