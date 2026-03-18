import { Download, Printer } from "lucide-react";

export default function Invoice({ order, user }) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("invoice-content");
    const opt = {
      margin: 10,
      filename: `invoice-${order._id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" }
    };
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Printer size={18} />
          Print Invoice
        </button>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
        >
          <Download size={18} />
          Download PDF
        </button>
      </div>

      {/* Invoice Content */}
      <div id="invoice-content" className="bg-white p-8 rounded-lg shadow print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-600">INVOICE</h1>
            <p className="text-gray-600">Order #{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="font-bold">MobileSale</p>
            <p className="text-sm text-gray-600">www.mobilesale.com</p>
            <p className="text-sm text-gray-600">support@mobilesale.com</p>
          </div>
        </div>

        {/* Customer & Order Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Bill To:</h3>
            <p className="text-gray-700">{user?.name}</p>
            <p className="text-gray-600 text-sm">{user?.email}</p>
            <p className="text-gray-600 text-sm">{user?.phone}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-600">
              <span className="font-bold">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}
            </p>
            <p className="text-gray-600">
              <span className="font-bold">Status:</span> {order.status}
            </p>
            <p className="text-gray-600">
              <span className="font-bold">Payment:</span> {order.paymentMethod || "Pending"}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2 font-bold">Product</th>
              <th className="text-center py-2 font-bold">Qty</th>
              <th className="text-right py-2 font-bold">Price</th>
              <th className="text-right py-2 font-bold">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-3">{item.name}</td>
                <td className="text-center py-3">{item.quantity}</td>
                <td className="text-right py-3">₹{item.price.toLocaleString()}</td>
                <td className="text-right py-3">₹{(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span>₹{(order.subtotal || order.total).toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount:</span>
                <span>-₹{order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax (18%):</span>
              <span>₹{(order.tax || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping:</span>
              <span>₹{(order.shipping || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t-2 pt-2">
              <span>Total:</span>
              <span className="text-blue-600">₹{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-center text-sm text-gray-600">
          <p>Thank you for your purchase!</p>
          <p>For support, contact: support@mobilesale.com | Phone: +91-XXXXXXXXXX</p>
          <p className="mt-4 text-xs">This is a computer-generated invoice. No signature required.</p>
        </div>
      </div>

      <style>{`
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          #invoice-content {
            box-shadow: none;
            border: none;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
