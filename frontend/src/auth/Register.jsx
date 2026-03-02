import { useState } from "react";
import api from "../utils/domain"; 
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  UserPlus, 
  Loader2, 
  ShieldCheck,
  Eye,
  EyeOff
} from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobile_no: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post("admin-register/", {
        username: form.username,
        email: form.email,
        password: form.password,
      });

      setSuccess("Success! Redirecting...");
      
      if (res.data.access && res.data.refresh) {
          if (login) {
              login(res.data.access, res.data.refresh, form.username);
          }
          setTimeout(() => navigate("/admin/dashboard"), 1200);
      } else {
          setTimeout(() => navigate("/admin/login"), 1500);
      }
      
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-8 font-sans transition-colors duration-300" style={{ backgroundColor: "var(--bg-app)" }}>
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "var(--primary-accent)" }} />
      
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-lg mb-4 transition-transform hover:-rotate-3" style={{ backgroundColor: "var(--primary-accent)" }}>
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase" style={{ color: "var(--text-title)" }}>Admin Registration</h2>
          <p className="text-sm font-medium mt-1 opacity-60" style={{ color: "var(--text-muted)" }}>Create your management account</p>
        </div>

        {/* Card Container using Theme Variables */}
        <div className="form-container shadow-2xl relative overflow-hidden">
           {/* Subtle background glow */}
           <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold text-center animate-shake">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-1">
              <label className="form-label block ml-1">Username</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: "var(--primary-accent)" }} />
                <input
                  name="username"
                  type="text"
                  required
                  className="form-input w-full pl-12"
                  placeholder="admin_user"
                  value={form.username}
                  onChange={handleChange}
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="form-label block ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: "var(--primary-accent)" }} />
                <input
                  name="email"
                  type="email"
                  required
                  className="form-input w-full pl-12"
                  placeholder="admin@mail.com"
                  value={form.email}
                  onChange={handleChange}
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Password Fields */}
              <div className="space-y-1">
                <label className="form-label block ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: "var(--primary-accent)" }} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="form-input w-full pl-11"
                    placeholder="••••"
                    value={form.password}
                    onChange={handleChange}
                    style={{ colorScheme: "dark" }}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="form-label block ml-1">Confirm</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: "var(--primary-accent)" }} />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    className="form-input w-full pl-11 pr-10"
                    placeholder="••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    style={{ colorScheme: "dark" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100 transition-opacity"
                    style={{ color: "var(--text-main)" }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-1">
              <label className="form-label block ml-1">Mobile (Optional)</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" style={{ color: "var(--primary-accent)" }} />
                <input
                  name="mobile_no"
                  type="text"
                  className="form-input w-full pl-12"
                  placeholder="9876543210"
                  value={form.mobile_no}
                  onChange={handleChange}
                  style={{ colorScheme: "dark" }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 mt-2 text-sm uppercase tracking-widest shadow-emerald-500/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                "Register Account"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: "var(--border-color)" }}>
            <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <Link 
                to="/admin/login" 
                className="font-bold transition-colors hover:underline underline-offset-4"
                style={{ color: "var(--primary-accent)" }}
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-8 text-[10px] uppercase tracking-[0.2em] font-bold opacity-30" style={{ color: "var(--text-muted)" }}>
          &copy; 2026 Admin Engine v3.0
        </p>
      </div>
    </div>
  );
};

export default Register;