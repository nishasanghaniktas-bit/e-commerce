import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  Share2, 
  Zap, 
  Minus, 
  Plus, 
  ChevronRight, 
  MessageSquare,
  Cpu,
  Layers,
  Activity,
  Box,
  Fingerprint,
  ArrowUpRight
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { API_BASE } from "../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../utils/imageUrl";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";
import { useToast } from "../context/ToastContext";

export default function ProductDetails({ showCartAction = true }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [related, setRelated] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  
  const liked = product ? isInWishlist(product._id) : false;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity });
  };

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    window.scrollTo(0, 0);
  }, [id]);

  const buildGallery = (prod) => {
    if (!prod) return [];
    const extra = Array.isArray(prod.images) ? prod.images : typeof prod.images === "string" ? prod.images.split(",") : [];
    const items = [prod.image, ...extra].filter(Boolean);
    const normalized = items.map((img) => getImageUrl(img) || getPlaceholder("No Image")).filter(Boolean);
    const unique = [...new Set(normalized)];
    if (!unique.length) unique.push(getPlaceholder("No Image"));
    return unique.slice(0, 6);
  };

  const fetchProduct = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products/${id}`);
      const prod = res.data.product || res.data;
      setProduct(prod);
      const galleryList = buildGallery(prod);
      setActiveImage(galleryList[0] || getPlaceholder("No Image"));
      setRelated(res.data.related || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/reviews/${id}`);
      setReviews(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const submitReview = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) return navigate("/login");
      const token = currentUser.token;
      await axios.post(`${API_BASE}/api/reviews`, { productId: id, rating, comment }, { headers: { Authorization: `Bearer ${token}` } });
      setComment("");
      fetchReviews();
      showToast("Review submitted", "success");
    } catch (error) {
      const msg = error.response?.data?.message || "Error submitting review";
      showToast(msg, "error");
    }
  };

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
      <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-semibold text-slate-500">Loading product details...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Dynamic Header */}
      <div className="bg-white border-b border-slate-100 py-6 px-8 sticky top-0 z-40 backdrop-blur-md bg-white/80">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <span onClick={() => navigate("/")} className="hover:text-indigo-600 cursor-pointer transition">Nexus</span>
            <ChevronRight size={12} />
            <span onClick={() => navigate("/products")} className="hover:text-indigo-600 cursor-pointer transition">Assets</span>
            <ChevronRight size={12} />
            <span className="text-slate-900 line-clamp-1">{product.name}</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <span className="text-2xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
            {showCartAction && (
              <button 
                onClick={handleAddToCart}
                className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start mb-32">
          {/* Advanced Visual Array */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex md:flex-col gap-4 order-2 md:order-1">
              {buildGallery(product).map((url, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveImage(url)}
                  className={`w-20 h-20 bg-white rounded-xl p-2 border-2 transition-all flex items-center justify-center ${activeImage === url ? "border-indigo-600" : "border-slate-100 hover:border-slate-300"}`}
                >
                  <img src={url} alt="" className="max-w-full max-h-full object-contain" onError={(e) => (e.target.src = getPlaceholder("No Image"))} />
                </button>
              ))}
            </div>

            <div className="flex-1 order-1 md:order-2 bg-white rounded-2xl p-10 border border-slate-100 relative group aspect-square flex items-center justify-center overflow-hidden">
              <img
                src={activeImage || getPlaceholder("No Image")}
                alt={product.name}
                className="relative z-10 max-h-full max-w-full object-contain mix-blend-multiply"
                onError={(e) => (e.target.src = getPlaceholder("No Image"))}
              />
              
              <div className="absolute top-10 right-10 flex flex-col gap-4 z-20">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product._id); }}
                  className={`p-4 bg-white rounded-2xl shadow-xl transition-all border border-slate-100 ${liked ? "text-rose-500 scale-110" : "text-slate-400"}`}
                >
                  <Heart size={20} fill={liked ? "currentColor" : "none"} />
                </button>
                <button className="p-4 bg-white rounded-2xl shadow-xl hover:text-indigo-600 transition-all border border-slate-100 text-slate-400">
                  <Share2 size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Core Data Interface */}
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                <Fingerprint size={14} /> Product ID: {id.slice(-8).toUpperCase()}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className={`${i < Math.floor(product.rating) ? 'text-indigo-600 fill-indigo-600' : 'text-slate-200'} transition-transform hover:scale-110 cursor-pointer`} />
                  ))}
                  <span className="ml-2 text-slate-900 font-black text-lg tracking-tighter">{product.rating}</span>
                </div>
                <div className="h-4 w-px bg-slate-300" />
                <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                  <MessageSquare size={16} /> {reviews.length} Reviews
                </div>
              </div>

              <div className="py-6 border-y border-slate-100">
                <div className="flex items-end gap-4 mb-3">
                  <span className="text-4xl font-bold text-slate-900">₹{product.price.toLocaleString()}</span>
                  {product.originalPrice && (
                    <span className="text-xl text-slate-400 line-through mb-1">₹{product.originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-md">Best Seller</span>
                  <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1"><Truck size={14} /> Free Shipping</span>
                </div>
              </div>

              <p className="text-slate-600 leading-relaxed text-base">
                {product.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 items-end">
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700">Quantity</label>
                  <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 w-full max-w-[200px]">
                    <button 
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-md transition-colors text-slate-500"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="flex-1 text-center font-semibold text-slate-900">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-md transition-colors text-slate-500"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {showCartAction ? (
                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-indigo-600 text-white rounded-lg py-4 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                  >
                    <Zap size={18} />
                    <span>Add to Cart</span>
                  </button>
                ) : (
                  <div className="w-full bg-slate-100 text-slate-400 rounded-lg py-4 font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                    <Activity size={18} />
                    <span>Preview Only</span>
                  </div>
                )}
              </div>
            </div>

            {/* Core Specs Snapshot */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <Truck size={24} className="text-indigo-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-700">Fast Delivery</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <ShieldCheck size={24} className="text-indigo-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-700">Secure Payment</div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <RotateCcw size={24} className="text-indigo-600 mx-auto mb-2" />
                <div className="text-xs font-semibold text-slate-700">Easy Returns</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="space-y-10">
          <div className="flex justify-center">
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
              {[
                { id: "description", label: "Description", icon: Layers },
                { id: "specifications", label: "Specifications", icon: Cpu },
                { id: "reviews", label: `Reviews (${reviews.length})`, icon: MessageSquare }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-md transition-colors ${
                    activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-[400px]">
            {activeTab === "description" && (
              <div className="max-w-4xl mx-auto space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">Product Overview</h3>
                <p className="text-slate-600 leading-relaxed text-lg">
                  {product.description || "Detailed description not available for this item."}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-indigo-600">Premium</div>
                    <div className="text-sm font-medium text-slate-500">Quality</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xl font-bold text-indigo-600">100%</div>
                    <div className="text-sm font-medium text-slate-500">Authentic</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="max-w-4xl mx-auto border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {product.specifications && Object.keys(product.specifications).length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, value], i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <th className="bg-slate-50 py-4 px-6 text-sm font-semibold text-slate-600 w-1/3">{key}</th>
                          <td className="py-4 px-6 text-sm text-slate-800 bg-white">{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="bg-slate-50 p-12 text-center text-slate-500">
                    No specifications available for this product.
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="max-w-4xl mx-auto space-y-10">
                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
                  <h4 className="text-xl font-bold text-slate-900 mb-6">Write a Review</h4>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-slate-600">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(r => (
                          <button 
                            key={r} 
                            onClick={() => setRating(r)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${rating >= r ? 'bg-indigo-50 text-indigo-600' : 'bg-white text-slate-300 border border-slate-200'}`}
                          >
                            <Star size={18} fill={rating >= r ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      value={comment} 
                      onChange={(e) => setComment(e.target.value)} 
                      placeholder="Share your experience with this product..." 
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400" 
                      rows="4"
                    />
                    <button 
                      onClick={submitReview} 
                      className="bg-indigo-600 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  {reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review._id} className="bg-white rounded-xl p-6 border border-slate-200 flex gap-6">
                        <div className="w-12 h-12 bg-indigo-50 rounded-full flex-shrink-0 flex items-center justify-center text-indigo-600 font-bold text-lg">
                          {review.user?.name?.charAt(0) || "U"}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-slate-900">{review.user?.name}</p>
                              <div className="flex gap-0.5 mt-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} size={12} className={`${i < review.rating ? 'text-indigo-600 fill-indigo-600' : 'text-slate-200'}`} />
                                ))}
                              </div>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Verified Purchase</span>
                          </div>
                          <p className="text-slate-600 text-sm">{review.comment}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-white border border-slate-200 rounded-xl">
                      <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">No reviews yet. Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20 space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Similar Products</h2>
              <button onClick={() => navigate('/products')} className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1">
                View All <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {related.map(p => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onView={(id) => navigate(`/products/${id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
