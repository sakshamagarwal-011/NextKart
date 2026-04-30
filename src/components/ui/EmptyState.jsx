import { ShoppingBag } from 'lucide-react';

export default function EmptyState({ icon: Icon = ShoppingBag, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="w-20 h-20 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-5">
        <Icon size={36} className="text-primary-500" />
      </div>
      <h3 className="text-lg font-bold text-dark-800 dark:text-dark-200 mb-2">{title}</h3>
      {description && (
        <p className="text-dark-500 text-sm max-w-sm mb-5">{description}</p>
      )}
      {action}
    </div>
  );
}
