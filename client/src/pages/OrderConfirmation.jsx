import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Truck, Clock, Receipt } from 'lucide-react';
import { FullPageSpinner } from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { orderService } from '../api/orderService.js';
import { formatCurrency, formatTime } from '../utils/format.js';

const OrderConfirmation = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService
      .getOrder(id)
      .then(setOrder)
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <FullPageSpinner />;

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          title="Order not found"
          message="We couldn't find this order."
          action={<Link to="/profile" className="btn-primary">View my orders</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="mb-6 flex flex-col items-center text-center"
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-veg/15 text-veg">
          <CheckCircle2 size={48} />
        </span>
        <h1 className="mt-4 font-display text-3xl font-bold">Order confirmed!</h1>
        <p className="mt-1 text-charcoal/60 dark:text-cream/60">
          Thanks for your order. We&apos;re getting your food ready.
        </p>
      </motion.div>

      <div className="card overflow-hidden">
        {/* Summary header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 bg-primary-50 px-6 py-4 dark:border-white/10 dark:bg-white/5">
          <div>
            <p className="text-xs uppercase tracking-wide text-charcoal/45 dark:text-cream/45">Order ID</p>
            <p className="font-mono text-sm font-semibold">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-charcoal/45 dark:text-cream/45">Payment</p>
            <p className="font-semibold">
              {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid Online'}
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${order.paymentStatus === 'Paid' ? 'bg-veg/15 text-veg' : 'bg-gold/15 text-gold'}`}>
                {order.paymentStatus}
              </span>
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="px-6 py-4">
          <h2 className="mb-3 flex items-center gap-2 font-semibold">
            <Receipt size={16} className="text-primary-500" /> Items
          </h2>
          <ul className="space-y-2">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span>
                  {item.quantity} × {item.name}
                  {item.spiceLevel && <span className="text-charcoal/45"> · {item.spiceLevel}</span>}
                </span>
                <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1.5 border-t border-black/5 pt-4 text-sm dark:border-white/10">
            <Row label="Subtotal" value={formatCurrency(order.itemsTotal)} />
            <Row label="Delivery fee" value={formatCurrency(order.deliveryFee)} />
            <Row label="Tax" value={formatCurrency(order.tax)} />
            <div className="flex justify-between pt-2 text-base font-bold">
              <span>Total</span>
              <span className="text-primary-600">{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Delivery estimate */}
        <div className="flex items-center gap-3 border-t border-black/5 px-6 py-4 dark:border-white/10">
          <Clock size={20} className="text-primary-500" />
          <div>
            <p className="text-sm font-semibold">Estimated delivery</p>
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              by {order.estimatedDeliveryAt ? formatTime(order.estimatedDeliveryAt) : '~40 min'} ·{' '}
              {order.deliveryAddress.street}, {order.deliveryAddress.city}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link to={`/orders/${order._id}/track`} className="btn-primary flex-1 py-3">
          <Truck size={18} /> Track your order
        </Link>
        <Link to="/dishes" className="btn-secondary flex-1 py-3">
          Order more food
        </Link>
      </div>
    </div>
  );
};

const Row = ({ label, value }) => (
  <div className="flex justify-between text-charcoal/60 dark:text-cream/60">
    <span>{label}</span>
    <span className="text-charcoal dark:text-cream">{value}</span>
  </div>
);

export default OrderConfirmation;
