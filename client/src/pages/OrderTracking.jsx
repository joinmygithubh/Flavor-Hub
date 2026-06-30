import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ChefHat, Truck, PackageCheck, ClipboardList, RefreshCw, XCircle } from 'lucide-react';
import { FullPageSpinner } from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SafeImage from '../components/ui/SafeImage.jsx';
import { orderService } from '../api/orderService.js';
import { ORDER_STEPS } from '../utils/constants.js';
import { formatCurrency, formatTime, formatDate } from '../utils/format.js';

const STEP_ICONS = [ClipboardList, ChefHat, Truck, PackageCheck];

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await orderService.getOrder(id);
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    // Light polling so an admin status change reflects here automatically.
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) return <FullPageSpinner />;
  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState title="Order not found" action={<Link to="/profile" className="btn-primary">My orders</Link>} />
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'Cancelled';
  const currentStep = ORDER_STEPS.indexOf(order.orderStatus);

  // Maps a step to the timestamp it occurred at (from status history).
  const stepTime = (stepName) =>
    order.statusHistory?.find((h) => h.status === stepName)?.at;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Track order</h1>
          <p className="font-mono text-sm text-charcoal/55 dark:text-cream/55">
            #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>
        <button onClick={load} className="btn-secondary px-3 py-2 text-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      <div className="card p-6">
        {isCancelled ? (
          <div className="flex flex-col items-center py-6 text-center">
            <XCircle size={48} className="text-red-500" />
            <p className="mt-3 font-display text-lg font-bold">Order cancelled</p>
            <p className="text-sm text-charcoal/55 dark:text-cream/55">This order is no longer being processed.</p>
          </div>
        ) : (
          <ol className="relative">
            {ORDER_STEPS.map((step, index) => {
              const Icon = STEP_ICONS[index];
              const done = index <= currentStep;
              const active = index === currentStep;
              const time = stepTime(step);
              return (
                <li key={step} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Connector line */}
                  {index < ORDER_STEPS.length - 1 && (
                    <span
                      className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${
                        index < currentStep ? 'bg-primary-500' : 'bg-black/10 dark:bg-white/10'
                      }`}
                    />
                  )}
                  <motion.span
                    initial={false}
                    animate={active ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ repeat: active ? Infinity : 0, duration: 1.6 }}
                    className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                      done ? 'bg-primary-500 text-white' : 'bg-black/5 text-charcoal/40 dark:bg-white/10 dark:text-cream/40'
                    }`}
                  >
                    {index < currentStep ? <Check size={18} /> : <Icon size={18} />}
                  </motion.span>
                  <div className="pt-1.5">
                    <p className={`font-semibold ${done ? 'text-charcoal dark:text-cream' : 'text-charcoal/45 dark:text-cream/45'}`}>
                      {step}
                    </p>
                    {time ? (
                      <p className="text-xs text-charcoal/50 dark:text-cream/50">{formatTime(time)}</p>
                    ) : active ? (
                      <p className="text-xs text-primary-500">In progress…</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Order details */}
      <div className="card mt-6 p-6">
        <h2 className="mb-3 font-semibold">Order details</h2>
        <ul className="space-y-3">
          {order.items.map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <SafeImage src={item.image} alt={item.name} aspect="aspect-square" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="text-xs text-charcoal/50 dark:text-cream/50">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between border-t border-black/5 pt-4 font-bold dark:border-white/10">
          <span>Total ({order.paymentMethod})</span>
          <span className="text-primary-600">{formatCurrency(order.totalAmount)}</span>
        </div>
        <p className="mt-3 text-xs text-charcoal/45 dark:text-cream/45">
          Placed on {formatDate(order.createdAt)}
        </p>
      </div>
    </div>
  );
};

export default OrderTracking;
