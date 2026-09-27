import { Star } from 'lucide-react';

export function StarRating({ rating, max = 5, size = 16 }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
        />
      ))}
      {rating > 0 && <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>}
    </div>
  );
}
