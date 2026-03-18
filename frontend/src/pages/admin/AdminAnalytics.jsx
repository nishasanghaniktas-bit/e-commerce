import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE } from "../../utils/apiBase";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Calendar, 
  Download,
  Filter,
  ArrowUpRight,
  Target,
  Zap
} from "lucide-react";

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [salesReport, setSalesReport] = useState([]);
  const [bestSelling, setBestSelling] = useState([]);
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchBestSelling();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      const res = await axios.get(`${API_BASE}/api/analytics/dashboard`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesReport = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      const res = await axios.get(`${API_BASE}/api/analytics/sales`, { 
        params: dateRange,
        headers: { Authorization: `Bearer ${token}` } 
      });
      setSalesReport(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBestSelling = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      const res = await axios.get(`${API_BASE}/api/analytics/best-selling`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setBestSelling(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading || !stats) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Loading data...</p>
    </div>
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-4">
            <BarChart3 className="text-indigo-600 w-9 h-9" /> Analytics
          </h1>
          <p className="text-slate-500 font-medium mt-1">Detailed store performance insights</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-white px-5 py-2.5 rounded-lg border border-slate-200 text-xs font-bold shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`₹${stats.totalSales?.toLocaleString()}`} trend="+12.5% increase" color="indigo" icon={TrendingUp} />
        <StatCard label="Today's Orders" value={stats.todayOrders} trend="+4 from yesterday" color="emerald" icon={ShoppingBag} />
        <StatCard label="New Customers" value={stats.totalUsers} trend="+81 this month" color="blue" icon={Users} />
        <StatCard label="Low Stock" value={stats.lowStock} trend="Restock needed" color="rose" icon={AlertTriangle} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Revenue Overview</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monthly Analytics</p>
            </div>
            <div className="flex gap-1.5 border border-slate-100 p-1 rounded-xl bg-slate-50">
              <button className="px-4 py-1.5 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-white transition-all">Orders</button>
              <button className="px-4 py-1.5 bg-white text-indigo-600 shadow-sm border border-slate-100 rounded-lg text-[10px] font-bold uppercase tracking-wider">Revenue</button>
            </div>
          </div>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={stats.salesByMonth}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
                <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Sellers */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="mb-10">
            <h2 className="text-xl font-bold text-slate-900">Top Products</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Based on recent sales</p>
          </div>
          <div className="space-y-6">
            {bestSelling.map((item, i) => (
              <div key={i} className="flex items-center justify-between group p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold group-hover:bg-indigo-600 group-hover:text-white transition-all text-xs">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.product?.name || "Premium Item"}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.totalSold} Units Sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-indigo-600 tracking-tight">₹{item.revenue?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-10 py-3.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
            Full Performance Analysis
          </button>
        </div>
      </div>

      {/* Custom Report Section */}
      <div className="bg-slate-900 rounded-3xl p-10 text-white overflow-hidden relative group">
        <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
              <Target className="text-indigo-400" size={28} />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Report Generation</h2>
            <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-sm">Select a date range to generate and download customized sales performance reports.</p>
          </div>
          
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Starting From</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Ending At</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                  <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} className="w-full bg-slate-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 transition-all" />
                </div>
              </div>
            </div>
            <button onClick={fetchSalesReport} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]">
              Generate Custom Report
            </button>
          </div>
        </div>
        <Zap className="absolute -right-20 -top-20 w-80 h-80 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
      </div>
    </div>
  );
}

function StatCard({ label, value, trend, color, icon: Icon }) {
  const colorMap = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-sm transition-all hover:shadow-md ${colorMap[color]}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100/50">
          <Icon size={20} strokeWidth={2} />
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-60 block leading-none mb-1">{label}</span>
          <span className="text-[10px] font-bold text-slate-400 leading-none">{trend}</span>
        </div>
      </div>
      <h2 className="text-2xl font-black tracking-tight">{value}</h2>
    </div>
  );
}
