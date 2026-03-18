import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Smartphone, 
  Layers, 
  ShoppingBag, 
  Users, 
  TicketPercent, 
  BarChart3, 
  Settings, 
  LogOut,
  Search,
  ChevronRight,
  RotateCcw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from '../../components/NotificationBell';

const sidebarLinks = [
  { path: "dashboard", name: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "products", name: "Products", icon: Smartphone },
  { path: "categories", name: "Categories", icon: Layers },
  { path: "orders", name: "Orders", icon: ShoppingBag },
  { path: "returns", name: "Returns", icon: RotateCcw },
  { path: "users", name: "Customers", icon: Users },
  { path: "coupons", name: "Promos", icon: TicketPercent },
  { path: "analytics", name: "Sales Dashboard", icon: BarChart3 },
  { path: "settings", name: "Settings", icon: Settings },
];

function AdminLayout() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  // Role Protection
  if (!currentUser || currentUser.role !== "admin") {
    navigate("/admin/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className="w-80 h-screen sticky top-0 bg-white border-r border-slate-200/60 flex flex-col z-50">
        <div className="p-6 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Admin Menu</p>
        </div>

        {/* User Profile Summary */}
        <div className="px-8 mb-6">
          <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3 border border-slate-200/60">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              {currentUser?.name?.charAt(0) || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{currentUser?.name || "Administrator"}</p>
              <p className="text-xs font-medium text-slate-500">System Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto scrollbar-hide">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Main Menu</p>
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
                ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <link.icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-indigo-600"}`} />
                    <span className="text-sm font-semibold">
                      {link.name}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-all ${isActive ? "text-white/70" : "opacity-0 group-hover:opacity-100 group-hover:translate-x-1 text-slate-400"}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 space-y-2 border-t border-slate-100">
          <button
            onClick={() => navigate("settings")}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all font-semibold text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-all font-semibold text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Operational Bar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center bg-slate-50 rounded-lg px-4 py-2.5 w-[400px] border border-slate-200 group focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all">
            <Search className="w-5 h-5 text-slate-400 mr-2 group-focus-within:text-indigo-600 transition-colors" />
            <input
              type="text"
              placeholder="Search administration..."
              className="bg-transparent outline-none text-sm font-medium text-slate-900 w-full placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center space-x-6">
            <NotificationBell />

            <div className="h-8 w-px bg-slate-200"></div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                {currentUser?.name?.charAt(0) || "A"}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold text-slate-900">{currentUser?.name || "Admin"}</p>
                <p className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Active session
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* dynamic Viewport */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-12 scroll-smooth scrollbar-hide">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

export default AdminLayout;
