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
import type { Tag } from "@/app/_types/Tag";
import { useAuth } from "@/app/_hooks/useAuth";

const Page: React.FC = () => {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { token } = useAuth();

  const fetchTags = async () => {
    try {
      const res = await fetch("/api/tags", {
        method: "GET",
        cache: "no-store",
      });
      if (!res.ok) throw new Error("タグの取得に失敗しました");
      const data = await res.json();
      setTags(data as Tag[]);
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`タグ「${name}」を削除しますか？`)) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      fetchTags();
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  };

  if (fetchError) {
    return <div className="text-red-500">{fetchError}</div>;
  }

  if (!tags) {
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
        <div className="text-2xl font-bold">タグ管理</div>
        <Link
          href="/admin/tags/new"
          className={twMerge(
            "rounded-md px-4 py-2 text-sm font-bold",
            "bg-indigo-500 text-white hover:bg-indigo-600"
          )}
        >
          <FontAwesomeIcon icon={faPlus} className="mr-1" />
          新規追加
        </Link>
      </div>

      {tags.length === 0 ? (
        <div className="py-8 text-center text-gray-400">
          タグがまだありません
        </div>
      ) : (
        <div className="space-y-2">
          {tags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 p-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className="h-6 w-6 rounded-full border"
                  style={{ backgroundColor: tag.color }}
                />
                <span className="font-bold">{tag.name}</span>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/tags/${tag.id}`}
                  className="rounded p-2 text-indigo-500 hover:bg-indigo-50"
                >
                  <FontAwesomeIcon icon={faPenToSquare} />
                </Link>
                <button
                  onClick={() => handleDelete(tag.id, tag.name)}
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
