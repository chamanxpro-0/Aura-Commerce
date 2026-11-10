"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  size = 14,
  className,
  showValue = false,
  count,
}: {
  value: number;
  size?: number;
  className?: string;
  showValue?: boolean;
  count?: number;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full;
          const isHalf = i === full && half;
          return (
            <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
              <Star
                className="absolute inset-0 text-muted-foreground/30"
                style={{ width: size, height: size }}
                strokeWidth={1.5}
              />
              {(filled || isHalf) && (
                <Star
                  className="absolute inset-0 fill-gold text-gold"
                  style={{ width: size, height: size, clipPath: isHalf ? "inset(0 50% 0 0)" : undefined }}
                  strokeWidth={1.5}
                />
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-foreground/80">
          {value.toFixed(1)}
          {typeof count === "number" && (
            <span className="text-muted-foreground"> ({count})</span>
          )}
        </span>
      )}
    </div>
  );
}
