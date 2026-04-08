import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Building2, LogIn, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      toast.success('Welcome back! 🏠');
      navigate(from, { replace: true });
    } else {
      setError(result.message);
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-bg py-12 px-4">
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-blue-600/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-violet-600/6 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="text-2xl font-black gradient-text">PropConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-slate-400 text-sm">Sign in to your account to continue</p>
        </div>

        {/* Form card */}
        <div className="glass-card p-8">
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl px-4 py-3 mb-5 text-sm">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center text-base py-3"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={17} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 p-3 bg-blue-600/8 border border-blue-500/20 rounded-xl text-xs text-slate-400">
            <p className="font-medium text-slate-300 mb-1">Demo account</p>
            <p>Register a new account to get started — it's free!</p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
