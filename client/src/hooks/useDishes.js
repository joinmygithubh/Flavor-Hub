import { useCallback, useEffect, useState } from 'react';
import { dishService } from '../api/dishService.js';

/**
 * Encapsulates the dish-listing data fetch: builds query params from the active
 * filters, calls the API, and exposes loading/error/pagination state. Keeps the
 * listing page focused on presentation.
 */
export const useDishes = (filters) => {
  const [dishes, setDishes] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDishes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Strip empty values so we don't send blank query params.
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '' && v != null)
      );
      const res = await dishService.listDishes(params);
      setDishes(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err.message || 'Failed to load dishes');
      setDishes([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDishes();
  }, [fetchDishes]);

  return { dishes, meta, loading, error, refetch: fetchDishes };
};
