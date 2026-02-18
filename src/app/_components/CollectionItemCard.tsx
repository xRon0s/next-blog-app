"use client";
import type { CollectionItem } from "@/app/_types/CollectionItem";
import { statusLabels, CollectionItemStatus } from "@/app/_types/CollectionItem";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";

type Props = {
  item: CollectionItem;
};

const statusColorMap: Record<CollectionItemStatus, string> = {
  owned: "bg-green-100 text-green-700 border-green-300",
  wishlist: "bg-yellow-100 text-yellow-700 border-yellow-300",
  sold: "bg-gray-100 text-gray-500 border-gray-300",
};

const CollectionItemCard: React.FC<Props> = ({ item }) => {
  const dtFmt = "YYYY-MM-DD";

  return (
    <Link href={`/collections/${item.id}`}>
      <div
        className={twMerge(
          "overflow-hidden rounded-lg border border-slate-300",
          "transition-shadow hover:shadow-md"
        )}
      >
        {item.imageURL && (
          <div className="aspect-square w-full overflow-hidden bg-slate-100">
            <img
              src={item.imageURL}
              alt={item.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        <div className="p-3">
          <div className="mb-1 flex items-center justify-between">
            <span
              className={twMerge(
                "rounded-full border px-2 py-0.5 text-xs font-bold",
                statusColorMap[item.status]
              )}
            >
              {statusLabels[item.status]}
            </span>
            <span className="text-xs text-slate-400">
              {dayjs(item.createdAt).format(dtFmt)}
            </span>
          </div>
          <div className="mb-1 text-base font-bold">{item.name}</div>

          {/* 評価 */}
          <div className="mb-2 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesomeIcon
                key={star}
                icon={faStarSolid}
                className={twMerge(
                  "text-xs",
                  star <= item.rating ? "text-yellow-400" : "text-slate-200"
                )}
              />
            ))}
          </div>

          {/* タグ */}
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
                style={{ backgroundColor: tag.color }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CollectionItemCard;
