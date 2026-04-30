import { Star } from 'lucide-react';

export default function StarRating({ rating, setRating, readonly = false, size = 20 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => setRating?.(star)}
          className={`transition-all duration-150 ${!readonly ? 'cursor-pointer hover:scale-110' : ''}`}
        >
          <Star
            size={size}
            className={
              star <= (rating || 0)
                ? 'fill-amber-400 text-amber-400'
                : 'fill-none text-dark-300 dark:text-dark-600'
            }
          />
        </button>
      ))}
    </div>
  );
}
