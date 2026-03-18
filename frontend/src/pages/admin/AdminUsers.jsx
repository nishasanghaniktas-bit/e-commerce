import { useEffect, useState } from "react";
import { 
  CheckCircle, 
  Ban, 
  Search, 
  ShoppingBag, 
  Download, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  ArrowUpRight,
  Shield,
  Activity,
  UserCheck,
  UserMinus,
  LogIn
} from "lucide-react";
import axios from "axios";
import { API_BASE } from "../../utils/apiBase";

function AdminUsers() {
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  const [data, setData] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    loggedIn: 0,
    users: []
  });

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const handleExport = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/users/export`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'customers_export.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Failed to export customers');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData({
        total: res.data.total || 0,
        active: res.data.active || 0,
        inactive: res.data.inactive || 0,
        loggedIn: res.data.loggedIn || 0,
        users: res.data.users || []
      });
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const toggleStatus = async (user) => {
    try {
      setUpdating(user._id);
      const newStatus = user.status === "active" ? "inactive" : "active";
      await axios.put(`${API_BASE}/api/users/status/${user._id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u._id === user._id ? { ...u, status: newStatus } : u),
        active: newStatus === "active" ? prev.active + 1 : prev.active - 1,
        inactive: newStatus === "inactive" ? prev.inactive + 1 : prev.inactive - 1
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user status");
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = data?.users?.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
            <Users className="text-indigo-600 w-9 h-9" /> Customers
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage your registered customers</p>
        </div>
        <button
          onClick={handleExport}
          className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Download size={16} /> Export Data
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={data.total} color="slate" icon={Users} />
        <StatCard label="Active" value={data.active} color="emerald" icon={UserCheck} />
        <StatCard label="Inactive" value={data.inactive} color="rose" icon={UserMinus} />
        <StatCard label="Sessions" value={data.loggedIn} color="amber" icon={LogIn} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-16 pr-8 py-4 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 placeholder:text-slate-400 font-semibold text-sm transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-semibold text-sm">Loading customers...</p>
        </div>
      ) : filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredUsers.map(user => (
            <UserGridCard key={user._id} user={user} onToggle={toggleStatus} updating={updating} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-20 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-xl flex items-center justify-center mx-auto border border-slate-100">
            <Users className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Customers Found</h3>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon: Icon }) {
  const colorMap = {
    slate: "bg-slate-50 text-slate-900 border-slate-200",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
  };

  return (
    <div className={`p-6 rounded-xl border shadow-sm transition-all hover:shadow-md ${colorMap[color]}`}>
      <div className="flex justify-between items-center mb-4">
        <div className="p-2.5 bg-white rounded-lg shadow-sm border border-slate-100">
          <Icon size={18} />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</span>
      </div>
      <h2 className="text-2xl font-black tracking-tight">{value}</h2>
    </div>
  );
}

function UserGridCard({ user, onToggle, updating }) {
  const isUpdating = updating === user._id;
  const initials = user.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all overflow-hidden group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-lg font-bold text-white shadow-md shadow-indigo-100">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 leading-none mt-1">
              {user.name}
              {user.role === "admin" && <Shield size={14} className="text-amber-500" />}
            </h3>
            <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${
              user.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
            }`}>
              <div className={`w-1 h-1 rounded-full ${user.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
              {user.status}
            </div>
          </div>
        </div>
        <button className="w-9 h-9 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-white transition-all">
          <ArrowUpRight size={18} />
        </button>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Mail size={13} />
          </div>
          <span className="truncate">{user.email}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Phone size={13} />
          </div>
          <span>{user.phone || "No phone provided"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
          <div className="w-7 h-7 rounded bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            <Calendar size={13} />
          </div>
          <span>Joined {new Date(user.joined || user.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between mb-6 border border-slate-100 transition-colors">
        <div className="flex items-center gap-2.5">
          <ShoppingBag size={16} className="text-indigo-600" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Purchases</span>
        </div>
        <span className="text-base font-bold text-slate-900">{user.orders || 0}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onToggle(user)}
          disabled={isUpdating}
          className={`flex-1 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${
            user.status === "active"
              ? "bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white"
              : "bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white"
          }`}
        >
          {isUpdating ? "..." : user.status === "active" ? "Deactivate" : "Activate"}
        </button>
        <button className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-indigo-600 transition-all">
          Manage
        </button>
      </div>
    </div>
  );
}

export default AdminUsers;
