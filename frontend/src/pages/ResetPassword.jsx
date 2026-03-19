import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { API_BASE } from "../utils/apiBase";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || "Password updated successfully!");
        navigate("/login");
      } else {
        setError(data.message || "Failed to update password.");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle="Choose a strong new password for your account">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={password}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-semibold"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={confirmPassword}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-5 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all font-semibold"
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Updating..." : "Update Password"}
        </button>

        <div className="flex flex-col space-y-4 items-center pt-2">
          <div className="h-px w-full bg-slate-100"></div>
          <p className="text-sm text-slate-500 font-medium text-center">
            Suddenly remembered?{" "}
            <Link to="/login" className="text-indigo-600 font-bold hover:underline underline-offset-4">
              Return to Login
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export default ResetPassword;
