import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../../utils/apiBase";
import { CheckCircle, XCircle, RotateCcw, Package, Clock, ShieldCheck, User as UserIcon } from "lucide-react";
import { getImageUrl, getPlaceholder } from "../../utils/imageUrl";

const statusColors = {
  Pending: "bg-amber-50 text-amber-600 border-amber-100",
  Approved: "bg-emerald-50 text-emerald-600 border-emerald-100",
  Rejected: "bg-rose-50 text-rose-600 border-rose-100",
};

export default function AdminReturns() {
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/returns/admin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_BASE}/api/returns/update-status/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { message: `Return request ${status.toLowerCase()} successfully`, type: "success" } 
      }));
      fetchData();
    } catch (err) {
      console.log(err);
      window.dispatchEvent(new CustomEvent("toast", { 
        detail: { message: "Failed to update status", type: "error" } 
      }));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
              <RotateCcw className="text-white w-7 h-7" />
            </div>
            Returns Management
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2 ml-1">
            Review and process customer refund requests
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-50 px-6 py-3 rounded-2xl border border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Pending</p>
            <p className="text-xl font-black text-indigo-600">{requests.filter(r => r.status === "Pending").length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden">
        <div className="grid grid-cols-7 bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-8 py-6">
          <span>Order ID</span>
          <span>Product</span>
          <span>Customer</span>
          <span>Reason</span>
          <span>Date</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="p-32 text-center">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching return records...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-32 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto border border-slate-100">
              <Package className="text-slate-200 w-10 h-10" />
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No return requests active at this time</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {requests.map((req) => (
              <div
                key={req._id}
                className="grid grid-cols-7 items-center px-8 py-6 text-sm hover:bg-slate-50/50 transition-all group"
              >
                <div className="font-black text-slate-900 font-mono text-xs">
                  #{req.orderId?.orderId || req.orderId?._id?.slice?.(-6).toUpperCase()}
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                    <img 
                      src={getImageUrl(req.productId?.image) || getPlaceholder(req.productId?.name)} 
                      alt={req.productId?.name} 
                      className="w-full h-full object-contain" 
                      onError={(e) => { e.target.src = getPlaceholder("No Image"); }}
                    />
                  </div>
                  <div className="min-w-0 pr-4">
                    <p className="font-black text-slate-800 truncate leading-tight text-xs">{req.productId?.name}</p>
                    <p className="text-[9px] text-indigo-600 font-bold uppercase tracking-widest mt-1">Item #{req.productId?._id?.slice(-4).toUpperCase()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                    {req.userId?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-[11px] leading-tight">{req.userId?.name}</p>
                    <p className="text-[9px] text-slate-400 font-medium truncate mt-0.5">{req.userId?.email}</p>
                  </div>
                </div>

                <div className="pr-10">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-2 w-fit">
                    <ShieldCheck size={10} /> {req.reason}
                  </span>
                  {req.message && (
                    <p className="text-[10px] text-slate-400 italic mt-2 truncate max-w-full">"{req.message}"</p>
                  )}
                  {req.image && (
                    <div className="mt-2 w-10 h-10 rounded border overflow-hidden cursor-pointer" onClick={() => window.open(getImageUrl(req.image))}>
                       <img src={getImageUrl(req.image)} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-bold text-slate-500 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Clock size={12} className="text-slate-300" />
                    {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <span
                    className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.1em] flex items-center gap-2 w-fit ${statusColors[req.status] || "bg-slate-50 text-slate-600 border-slate-100"}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${req.status === 'Pending' ? 'bg-amber-400' : req.status === 'Approved' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {req.status}
                  </span>
                </div>

                <div className="flex justify-end gap-2">
                  {req.status === "Pending" ? (
                    <>
                      <button
                        onClick={() => updateStatus(req._id, "Approved")}
                        className="p-3 rounded-xl text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                        title="Approve Return"
                      >
                        <CheckCircle size={18} />
                      </button>
                      <button
                        onClick={() => updateStatus(req._id, "Rejected")}
                        className="p-3 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                        title="Reject Return"
                      >
                        <XCircle size={18} />
                      </button>
                    </>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase italic pr-4">Processed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
