import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { API_BASE } from "../../utils/apiBase";
import { useCart } from "../../context/CartContext";
import ProductCard from "../../components/ProductCard";
import { useToast } from "../../context/ToastContext";

export default function UserSearch() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [pRes, cRes] = await Promise.all([
          axios.get(`${API_BASE}/api/products`),
          axios.get(`${API_BASE}/api/categories`),
        ]);
        setProducts(pRes.data?.data || pRes.data || []);
        setCategories(cRes.data || []);
      } catch (err) {
        console.error(err);
        showToast("Unable to load products", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [showToast]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const matchText =
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q);
      const matchCategory = category ? p.category === category : true;
      return matchText && matchCategory;
    });
  }, [products, search, category]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-28 px-6">
      <div className="container mx-auto max-w-6xl space-y-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 flex items-center gap-2">
              <SlidersHorizontal size={14} /> Product Finder
            </p>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Search Products</h1>
            <p className="text-slate-500 font-medium">Browse the full catalog and filter by category.</p>
          </div>
          <div className="text-sm text-slate-500 font-semibold">
            Showing {filtered.length} of {products.length} items
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, category, or description..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 outline-none shadow-sm"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full md:w-60 bg-white border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-200 outline-none shadow-sm"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading products...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-16 text-center space-y-4 shadow-sm">
            <p className="text-2xl font-bold text-slate-900">No products found</p>
            <p className="text-slate-500">Try adjusting your search or category filter.</p>
            <button
              onClick={() => { setSearch(""); setCategory(""); }}
              className="px-6 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-indigo-600 transition"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onView={(id) => navigate(`/products/${id}`)}
                onAddToCart={() => addToCart(p)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
