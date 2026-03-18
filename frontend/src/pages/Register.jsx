import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { API_BASE } from "../utils/apiBase";

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const [preview, setPreview] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError("Please fill all required fields");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = new FormData();
      payload.append("name", form.name.trim());
      payload.append("email", form.email.trim());
      payload.append("phone", form.phone.trim());
      payload.append("address", form.address.trim());
      payload.append("password", form.password);
      payload.append("role", "user");
      if (photo) {
        payload.append("image", photo);
      }

      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        body: payload,
      });

      // Some error responses may be empty or not JSON; parse defensively
      let data = null;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!response.ok) {
        setError(data?.message || "Registration failed");
        return;
      }

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Join Us" subtitle="Create your MobileSale premium account">
      <div className="space-y-6">
        <div className="flex flex-col items-center">
          <label className="group cursor-pointer relative">
            <div className="w-24 h-24 rounded-full border-2 border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-indigo-400 group-hover:shadow-lg">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-2">
                  <div className="text-2xl mb-1">📷</div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Upload</div>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Phone</label>
            <input
              type="tel"
              placeholder="Phone number"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Shipping Address</label>
            <input
              type="text"
              placeholder="Full address"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              placeholder="Create password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm password"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all font-semibold"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold transition-all shadow-lg ${
            loading
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100"
          }`}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-center text-slate-500 text-sm font-medium">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
