"use client";
import { useState, useEffect, useCallback } from "react";
import type { Tag } from "@/app/_types/Tag";
import type { CollectionItemStatus } from "@/app/_types/CollectionItem";
import { statusLabels } from "@/app/_types/CollectionItem";
import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faXmark,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

type Props = {
  onSearch: (params: {
    search: string;
    tagIds: string[];
    status: string;
  }) => void;
};

const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [tags, setTags] = useState<Tag[] | null>(null);

  // タグの取得
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch("/api/tags", {
          method: "GET",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setTags(data as Tag[]);
        }
      } catch (e) {
        console.error("タグの取得に失敗:", e);
      }
    };
    fetchTags();
  }, []);

  const handleSearch = useCallback(() => {
    onSearch({
      search: searchText,
      tagIds: selectedTagIds,
      status: selectedStatus,
    });
  }, [searchText, selectedTagIds, selectedStatus, onSearch]);

  // 入力変更時に自動検索
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);
    return () => clearTimeout(timer);
  }, [handleSearch]);

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const clearAll = () => {
    setSearchText("");
    setSelectedTagIds([]);
    setSelectedStatus("");
  };

  const statuses: { value: CollectionItemStatus | ""; label: string }[] = [
    { value: "", label: "すべて" },
    { value: "owned", label: statusLabels.owned },
    { value: "wishlist", label: statusLabels.wishlist },
    { value: "sold", label: statusLabels.sold },
  ];

  return (
    <div className="mb-4 space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      {/* テキスト検索 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="アイテムを検索..."
            className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none"
          />
        </div>
        {(searchText || selectedTagIds.length > 0 || selectedStatus) && (
          <button
            onClick={clearAll}
            className="rounded-md border border-slate-300 p-2 text-slate-500 hover:bg-slate-50"
            title="条件をクリア"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}
      </div>

      {/* ステータスフィルタ */}
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => setSelectedStatus(s.value)}
            className={twMerge(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
              selectedStatus === s.value
                ? "border-indigo-500 bg-indigo-500 text-white"
                : "border-slate-300 text-slate-600 hover:bg-slate-50"
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* タグフィルタ */}
      {tags === null ? (
        <div className="text-sm text-slate-400">
          <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
          タグ読込中...
        </div>
      ) : tags.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={twMerge(
                "rounded-full px-2.5 py-1 text-xs font-semibold transition-all",
                selectedTagIds.includes(tag.id)
                  ? "text-white shadow-sm"
                  : "border border-slate-200 text-slate-500 hover:border-slate-400"
              )}
              style={
                selectedTagIds.includes(tag.id)
                  ? { backgroundColor: tag.color }
                  : {}
              }
            >
              {tag.name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default SearchBar;
