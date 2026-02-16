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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4 py-8 font-sans">
      <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
      
      {/* Reduced width to max-w-md to match standard Login size */}
      <div className="max-w-md w-full">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-600 text-white shadow-lg mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Admin Registration</h2>
        </div>

        {/* Compact Card */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          {error && <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-xs font-bold">{error}</div>}
          {success && <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="username"
                  type="text"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  placeholder="admin_user"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  placeholder="admin@mail.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Grid - Compact */}
            
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder="••••"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">Confirm</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    className="block w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                    placeholder="••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            

            {/* Mobile */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 ml-1">Mobile (Optional)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="mobile_no"
                  type="text"
                  className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500"
                  placeholder="9876543210"
                  value={form.mobile_no}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex justify-center items-center py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Register"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 pt-4 border-t border-slate-50 text-center">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{" "}
              <Link to="/admin/login" className="text-emerald-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;