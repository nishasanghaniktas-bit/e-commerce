import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  Search,
  Package,
  User,
  LogOut,
  ShoppingCart,
  Heart,
  ChevronRight,
  Store,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import NotificationBell from "../../components/NotificationBell";

const sidebarLinks = [
  { path: "/user", name: "Dashboard", icon: Home, end: true },
  { path: "search", name: "Products", icon: Search },
  { path: "cart", name: "Cart", icon: ShoppingCart, showBadge: "cart" },
  { path: "wishlist", name: "Saved Items", icon: Heart, showBadge: "wishlist" },
  { path: "orders", name: "Orders", icon: Package },
  { path: "returns", name: "Returns & Refunds", icon: RotateCcw },
  { path: "profile", name: "My Account", icon: User },
];

function UserLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getBadgeCount = (type) => {
    if (type === "cart") return cartCount;
    if (type === "wishlist") return wishlistCount;
    return 0;
  };

  return (
    <>
      <div className="min-h-screen bg-[#f8fafc] flex font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Sidebar */}
      <aside className="w-72 h-screen sticky top-0 bg-white border-r border-slate-200/60 flex flex-col z-50">
        <div className="p-6 pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">My Menu</p>
        </div>

        {/* User Profile Summary */}
        <div className="px-6 mb-6">
          <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-4 flex items-center gap-3 border border-indigo-100/50">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
              {user?.name?.charAt(0) || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] font-medium text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
            Navigation
          </p>
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) => `
                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group
                ${
                  isActive
                    ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center space-x-3">
                    <link.icon
                      className={`w-[18px] h-[18px] transition-colors ${
                        isActive
                          ? "text-indigo-400"
                          : "group-hover:text-indigo-600"
                      }`}
                    />
                    <span className="text-sm font-semibold">
                      {link.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {link.showBadge && getBadgeCount(link.showBadge) > 0 && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center ${
                          isActive
                            ? "bg-indigo-500 text-white"
                            : "bg-indigo-100 text-indigo-600"
                        }`}
                      >
                        {getBadgeCount(link.showBadge)}
                      </span>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                        isActive ? "text-indigo-400" : ""
                      }`}
                    />
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-6 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all text-sm font-semibold"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-10 shrink-0 z-40">
          <div className="flex items-center gap-3">
            <Store className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-bold text-slate-900">
              Welcome back, {user?.name?.split(" ")[0] || "User"}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationBell />
            <button
              onClick={() => navigate("cart")}
              className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-slate-400" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => navigate("wishlist")}
              className="relative p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Heart className="w-5 h-5 text-slate-400" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {wishlistCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-10 scroll-smooth">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

export default UserLayout;
