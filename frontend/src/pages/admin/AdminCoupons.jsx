import { useState, useEffect } from "react";
import axios from "axios";
import SelectDropdown from "../../components/SelectDropdown";
import { API_BASE } from "../../utils/apiBase";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", discount: "", discountType: "percentage", minPurchase: "", maxDiscount: "", expiryDate: "", usageLimit: "" });
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      const res = await axios.get(`${API_BASE}/api/coupons`, { headers: { Authorization: `Bearer ${token}` } });
      setCoupons(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      if (editing) {
        await axios.put(`${API_BASE}/api/coupons/${editing}`, form, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_BASE}/api/coupons`, form, { headers: { Authorization: `Bearer ${token}` } });
      }
      setForm({ code: "", discount: "", discountType: "percentage", minPurchase: "", maxDiscount: "", expiryDate: "", usageLimit: "" });
      setEditing(null);
      fetchCoupons();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete coupon?")) return;
    try {
      const token = JSON.parse(localStorage.getItem("currentUser"))?.token;
      await axios.delete(`${API_BASE}/api/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchCoupons();
    } catch (error) {
      alert(error.response?.data?.message || "Error");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Coupon Management</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">{editing ? "Edit" : "Add"} Coupon</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Coupon Code" value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} className="border rounded p-3" required />
          <input type="number" placeholder="Discount" value={form.discount} onChange={(e) => setForm({...form, discount: e.target.value})} className="border rounded p-3" required />
          <div>
            <SelectDropdown
              value={form.discountType}
              onChange={(val) => setForm({ ...form, discountType: val })}
              options={[{ value: "percentage", label: "Percentage" }, { value: "fixed", label: "Fixed Amount" }]}
              className="w-full"
              buttonClassName="border rounded p-3"
            />
          </div>
          <input type="number" placeholder="Min Purchase" value={form.minPurchase} onChange={(e) => setForm({...form, minPurchase: e.target.value})} className="border rounded p-3" />
          <input type="number" placeholder="Max Discount" value={form.maxDiscount} onChange={(e) => setForm({...form, maxDiscount: e.target.value})} className="border rounded p-3" />
          <input type="date" placeholder="Expiry Date" value={form.expiryDate} onChange={(e) => setForm({...form, expiryDate: e.target.value})} className="border rounded p-3" />
          <input type="number" placeholder="Usage Limit" value={form.usageLimit} onChange={(e) => setForm({...form, usageLimit: e.target.value})} className="border rounded p-3" />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">{editing ? "Update" : "Add"}</button>
            {editing && <button type="button" onClick={() => { setEditing(null); setForm({ code: "", discount: "", discountType: "percentage", minPurchase: "", maxDiscount: "", expiryDate: "", usageLimit: "" }); }} className="bg-gray-400 text-white px-6 py-2 rounded">Cancel</button>}
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Discount</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Min Purchase</th>
              <th className="p-4 text-left">Used</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon._id} className="border-b">
                <td className="p-4 font-bold">{coupon.code}</td>
                <td className="p-4">{coupon.discount}{coupon.discountType === "percentage" ? "%" : "₹"}</td>
                <td className="p-4">{coupon.discountType}</td>
                <td className="p-4">₹{coupon.minPurchase || 0}</td>
                <td className="p-4">{coupon.usedCount}/{coupon.usageLimit || "∞"}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded text-sm ${coupon.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => { setForm(coupon); setEditing(coupon._id); }} className="text-blue-600 hover:underline mr-4">Edit</button>
                  <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
