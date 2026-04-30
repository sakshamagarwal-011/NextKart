import { cn } from '../../lib/utils';
import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, className, ...props }, ref) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-dark-700 dark:text-dark-300">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none transition-all duration-200',
            'border-dark-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            'dark:bg-dark-800 dark:border-dark-700 dark:text-dark-100 dark:focus:border-primary-400',
            'placeholder:text-dark-400',
            Icon && 'pl-10',
            error && 'border-accent-400 focus:border-accent-400 focus:ring-accent-400/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-accent-500 mt-1">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
