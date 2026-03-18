import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../utils/apiBase";
import { 
  RotateCcw, 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Image as ImageIcon,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { getImageUrl, getPlaceholder } from "../../utils/imageUrl";

const REASONS = ["Damaged", "Wrong Product", "Defective", "Other"];

export default function ReturnsRefunds() {
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    orderId: "",
    productId: "",
    productName: "",
    reason: REASONS[0],
    message: "",
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const ordersRes = await axios.get(`${API_BASE}/api/orders/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Requirement: Only show delivered orders for returns (like Meesho)
      const deliveredOrders = (ordersRes.data || []).filter(o => 
        (o.orderStatus || o.status)?.toLowerCase() === "delivered"
      );
      setDeliveredOrders(deliveredOrders);

      const returnsRes = await axios.get(`${API_BASE}/api/returns/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReturnRequests(returnsRes.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const handleOpenModal = (order, item) => {
    setFormData({
      orderId: order._id,
      productId: item.product,
      productName: item.name,
      reason: REASONS[0],
      message: "",
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const fd = new FormData();
      fd.append("orderId", formData.orderId);
      fd.append("productId", formData.productId);
      fd.append("reason", formData.reason);
      fd.append("message", formData.message || "");
      if (imageFile) fd.append("image", imageFile);

      await axios.post(`${API_BASE}/api/returns/request`, fd, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { message: "Return request submitted successfully!", type: "success" } 
      }));
      setShowModal(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit request";
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { message: msg, type: "error" } 
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending": return "bg-amber-50 text-amber-600 border-amber-100";
      case "Approved": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Rejected": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending": return <Clock size={12} />;
      case "Approved": return <CheckCircle size={12} />;
      case "Rejected": return <XCircle size={12} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 mt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
            <RotateCcw className="text-indigo-600 w-10 h-10" /> Returns & Refunds
          </h1>
          <p className="text-slate-500 font-medium mt-2">Manage your product returns and check refund status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Eligible Orders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <Package className="text-indigo-600" size={20} />
            <h2 className="text-xl font-bold text-slate-800">Delivered Orders</h2>
          </div>

          {loading ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-20 text-center">
              <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Loading orders...</p>
            </div>
          ) : deliveredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center space-y-4">
              <p className="text-slate-400 font-medium">No delivered orders found eligible for return.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deliveredOrders.map(order => (
                <div key={order._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Order ID</span>
                      <p className="text-sm font-bold text-slate-900">#{order.orderId || order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right block">Date</span>
                      <p className="text-sm font-bold text-slate-900 text-right">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="p-6 space-y-6">
                    {order.items.map((item, idx) => {
                      const isAlreadyRequested = returnRequests.some(r => r.orderId?._id === order._id && r.productId?._id === (item.product || item._id));
                      return (
                        <div key={idx} className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="w-20 h-20 bg-slate-50 rounded-2xl border border-slate-100 p-2 overflow-hidden shrink-0 shadow-inner">
                            <img 
                              src={getImageUrl(item.image) || getPlaceholder(item.name)} 
                              alt={item.name} 
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h4 className="font-bold text-slate-900 text-lg leading-tight">{item.name}</h4>
                            <p className="text-slate-500 font-medium text-sm mt-1">Quantity: {item.quantity} • ₹{item.price?.toLocaleString()}</p>
                          </div>
                          <div className="shrink-0">
                            {isAlreadyRequested ? (
                              <span className="px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                                Return Requested
                              </span>
                            ) : (
                              <button
                                onClick={() => handleOpenModal(order, item)}
                                className="group flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                              >
                                Request Return <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Return History */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <RotateCcw className="text-indigo-600" size={20} />
            <h2 className="text-xl font-bold text-slate-800">Recent Requests</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse"></div>)}
            </div>
          ) : returnRequests.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-10 text-center">
              <p className="text-slate-400 text-sm font-medium">No return history available.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {returnRequests.map(req => (
                <div key={req._id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3">
                     <span className={`px-3 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getStatusStyle(req.status)}`}>
                        {getStatusIcon(req.status)} {req.status}
                     </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 p-1 overflow-hidden shrink-0 shadow-sm">
                      <img
                        src={getImageUrl(req.image) || getImageUrl(req.productId?.image) || getPlaceholder(req.productId?.name)}
                        alt={req.productId?.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 pr-20">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{req.productId?.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">#{req.orderId?.orderId || req.orderId?._id?.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={12} className="text-indigo-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reason</p>
                        <p className="text-xs font-bold text-slate-700">{req.reason}</p>
                      </div>
                    </div>
                    {req.message && (
                      <div className="flex items-start gap-2">
                        <MessageSquare size={12} className="text-slate-300 mt-0.5" />
                        <p className="text-[11px] text-slate-500 font-medium italic">"{req.message}"</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest pt-2 flex justify-between">
                    <span>Requested On</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Return Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowModal(false)}></div>
          
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl relative z-10 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
            <div className="absolute top-6 right-6">
              <button 
                onClick={() => setShowModal(false)}
                className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Request Return</h2>
                <p className="text-slate-500 font-medium italic">Tell us what went wrong with your product</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Product Name (Readonly)</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={formData.productName}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-600 outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block font-mono">Order ID</label>
                    <input 
                      type="text" 
                      readOnly 
                      value={formData.orderId.slice(-8).toUpperCase()}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-400 outline-none font-mono" 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Reason for Return</label>
                    <select 
                      value={formData.reason}
                      onChange={(e) => setFormData({...formData, reason: e.target.value})}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all appearance-none"
                    >
                      {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Additional Message</label>
                  <textarea 
                    rows="3"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Provide more details about the issue..."
                    className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder:text-slate-300"
                  ></textarea>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Upload Image (Optional)</label>
                  <div className="relative group">
                    <div className="mt-1">
                      <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                      {imageFile && <p className="text-xs text-slate-500 mt-2">Selected: {imageFile.name}</p>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={submitting}
                  className={`w-full bg-indigo-600 text-white rounded-[1.2rem] py-5 text-sm font-black uppercase tracking-[0.15em] shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 transition-all ${submitting ? "opacity-70 cursor-not-allowed" : "hover:bg-indigo-700 hover:-translate-y-1"}`}
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>Submit Return Request <RotateCcw size={18} /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
