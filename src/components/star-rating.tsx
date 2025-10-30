"use client";

import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  starCount?: number;
}

export function StarRating({ rating, onRatingChange, starCount = 5 }: StarRatingProps) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center space-x-1 mt-2">
      {[...Array(starCount)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            type="button"
            key={ratingValue}
            className="focus:outline-none"
            onClick={() => onRatingChange(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={cn(
                'h-8 w-8 transition-colors duration-200',
                ratingValue <= (hover || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-muted-foreground'
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
