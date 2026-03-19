import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { API_BASE } from "../utils/apiBase";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: "success", text: data.message || "Reset link sent to your email." });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to send reset link." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Server error. Please try again later." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a reset link">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
            <input
              type="email"
              placeholder="name@example.com"
              required
              value={email}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-semibold"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {message.text && (
          <div className={`${message.type === "success" ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-red-50 border-red-100 text-red-600"} border p-4 rounded-xl text-sm text-center font-semibold`}>
            {message.text}
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
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <div className="flex flex-col space-y-4 items-center pt-2">
          <div className="h-px w-full bg-slate-100"></div>
          <p className="text-sm text-slate-500 font-medium text-center">
            Remembered your password?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">
              Return to Login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ForgotPassword;
