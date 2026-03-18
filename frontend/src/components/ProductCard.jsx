import { Heart, ShoppingBag, Eye, Star, CheckCircle2, AlertTriangle } from "lucide-react";
import { getImageUrl, getPlaceholder } from "../utils/imageUrl";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product, onAddToCart, onView, className = "", renderActions, hideWishlist = false }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { cart, addToCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.role === "admin" || hideWishlist;
  const liked = !isAdmin && isInWishlist(product._id);
  const isInCart = cart.some(item => item._id === product._id);
  const stockLevel = product.stock ?? 0;
  
  const badge =
    stockLevel <= 0 ? "Out of Stock" : stockLevel <= 10 ? "Low Stock" : "";

  return (
    <article
      className={`relative group bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${className}`}
      aria-label={product.name}
    >
      {/* Top Actions */}
      <div className="absolute top-5 inset-x-5 flex justify-between items-center z-10">
        {badge ? (
          <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 ${
            stockLevel <= 0 
              ? 'bg-rose-500 text-white' 
              : 'bg-amber-500 text-white'
          }`}>
            {stockLevel <= 10 && stockLevel > 0 && <AlertTriangle size={12} />}
            {badge}
          </div>
        ) : <div />}
        
        {/* Wishlist icon — hidden on admin side */}
        {!isAdmin && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!user) {
                navigate("/login");
                return;
              }
              toggleWishlist(product._id);
            }}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              liked 
                ? "bg-rose-100 text-rose-500" 
                : "bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 border border-slate-200 shadow-sm"
            }`}
          >
            <Heart className="w-5 h-5" fill={liked ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      {/* Image Section */}
      <div 
        className="relative h-64 bg-slate-50 flex items-center justify-center p-8 cursor-pointer overflow-hidden"
        onClick={() => onView?.(product._id)}
      >
        <img
          src={getImageUrl(product.image) || getPlaceholder("No Image")}
          alt={product.name}
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
          onError={(e) => (e.target.src = getPlaceholder("No Image"))}
        />
        
        {/* Rating Overlay */}
        <div className="absolute bottom-4 left-4 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold border border-slate-100 shadow-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
          <span className="text-slate-700">{product.rating?.toFixed(1) ?? "0.0"}</span>
        </div>

        {/* Stock indicator for admin */}
        {isAdmin && (
          <div className={`absolute bottom-4 right-4 px-2 py-1 rounded-md text-[10px] font-bold border ${
            stockLevel <= 0 
              ? 'bg-rose-50 text-rose-600 border-rose-100' 
              : stockLevel <= 10 
                ? 'bg-amber-50 text-amber-600 border-amber-100' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
          }`}>
            Stock: {stockLevel}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 mb-1 block">
            {(product.category?.name || product.category) + (product.subcategory?.name ? ` · ${product.subcategory.name}` : "") + (product.peta_subcategory?.name ? ` · ${product.peta_subcategory.name}` : "")}
          </span>
          <h3 
            className="text-lg font-bold text-slate-900 line-clamp-1 cursor-pointer hover:text-indigo-600 transition"
            onClick={() => onView?.(product._id)}
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 mt-1 min-h-[2.5rem]">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Price</span>
            <div className="flex items-baseline gap-1">
              <p className="text-xl font-bold text-slate-900 tracking-tight">₹{product.price?.toLocaleString()}</p>
              {product.originalPrice && product.originalPrice > product.price && (
                <p className="text-xs text-slate-400 line-through font-medium">₹{product.originalPrice?.toLocaleString()}</p>
              )}
            </div>
          </div>

          {!renderActions && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (stockLevel <= 0) return;
                  if (onAddToCart) {
                    onAddToCart(product, { isInCart });
                    return;
                  }
                  if (isInCart) {
                    removeFromCart(product._id);
                  } else {
                    addToCart(product);
                  }
                }}
                disabled={stockLevel <= 0}
                className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  isInCart 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" 
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100"
                } ${stockLevel <= 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
              >
                {isInCart ? <CheckCircle2 className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onView?.(product._id);
                }}
                className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {renderActions && (
          <div className="w-full">
            {renderActions(product)}
          </div>
        )}
      </div>
    </article>
  );
}
