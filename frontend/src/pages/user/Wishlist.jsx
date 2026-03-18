import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart, Trash2, ShoppingCart, ArrowRight, Zap, Eye, Star } from "lucide-react";
import { API_BASE } from "../../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../../utils/imageUrl";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, fetchWishlist: refreshWishlist } = useWishlist();
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/wishlist`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.products || []);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await axios.delete(`${API_BASE}/api/wishlist/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      refreshWishlist(); // Sync context count
    } catch (error) {
      console.error("Remove error:", error);
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Heart className="w-8 h-8 text-rose-500" /> My Wishlist
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Products you've saved for later
          </p>
        </div>
        <div className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center gap-2">
          <Heart size={14} className="text-rose-400" /> {products.length} items
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="aspect-[4/5] bg-slate-100 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto">
            <Heart size={36} className="text-rose-300" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">
              Your wishlist is empty
            </h2>
            <p className="text-slate-500 font-medium mt-2">
              Browse our products and tap the heart icon to save your favorites.
            </p>
          </div>
          <button
            onClick={() => navigate("/products")}
            className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg"
          >
            Browse Products <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="group bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500"
            >
              {/* Image */}
              <div className="relative aspect-square bg-slate-50 p-6 overflow-hidden">
                <img
                  src={
                    getImageUrl(product.image) || getPlaceholder(product.name)
                  }
                  alt={product.name}
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700"
                  onError={(e) =>
                    (e.target.src = getPlaceholder(product.name))
                  }
                />
                <button
                  onClick={() => removeFromWishlist(product._id)}
                  className="absolute top-3 right-3 w-9 h-9 bg-white shadow-lg rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={14} />
                </button>
                {product.rating > 0 && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold border border-slate-100">
                    <Star size={12} className="text-yellow-500 fill-yellow-500" />
                    {product.rating?.toFixed(1)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5 space-y-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    {typeof product.category === 'object' ? (product.category.name || "General") : (product.category || "General")}
                  </p>
                  <h3 className="text-base font-bold text-slate-900 truncate mt-0.5">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      ₹{product.price?.toLocaleString()}
                    </p>
                    {product.originalPrice &&
                      product.originalPrice > product.price && (
                        <p className="text-xs text-slate-400 line-through">
                          ₹{product.originalPrice?.toLocaleString()}
                        </p>
                      )}
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                      product.stock <= 0
                        ? "bg-red-50 text-red-600"
                        : product.stock <= 10
                        ? "bg-amber-50 text-amber-600"
                        : "bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {product.stock <= 0
                      ? "Out of Stock"
                      : product.stock <= 10
                      ? `Only ${product.stock} left`
                      : "In Stock"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => navigate(`/products/${product._id}`)}
                    className="py-3 bg-slate-50 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition flex items-center justify-center gap-1.5"
                  >
                    <Eye size={14} /> Details
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                    className="py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
                  >
                    <ShoppingCart size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
