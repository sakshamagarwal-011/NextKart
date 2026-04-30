import { cn } from '../../lib/utils';

const statusStyles = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  accepted: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  preparing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  open: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  closed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  'in-stock': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'out-of-stock': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export default function Badge({ status, children, className, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold',
        statusStyles[status] || 'bg-dark-100 text-dark-600 dark:bg-dark-700 dark:text-dark-300',
        className
      )}
    >
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          status === 'open' || status === 'delivered' || status === 'paid' || status === 'in-stock'
            ? 'bg-emerald-500'
            : status === 'pending'
            ? 'bg-amber-500'
            : 'bg-red-500'
        )} />
      )}
      {children}
    </span>
  );
}
