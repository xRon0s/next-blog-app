"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import type { CollectionItem } from "@/app/_types/CollectionItem";
import { statusLabels, CollectionItemStatus } from "@/app/_types/CollectionItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faArrowLeft,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import StarRating from "@/app/_components/StarRating";
import dayjs from "dayjs";
import Link from "next/link";
import { useAuth } from "@/app/_hooks/useAuth";

const statusColorMap: Record<CollectionItemStatus, string> = {
  owned: "bg-green-100 text-green-700 border-green-300",
  wishlist: "bg-yellow-100 text-yellow-700 border-yellow-300",
  sold: "bg-gray-100 text-gray-500 border-gray-300",
};

const Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();
  const [item, setItem] = useState<CollectionItem | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await fetch(`/api/collections/${id}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("アイテムの取得に失敗しました");
        const data = await res.json();
        setItem(data as CollectionItem);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました"
        );
      }
    };
    fetchItem();
  }, [id]);

  if (fetchError) {
    return <div className="text-red-500">{fetchError}</div>;
  }

  if (!item) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main>
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => router.push("/collections")}
          className="text-sm text-indigo-500 hover:underline"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-1" />
          一覧に戻る
        </button>
        {session && (
          <Link
            href={`/admin/collections/${item.id}`}
            className="text-sm text-indigo-500 hover:underline"
          >
            <FontAwesomeIcon icon={faPenToSquare} className="mr-1" />
            編集
          </Link>
        )}
      </div>

      {item.imageURL && (
        <div className="mb-4 overflow-hidden rounded-lg">
          <img
            src={item.imageURL}
            alt={item.name}
            className="w-full object-cover"
          />
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className={twMerge(
              "rounded-full border px-3 py-0.5 text-xs font-bold",
              statusColorMap[item.status]
            )}
          >
            {statusLabels[item.status]}
          </span>
          <span className="text-sm text-slate-400">
            {dayjs(item.createdAt).format("YYYY-MM-DD")}
          </span>
        </div>

        <h1 className="text-2xl font-bold">{item.name}</h1>

        <StarRating rating={item.rating} readonly />

        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full px-3 py-1 text-xs font-semibold text-white"
              style={{ backgroundColor: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>

        <div className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed">
          {item.description}
        </div>
      </div>
    </main>
  );
};

export default Page;
