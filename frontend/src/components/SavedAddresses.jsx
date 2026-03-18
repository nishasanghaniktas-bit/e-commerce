import { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Plus, MapPin } from "lucide-react";
import { API_BASE } from "../../utils/apiBase";

export default function SavedAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false
  });

  const token = JSON.parse(localStorage.getItem("currentUser"))?.token;

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(
        `${API_BASE}/api/users/profile/addresses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddresses(res.data);
    } catch (error) {
      console.log("Error fetching addresses:", error);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(
        `${API_BASE}/api/users/profile/addresses`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFormData({
        name: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        isDefault: false
      });
      setShowForm(false);
      fetchAddresses();
      alert("Address added successfully!");
    } catch (error) {
      alert("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      await axios.delete(
        `${API_BASE}/api/users/profile/addresses/${addressId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAddresses();
      alert("Address deleted!");
    } catch (error) {
      alert("Failed to delete address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await axios.put(
        `${API_BASE}/api/users/profile/addresses/${addressId}/default`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAddresses();
    } catch (error) {
      alert("Failed to set default address");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Saved Addresses</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Address
        </button>
      </div>

      {/* Add Address Form */}
      {showForm && (
        <form onSubmit={handleAddAddress} className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="tel"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Street Address"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="State"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            <input
              type="text"
              placeholder="ZIP Code"
              value={formData.zipCode}
              onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
              className="border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4"
            />
            <span>Set as default address</span>
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Address"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 border rounded-lg py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Addresses List */}
      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No saved addresses</p>
        ) : (
          addresses.map((address) => (
            <div
              key={address._id}
              onClick={() => setSelectedAddress(address._id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                selectedAddress === address._id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-blue-600" />
                  <p className="font-bold">{address.name}</p>
                  {address.isDefault && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Default
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAddress(address._id);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-700">
                {address.street}, {address.city}, {address.state} {address.zipCode}
              </p>
              <p className="text-sm text-gray-600 mt-1">Phone: {address.phone}</p>

              {!address.isDefault && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSetDefault(address._id);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 mt-2"
                >
                  Set as default
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
