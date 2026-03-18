import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../utils/apiBase";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShoppingBag,
  DollarSign,
  Smartphone,
  AlertTriangle,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Package
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const token = authUser?.token || JSON.parse(localStorage.getItem("currentUser"))?.token;

  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalUsers: 0,
    activeOrders: 0,
    totalOrders: 0,
    revenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || authUser?.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchDashboard();
  }, [token, authUser, navigate]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats({
        totalProducts: res.data.totalProducts || 0,
        lowStock: res.data.lowStock || 0,
        totalUsers: res.data.totalUsers || 0,
        activeOrders: res.data.activeOrders || 0,
        totalOrders: res.data.totalOrders || 0,
        revenue: res.data.revenue || 0,
      });
      setRecentOrders(res.data.recentOrders || []);
    } catch (err) {
      console.log("Dashboard Error:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("currentUser");
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Activity className="text-indigo-600" /> Dashboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">Overview of your store's performance</p>
        </div>
        <div className="hidden md:block">
          <div className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
            System Active
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={DollarSign} 
          label="Total Revenue" 
          value={`₹${(stats.revenue || 0).toLocaleString()}`} 
          color="indigo" 
          trend="+12.5%" 
        />
        <StatCard 
          icon={ShoppingBag} 
          label="Orders" 
          value={stats.totalOrders} 
          color="violet" 
          trend="+8.2%" 
        />
        <StatCard 
          icon={Users} 
          label="Customers" 
          value={stats.totalUsers} 
          color="blue" 
          trend="+2.4%" 
        />
        <StatCard 
          icon={Smartphone} 
          label="Products" 
          value={stats.totalProducts} 
          color="slate" 
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="text-indigo-600" size={20} /> Recent Orders
            </h2>
            <button className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">View All</button>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Order ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded">
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-800">{order.user?.name || "Customer"}</p>
                      <p className="text-xs text-slate-500">Ordered {order.items?.length} products</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${
                        order.status?.toLowerCase() === "delivered" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        order.status?.toLowerCase() === "pending" ? "bg-amber-50 text-amber-600 border-amber-100" :
                        "bg-indigo-50 text-indigo-600 border-indigo-100"
                      }`}>
                        {order.status || "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">
                      ₹{(order.pricing?.total || order.total || order.items?.reduce((acc, it) => acc + (it.price * it.quantity), 0) || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {recentOrders.length === 0 && (
             <div className="p-12 text-center text-slate-400 font-medium">No recent orders found</div>
          )}
        </div>

        {/* Status / Alerts */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="text-emerald-500" size={20} /> Store Health
            </h3>
            <div className="space-y-4">
              <StatusItem label="Server" status="Online" color="emerald" />
              <StatusItem label="Database" status="Normal" color="emerald" />
              <StatusItem label="Inventory" status="Updated" color="emerald" />
            </div>
          </div>

          <div className={`rounded-2xl p-6 border shadow-sm transition-all duration-300 ${
            stats.lowStock > 0 
              ? "bg-amber-50 border-amber-100 text-amber-900" 
              : "bg-emerald-50 border-emerald-100 text-emerald-900"
          }`}>
            <div className="flex items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                stats.lowStock > 0 ? "bg-amber-200/50" : "bg-emerald-200/50"
              }`}>
                {stats.lowStock > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="font-bold text-base">Inventory Alert</h4>
                <p className="text-sm font-medium mt-1 leading-relaxed opacity-80">
                  {stats.lowStock > 0 
                    ? `${stats.lowStock} products are running low on stock.` 
                    : "All products are presently in stock."}
                </p>
                {stats.lowStock > 0 && (
                  <button className="mt-4 bg-white text-amber-900 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:shadow transition">
                    Restock Products
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-2">Notice</p>
              <h4 className="text-xl font-bold mb-1 leading-tight">Admin Update</h4>
              <p className="text-slate-400 text-xs font-medium leading-relaxed">Your dashboard has been upgraded to the latest version.</p>
            </div>
            <Package size={80} className="absolute -right-6 -bottom-6 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, trend }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    slate: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[color] || colorMap.indigo}`}>
          <Icon size={22} strokeWidth={2} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
            <ArrowUpRight size={12} /> {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mb-1">{label}</p>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h2>
      </div>
    </div>
  );
}

function StatusItem({ label, status, color }) {
  const markerColor = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
  }[color];

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-1.5 h-1.5 rounded-full ${markerColor}`}></div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-900">{status}</span>
      </div>
    </div>
  );
}

export default AdminDashboard;
