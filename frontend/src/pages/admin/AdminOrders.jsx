import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "../../context/ToastContext";
import { useNavigate } from "react-router-dom";
import {
  Eye,
  CheckCircle,
  Truck,
  Clock,
  ShoppingBag,
  User,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  XCircle,
  Package,
  Settings,
  Activity,
  Trash2,
  RotateCcw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE } from "../../utils/apiBase";
import SelectDropdown from "../../components/SelectDropdown";

function AdminOrders() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const token = authUser?.token;
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/orders/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data || []);
    } catch (err) {
      console.log("Error fetching orders:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || authUser?.role !== "admin") {
      navigate("/admin/login");
      return;
    }
    fetchOrders();
  }, [token, authUser, navigate]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/api/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(prev => prev.map(o => o._id === id ? { 
        ...o, 
        status, 
        orderStatus: status.charAt(0).toUpperCase() + status.slice(1) 
      } : o));
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update status";
      console.log("Error updating status:", msg);
      showToast(msg, "error");
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Admin: Permanently delete this order?")) return;
    try {
      await axios.delete(`${API_BASE}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(prev => prev.filter(o => o._id !== orderId));
      showToast("Order deleted permanently", "success");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete order";
      showToast(msg, "error");
    }
  };

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter(o => {
        const f = filter.toLowerCase();
        return (
          o.orderStatus?.toLowerCase() === f ||
          o.status?.toLowerCase() === f ||
          o.paymentMethod?.toLowerCase() === f ||
          o.paymentStatus?.toLowerCase() === f
        );
      });

  const total = orders.length;
  const pending = orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === "pending").length;
  const processing = orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === "processing").length;
  const shipped = orders.filter(o => ["shipped", "out_for_delivery"].includes((o.orderStatus || o.status)?.toLowerCase())).length;
  const delivered = orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === "delivered").length;
  const cancelled = orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === "cancelled").length;
  const returned = orders.filter(o => (o.orderStatus || o.status)?.toLowerCase() === "returned").length;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <ShoppingBag className="text-indigo-600 w-9 h-9" /> Orders
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage and update customer orders</p>
        </div>
        <div className="flex gap-4">
          <SelectDropdown
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All Orders" },
              { value: "Processing", label: "Processing" },
              { value: "Shipped", label: "Shipped" },
              { value: "Delivered", label: "Delivered" },
              { value: "Cancelled", label: "Cancelled" },
              { value: "COD", label: "Method: COD" },
              { value: "Online", label: "Method: Online" },
              { value: "Paid", label: "Status: Paid" },
              { value: "Pending", label: "Status: Pending" },
            ]}
            className="w-64"
            buttonClassName="w-full bg-white font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Orders" value={total} color="slate" icon={ShoppingBag} />
        <StatCard label="Pending" value={pending} color="amber" icon={Clock} />
        <StatCard label="Processing" value={processing} color="blue" icon={Package} />
        <StatCard label="Shipped" value={shipped} color="indigo" icon={Truck} />
        <StatCard label="Delivered" value={delivered} color="emerald" icon={CheckCircle} />
        <StatCard label="Cancelled" value={cancelled + returned} color="rose" icon={XCircle} />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold text-sm">Loading orders...</p>
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredOrders.map(order => (
            <OrderGridCard 
              key={order._id} 
              order={order} 
              onStatusChange={updateStatus} 
              onDelete={deleteOrder}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto border border-slate-100">
            <Package className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">No Orders Found</h3>
            <p className="text-slate-500 font-medium">No orders match the selected filter.</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const colorMap = {
    slate: "bg-white border-slate-200 text-slate-900",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  const isLarge = String(value).length > 8;

  return (
    <div className={`p-5 rounded-[1.5rem] border shadow-sm transition-all hover:shadow-md hover:scale-[1.02] ${colorMap[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white rounded-xl shadow-sm border border-black/5">
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <span className="text-[8px] font-black uppercase tracking-[0.1em] opacity-50 text-right leading-none max-w-[50px]">{label}</span>
      </div>
      <h2 className={`font-black tracking-tighter ${isLarge ? "text-lg" : "text-2xl"}`}>{value}</h2>
    </div>
  );
}

function OrderGridCard({ order, onStatusChange, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);
  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case "pending":
      case "processing": return { icon: Settings, color: "text-blue-500 bg-blue-50 border-blue-100", label: "Processing" };
      case "shipped": return { icon: Truck, color: "text-indigo-500 bg-indigo-50 border-indigo-100", label: "Shipped" };
      case "delivered": return { icon: CheckCircle, color: "text-emerald-500 bg-emerald-50 border-emerald-100", label: "Delivered" };
      case "cancelled": return { icon: XCircle, color: "text-rose-500 bg-rose-50 border-rose-100", label: "Cancelled" };
      case "returned": return { icon: RotateCcw, color: "text-amber-500 bg-amber-50 border-amber-100", label: "Returned" };
      default: return { icon: Clock, color: "text-slate-500 bg-slate-50 border-slate-100", label: status || "Unknown" };
    }
  };

  const config = getStatusConfig(order.orderStatus || order.status);
  const StatusIcon = config.icon;

  const getPaymentStyle = (status) => {
    switch(status) {
      case "Paid": return "text-emerald-500 font-bold";
      case "Failed": return "text-rose-500 font-bold";
      default: return "text-amber-500 font-bold";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all group">
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">#{order._id.slice(-6).toUpperCase()}</h3>
            <div className={`px-3 py-1 rounded-md flex items-center gap-2 border ${config.color}`}>
              <StatusIcon size={12} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Calendar size={14} />
            <span className="text-xs font-semibold">{new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
          </div>
        </div>
        <button 
          onClick={() => onDelete(order._id)}
          className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hover:bg-rose-600 hover:text-white transition-all"
          title="Delete Order (Admin)"
        >
          <Trash2 size={20} />
        </button>
      </div>

      <div className="bg-slate-50/50 rounded-xl p-4 mb-6 border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100">
            <User size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Customer</p>
            <p className="text-sm font-bold text-slate-900">{order.user?.name || "Customer"}</p>
          </div>
        </div>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-600">{item.name} <span className="opacity-60 text-[10px]">×{item.quantity}</span></span>
              <span className="font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="text-left font-bold tracking-tight">
          <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-indigo-600">₹{(order.pricing?.total || order.total || order.items?.reduce((acc, item) => acc + (item.price * item.quantity), 0) || 0).toLocaleString()}</p>
        </div>
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-lg flex items-center gap-2 text-xs transition-colors"
        >
          <Eye size={16} /> {showDetails ? "Hide" : "Details"}
        </button>
      </div>

      {showDetails && (
        <div className="bg-slate-50/60 border border-slate-100 rounded-2xl p-5 space-y-3 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Shipping Information</p>
          <div className="text-xs text-slate-600 font-medium leading-relaxed">
            <div>{order.shippingAddress?.name}</div>
            <div>{order.shippingAddress?.phone}</div>
            <div>{order.shippingAddress?.address}</div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-3">Payment Details</p>
          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] uppercase font-bold tracking-wider">{order.paymentMethod || order.payment?.method}</span>
            <span className={getPaymentStyle(order.paymentStatus || order.payment?.status)}>Status: {order.paymentStatus || order.payment?.status}</span>
          </div>
          {(order.transactionId || order.payment?.transactionId) && (
            <p className="text-[9px] text-slate-400 font-mono mt-1">TXN: {order.transactionId || order.payment?.transactionId}</p>
          )}
          {order.statusHistory?.length > 0 && (
            <div className="pt-3 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status History</p>
              <ul className="space-y-1 text-[11px] text-slate-500">
                {order.statusHistory.slice(-5).reverse().map((s, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span className="font-bold capitalize text-slate-600">{s.status}</span>
                    <span>{new Date(s.changedAt || order.updatedAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Set New Status</p>
        <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide">
          {["pending", "processing", "shipped", "delivered", "cancelled"].map(s => (
            <button
              key={s}
              onClick={() => onStatusChange(order._id, s)}
              className={`flex-1 min-w-[70px] py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                (order.orderStatus?.toLowerCase() || order.status?.toLowerCase()) === s 
                  ? "bg-slate-900 border-slate-900 text-white shadow-md" 
                  : "bg-white border-slate-200 text-slate-500 hover:border-slate-400"
              }`}
            >
              {s.slice(0, 4)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
