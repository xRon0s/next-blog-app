"use client";
import { useState, useCallback } from "react";
import type { CollectionItem } from "@/app/_types/CollectionItem";
import CollectionItemCard from "@/app/_components/CollectionItemCard";
import SearchBar from "@/app/_components/SearchBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faBoxOpen } from "@fortawesome/free-solid-svg-icons";

const Page: React.FC = () => {
  const [items, setItems] = useState<CollectionItem[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(
    async (params: { search: string; tagIds: string[]; status: string }) => {
      try {
        setIsSearching(true);
        const query = new URLSearchParams();
        if (params.search) query.set("search", params.search);
        if (params.tagIds.length > 0)
          query.set("tags", params.tagIds.join(","));
        if (params.status) query.set("status", params.status);

        const res = await fetch(`/api/collections?${query.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("データの取得に失敗しました");
        const data = await res.json();
        setItems(data as CollectionItem[]);
        setFetchError(null);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました"
        );
      } finally {
        setIsSearching(false);
      }
    },
    []
  );

  if (fetchError) {
    return <div className="text-red-500">{fetchError}</div>;
  }

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">
        <FontAwesomeIcon icon={faBoxOpen} className="mr-2" />
        コレクション
      </div>

      <SearchBar onSearch={handleSearch} />

      {isSearching && (
        <div className="py-8 text-center text-gray-500">
          <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
          検索中...
        </div>
      )}

      {!isSearching && items !== null && items.length === 0 && (
        <div className="py-8 text-center text-gray-400">
          アイテムが見つかりませんでした
        </div>
      )}

      {!isSearching && items !== null && items.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <CollectionItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
