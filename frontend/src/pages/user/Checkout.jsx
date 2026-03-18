import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CreditCard, Truck, MapPin, ShieldCheck, ChevronRight, Zap, Banknote } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { API_BASE } from "../../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../../utils/imageUrl";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useCart();
  const [address, setAddress] = useState({ name: "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const subtotal = cartTotal;
  const shippingCharge = subtotal > 50000 ? 0 : 500;
  const tax = subtotal * 0.18;
  const total = subtotal + tax + shippingCharge;

  const placeOrder = async () => {
    if (!address.name || !address.phone || !address.address) {
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Please fill in shipping details", type: "error" } }));
      return;
    }

    setLoading(true);
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      
      // Step 1: Create Order on backend with status Pending
      const orderData = { 
        items: cart.map(item => ({ 
          product: item._id, 
          productId: item._id,
          name: item.name, 
          price: item.price, 
          quantity: item.quantity, 
          image: item.image 
        })),
        subtotal,
        tax,
        shippingCharge,
        total,
        shippingAddress: address,
        paymentMethod: paymentMethod === "online" ? "Online" : "COD",
        paymentStatus: "Pending"
      };

      const { data: { order } } = await axios.post(`${API_BASE}/api/orders/create`, orderData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });

      if (paymentMethod === "cod") {
        clearCart();
        window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Order placed successfully!", type: "success" } }));
        navigate("/user/orders");
      } else {
        // Step 2: Online Payment Integration (Razorpay)
        const { data: rzpData } = await axios.post(`${API_BASE}/api/payment/create-order`, { orderId: order._id }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const options = {
          key: rzpData.key,
          amount: rzpData.amount,
          currency: rzpData.currency,
          name: "MobileSale",
          description: "Payment for Order #" + order.orderId,
          order_id: rzpData.orderId,
          handler: async (response) => {
            try {
              const verifyData = {
                orderId: order._id,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              };

              await axios.post(`${API_BASE}/api/payment/verify`, verifyData, {
                headers: { Authorization: `Bearer ${token}` }
              });

              clearCart();
              window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Payment Successful! Order Confirmed.", type: "success" } }));
              navigate("/user/orders");
            } catch (err) {
              window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Payment verification failed", type: "error" } }));
            }
          },
          prefill: {
            name: address.name,
            contact: address.phone
          },
          theme: { color: "#4f46e5" },
          modal: {
            onhighlight: function() { console.log('Payment modal highlighted'); },
            ondismiss: function() { 
              setLoading(false);
              window.dispatchEvent(new CustomEvent("toast", { detail: { message: "Payment cancelled", type: "error" } }));
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Error placing order";
      window.dispatchEvent(new CustomEvent("toast", { detail: { message: msg, type: "error" } }));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center space-x-4 mb-12 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 font-bold">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
            <span className="text-sm">Cart</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center space-x-2 text-indigo-600 font-bold">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
            <span className="text-sm">Payment</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center space-x-2 text-slate-400 font-bold">
            <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs">3</span>
            <span className="text-sm">Complete</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Address */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Truck className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Delivery Address</h2>
                  <p className="text-slate-500 text-sm">Enter your accurate shipping information</p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input type="text" placeholder="John Doe" value={address.name} onChange={(e) => setAddress({...address, name: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-semibold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                  <input type="text" placeholder="+91 00000 00000" value={address.phone} onChange={(e) => setAddress({...address, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-semibold" />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Street Address</label>
                  <input type="text" placeholder="House No, Apartment, Landmark" value={address.address} onChange={(e) => setAddress({...address, address: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-semibold" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">City</label>
                  <input type="text" placeholder="Mumbai" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-semibold" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">State</label>
                    <input type="text" placeholder="Maharashtra" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-semibold" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Pincode</label>
                    <input type="text" placeholder="400001" value={address.pincode} onChange={(e) => setAddress({...address, pincode: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 outline-none transition-all text-sm font-semibold" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-4 mb-2">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Payment Selection</h2>
                  <p className="text-slate-500 text-sm">Choose how you would like to pay</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { id: "cod", icon: Banknote, label: "Cash on Delivery", desc: "Pay only when you receive" },
                  { id: "online", icon: Zap, label: "Online Payment", desc: "Cards, UPI, NetBanking" }
                ].map((method) => (
                  <label 
                    key={method.id}
                    className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id 
                        ? 'border-indigo-600 bg-indigo-50/50' 
                        : 'border-slate-100 bg-slate-50 hover:border-indigo-200'
                    }`}
                  >
                    <input 
                      type="radio" 
                      className="absolute opacity-0" 
                      name="payment" 
                      value={method.id} 
                      checked={paymentMethod === method.id} 
                      onChange={(e) => setPaymentMethod(e.target.value)} 
                    />
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === method.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 border border-slate-200'}`}>
                        <method.icon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{method.label}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{method.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <aside className="space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 sticky top-28">
              <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
              
              <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item._id} className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 p-1 shrink-0 flex items-center justify-center">
                      <img
                        src={getImageUrl(item.image) || getPlaceholder("No Image")}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => (e.target.src = getPlaceholder("No Image"))}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Tax (18%)</span>
                  <span className="text-slate-900">₹{tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className={shippingCharge === 0 ? "text-emerald-500" : "text-slate-900"}>
                    {shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}
                  </span>
                </div>
                <div className="flex justify-between pt-4 border-t border-slate-50">
                  <span className="text-lg font-bold text-slate-900">Payable Amount</span>
                  <span className="text-2xl font-black text-indigo-600">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <button 
                onClick={placeOrder}
                disabled={loading}
                className={`w-full bg-slate-900 text-white font-bold uppercase tracking-wider text-xs py-5 rounded-xl hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center space-x-3 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Place Order Now</span>
                )}
              </button>

              <div className="flex items-center justify-center space-x-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>SSL Secured Checkout</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
