import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(form.email, form.password);
    setLoading(false);

    if (!result.success) {
      setError(result.message || "Invalid credentials");
      return;
    }

    if (result.user.role !== "user") {
      setError("Please use the official Admin Portal for management access.");
      return;
    }

    navigate("/");
  };

  return (
    <AuthLayout title="User Login" subtitle="Secure access to your MobileSale account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              required
              value={form.email}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-semibold"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={form.password}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-semibold"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl text-sm text-center font-semibold">
            {error}
          </div>
        )}

        <button
          disabled={loading}
          className={`w-full rounded-2xl py-4 font-bold transition-all duration-300 shadow-lg ${
            loading
              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-100"
          }`}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <div className="flex flex-col space-y-4 items-center">
          <Link to="/forgot" className="text-sm text-slate-500 hover:text-indigo-600 font-semibold transition">
            Forgot password?
          </Link>
          <div className="h-px w-full bg-slate-100"></div>
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-indigo-600 font-bold hover:underline underline-offset-4">
              Create account
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default Login;
