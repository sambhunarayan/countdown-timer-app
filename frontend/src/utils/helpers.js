/**
 * Utility: format helpers used across the frontend.
 */

/**
 * Format a date for display in the admin dashboard.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Truncate a string to `max` chars with ellipsis.
 */
export function truncate(str, max = 40) {
  if (!str || str.length <= max) return str;
  return str.slice(0, max) + '…';
}
