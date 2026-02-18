"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faPlus,
  faTrash,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import type { CollectionItem } from "@/app/_types/CollectionItem";
import { statusLabels } from "@/app/_types/CollectionItem";
import { useAuth } from "@/app/_hooks/useAuth";

const Page: React.FC = () => {
  const [items, setItems] = useState<CollectionItem[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/collections", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("データの取得に失敗しました");
      const data = await res.json();
      setItems(data as CollectionItem[]);
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`「${name}」を削除しますか？`)) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      fetchItems(); // 一覧を再取得
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  };

  if (fetchError) {
    return <div className="text-red-500">{fetchError}</div>;
  }

  if (!items) {
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
        <div className="text-2xl font-bold">コレクション管理</div>
        <Link
          href="/admin/collections/new"
          className={twMerge(
            "rounded-md px-4 py-2 text-sm font-bold",
            "bg-indigo-500 text-white hover:bg-indigo-600"
          )}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          新規追加
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          アイテムがまだありません
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
            >
              <div className="flex items-center gap-3">
                {item.imageURL && (
                  <img
                    src={item.imageURL}
                    alt={item.name}
                    className="h-12 w-12 rounded object-cover"
                  />
                )}
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{statusLabels[item.status]}</span>
                    <span>
                      {item.tags.map((t) => t.name).join(", ")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/collections/${item.id}`}
                  className="rounded p-2 text-indigo-500 hover:bg-indigo-50"
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </Link>
                <button
                  onClick={() => handleDelete(item.id, item.name)}
                  className="rounded p-2 text-red-500 hover:bg-red-50"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
