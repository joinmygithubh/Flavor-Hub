import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Wallet, CreditCard, ShoppingBag, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import SafeImage from '../components/ui/SafeImage.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import MockPaymentModal from '../components/cart/MockPaymentModal.jsx';
import { useCartStore, unitPrice } from '../store/cartStore.js';
import { useAuth } from '../context/AuthContext.jsx';
import { orderService } from '../api/orderService.js';
import { paymentService } from '../api/paymentService.js';
import { computeTotals } from '../utils/orderTotals.js';
import { formatCurrency } from '../utils/format.js';

const EMPTY_ADDRESS = { street: '', city: '', state: '', zip: '', phone: '' };

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, toOrderItems, clearCart } = useCartStore();

  const [address, setAddress] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [placing, setPlacing] = useState(false);

  // Online-payment modal state.
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paySession, setPaySession] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  const totals = useMemo(() => computeTotals(items), [items]);

  // Prefill with the user's first saved address, if any.
  useEffect(() => {
    if (user?.addresses?.length) {
      const a = user.addresses[0];
      setAddress({
        street: a.street || '',
        city: a.city || '',
        state: a.state || '',
        zip: a.zip || '',
        phone: a.phone || '',
      });
    }
  }, [user]);

  const onAddressChange = (e) => setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));

  const validateAddress = () => {
    const next = {};
    if (address.street.trim().length < 3) next.street = 'Street is required';
    if (address.city.trim().length < 2) next.city = 'City is required';
    if (address.state.trim().length < 2) next.state = 'State is required';
    if (address.zip.trim().length < 3) next.zip = 'ZIP is required';
    if (address.phone.trim().length < 7) next.phone = 'Valid phone required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // Creates the order on the server and routes to the confirmation page.
  const finalizeOrder = async (payment) => {
    const order = await orderService.createOrder({
      items: toOrderItems(),
      paymentMethod,
      deliveryAddress: address,
      ...(payment ? { payment } : {}),
    });
    clearCart();
    navigate(`/orders/${order._id}/confirmation`, { replace: true });
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) {
      toast.error('Please complete your delivery address');
      return;
    }

    // COD: confirm immediately.
    if (paymentMethod === 'COD') {
      setPlacing(true);
      try {
        await finalizeOrder();
        toast.success('Order placed! Pay with cash on delivery.');
      } catch (err) {
        toast.error(err.message || 'Could not place order');
      } finally {
        setPlacing(false);
      }
      return;
    }

    // Online: create a payment session, then open the (mock) gateway.
    setPlacing(true);
    try {
      const session = await paymentService.createSession(toOrderItems());
      setPaySession(session);
      setPayModalOpen(true);
    } catch (err) {
      toast.error(err.message || 'Could not start payment');
    } finally {
      setPlacing(false);
    }
  };

  // Mock gateway success path: pay -> verify -> create order.
  const handlePay = async () => {
    setProcessingPayment(true);
    try {
      const { paymentId, signature } = await paymentService.mockPay(paySession.orderId);
      const verification = await paymentService.verify({
        orderId: paySession.orderId,
        paymentId,
        signature,
      });
      if (!verification.verified) throw new Error('Payment could not be verified');

      await finalizeOrder({ orderId: paySession.orderId, paymentId, signature });
      toast.success('Payment successful — order confirmed!');
      setPayModalOpen(false);
    } catch (err) {
      // Failure does NOT create a confirmed order; keep the modal open for retry.
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Mock gateway failure path.
  const handleSimulateFailure = async () => {
    setProcessingPayment(true);
    try {
      await paymentService.mockPay(paySession.orderId, { fail: true });
      toast.error('Payment failed or was cancelled. You can retry.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Add some dishes before heading to checkout."
          action={<button onClick={() => navigate('/dishes')} className="btn-primary">Browse menu</button>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Left: address + payment */}
        <div className="space-y-8">
          {/* Delivery address */}
          <section className="card p-6">
            <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
              <MapPin size={18} className="text-primary-500" /> Delivery address
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field className="sm:col-span-2" label="Street address" name="street" value={address.street} onChange={onAddressChange} error={errors.street} placeholder="123 Flavor Street, Apt 4" />
              <Field label="City" name="city" value={address.city} onChange={onAddressChange} error={errors.city} placeholder="Metropolis" />
              <Field label="State" name="state" value={address.state} onChange={onAddressChange} error={errors.state} placeholder="NY" />
              <Field label="ZIP / Postal code" name="zip" value={address.zip} onChange={onAddressChange} error={errors.zip} placeholder="10001" />
              <Field label="Phone" name="phone" value={address.phone} onChange={onAddressChange} error={errors.phone} placeholder="+1 555 123 4567" />
            </div>
          </section>

          {/* Payment method */}
          <section className="card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Payment method</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <PaymentOption
                active={paymentMethod === 'COD'}
                onClick={() => setPaymentMethod('COD')}
                icon={Wallet}
                title="Cash on Delivery"
                subtitle="Pay with cash when it arrives"
              />
              <PaymentOption
                active={paymentMethod === 'Online'}
                onClick={() => setPaymentMethod('Online')}
                icon={CreditCard}
                title="Pay Online"
                subtitle="Card / UPI via secure gateway"
              />
            </div>
          </section>
        </div>

        {/* Right: order summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">Order summary</h2>
            <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                    <SafeImage src={item.image} alt={item.name} aspect="aspect-square" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold leading-tight">{item.name}</p>
                    <p className="text-xs text-charcoal/50 dark:text-cream/50">Qty {item.quantity}</p>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(unitPrice(item) * item.quantity)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 space-y-2 border-t border-black/5 pt-4 text-sm dark:border-white/10">
              <Row label="Subtotal" value={formatCurrency(totals.itemsTotal)} />
              <Row label="Delivery fee" value={formatCurrency(totals.deliveryFee)} />
              <Row label="Tax (5%)" value={formatCurrency(totals.tax)} />
              <div className="flex justify-between border-t border-black/5 pt-3 dark:border-white/10">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold text-primary-600">
                  {formatCurrency(totals.totalAmount)}
                </span>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary mt-5 w-full py-3">
              {placing && <Spinner />}
              {paymentMethod === 'COD' ? 'Place order' : 'Pay & place order'}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-charcoal/45 dark:text-cream/45">
              <ShieldCheck size={13} /> Your details are safe with us.
            </p>
          </div>
        </aside>
      </div>

      <MockPaymentModal
        open={payModalOpen}
        amount={totals.totalAmount}
        onPay={handlePay}
        onSimulateFailure={handleSimulateFailure}
        onClose={() => !processingPayment && setPayModalOpen(false)}
        processing={processingPayment}
      />
    </div>
  );
};

const Field = ({ label, error, className = '', ...rest }) => (
  <div className={className}>
    <label className="label">{label}</label>
    <input className="input" {...rest} />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between text-charcoal/60 dark:text-cream/60">
    <span>{label}</span>
    <span className="text-charcoal dark:text-cream">{value}</span>
  </div>
);

const PaymentOption = ({ active, onClick, icon: Icon, title, subtitle }) => (
  <button
    type="button"
    onClick={onClick}
    className={clsx(
      'flex items-start gap-3 rounded-2xl border p-4 text-left transition',
      active
        ? 'border-primary-500 bg-primary-50 dark:bg-white/10'
        : 'border-black/10 hover:border-primary-300 dark:border-white/15'
    )}
  >
    <span className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', active ? 'bg-primary-500 text-white' : 'bg-black/5 text-charcoal/60 dark:bg-white/10 dark:text-cream/60')}>
      <Icon size={18} />
    </span>
    <span>
      <span className="block font-semibold">{title}</span>
      <span className="block text-xs text-charcoal/55 dark:text-cream/55">{subtitle}</span>
    </span>
  </button>
);

export default Checkout;
