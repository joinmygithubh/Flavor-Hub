/** Formatting helpers shared across the UI. */

export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

export const formatDate = (date) =>
  new Date(date).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

export const formatTime = (date) =>
  new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
