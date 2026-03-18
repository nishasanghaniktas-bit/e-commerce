import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../utils/apiBase";
import { getImageUrl, getPlaceholder } from "../../utils/imageUrl";

function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      const res = await axios.get(`${API_BASE}/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setOrder(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!order) return <div className="p-6">Loading...</div>;

  const statuses = ["pending", "processing", "shipped", "out_for_delivery", "delivered"];
  const currentStatus = (order.orderStatus || order.status)?.toLowerCase();
  const currentIndex = statuses.indexOf(currentStatus);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Order Tracking</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-600">Order ID</p>
              <p className="font-bold">{order.orderId}</p>
            </div>
            <div>
              <p className="text-gray-600">Order Date</p>
              <p className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600">Total</p>
              <p className="font-bold text-blue-600">₹{order.total}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {statuses.map((status, index) => (
              <div key={status} className="flex items-center mb-8">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${index <= currentIndex ? "bg-green-500 text-white" : "bg-gray-300"}`}>
                  {index < currentIndex ? "✓" : index + 1}
                </div>
                <div className="ml-4">
                  <p className={`font-semibold ${index <= currentIndex ? "text-green-600" : "text-gray-400"}`}>
                    {status.replace(/_/g, " ").toUpperCase()}
                  </p>
                  {order.statusHistory?.find(h => h.status === status) && (
                    <p className="text-sm text-gray-600">
                      {new Date(order.statusHistory?.find(h => h.status?.toLowerCase() === status)?.changedAt || order.statusHistory.find(h => h.status?.toLowerCase() === status)?.timestamp || order.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                {index < statuses.length - 1 && (
                  <div className={`absolute left-6 w-0.5 h-8 ${index < currentIndex ? "bg-green-500" : "bg-gray-300"}`} style={{ top: `${(index + 1) * 80}px` }}></div>
                )}
              </div>
            ))}
          </div>

          {order.trackingId && (
            <div className="mt-6 p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Tracking ID</p>
              <p className="font-bold">{order.trackingId}</p>
              {order.courier && <p className="text-sm text-gray-600">Courier: {order.courier}</p>}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 border-b pb-4">
                <img
                  src={getImageUrl(item.image) || getPlaceholder("No Image")}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded"
                  onError={(e) => (e.target.src = getPlaceholder("No Image"))}
                />
                <div className="flex-1">
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-gray-600">Quantity: {item.quantity}</p>
                  <p className="font-bold text-blue-600">₹{item.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default OrderTracking; 