import { cn } from '../../lib/utils';

export default function Card({ children, className, hover = false, glass = false, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 transition-all duration-300',
        glass
          ? 'glass'
          : 'bg-white dark:bg-dark-800 border border-dark-100 dark:border-dark-700',
        hover && 'hover:shadow-xl hover:-translate-y-1 cursor-pointer hover:border-primary-200 dark:hover:border-primary-800',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
