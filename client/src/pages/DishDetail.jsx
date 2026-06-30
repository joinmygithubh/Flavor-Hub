import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, ChevronLeft, Star, ShoppingCart, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import SafeImage from '../components/ui/SafeImage.jsx';
import Rating from '../components/ui/Rating.jsx';
import VegBadge from '../components/ui/VegBadge.jsx';
import QuantityStepper from '../components/ui/QuantityStepper.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { DetailSkeleton } from '../components/ui/Skeletons.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { dishService } from '../api/dishService.js';
import { useCartStore } from '../store/cartStore.js';
import { useUIStore } from '../store/uiStore.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatCurrency, formatDate } from '../utils/format.js';

const DishDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const [dish, setDish] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Customization + quantity selections.
  const [spiceLevel, setSpiceLevel] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [quantity, setQuantity] = useState(1);

  // Review form.
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadDish = async () => {
    setLoading(true);
    try {
      const data = await dishService.getDish(id);
      setDish(data);
      setSpiceLevel(data.spiceLevels?.[0] || '');
    } catch (err) {
      if (err.status === 404) setNotFound(true);
      else toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDish();
    // Reset selections when navigating between dishes.
    setSelectedAddOns([]);
    setQuantity(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const toggleAddOn = (addOn) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a.name === addOn.name)
        ? prev.filter((a) => a.name !== addOn.name)
        : [...prev, { name: addOn.name, price: addOn.price }]
    );
  };

  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);
  const lineTotal = dish ? (dish.price + addOnsTotal) * quantity : 0;

  const handleAddToCart = () => {
    addItem(dish, { quantity, spiceLevel, addOns: selectedAddOns });
    toast.success(`${dish.name} added to cart`);
    openCart();
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate(`/login?redirect=/dishes/${id}`);
      return;
    }
    setSubmittingReview(true);
    try {
      const updated = await dishService.addReview(id, { rating: reviewRating, comment: reviewComment });
      setDish(updated);
      setReviewComment('');
      toast.success('Thanks for your review!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <DetailSkeleton />
      </div>
    );
  }

  if (notFound || !dish) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Dish not found"
          message="This dish may have been removed or the link is incorrect."
          action={<Link to="/dishes" className="btn-primary">Back to menu</Link>}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-4 -ml-2">
        <ChevronLeft size={18} /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-3xl shadow-card"
        >
          <SafeImage src={dish.image} alt={dish.name} aspect="aspect-[4/3]" />
        </motion.div>

        {/* Info + customization */}
        <div>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-600">
              {dish.cuisine}
            </span>
            <VegBadge isVeg={dish.isVeg} showLabel />
          </div>

          <h1 className="mt-3 font-display text-3xl font-bold">{dish.name}</h1>

          <div className="mt-2 flex items-center gap-4 text-sm text-charcoal/60 dark:text-cream/60">
            <Rating value={dish.rating} count={dish.reviews?.length} size="md" />
            <span className="inline-flex items-center gap-1">
              <Clock size={15} /> {dish.prepTime} min
            </span>
          </div>

          <p className="mt-4 text-charcoal/70 dark:text-cream/70">{dish.description}</p>

          {/* Ingredients */}
          {dish.ingredients?.length > 0 && (
            <div className="mt-5">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-charcoal/50 dark:text-cream/50">
                Ingredients
              </h3>
              <div className="flex flex-wrap gap-2">
                {dish.ingredients.map((ing) => (
                  <span key={ing} className="rounded-full bg-black/5 px-3 py-1 text-sm dark:bg-white/10">
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spice level */}
          {dish.spiceLevels?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
                <Flame size={15} className="text-primary-500" /> Spice level
              </h3>
              <div className="flex flex-wrap gap-2">
                {dish.spiceLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setSpiceLevel(level)}
                    className={clsx(
                      'rounded-full border px-4 py-1.5 text-sm font-medium transition',
                      spiceLevel === level
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-black/10 hover:border-primary-300 dark:border-white/15'
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add-ons */}
          {dish.addOns?.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold">Add-ons</h3>
              <div className="space-y-2">
                {dish.addOns.map((addOn) => {
                  const checked = !!selectedAddOns.find((a) => a.name === addOn.name);
                  return (
                    <label
                      key={addOn.name}
                      className={clsx(
                        'flex cursor-pointer items-center justify-between rounded-xl border px-4 py-2.5 transition',
                        checked ? 'border-primary-400 bg-primary-50 dark:bg-white/10' : 'border-black/10 dark:border-white/15'
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAddOn(addOn)}
                          className="h-4 w-4 accent-primary-500"
                        />
                        {addOn.name}
                      </span>
                      <span className="text-sm font-medium text-charcoal/70 dark:text-cream/70">
                        + {formatCurrency(addOn.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add to cart bar */}
          <div className="mt-8 flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <QuantityStepper value={quantity} onChange={setQuantity} />
            <button onClick={handleAddToCart} className="btn-primary flex-1 py-3">
              <ShoppingCart size={18} /> Add to cart · {formatCurrency(lineTotal)}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-14">
        <h2 className="font-display text-2xl font-bold">
          Reviews {dish.reviews?.length > 0 && <span className="text-charcoal/40">({dish.reviews.length})</span>}
        </h2>

        {/* Review form */}
        <form onSubmit={submitReview} className="card mt-5 space-y-3 p-5">
          <p className="font-semibold">Leave a review</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setReviewRating(n)} aria-label={`${n} stars`}>
                <Star
                  size={24}
                  className={n <= reviewRating ? 'fill-gold text-gold' : 'text-charcoal/20'}
                />
              </button>
            ))}
          </div>
          <textarea
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share what you thought about this dish..."
            rows={3}
            className="input"
          />
          <button type="submit" disabled={submittingReview} className="btn-primary">
            {submittingReview && <Spinner />} Submit review
          </button>
        </form>

        {/* Review list */}
        <div className="mt-6 space-y-4">
          {dish.reviews?.length === 0 ? (
            <p className="text-charcoal/50 dark:text-cream/50">No reviews yet — be the first!</p>
          ) : (
            dish.reviews
              .slice()
              .reverse()
              .map((r, i) => (
                <div key={i} className="card p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{r.name || 'Anonymous'}</p>
                    <Rating value={r.rating} />
                  </div>
                  {r.comment && <p className="mt-1.5 text-sm text-charcoal/70 dark:text-cream/70">{r.comment}</p>}
                  {r.createdAt && (
                    <p className="mt-1 text-xs text-charcoal/40 dark:text-cream/40">{formatDate(r.createdAt)}</p>
                  )}
                </div>
              ))
          )}
        </div>
      </section>
    </div>
  );
};

export default DishDetail;
