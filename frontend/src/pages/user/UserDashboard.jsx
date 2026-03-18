import { useEffect, useState } from "react";
import { ShoppingCart, Heart, Package, CheckCircle, Clock, Cpu, Zap, Activity, Box, ArrowUpRight } from "lucide-react";
import axios from "axios";
import { API_BASE } from "../../utils/apiBase";
import ProductCard from "../../components/ProductCard";
import { useNavigate } from "react-router-dom";

function UserDashboard() {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  const [dashboard, setDashboard] = useState({
    totalOrders: 0,
    activeOrders: 0,
    deliveredOrders: 0,
  });

  const [products, setProducts] = useState([]);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) setUserProfile(user);
    
    fetchDashboard();
    fetchProducts();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/user/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDashboard(res.data);
    } catch (error) {
      console.log("Dashboard Error:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products`);
      const items = res.data.data || res.data || [];
      setProducts(items); // show all products
    } catch (error) {
      console.log("Error fetching products:", error);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header Profile Section */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {userProfile?.name?.charAt(0) || "U"}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">Welcome, {userProfile?.name}</h1>
              <div className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold">Premium Member</div>
            </div>
            <p className="text-slate-500 font-medium text-sm">{userProfile?.email}</p>
          </div>
        </div>

        <button 
          onClick={() => navigate("/user/profile")}
          className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          Manage Profile <ArrowUpRight size={16} />
        </button>
      </div>

      {/* Statistics Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate("/user/orders")}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <Package size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-500">Total Orders</p>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{dashboard.totalOrders}</h2>
        </div>

        <div 
          onClick={() => navigate("/user/orders")}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-500">
              <Activity size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-500">Active Orders</p>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{dashboard.activeOrders}</h2>
        </div>

        <div 
          onClick={() => navigate("/user/returns")}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-500">
              <CheckCircle size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-500">Delivered Orders</p>
          </div>
          <h2 className="text-3xl font-bold text-slate-900">{dashboard.deliveredOrders}</h2>
        </div>
      </div>

      {/* Recommended Products */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Recommended For You</h2>
          <button 
            onClick={() => navigate("/products")} 
            className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors"
          >
            View All Products
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onView={(id) => navigate(`/products/${id}`)}
            />
          ))}
        </div>
      </section>

      {/* Promotional Banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl">
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Special Offers Just For You</h3>
          <p className="text-slate-600">Get the best deals on premium mobile accessories and devices. Shop now to save more on your favorite items.</p>
        </div>
        <button onClick={() => navigate("/products")} className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap">
          Shop Now
        </button>
      </div>
    </div>
  );
}

export default UserDashboard;
