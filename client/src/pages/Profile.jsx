import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, MapPin, Package, ChevronRight, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import SafeImage from '../components/ui/SafeImage.jsx';
import Spinner, { FullPageSpinner } from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { orderService } from '../api/orderService.js';
import { authService } from '../api/authService.js';
import { formatCurrency, formatDate } from '../utils/format.js';

const STATUS_COLORS = {
  Placed: 'bg-blue-100 text-blue-700',
  Preparing: 'bg-gold/15 text-gold',
  'Out for Delivery': 'bg-primary-100 text-primary-700',
  Delivered: 'bg-veg/15 text-veg',
  Cancelled: 'bg-red-100 text-red-600',
};

const Profile = () => {
  const { user, setUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('orders');

  // Editable profile form.
  const [name, setName] = useState(user?.name || '');
  const [addr, setAddr] = useState(user?.addresses?.[0] || { label: 'Home', street: '', city: '', state: '', zip: '', phone: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    orderService
      .getMyOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { user: updated } = await authService.updateProfile({ name, addresses: [addr] });
      setUser(updated);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-500 text-2xl font-bold text-white">
          {user.name?.[0]?.toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-2xl font-bold">{user.name}</h1>
          <p className="text-charcoal/55 dark:text-cream/55">{user.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 border-b border-black/5 dark:border-white/10">
        <TabButton active={tab === 'orders'} onClick={() => setTab('orders')} icon={Package}>
          Order history
        </TabButton>
        <TabButton active={tab === 'profile'} onClick={() => setTab('profile')} icon={User}>
          Profile &amp; address
        </TabButton>
      </div>

      {tab === 'orders' ? (
        orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            message="When you place an order, it'll show up here."
            action={<Link to="/dishes" className="btn-primary">Start ordering</Link>}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <motion.div key={order._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs text-charcoal/50 dark:text-cream/50">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[order.orderStatus] || 'bg-black/5'}`}>
                    {order.orderStatus}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="h-12 w-12 overflow-hidden rounded-lg">
                      <SafeImage src={item.image} alt={item.name} aspect="aspect-square" />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <span className="text-sm text-charcoal/50">+{order.items.length - 4} more</span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-3 dark:border-white/10">
                  <span className="font-semibold">{formatCurrency(order.totalAmount)}</span>
                  <Link to={`/orders/${order._id}/track`} className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:underline">
                    Track order <ChevronRight size={15} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        <form onSubmit={saveProfile} className="card max-w-xl space-y-5 p-6">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <MapPin size={16} className="text-primary-500" /> Saved address
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <AddrField className="sm:col-span-2" label="Street" value={addr.street} onChange={(v) => setAddr({ ...addr, street: v })} />
              <AddrField label="City" value={addr.city} onChange={(v) => setAddr({ ...addr, city: v })} />
              <AddrField label="State" value={addr.state} onChange={(v) => setAddr({ ...addr, state: v })} />
              <AddrField label="ZIP" value={addr.zip} onChange={(v) => setAddr({ ...addr, zip: v })} />
              <AddrField label="Phone" value={addr.phone} onChange={(v) => setAddr({ ...addr, phone: v })} />
            </div>
          </div>

          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? <Spinner /> : <Save size={16} />} Save changes
          </button>
        </form>
      )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
      active ? 'border-primary-500 text-primary-600' : 'border-transparent text-charcoal/50 hover:text-charcoal dark:text-cream/50'
    }`}
  >
    <Icon size={16} /> {children}
  </button>
);

const AddrField = ({ label, value, onChange, className = '' }) => (
  <div className={className}>
    <label className="label">{label}</label>
    <input className="input" value={value || ''} onChange={(e) => onChange(e.target.value)} />
  </div>
);

export default Profile;
