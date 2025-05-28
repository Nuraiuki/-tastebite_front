import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ rating, onRate }) {
  const [hovered, setHovered] = useState(null);
  const stars = Array(5).fill(0);

  return (
    <div className="flex gap-1">
      {stars.map((_, i) => {
        const isFilled = i < (hovered ?? rating);
        return (
          <button
            key={i}
            onClick={() => onRate(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(null)}
            className="transition-transform transform hover:scale-110"
          >
            <Star
              fill={isFilled ? "#facc15" : "none"}
              color={isFilled ? "#facc15" : "#d1d5db"}
              className="w-6 h-6"
            />
          </button>
        );
      })}
    </div>
  );
}
