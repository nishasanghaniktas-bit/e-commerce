import { CheckCircle, Clock, Truck, MapPin, Package } from "lucide-react";

export default function OrderTracking({ order }) {
  const statuses = ["Pending", "Processing", "Shipped", "Out for Delivery", "Delivered"];
  const currentStatus = (order.orderStatus || order.status)?.toLowerCase();
  const currentStatusIndex = statuses.findIndex(s => s.toLowerCase() === currentStatus);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-6 h-6" />;
      case "Processing":
        return <Package className="w-6 h-6" />;
      case "Shipped":
        return <Truck className="w-6 h-6" />;
      case "Out for Delivery":
        return <MapPin className="w-6 h-6" />;
      case "Delivered":
        return <CheckCircle className="w-6 h-6" />;
      default:
        return <Clock className="w-6 h-6" />;
    }
  };

  const getStatusColor = (index) => {
    if (index < currentStatusIndex) return "bg-green-500";
    if (index === currentStatusIndex) return "bg-blue-500";
    return "bg-gray-300";
  };

  const getTextColor = (index) => {
    if (index <= currentStatusIndex) return "text-gray-900";
    return "text-gray-400";
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-6">Order Tracking</h3>

      <div className="space-y-6">
        {statuses.map((status, index) => (
          <div key={status} className="flex items-start gap-4">
            {/* Timeline Circle */}
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full ${getStatusColor(index)} flex items-center justify-center text-white`}>
                {index < currentStatusIndex ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  getStatusIcon(status)
                )}
              </div>

              {/* Timeline Line */}
              {index < statuses.length - 1 && (
                <div className={`w-1 h-12 mt-2 ${index < currentStatusIndex ? "bg-green-500" : "bg-gray-300"}`}></div>
              )}
            </div>

            {/* Status Info */}
            <div className="flex-1 pt-2">
              <p className={`font-bold text-lg ${getTextColor(index)}`}>
                {status}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {index === currentStatusIndex && "Current Status"}
                {index < currentStatusIndex && "Completed"}
                {index > currentStatusIndex && "Pending"}
              </p>

              {/* Status Details */}
              {index === currentStatusIndex && order.statusUpdatedAt && (
                <p className="text-xs text-gray-400 mt-2">
                  Updated: {new Date(order.statusUpdatedAt).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Info */}
      {currentStatus === "shipped" && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="font-bold text-blue-900">Tracking Information</p>
          <p className="text-sm text-blue-700 mt-2">
            Courier: {order.courier || "Not assigned"}
          </p>
          <p className="text-sm text-blue-700">
            Tracking ID: {order.trackingId || "Not available"}
          </p>
        </div>
      )}

      {currentStatus === "delivered" && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="font-bold text-green-900">✓ Order Delivered</p>
          <p className="text-sm text-green-700 mt-2">
            Delivered on: {new Date(order.deliveredAt || order.updatedAt).toLocaleDateString()}
          </p>
        </div>
      )}
    </div>
  );
}
