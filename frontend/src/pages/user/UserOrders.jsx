import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Eye, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  Filter, 
  Search, 
  Calendar, 
  Hash, 
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  XCircle,
  Activity,
  ShoppingBag,
  Trash2,
  RotateCcw
} from "lucide-react";
import axios from "axios";
import { API_BASE } from "../../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../../utils/imageUrl";

function UserOrders() {
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/orders/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (error) {
      console.log("Orders Error:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to remove this order from your history?")) return;
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      await axios.delete(`${API_BASE}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev => prev.filter(o => o._id !== orderId));
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Order removed", type: "success" } }));
    } catch (error) {
      console.log("Delete Error:", error);
      const msg = error.response?.data?.message || "Failed to delete order";
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: msg, type: "error" } }));
    }
  };

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === filter.toLowerCase());

  const stats = {
    total: orders.length,
    pending: orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === "pending").length,
    processing: orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === "processing").length,
    shipped: orders.filter(o => 
      ["shipped", "out_for_delivery"].includes((o.orderStatus || o.status)?.toLowerCase())
    ).length,
    cancelled: orders.filter(o => ["cancelled", "returned"].includes((o.orderStatus || o.status)?.toLowerCase())).length,
    delivered: orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === "delivered").length,
    spent: orders.reduce((sum, o) => sum + (o.totalAmount || o.pricing?.total || o.total || 0), 0),
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 mt-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
            <Package className="text-indigo-600 w-10 h-10" /> My Orders
          </h1>
          <p className="text-slate-500 font-medium mt-2">Track your orders and view purchase history</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <Filter size={16} className="text-slate-400 ml-3" />
          {["all", "pending", "processing", "shipped", "delivered"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${
                filter === f ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:text-slate-900"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-7 gap-5">
        <StatCard 
          label="Total Spent" 
          value={`₹${Math.round(stats.spent || 0).toLocaleString()}`} 
          color="indigo" 
          icon={Activity} 
        />
        <StatCard 
          label="Total Orders" 
          value={stats.total} 
          color="slate" 
          icon={ShoppingBag} 
          onClick={() => setFilter("all")}
          active={filter === "all"}
        />
        <StatCard 
          label="Pending" 
          value={stats.pending} 
          color="amber" 
          icon={Clock} 
          onClick={() => setFilter("pending")}
          active={filter === "pending"}
        />
        <StatCard 
          label="Processing" 
          value={stats.processing} 
          color="blue" 
          icon={Package} 
          onClick={() => setFilter("processing")}
          active={filter === "processing"}
        />
        <StatCard 
          label="Shipped" 
          value={stats.shipped} 
          color="indigo" 
          icon={Truck} 
          onClick={() => setFilter("shipped")}
          active={filter === "shipped"}
        />
        <StatCard 
          label="Completed" 
          value={stats.delivered} 
          color="emerald" 
          icon={CheckCircle} 
          onClick={() => setFilter("delivered")}
          active={filter === "delivered"}
        />
        <StatCard 
          label="Cancelled" 
          value={stats.cancelled} 
          color="rose" 
          icon={XCircle} 
          onClick={() => setFilter("cancelled")}
          active={filter === "cancelled"}
        />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading your orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredOrders.map(order => (
            <OrderCard key={order._id} order={order} onDelete={deleteOrder} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-32 text-center space-y-6 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto border border-slate-100">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">No Orders Found</h3>
          <p className="text-slate-400 font-medium">You haven't placed any orders yet.</p>
          <Link to="/products" className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 hover:shadow-xl transition-all">
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon, onClick, active }) {
  const colorMap = {
    slate: "from-slate-50 to-white text-slate-900 border-slate-200",
    amber: "from-amber-50 to-white text-amber-600 border-amber-100",
    blue: "from-blue-50 to-white text-blue-600 border-blue-100",
    indigo: "from-indigo-50 to-white text-indigo-700 border-indigo-100",
    emerald: "from-emerald-50 to-white text-emerald-600 border-emerald-100",
    rose: "from-rose-50 to-white text-rose-600 border-rose-100",
  };

  const isLarge = String(value).length > 8;

  return (
    <div 
      onClick={onClick}
      className={`p-4 rounded-[1.8rem] border bg-gradient-to-br shadow-sm transition-all duration-300 relative overflow-hidden group
        ${onClick ? "cursor-pointer hover:shadow-xl hover:shadow-indigo-50/50 hover:-translate-y-1" : ""}
        ${active ? "ring-2 ring-indigo-600 ring-offset-2 scale-[1.05] shadow-lg" : ""} 
        ${colorMap[color]}`}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-2.5 rounded-2xl shadow-sm border border-black/5 bg-white`}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <div className="text-right">
          <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40 leading-none">{label}</span>
        </div>
      </div>
      <div className="relative z-10">
        <h2 className={`font-black tracking-tight leading-none ${isLarge ? "text-lg" : "text-xl"}`}>
          {value}
        </h2>
      </div>
      {active && (
        <div className="absolute top-0 right-0 p-1">
          <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onDelete }) {
  const statusStyles = {
    pending: "bg-amber-50 text-amber-600 border-amber-100 icon-clock",
    processing: "bg-blue-50 text-blue-600 border-blue-100 icon-package",
    shipped: "bg-indigo-50 text-indigo-600 border-indigo-100 icon-truck",
    out_for_delivery: "bg-blue-50 text-blue-600 border-blue-100 icon-truck",
    delivered: "bg-emerald-50 text-emerald-600 border-emerald-100 icon-check",
    cancelled: "bg-rose-50 text-rose-600 border-rose-100 icon-x",
    returned: "bg-purple-50 text-purple-600 border-purple-100",
  };

  const status = (order.orderStatus || order.status)?.toLowerCase() || "pending";
  const style = statusStyles[status] || "bg-slate-50 text-slate-600 border-slate-100";
  const isDelivered = status === "delivered";

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-indigo-50 transition-all duration-500 group relative overflow-hidden">
      {/* Visual background element */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-50 group-hover:scale-[3] transition-transform duration-1000" />
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              <Hash size={12} className="text-indigo-600" /> Order ID
            </div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              #{order._id.slice(-8).toUpperCase()}
            </h3>
          </div>
          <div className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-widest border flex items-center gap-2 ${style}`}>
            <div className={`w-1 h-1 rounded-full animate-pulse ${style.split(' ')[1].replace('text-', 'bg-')}`} />
            {status.replace(/_/g, ' ')}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <Calendar size={14} className="text-slate-400" />
            </div>
            <span>Ordered on: {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
              <ShieldCheck size={14} className={order.paymentStatus === "Paid" ? "text-emerald-500" : "text-slate-400"} />
            </div>
            <span>Payment: {order.paymentStatus || "Pending"} via {order.paymentMethod || "COD"}</span>
          </div>
        </div>

        <div className="bg-slate-50/50 rounded-2xl p-5 mb-8 border border-slate-100 space-y-4">
          {order.items?.slice(0, 2).map((item, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 p-1 shrink-0 overflow-hidden shadow-sm">
                <img 
                  src={getImageUrl(item.image) || getPlaceholder("No Image")} 
                  alt={item.name} 
                  className="w-full h-full object-contain"
                  onError={(e) => { e.target.src = getPlaceholder("No Image"); }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-3">
                  <p className="text-[11px] font-bold text-slate-800 truncate">{item.name}</p>
                  <span className="text-[10px] font-black text-indigo-600 shrink-0">×{item.quantity}</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400">₹{item.price?.toLocaleString()}</p>
              </div>
            </div>
          ))}
          {order.items?.length > 2 && (
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pt-3 border-t border-slate-200/50 flex items-center gap-2">
              <div className="w-5 h-5 bg-slate-100 rounded flex items-center justify-center text-[8px]">+{order.items.length - 2}</div>
              <span>Additional Items</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-8">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Amount</span>
          <span className="text-2xl font-bold text-indigo-600 tracking-tight">₹{(order.pricing?.total || order.total || order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0)?.toLocaleString()}</span>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/user/orders/${order._id}`}
            className="flex-1 flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-600 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <Eye size={16} /> View Order Details
          </Link>

          {isDelivered && (
            <Link
              to="/user/returns"
              className="flex-1 flex items-center justify-center gap-3 bg-indigo-600 text-white py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <RotateCcw size={16} /> Return Items
            </Link>
          )}
          
          {(status === "cancelled" || status === "delivered" || status === "returned") && (
            <button
              onClick={() => onDelete(order._id)}
              className="w-14 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-rose-100"
              title="Delete Order"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserOrders;
