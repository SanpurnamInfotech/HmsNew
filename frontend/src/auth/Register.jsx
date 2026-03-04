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
        mobile_no: form.mobile_no, 
      });

      setSuccess("Success! Redirecting...");
      
      const { access, refresh, ...userData } = res.data;

      if (access && refresh) {
          if (login) {
              login(access, refresh, userData);
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
      <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: "var(--primary-accent)" }} />
      
      <div className="max-w-md w-full animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-lg mb-4 transition-transform hover:-rotate-3" style={{ backgroundColor: "var(--primary-accent)" }}>
            <UserPlus className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight uppercase" style={{ color: "var(--text-title)" }}>Admin Registration</h2>
          <p className="text-sm font-medium mt-1 opacity-60" style={{ color: "var(--text-muted)" }}>Create your management account</p>
        </div>

        <div className="form-container shadow-2xl relative overflow-hidden">
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
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <input
                  name="username"
                  type="text"
                  required
                  autoComplete="off"
                  className="form-input w-full pl-12 bg-transparent outline-none"
                  placeholder="admin_user"
                  value={form.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="form-label block ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="off"
                  className="form-input w-full pl-12 bg-transparent outline-none"
                  placeholder="admin@mail.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mobile No. */}
            <div className="space-y-1">
              <label className="form-label block ml-1">Mobile No.</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                <input
                  name="mobile_no"
                  type="text"
                  autoComplete="off"
                  className="form-input w-full pl-12 bg-transparent outline-none"
                  placeholder="98XXXXXXXX"
                  value={form.mobile_no}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Fields */}
            
              <div className="space-y-1">
                <label className="form-label block ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="form-input w-full pl-11 bg-transparent outline-none"
                    placeholder="••••"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="form-label block ml-1">Confirm</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40 group-focus-within:opacity-100 transition-opacity" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    className="form-input w-full pl-11 pr-10 bg-transparent outline-none"
                    placeholder="••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
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
        

      </div>
    </div>
  );
};

export default Register;