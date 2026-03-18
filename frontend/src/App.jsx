import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PublicLayout from "./components/PublicLayout";

import Home from "./pages/Home";
import ProductListing from "./pages/ProductListing";
import ProductDetails from "./pages/ProductDetails";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* ================= ADMIN PAGES ================= */
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminReturns from "./pages/admin/AdminReturns";
import AdminNotifications from "./pages/admin/AdminNotifications";

/* ================= USER PAGES ================= */
import UserLayout from "./pages/user/UserLayout";
import UserDashboard from "./pages/user/UserDashboard";
import UserSearch from "./pages/user/UserSearch";
import UserOrders from "./pages/user/UserOrders";
import UserProfile from "./pages/user/UserProfile";
import Cart from "./pages/user/Cart";
import OrderDetails from "./pages/user/OrderDetails";
import Checkout from "./pages/user/Checkout";
import Wishlist from "./pages/user/Wishlist";
import OrderTracking from "./pages/user/OrderTracking";
import ReturnsRefunds from "./pages/user/ReturnsRefunds";
import Notifications from "./pages/user/Notifications";

function App() {
  const { user } = useAuth();

  const ProtectedRoute = ({ children, role }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role?.toLowerCase() !== role.toLowerCase()) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductListing />} />
          <Route path="products/:id" element={<ProductDetails />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset/:token" element={<ResetPassword />} />

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin">
          <Route index element={<AdminLogin />} />
          <Route path="login" element={<AdminLogin />} />
          <Route
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="products/:id" element={<ProductDetails showCartAction={false} />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="returns" element={<AdminReturns />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* ================= USER ROUTES ================= */}
        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
          <Route path="search" element={<UserSearch />} />
          <Route path="orders" element={<UserOrders />} />
          <Route path="orders/:id" element={<OrderDetails />} />
          <Route path="tracking/:id" element={<OrderTracking />} />
          <Route path="profile" element={<UserProfile />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="returns" element={<ReturnsRefunds />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        {/* ================= AUTO REDIRECT ================= */}
        <Route
          path="*"
          element={
            user ? (
              user.role?.toLowerCase() === "admin" ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/user" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
