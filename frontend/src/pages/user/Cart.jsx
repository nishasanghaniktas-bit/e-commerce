import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useEffect, useState } from "react";
import axios from "axios";
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  Ticket, 
  Truck, 
  PackageCheck,
  ArrowRight
} from "lucide-react";
import { API_BASE } from "../../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../../utils/imageUrl";

function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const tax = Math.round(cartTotal * 0.18);
  const shipping = cartTotal > 500 ? 0 : 50;
  const finalTotal = cartTotal + tax + shipping - discount;

  const fetchAvailableCoupons = async () => {
    if (!currentUser) return;
    try {
      const res = await axios.get(`${API_BASE}/api/coupons?amount=${cartTotal}`, {
        headers: { Authorization: `Bearer ${currentUser.token}` },
      });
      setAvailableCoupons(res.data?.coupons || []);
      setShowCoupons(true);
    } catch (err) {
      setAvailableCoupons([]);
      setShowCoupons(true);
    }
  };

  const applyCoupon = async (code) => {
    if (!code) return;
    if (!currentUser) return navigate("/login");
    if (appliedCoupon?.code === code.toUpperCase()) {
      setCouponMessage("Coupon already applied");
      return;
    }
    try {
      setCouponLoading(true);
      const res = await axios.post(
        `${API_BASE}/api/coupons/validate`,
        { code, amount: cartTotal },
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );
      const disc = res.data.discount || 0;
      setCouponCode(code.toUpperCase());
      setDiscount(disc);
      setAppliedCoupon({ code: code.toUpperCase(), ...res.data });
      setCouponMessage("Coupon Applied Successfully");
      window.dispatchEvent(
        new CustomEvent("toast", { detail: { message: "Coupon Applied Successfully", type: "success" } })
      );
      setShowCoupons(false);
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid coupon code";
      setCouponMessage(msg);
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: msg, type: "error" } }));
      setDiscount(0);
      setAppliedCoupon(null);
    }
    finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setDiscount(0);
    setCouponMessage("Coupon removed");
  };

  useEffect(() => {
    // if cart total drops below min purchase, remove coupon automatically
    if (appliedCoupon && appliedCoupon.minPurchase && cartTotal < appliedCoupon.minPurchase) {
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponMessage("Minimum purchase not met; coupon removed");
    }
  }, [cartTotal, appliedCoupon]);

  const handleCheckout = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal: cartTotal,
        discount,
        tax,
        shippingCharge: shipping,
        total: finalTotal,
        // only send coupon that has been validated/applied
        couponCode: appliedCoupon?.code || undefined,
        paymentMethod: "cod",
        shippingAddress: {
          name: currentUser.name,
          phone: currentUser.phone,
          address: currentUser.address
        }
      };

      await axios.post(
        `${API_BASE}/api/orders`,
        orderData,
        { headers: { Authorization: `Bearer ${currentUser.token}` } }
      );

      clearCart();
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Order placed", type: "success" } }));
      navigate("/user/orders");
    } catch (error) {
      console.error("Order error", error.response?.data || error.message);
      const msg = error.response?.data?.message || "Order failed";
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: msg, type: "error" } }));
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 mt-12">
        <div className="text-center space-y-10 max-w-md">
          <div className="w-32 h-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center justify-center mx-auto relative group">
            <div className="absolute inset-0 bg-indigo-600 rounded-[2.5rem] scale-90 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity" />
            <ShoppingBag className="w-16 h-16 text-slate-300 relative z-10" />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Your cart is empty</h2>
            <p className="text-slate-500 font-medium">Browse our products and add them to your cart to continue.</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl font-bold uppercase tracking-wider text-xs hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Shopping Cart</h1>
            <p className="text-slate-500 font-semibold text-xs mt-1">Review your items before checkout</p>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">
            {cart.length} {cart.length === 1 ? 'ITEM' : 'ITEMS'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row gap-8 border border-slate-100 group relative"
              >
                {/* Image */}
                <div className="w-full md:w-32 h-32 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                  <img
                    src={getImageUrl(item.image) || getPlaceholder("No Image")}
                    alt={item.name}
                    className="max-h-[90%] max-w-[90%] object-contain"
                    onError={(e) => (e.target.src = getPlaceholder("No Image"))}
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-center py-1">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      {item.category || "General"}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-2">{item.name}</h3>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-slate-400 font-semibold text-[10px] uppercase tracking-wider">
                    <ShieldCheck size={12} /> Genuine Local stock
                  </div>
                </div>

                {/* Quantity & Price */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-6 min-w-[140px]">
                  <div className="flex items-center gap-3 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => item.quantity > 1 && updateQuantity(item._id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-500 hover:text-indigo-600 shadow-none border border-transparent hover:border-slate-200"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-6 text-center font-bold text-slate-900 tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-slate-500 hover:text-indigo-600 shadow-none border border-transparent hover:border-slate-200"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xl font-bold text-slate-900 tracking-tight">₹{(item.price * item.quantity).toLocaleString()}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">₹{item.price.toLocaleString()} / unit</p>
                  </div>

                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Logic */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200 sticky top-32 overflow-hidden group">
              <Zap className="absolute -right-20 -top-20 w-80 h-80 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
              
              <div className="relative z-10 space-y-8">
                <h2 className="text-xl font-bold tracking-tight flex items-center gap-3">
                  <ShoppingBag className="text-indigo-400" size={20} /> Order Summary
                </h2>

                {/* Coupon */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Promo Code</label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onFocus={fetchAvailableCoupons}
                        onClick={fetchAvailableCoupons}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE OR PICK BELOW"
                        className="flex-1 bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-500"
                      />
                      <button
                        onClick={() => applyCoupon(couponCode)}
                        disabled={couponLoading}
                        className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                      {appliedCoupon && (
                        <button
                          onClick={removeCoupon}
                          className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/20 transition-all"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {couponMessage && (
                      <p className={`text-xs font-semibold ${couponMessage.toLowerCase().includes("success") ? "text-emerald-300" : "text-amber-200"}`}>
                        {couponMessage}
                      </p>
                    )}
                    <button
                      onClick={fetchAvailableCoupons}
                      className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-indigo-200 hover:text-white transition self-start"
                    >
                      <Ticket size={14} /> View available coupons
                    </button>
                    {showCoupons && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-2 max-h-48 overflow-y-auto">
                        {availableCoupons.length === 0 && (
                          <p className="text-xs text-slate-200">No coupons available for this cart.</p>
                        )}
                        {availableCoupons.map((c) => (
                          <div key={c._id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-sm font-bold text-white">{c.code}</p>
                              <p className="text-[11px] text-slate-200">
                                {c.discountType === "percentage"
                                  ? `${c.discount}% off${c.maxDiscount ? ` (max ₹${c.maxDiscount})` : ""}`
                                  : `Flat ₹${c.discount} off`}
                                {c.minPurchase ? ` • Min ₹${c.minPurchase}` : ""}
                                {c.usageLimit ? ` • Uses left: ${c.usageLeft ?? "-"}` : ""}
                              </p>
                            </div>
                            <button
                              onClick={() => applyCoupon(c.code)}
                              className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                            >
                              Apply
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Charges */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Subtotal</span>
                    <span className="text-white">₹{cartTotal.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      <span>Discount Applied</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>GST (18%)</span>
                    <span className="text-white">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-2">Shipping</span>
                    <span className={shipping === 0 ? "text-emerald-400" : "text-white"}>
                      {shipping === 0 ? "FREE" : `₹${shipping}`}
                    </span>
                  </div>
                </div>

                {/* Final Total */}
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Order Total</span>
                    <span className="text-3xl font-bold tracking-tight text-white">₹{finalTotal.toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-4 pt-2">
                  <button
                    onClick={handleCheckout}
                    disabled={loading || cart.length === 0}
                    className="w-full bg-indigo-600 text-white font-bold uppercase tracking-wider text-xs py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    <span>{loading ? "Processing..." : "Proceed to Checkout"}</span>
                    {!loading && <ArrowRight size={16} />}
                  </button>
                  
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <ShieldCheck size={12} /> Secure Checkout
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
