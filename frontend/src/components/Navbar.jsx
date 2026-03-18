import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  User, 
  Search, 
  Heart, 
  LogOut, 
  Menu, 
  X, 
  Zap, 
  Layers, 
  LayoutDashboard
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useState } from 'react';
import Dropdown from './Dropdown';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isUser = user && !isAdmin;

  return (
    <nav className="sticky top-0 z-[100] bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-500 shadow-xl shadow-slate-200">
            <Zap className="text-white w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter text-slate-900 leading-none">
              MOBILE<span className="text-indigo-600">SALE</span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 leading-none mt-0.5">
              Premium E-Commerce
            </span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-lg mx-12 relative group">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-6 focus:ring-4 focus:ring-indigo-50 text-sm placeholder:text-slate-400 transition-all font-medium"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-600 transition-colors" />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-10">
          <nav className="flex items-center space-x-8">
            <Link to="/products" className="text-sm font-semibold text-slate-600 hover:text-indigo-600 transition relative group">
              Products
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full" />
            </Link>
          </nav>

          <div className="flex items-center space-x-4 border-l border-slate-100 pl-8">
            <NotificationBell />
            {/* Wishlist — only for logged-in users, NOT admins */}
            {isUser && (
              <Link to="/user/wishlist" className="relative text-slate-400 hover:text-rose-500 transition group p-2">
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border-2 border-white min-w-[18px] text-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>
            )}
            
            {/* Cart — only for users */}
            {(!user || isUser) && (
              <button
                onClick={() => navigate("/user/cart")}
                className="relative text-slate-400 hover:text-indigo-600 transition group p-2"
                aria-label="Cart"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border-2 border-white min-w-[18px] text-center">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {user ? (
              <Dropdown className="relative group" trigger={({ open }) => (
                <button
                  className="flex items-center space-x-3 bg-slate-50 border border-slate-100 rounded-2xl py-1.5 pl-1.5 pr-4 hover:bg-white hover:border-indigo-100 transition-all"
                  aria-label="Account menu"
                  aria-expanded={open}
                >
                  <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-bold uppercase">
                    {user.name?.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-900">
                    {user.name?.split(' ')[0]}
                  </span>
                </button>
              )}>
                {({ open, close }) => (
                  <div className={`absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 transition-all duration-300 transform z-[110] overflow-hidden ${open ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-4'}`}>
                    <div className="p-4 bg-slate-50 border-b border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-2 space-y-1">
                      <Link to={isAdmin ? "/admin/dashboard" : "/user"} className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all" onClick={close}>
                        <LayoutDashboard className="w-4 h-4" />
                        <span>{isAdmin ? "Admin Dashboard" : "My Dashboard"}</span>
                      </Link>
                      {isUser && (
                        <Link to="/user/orders" className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all" onClick={close}>
                          <Layers className="w-4 h-4" />
                          <span>My Orders</span>
                        </Link>
                      )}
                      <hr className="my-2 border-slate-100" />
                      <button
                        onClick={() => {
                          logout();
                          close();
                          navigate('/');
                        }}
                        className="flex w-full items-center space-x-3 px-4 py-3 text-sm font-medium text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </Dropdown>
            ) : (
              <Link to="/login" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-100/20">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden p-3 bg-slate-50 rounded-xl text-slate-900 border border-slate-100 shadow-sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden mt-6 space-y-3 pb-6 animate-in slide-in-from-top duration-500">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-slate-100 border-none rounded-xl py-3 pl-12 pr-6 focus:ring-4 focus:ring-indigo-50 text-sm placeholder:text-slate-400"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          </div>
          <Link 
            to="/products" 
            onClick={() => setIsMenuOpen(false)}
            className="block px-6 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
          >
            Products
          </Link>
          {(!user || isUser) && (
            <button 
              onClick={() => { setIsMenuOpen(false); navigate("/user/cart"); }} 
              className="flex items-center justify-between w-full px-6 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
            >
              Cart <span className="bg-indigo-600 text-white text-xs px-2.5 py-0.5 rounded-full">{cartCount}</span>
            </button>
          )}
          {isUser && (
            <Link 
              to="/user/wishlist" 
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between w-full px-6 py-3 bg-white border border-slate-100 rounded-xl text-sm font-bold text-slate-900 hover:bg-slate-50 transition"
            >
              Wishlist <span className="bg-rose-500 text-white text-xs px-2.5 py-0.5 rounded-full">{wishlistCount}</span>
            </Link>
          )}
          {user ? (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <Link 
                to={isAdmin ? "/admin/dashboard" : "/user"} 
                onClick={() => setIsMenuOpen(false)}
                className="block px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold text-center"
              >
                {isAdmin ? "Admin Dashboard" : "My Dashboard"}
              </Link>
              <button 
                onClick={() => { logout(); setIsMenuOpen(false); navigate('/'); }} 
                className="w-full px-6 py-3 bg-rose-50 text-rose-500 rounded-xl text-sm font-bold"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setIsMenuOpen(false)}
              className="block px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold text-center shadow-lg"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
