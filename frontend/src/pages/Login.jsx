import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setBusy(false);
    }
  };

  const fillAdmin = () => {
    setForm({ email: 'admin@scango.com', password: '124Dhruv@' });
  };

  return (
    <div className="max-w-md mx-auto pt-4 sm:pt-10 pb-20">
      <div className="card border-slate-800/80 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 text-slate-950" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <line x1="7" y1="8" x2="7" y2="16" />
              <line x1="11" y1="8" x2="11" y2="16" />
              <line x1="14" y1="8" x2="14" y2="16" />
            </svg>
          </div>
          <h1 className="font-display font-extrabold text-2xl text-white">Welcome Back</h1>
          <p className="text-xs text-slate-400">Sign in to your Scan&amp;Go self-checkout account</p>
        </div>

        {/* Demo Quick Pill */}
        <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            <span className="text-emerald-400 font-semibold block text-[11px]">Testing Quick Access:</span>
            <span className="text-[10px]">Use store manager admin pass</span>
          </div>
          <button
            type="button"
            onClick={fillAdmin}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 active:scale-95 transition-all"
          >
            Auto-Fill Admin
          </button>
        </div>

        {/* Error notice */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 block">Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 block">Password</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button className="btn btn-primary w-full py-3 text-sm font-bold" disabled={busy}>
            {busy ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4 text-slate-950" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In to Scan&Go'
            )}
          </button>
        </form>

        <p className="text-xs text-center text-slate-400 pt-2 border-t border-slate-800/80">
          First time shopping here?{' '}
          <Link to="/register" className="text-emerald-400 font-semibold hover:underline">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
