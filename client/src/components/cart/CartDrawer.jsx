import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Trash2 } from 'lucide-react';
import SafeImage from '../ui/SafeImage.jsx';
import QuantityStepper from '../ui/QuantityStepper.jsx';
import EmptyState from '../ui/EmptyState.jsx';
import { useCartStore, unitPrice } from '../../store/cartStore.js';
import { useUIStore } from '../../store/uiStore.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatCurrency } from '../../utils/format.js';

/** Slide-in cart drawer with quantity controls, subtotal and checkout CTA. */
const CartDrawer = () => {
  const navigate = useNavigate();
  const { isCartOpen, closeCart } = useUIStore();
  const { items, updateQuantity, removeItem, clearCart, subtotal } = useCartStore();
  const { isAuthenticated } = useAuth();

  const goToCheckout = () => {
    closeCart();
    navigate(isAuthenticated ? '/checkout' : '/login?redirect=/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-charcoal/50 backdrop-blur-sm"
          />
          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-cream shadow-2xl dark:bg-charcoal"
          >
            <header className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/10">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <ShoppingBag size={20} className="text-primary-500" /> Your Cart
              </h2>
              <button onClick={closeCart} className="btn-ghost rounded-full" aria-label="Close cart">
                <X size={20} />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="Your cart is empty"
                  message="Browse our menu and add some delicious dishes to get started."
                />
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.key} className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                        <SafeImage src={item.image} alt={item.name} aspect="aspect-square" />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold leading-tight">{item.name}</p>
                            {item.spiceLevel && (
                              <p className="text-xs text-charcoal/50 dark:text-cream/50">Spice: {item.spiceLevel}</p>
                            )}
                            {item.addOns?.length > 0 && (
                              <p className="text-xs text-charcoal/50 dark:text-cream/50">
                                + {item.addOns.map((a) => a.name).join(', ')}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => removeItem(item.key)}
                            className="text-charcoal/40 hover:text-red-500"
                            aria-label="Remove item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <QuantityStepper
                            value={item.quantity}
                            onChange={(q) => updateQuantity(item.key, q)}
                          />
                          <span className="font-semibold">
                            {formatCurrency(unitPrice(item) * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="space-y-3 border-t border-black/5 px-5 py-4 dark:border-white/10">
                <button
                  onClick={clearCart}
                  className="text-xs font-medium text-charcoal/50 hover:text-red-500 dark:text-cream/50"
                >
                  Clear cart
                </button>
                <div className="flex items-center justify-between text-base">
                  <span className="text-charcoal/60 dark:text-cream/60">Subtotal</span>
                  <span className="font-display text-xl font-bold">{formatCurrency(subtotal())}</span>
                </div>
                <p className="text-xs text-charcoal/45 dark:text-cream/45">
                  Delivery fee &amp; taxes calculated at checkout.
                </p>
                <button onClick={goToCheckout} className="btn-primary w-full py-3">
                  Proceed to Checkout
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
