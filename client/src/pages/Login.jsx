import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../components/ui/Logo.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <div className="mb-6 text-center">
          <span className="mb-3 flex justify-center">
            <Logo withWordmark={false} markSize={48} />
          </span>
          <h1 className="font-display text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-charcoal/55 dark:text-cream/55">Sign in to continue to Flavor Hub.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email</label>
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={onChange}
                placeholder="you@email.com"
                className="input pl-10"
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="password">Password</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                id="password"
                name="password"
                type="password"
                required
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                className="input pl-10"
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading && <Spinner />} Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal/55 dark:text-cream/55">
          New to Flavor Hub?{' '}
          <Link to={`/signup?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-primary-600 hover:underline">
            Create an account
          </Link>
        </p>

        <div className="mt-4 rounded-xl bg-primary-50 p-3 text-center text-xs text-primary-700 dark:bg-white/5 dark:text-primary-200">
          Demo admin: <strong>admin@flavorhub.test</strong> / <strong>Admin@12345</strong>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
