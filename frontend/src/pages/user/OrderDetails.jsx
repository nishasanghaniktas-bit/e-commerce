import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Eye, 
  Package, 
  ArrowLeft, 
  ChevronRight, 
  Hash, 
  Calendar, 
  ShieldCheck, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  CreditCard, 
  Activity,
  Zap,
  RotateCcw,
  AlertCircle,
  Layers,
  Upload,
  Trash2
} from "lucide-react";
import { API_BASE } from "../../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../../utils/imageUrl";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  const [order, setOrder] = useState(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnDescription, setReturnDescription] = useState("");
  const [returnImages, setReturnImages] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnRequests, setReturnRequests] = useState([]);
  const { addToCart } = useCart();
  const { showToast } = useToast();

  const fetchOrder = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        const msg = (await res.json())?.message || "Failed to load order";
        showToast(msg, "error");
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch (err) {
      console.log(err);
      showToast("Unable to load order details", "error");
    }
  };

  useEffect(() => {
    fetchOrder();
    fetchReturns();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchReturns = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/returns/order/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReturnRequests(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const cancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await fetch(`${API_BASE}/api/orders/cancel/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Order cancelled", "success");
      navigate("/user/orders");
    } catch (err) {
      console.log(err);
      showToast("Unable to cancel order", "error");
    }
  };

  const reorder = async () => {
    try {
      order.items.forEach(item => {
        addToCart({
          _id: item.product,
          name: item.name,
          price: item.price,
          image: item.image,
          stock: item.stock
        }, item.quantity || 1);
      });
      showToast("Items added back to cart", "success");
      navigate("/user/cart");
    } catch (err) {
      console.log(err);
      showToast("Unable to add items to cart", "error");
    }
  };

  const deleteOrder = async () => {
    if (!window.confirm("Are you sure you want to remove this order from your history?")) return;
    try {
      await fetch(`${API_BASE}/api/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast("Order removed", "success");
      navigate("/user/orders");
    } catch (err) {
      console.log(err);
      showToast("Unable to delete order", "error");
    }
  };

  const requestReturn = async () => {
    if (!returnReason.trim() || !selectedItem) {
      showToast("Please select an item and enter a reason", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/returns/request`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: order._id,
          productId: selectedItem.product || selectedItem._id,
          reason: returnReason,
          message: returnDescription,
          image: returnImages[0] // User requested single 'image' field (String)
        })
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      showToast("Return requested", "success");
      setShowReturnForm(false);
      setReturnReason("");
      setReturnDescription("");
      setReturnImages([]);
      setSelectedItem(null);
      fetchOrder();
      fetchReturns();
    } catch (err) {
      console.log(err);
      showToast("Unable to request return", "error");
    }
  };

  const isEligible = () => {
    const status = (order?.orderStatus || order?.status || "").toLowerCase();
    if (!order?.deliveredAt) return false;
    const days = (Date.now() - new Date(order.deliveredAt)) / (1000 * 60 * 60 * 24);
    return days <= 7 && status === "delivered";
  };

  const existingStatus = (productId) =>
    returnRequests.find((r) => r.product?._id === productId);

  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setReturnImages((prev) => [...prev.slice(0, 3), reader.result]);
    };
    reader.readAsDataURL(file);
  };

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-slate-50">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading order details...</p>
      </div>
    );
  }

  const steps = ["Processing", "Shipped", "Delivered"];
  const currentStep = steps.findIndex(s => s.toLowerCase() === (order.orderStatus || order.status)?.toLowerCase());

  const statusColors = {
    pending: "text-amber-500 bg-amber-50 border-amber-100",
    processing: "text-blue-500 bg-blue-50 border-blue-100",
    shipped: "text-indigo-500 bg-indigo-50 border-indigo-100",
    out_for_delivery: "text-blue-500 bg-blue-50 border-blue-100",
    delivered: "text-emerald-500 bg-emerald-50 border-emerald-100",
    cancelled: "text-rose-500 bg-rose-50 border-rose-100",
    returned: "text-purple-500 bg-purple-50 border-purple-100",
  };

  const pricing = order.pricing || {};
  const subtotal = pricing.subtotal ?? order.subtotal ?? 0;
  const tax = pricing.tax ?? 0;
  const shipping = pricing.shipping ?? order.shippingCharge ?? 0;
  const discount = pricing.discount ?? order.discount ?? 0;
  const total = (pricing.total || order.total) ? (pricing.total || order.total) : (order.items?.reduce((acc, it) => acc + (it.price * it.quantity), 0) + tax + shipping - discount);

  return (
    <div className="min-h-screen bg-slate-50 pb-32 pt-10">
      <div className="container mx-auto px-6 max-w-6xl">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 text-sm font-medium text-slate-400 mb-8">
          <Link to="/" className="hover:text-indigo-600 transition">Home</Link>
          <ChevronRight size={14} />
          <Link to="/user/orders" className="hover:text-indigo-600 transition">Orders</Link>
          <ChevronRight size={14} />
          <span className="text-slate-900">Order #{order.orderId || order._id?.slice(-8).toUpperCase()}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-12 items-start">
          {/* Left Column: Summary & Items */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 mb-1">
                    <Package size={18} /> Order Details
                  </div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Order #{order.orderId || order._id?.slice(-8).toUpperCase()}
                  </h1>
                </div>
                <div className={`px-4 py-1.5 rounded-full border text-xs font-bold flex items-center gap-2 ${statusColors[(order.orderStatus || order.status)?.toLowerCase()] || "text-slate-500 bg-slate-50 border-slate-200"}`}>
                  <div className={`w-2 h-2 rounded-full ${statusColors[(order.orderStatus || order.status)?.toLowerCase()]?.split(' ')[2]?.replace('border-', 'bg-') || "bg-slate-400"}`} />
                  { (order.orderStatus || order.status)?.replace(/_/g, " ").charAt(0).toUpperCase() + (order.orderStatus || order.status)?.replace(/_/g, " ").slice(1) }
                </div>
              </div>

              {/* Tracking visual */}
              <div className="mb-12 px-4">
                <div className="flex justify-between items-center relative">
                  {/* Progress Line Background */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-100 -z-0" />
                  {/* Active Progress Line */}
                  <div 
                    className="absolute top-5 left-0 h-0.5 bg-indigo-600 transition-all duration-1000 -z-0" 
                    style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                  />
                  
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center relative z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-700 ${idx <= currentStep ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-300'}`}>
                        {idx === 0 && <Clock size={16} />}
                        {idx === 1 && <Package size={16} />}
                        {idx === 2 && <Truck size={16} />}
                        {idx === 3 && <CheckCircle size={16} />}
                      </div>
                      <span className={`mt-3 text-xs font-semibold capitalize ${idx <= currentStep ? 'text-slate-900' : 'text-slate-400'}`}>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers size={20} className="text-indigo-500" /> Order Items
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <tbody className="divide-y divide-slate-100">
                      {order.items.map((item, idx) => {
                        const returnStatus = existingStatus(item.product);
                        return (
                        <tr key={idx} className="group hover:bg-white transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-white rounded-lg border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                                <img
                                  src={getImageUrl(item.image) || getPlaceholder("No Image")}
                                  alt={item.name}
                                  className="max-w-full max-h-full object-contain"
                                  onError={(e) => (e.target.src = getPlaceholder("No Image"))}
                                />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                <p className="text-xs font-medium text-slate-500">Price: ₹{item.price.toLocaleString()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-xs font-bold text-slate-400 block mb-1">Quantity</span>
                            <span className="text-sm font-bold text-slate-900">{item.quantity}</span>
                          </td>
                          <td className="p-4 text-right">
                            <span className="text-xs font-bold text-slate-400 block mb-1">Subtotal</span>
                            <span className="text-sm font-bold text-indigo-600">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </td>
                          <td className="p-4 text-right min-w-[150px]">
                            {returnStatus ? (
                              <span className={`px-2.5 py-1 rounded-md text-xs font-bold border inline-block ${
                                returnStatus.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                returnStatus.status === 'rejected' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                returnStatus.status === 'refunded' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {returnStatus.status}
                              </span>
                            ) : isEligible() ? (
                              <button
                                onClick={() => {
                                  setSelectedItem(item);
                                  setShowReturnForm(true);
                                }}
                                className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-all border border-indigo-100"
                              >
                                Return Item
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Return Form Section */}
            {showReturnForm && (
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm animate-in slide-in-from-bottom duration-500">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-slate-900">Request Return</h3>
                    <button onClick={() => setShowReturnForm(false)} className="text-slate-400 hover:text-slate-600 transition"><XCircle /></button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Reason for Return</label>
                    <input
                      type="text"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      placeholder="e.g. Defective, Wrong Item, Changed Mind..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Additional Comments (Optional)</label>
                    <textarea
                      value={returnDescription}
                      onChange={(e) => setReturnDescription(e.target.value)}
                      placeholder="Please provide more details about the issue..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 text-sm font-medium resize-none"
                      rows="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1 flex items-center gap-2">
                      <Upload size={16} /> Photos (Optional, Max 3)
                    </label>
                    <div className="flex gap-4 items-center">
                      {returnImages.map((img, i) => (
                        <div key={i} className="w-16 h-16 rounded-lg border border-slate-200 overflow-hidden">
                          <img src={img} alt="Return" className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {returnImages.length < 3 && (
                        <label className="w-16 h-16 rounded-lg border-2 border-dashed border-slate-200 hover:border-indigo-400 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors">
                          <input type="file" multiple accept="image/*" onChange={handleFile} className="hidden" />
                          <Upload size={20} className="text-slate-400" />
                        </label>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={requestReturn}
                      className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Submit Request
                    </button>
                    <button
                      onClick={() => setShowReturnForm(false)}
                      className="px-8 py-3 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Logistics & Actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin size={20} className="text-indigo-500" /> Shipping Address
                </h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm font-semibold text-slate-900 leading-relaxed">
                    {order.shippingAddress?.name}<br />
                    {order.shippingAddress?.address}<br />
                    <span className="text-indigo-600">Phone: {order.shippingAddress?.phone}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard size={20} className="text-indigo-500" /> Payment Summary
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Subtotal</span>
                    <span className="text-slate-900">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Tax</span>
                    <span className="text-slate-900">₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-slate-500">
                    <span>Shipping</span>
                    <span className="text-slate-900">₹{shipping.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm font-bold text-emerald-600">
                      <span>Discount</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900">Total Amount</span>
                    <span className="text-2xl font-bold text-indigo-600">₹{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 space-y-3">
                <button
                  onClick={reorder}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <RotateCcw size={18} /> Reorder All Items
                </button>
                
                {!["delivered", "cancelled", "returned", "shipped"].includes(order.status?.toLowerCase()) && (
                  <button
                    onClick={cancelOrder}
                    className="w-full flex items-center justify-center gap-2 bg-white text-rose-600 py-3.5 rounded-lg font-semibold border border-slate-200 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                  >
                    <XCircle size={18} /> Cancel Order
                  </button>
                )}

                {["cancelled", "delivered", "returned"].includes(order.status?.toLowerCase()) && (
                  <button
                    onClick={deleteOrder}
                    className="w-full flex items-center justify-center gap-2 bg-rose-50 text-rose-600 py-3.5 rounded-lg font-semibold border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm group/del"
                  >
                    <Trash2 size={18} className="group-hover/del:scale-110 transition-transform" /> Delete Order History
                  </button>
                )}
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="text-indigo-600" />
                <h4 className="font-bold text-slate-900">Need Help?</h4>
              </div>
              <p className="text-sm text-slate-600 mb-4">If you have any issues with your order, please contact our support team.</p>
              <button className="w-full bg-white border border-slate-200 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
