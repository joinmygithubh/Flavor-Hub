import { motion } from 'framer-motion';

/** Friendly empty/illustration state with an optional call to action. */
const EmptyState = ({ icon: Icon, title, message, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-white/60 px-6 py-16 text-center dark:border-white/10 dark:bg-white/5"
  >
    {Icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 text-primary-500 dark:bg-white/10">
        <Icon size={30} />
      </div>
    )}
    <h3 className="font-display text-lg font-semibold text-charcoal dark:text-cream">{title}</h3>
    {message && <p className="mt-1 max-w-sm text-sm text-charcoal/60 dark:text-cream/60">{message}</p>}
    {action && <div className="mt-5">{action}</div>}
  </motion.div>
);

export default EmptyState;
