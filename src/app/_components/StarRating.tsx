"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Props = {
  rating: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
};

const StarRating: React.FC<Props> = ({
  rating,
  onChange,
  readonly = false,
}) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star === rating ? 0 : star)}
          className={twMerge(
            "text-lg transition-colors",
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110",
            star <= rating ? "text-yellow-400" : "text-slate-200"
          )}
        >
          <FontAwesomeIcon icon={faStarSolid} />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
