import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Trash2, X, LayoutDashboard, UtensilsCrossed, ClipboardList, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import SafeImage from '../components/ui/SafeImage.jsx';
import Spinner, { FullPageSpinner } from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import VegBadge from '../components/ui/VegBadge.jsx';
import { dishService } from '../api/dishService.js';
import { orderService } from '../api/orderService.js';
import { CUISINES, ORDER_STEPS } from '../utils/constants.js';
import { formatCurrency, formatDate } from '../utils/format.js';

const EMPTY_DISH = {
  name: '', cuisine: 'Italian', description: '', price: '', image: '',
  isVeg: false, prepTime: 20, rating: 4.5, tags: '',
};

const Admin = () => {
  const [tab, setTab] = useState('dishes');
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-1 flex items-center gap-2 font-display text-3xl font-bold">
        <LayoutDashboard size={28} className="text-primary-500" /> Admin Dashboard
      </h1>
      <p className="mb-6 text-charcoal/55 dark:text-cream/55">Manage the menu and incoming orders.</p>

      <div className="mb-6 flex gap-2 border-b border-black/5 dark:border-white/10">
        <Tab active={tab === 'dishes'} onClick={() => setTab('dishes')} icon={UtensilsCrossed}>Dishes</Tab>
        <Tab active={tab === 'orders'} onClick={() => setTab('orders')} icon={ClipboardList}>Orders</Tab>
      </div>

      {tab === 'dishes' ? <DishManager /> : <OrderManager />}
    </div>
  );
};

/* ------------------------------ Dish manager ------------------------------ */
const DishManager = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_DISH);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Pull a large page so the admin sees the whole catalogue.
      const res = await dishService.listDishes({ limit: 60, sort: 'newest' });
      setDishes(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_DISH);
    setModalOpen(true);
  };

  const openEdit = (dish) => {
    setEditing(dish);
    setForm({ ...dish, tags: (dish.tags || []).join(', ') });
    setModalOpen(true);
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    // Coerce types to match the API contract.
    const payload = {
      name: form.name,
      cuisine: form.cuisine,
      description: form.description,
      price: Number(form.price),
      image: form.image,
      isVeg: !!form.isVeg,
      prepTime: Number(form.prepTime),
      rating: Number(form.rating),
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    try {
      if (editing) {
        await dishService.updateDish(editing._id, payload);
        toast.success('Dish updated');
      } else {
        await dishService.createDish(payload);
        toast.success('Dish created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.errors?.[0]?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (dish) => {
    if (!window.confirm(`Delete "${dish.name}"?`)) return;
    try {
      await dishService.deleteDish(dish._id);
      toast.success('Dish deleted');
      setDishes((d) => d.filter((x) => x._id !== dish._id));
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <FullPageSpinner />;

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> Add dish
        </button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-black/5 bg-black/[0.02] text-xs uppercase tracking-wide text-charcoal/50 dark:border-white/10 dark:bg-white/5 dark:text-cream/50">
              <tr>
                <th className="px-4 py-3">Dish</th>
                <th className="px-4 py-3">Cuisine</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Veg</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dishes.map((dish) => (
                <tr key={dish._id} className="border-b border-black/5 last:border-0 dark:border-white/10">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-lg">
                        <SafeImage src={dish.image} alt={dish.name} aspect="aspect-square" />
                      </div>
                      <span className="font-medium">{dish.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal/60 dark:text-cream/60">{dish.cuisine}</td>
                  <td className="px-4 py-3">{formatCurrency(dish.price)}</td>
                  <td className="px-4 py-3"><VegBadge isVeg={dish.isVeg} /></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => openEdit(dish)} className="btn-ghost rounded-lg p-2" aria-label="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => remove(dish)} className="btn-ghost rounded-lg p-2 text-red-500" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit modal */}
      <AnimatePresence>
        {modalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalOpen(false)} className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[92%] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl bg-cream p-6 shadow-2xl dark:bg-charcoal"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">{editing ? 'Edit dish' : 'Add dish'}</h3>
                <button onClick={() => setModalOpen(false)} className="btn-ghost rounded-full"><X size={18} /></button>
              </div>
              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input name="name" required value={form.name} onChange={onChange} className="input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Cuisine</label>
                    <select name="cuisine" value={form.cuisine} onChange={onChange} className="input">
                      {CUISINES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Price (USD)</label>
                    <input name="price" type="number" step="0.01" min="0" required value={form.price} onChange={onChange} className="input" />
                  </div>
                </div>
                <div>
                  <label className="label">Image URL</label>
                  <input name="image" type="url" required value={form.image} onChange={onChange} className="input" placeholder="https://images.unsplash.com/..." />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea name="description" rows={2} value={form.description} onChange={onChange} className="input" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Prep (min)</label>
                    <input name="prepTime" type="number" min="1" value={form.prepTime} onChange={onChange} className="input" />
                  </div>
                  <div>
                    <label className="label">Rating</label>
                    <input name="rating" type="number" step="0.1" min="0" max="5" value={form.rating} onChange={onChange} className="input" />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input name="isVeg" type="checkbox" checked={!!form.isVeg} onChange={onChange} className="h-4 w-4 accent-veg" />
                      Vegetarian
                    </label>
                  </div>
                </div>
                <div>
                  <label className="label">Tags (comma separated)</label>
                  <input name="tags" value={form.tags} onChange={onChange} className="input" placeholder="spicy, popular" />
                </div>
                <button type="submit" disabled={saving} className="btn-primary w-full py-3">
                  {saving && <Spinner />} {editing ? 'Save changes' : 'Create dish'}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ----------------------------- Order manager ----------------------------- */
const OrderManager = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await orderService.getAllOrders({ limit: 50 });
      setOrders(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const changeStatus = async (order, status) => {
    try {
      const updated = await orderService.updateStatus(order._id, status);
      setOrders((list) => list.map((o) => (o._id === order._id ? updated : o)));
      toast.success(`Order marked "${status}"`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <FullPageSpinner />;

  if (orders.length === 0) {
    return <EmptyState icon={Package} title="No orders yet" message="Orders placed by customers will appear here." />;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-sm font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
              <p className="text-xs text-charcoal/50 dark:text-cream/50">
                {order.user?.name || 'Customer'} · {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold">{formatCurrency(order.totalAmount)}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${order.paymentStatus === 'Paid' ? 'bg-veg/15 text-veg' : 'bg-gold/15 text-gold'}`}>
                {order.paymentMethod} · {order.paymentStatus}
              </span>
            </div>
          </div>

          <div className="mt-3 text-sm text-charcoal/60 dark:text-cream/60">
            {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-black/5 pt-3 dark:border-white/10">
            <span className="text-xs font-medium text-charcoal/50 dark:text-cream/50">Update status:</span>
            {ORDER_STEPS.map((step) => (
              <button
                key={step}
                onClick={() => changeStatus(order, step)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  order.orderStatus === step
                    ? 'bg-primary-500 text-white'
                    : 'bg-black/5 text-charcoal/60 hover:bg-primary-100 dark:bg-white/10 dark:text-cream/60'
                }`}
              >
                {step}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const Tab = ({ active, onClick, icon: Icon, children }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
      active ? 'border-primary-500 text-primary-600' : 'border-transparent text-charcoal/50 hover:text-charcoal dark:text-cream/50'
    }`}
  >
    <Icon size={16} /> {children}
  </button>
);

export default Admin;
