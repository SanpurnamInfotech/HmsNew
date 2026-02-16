import { useState } from "react";
import api from "../utils/domain"; 
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { Eye, EyeOff, Lock, User, Loader2, ShieldCheck } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("admin-login/", { username, password });
      const { access, refresh, username: resUser } = res.data;

      if (login) {
        login(access, refresh, resUser); 
      }

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 font-sans">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
      
      <div className="max-w-md w-full">
        {/* Compact Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white shadow-lg mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Portal</h2>
        </div>

        {/* Compact Card Container */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-pulse text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 placeholder:text-slate-400"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 placeholder:text-slate-400"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-4 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Need access?{" "}
              <Link 
                to="/admin/register" 
                className="font-bold text-emerald-600 hover:text-emerald-500 transition-colors hover:underline underline-offset-4"
              >
                Register as Admin
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;