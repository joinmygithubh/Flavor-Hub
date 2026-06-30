import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Lock, X, CheckCircle2 } from 'lucide-react';
import Spinner from '../ui/Spinner.jsx';
import { formatCurrency } from '../../utils/format.js';

/**
 * Simulated payment widget that stands in for a real Stripe/Razorpay checkout in
 * test mode. It does NOT process real cards — it lets the user trigger a
 * "successful" or "failed" payment so the full online-payment flow is demoable.
 *
 * Props:
 *  - open, amount
 *  - onPay(): resolves the (mock) payment -> parent calls the gateway + verifies
 *  - onSimulateFailure(): trigger the failure path
 *  - onClose()
 *  - processing: parent-controlled loading flag
 */
const MockPaymentModal = ({ open, amount, onPay, onSimulateFailure, onClose, processing }) => {
  const [card] = useState('4242 4242 4242 4242'); // test card, display only

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!processing ? onClose : undefined}
            className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-2xl dark:bg-charcoal"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 font-display text-lg font-bold">
                <CreditCard size={20} className="text-primary-500" /> Secure Checkout
              </h3>
              <button onClick={onClose} disabled={processing} className="btn-ghost rounded-full disabled:opacity-40">
                <X size={18} />
              </button>
            </div>

            <div className="rounded-xl bg-primary-50 p-3 text-center text-xs text-primary-700 dark:bg-white/5 dark:text-primary-200">
              Test mode — no real charge. This simulates a payment gateway.
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="label">Card number</label>
                <input className="input" value={card} readOnly />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Expiry</label>
                  <input className="input" value="12 / 34" readOnly />
                </div>
                <div>
                  <label className="label">CVC</label>
                  <input className="input" value="123" readOnly />
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-xl bg-black/5 px-4 py-3 dark:bg-white/5">
              <span className="text-sm text-charcoal/60 dark:text-cream/60">Amount payable</span>
              <span className="font-display text-xl font-bold">{formatCurrency(amount)}</span>
            </div>

            <button onClick={onPay} disabled={processing} className="btn-primary mt-4 w-full py-3">
              {processing ? <Spinner /> : <CheckCircle2 size={18} />}
              {processing ? 'Processing...' : `Pay ${formatCurrency(amount)}`}
            </button>
            <button
              onClick={onSimulateFailure}
              disabled={processing}
              className="mt-2 w-full text-center text-xs text-charcoal/45 hover:text-red-500 dark:text-cream/45"
            >
              Simulate a failed payment
            </button>

            <p className="mt-3 flex items-center justify-center gap-1 text-xs text-charcoal/40 dark:text-cream/40">
              <Lock size={12} /> Payments are encrypted &amp; secure
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MockPaymentModal;
