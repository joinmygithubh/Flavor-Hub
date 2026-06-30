import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../components/ui/Logo.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { signup } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // Lightweight client-side validation; the server validates authoritatively.
  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email';
    if (form.password.length < 8) next.password = 'At least 8 characters';
    else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password))
      next.password = 'Use letters and numbers';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const user = await signup(form);
      toast.success(`Welcome, ${user.name.split(' ')[0]}!`);
      navigate(redirect, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
        <div className="mb-6 text-center">
          <span className="mb-3 flex justify-center">
            <Logo withWordmark={false} markSize={48} />
          </span>
          <h1 className="font-display text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-charcoal/55 dark:text-cream/55">Join Flavor Hub and start ordering.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <Field
            id="name" name="name" label="Full name" icon={User} value={form.name}
            onChange={onChange} error={errors.name} placeholder="Jane Doe" autoComplete="name"
          />
          <Field
            id="email" name="email" type="email" label="Email" icon={Mail} value={form.email}
            onChange={onChange} error={errors.email} placeholder="you@email.com" autoComplete="email"
          />
          <Field
            id="password" name="password" type="password" label="Password" icon={Lock} value={form.password}
            onChange={onChange} error={errors.password} placeholder="At least 8 characters" autoComplete="new-password"
          />

          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading && <Spinner />} Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-charcoal/55 dark:text-cream/55">
          Already have an account?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

const Field = ({ id, name, label, icon: Icon, error, type = 'text', ...rest }) => (
  <div>
    <label className="label" htmlFor={id}>{label}</label>
    <div className="relative">
      <Icon size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
      <input id={id} name={name} type={type} className="input pl-10" {...rest} />
    </div>
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

export default Signup;
