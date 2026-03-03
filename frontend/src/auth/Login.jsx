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
    <div className="min-h-screen w-full flex items-center justify-center px-4 font-sans transition-colors duration-300" style={{ backgroundColor: "var(--bg-app)" }}>
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "var(--primary-accent)" }} />
      
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        {/* Compact Header Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-lg mb-4 transition-transform hover:rotate-3" style={{ backgroundColor: "var(--primary-accent)" }}>
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase" style={{ color: "var(--text-title)" }}>Admin Portal</h2>
          {/* <p className="text-sm font-medium mt-1 opacity-60" style={{ color: "var(--text-muted)" }}>Secure Management Access</p> */}
        </div>

        {/* Card Container using Theme Variables */}
        <div className="form-container shadow-2xl overflow-hidden relative">
          {/* Subtle background glow effect for Dark Mode */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold animate-in slide-in-from-top-2 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Input */}
            <div className="space-y-1.5">
              <label className="form-label block ml-1">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: "var(--primary-accent)" }} />
                <input
                  type="text"
                  required
                  className="form-input w-full pl-12"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="form-label block ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: "var(--primary-accent)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className="form-input w-full pl-12 pr-12"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ colorScheme: "dark" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                  style={{ color: "var(--text-main)" }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-4 text-sm uppercase tracking-widest shadow-emerald-500/20"
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
          <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "var(--border-color)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Need administrative access?{" "}
              <Link 
                to="/admin/register" 
                className="font-bold transition-colors hover:underline underline-offset-4"
                style={{ color: "var(--primary-accent)" }}
              >
                Register Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;