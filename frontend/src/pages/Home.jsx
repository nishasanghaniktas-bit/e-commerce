import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowRight, 
  Star, 
  Flame, 
  Gift, 
  TrendingUp, 
  Heart, 
  Zap, 
  Cpu, 
  ShieldCheck, 
  Activity,
  Layers,
  ArrowUpRight,
  ChevronRight,
  Globe,
  Database
} from "lucide-react";
import { API_BASE } from "../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../utils/imageUrl";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/products`);
        const payload = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        setProducts(payload);
      } catch (err) {
        console.error("Failed to load neural assets", err);
      }
    };
    load();
  }, []);

  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (p) =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
    );
  }, [products, search]);

  return (
    <div className="bg-slate-50 min-h-screen overflow-hidden">
      {/* Cinematic Hero */}
      <section className="relative pt-32 pb-40 px-6 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-0" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-100/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 -z-0" />
        
        <div className="container mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-10 animate-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xl shadow-slate-200">
              <Zap size={14} className="text-yellow-400" /> NEW ARRIVALS: IPHONE 15 SERIES
            </div>
            
            <div className="space-y-4">
              <h1 className="text-7xl md:text-8xl font-black leading-[0.85] tracking-tighter text-slate-900">
                PREMIUM <br />
                <span className="text-indigo-600">MOBILE</span> <br />
                EXPERIENCE.
              </h1>
              <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                Discover the latest in mobile technology. Premium devices, accessories, and peripherals delivered to your doorstep.
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-4 items-stretch">
              <div className="relative flex-1 min-w-[240px]">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search for models, brands, or features..."
                  className="w-full px-5 py-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-800 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
              <button
                onClick={() => navigate("/products")}
                className="px-10 py-4 rounded-2xl bg-slate-900 text-white font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 hover:shadow-xl transition-all active:scale-95 group"
              >
                Shop Now <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-10 pt-10 border-t border-slate-100">
              <div className="space-y-2">
                <div className="text-3xl font-bold text-slate-900 tracking-tighter">5.0k+</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Happy Customers</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-slate-900 tracking-tighter">24h</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fast Delivery</div>
              </div>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-slate-900 tracking-tighter">100%</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Genuine Products</div>
              </div>
            </div>
          </div>

          <div className="relative group animate-in zoom-in duration-1000 delay-200">
            <div className="aspect-square rounded-[4rem] bg-white flex items-center justify-center overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.1)] border-8 border-white group-hover:shadow-indigo-100 transition-all duration-700">
              <img 
                src="https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800" 
                alt="hero" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            </div>
            
            {/* Float Cards */}
            <div className="absolute -left-8 bottom-20 bg-white rounded-2xl shadow-2xl p-5 border border-slate-100 flex items-center gap-4 animate-bounce-slow">
              <div className="w-11 h-11 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
                <Flame size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-sm tracking-tight">Flash Sale</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Limited Time Offers</p>
              </div>
            </div>

            <div className="absolute -right-4 top-20 bg-indigo-600 text-white rounded-2xl shadow-2xl p-5 flex items-center gap-4">
              <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center border border-white/20">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="font-bold text-sm tracking-tight">Secure Pay</p>
                <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-wider">100% Protected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Indicators removed per request */}

      {/* Unified Product Grid */}
      <section className="container mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
              <Layers size={14} /> Catalog
            </div>
            <h2 className="text-5xl font-bold text-slate-900 tracking-tighter leading-none">Our Collection</h2>
            <p className="text-slate-500 font-medium max-w-xl">Curated selection of high-end smartphones and professional accessories.</p>
          </div>
          <div className="text-sm text-slate-500 font-semibold">
            Showing {filteredProducts.length} of {Array.isArray(products) ? products.length : 0} items
          </div>
        </div>
        
        <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {filteredProducts.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              onView={(id) => navigate(`/products/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* Mid Banner placeholder removed */}

      {/* Trending section removed per request */}

      {/* Global Intel Footer Placeholder */}
      <div className="bg-slate-50 border-t border-slate-200 py-24">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <h4 className="text-3xl font-bold tracking-tighter text-indigo-600 italic">MOBILESALE</h4>
            <p className="text-slate-500 max-w-sm font-medium leading-relaxed">Your premier destination for the latest smartphones and mobile hardware. Authorized retailer providing genuine products since 2024.</p>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-sans">Shop Nodes</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-900">
              <li><Link to="/products" className="hover:text-indigo-600 transition-colors">Browse Shop</Link></li>
              <li><Link to="/user/orders" className="hover:text-indigo-600 transition-colors">My Orders</Link></li>
              <li><Link to="/user/wishlist" className="hover:text-indigo-600 transition-colors">Wishlist</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 font-sans">Account & Support</h5>
            <ul className="space-y-4 text-sm font-bold text-slate-900">
              <li><Link to="/login" className="hover:text-indigo-600 transition-colors">Login / Sign In</Link></li>
              <li><Link to="/admin" className="hover:text-indigo-600 transition-colors">Admin Portal</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
