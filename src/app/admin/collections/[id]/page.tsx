"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/app/_hooks/useAuth";
import StarRating from "@/app/_components/StarRating";
import ImageUploader from "@/app/_components/ImageUploader";
import type { CollectionItem, CollectionItemStatus } from "@/app/_types/CollectionItem";
import { statusLabels } from "@/app/_types/CollectionItem";

type TagApiResponse = {
  id: string;
  name: string;
  color: string;
};

type SelectableTag = {
  id: string;
  name: string;
  color: string;
  isSelect: boolean;
};

const Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<CollectionItemStatus>("owned");
  const [checkableTags, setCheckableTags] = useState<SelectableTag[] | null>(
    null
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // タグとアイテムを並行取得
        const [tagsRes, itemRes] = await Promise.all([
          fetch("/api/tags", { method: "GET", cache: "no-store" }),
          fetch(`/api/collections/${id}`, { method: "GET", cache: "no-store" }),
        ]);

        if (!tagsRes.ok) throw new Error("タグの取得に失敗しました");
        if (!itemRes.ok) throw new Error("アイテムの取得に失敗しました");

        const tagsData = (await tagsRes.json()) as TagApiResponse[];
        const itemData = (await itemRes.json()) as CollectionItem;

        // フォームにデータをセット
        setName(itemData.name);
        setDescription(itemData.description);
        setImageURL(itemData.imageURL);
        setRating(itemData.rating);
        setStatus(itemData.status);

        // タグの選択状態を設定
        const itemTagIds = itemData.tags.map((t) => t.id);
        setCheckableTags(
          tagsData.map((tag) => ({
            id: tag.id,
            name: tag.name,
            color: tag.color,
            isSelect: itemTagIds.includes(tag.id),
          }))
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? error.message
            : `予期せぬエラーが発生しました`;
        setFetchErrorMsg(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const switchTagState = (tagId: string) => {
    if (!checkableTags) return;
    setCheckableTags(
      checkableTags.map((tag) =>
        tag.id === tagId ? { ...tag, isSelect: !tag.isSelect } : tag
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      window.alert("トークンが取得できません。");
      return;
    }
    setIsSubmitting(true);

    try {
      const requestBody = {
        name,
        description,
        imageURL,
        rating,
        status,
        tagIds: checkableTags
          ? checkableTags.filter((t) => t.isSelect).map((t) => t.id)
          : [],
      };
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      setIsSubmitting(false);
      router.push(`/collections/${id}`);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `更新に失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("このアイテムを削除しますか？")) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      router.push("/admin/collections");
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました"
      );
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (fetchErrorMsg) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  const statuses: { value: CollectionItemStatus; label: string }[] = [
    { value: "owned", label: statusLabels.owned },
    { value: "wishlist", label: statusLabels.wishlist },
    { value: "sold", label: statusLabels.sold },
  ];

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">アイテムの編集</div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="text-gray-500">処理中...</div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={twMerge("space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-1">
          <label htmlFor="name" className="block font-bold">
            アイテム名
          </label>
          <input
            type="text"
            id="name"
            className="w-full rounded-md border-2 px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="アイテム名を入力"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="description" className="block font-bold">
            説明
          </label>
          <textarea
            id="description"
            className="h-32 w-full rounded-md border-2 px-2 py-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="アイテムの説明を入力"
            required
          />
        </div>

        <ImageUploader imageURL={imageURL} onImageChange={setImageURL} />

        <div className="space-y-1">
          <div className="font-bold">評価</div>
          <StarRating rating={rating} onChange={setRating} />
        </div>

        <div className="space-y-1">
          <div className="font-bold">ステータス</div>
          <div className="flex gap-3">
            {statuses.map((s) => (
              <label key={s.value} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="status"
                  value={s.value}
                  checked={status === s.value}
                  onChange={(e) =>
                    setStatus(e.target.value as CollectionItemStatus)
                  }
                  className="cursor-pointer"
                />
                <span className="cursor-pointer text-sm">{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="font-bold">タグ</div>
          <div className="flex flex-wrap gap-x-3.5">
            {checkableTags && checkableTags.length > 0 ? (
              checkableTags.map((t) => (
                <label key={t.id} className="flex space-x-1">
                  <input
                    type="checkbox"
                    checked={t.isSelect}
                    className="mt-0.5 cursor-pointer"
                    onChange={() => switchTagState(t.id)}
                  />
                  <span className="cursor-pointer">{t.name}</span>
                </label>
              ))
            ) : (
              <div className="text-sm text-slate-400">
                タグがありません。
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-red-500 text-white hover:bg-red-600"
            )}
          >
            削除
          </button>
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed"
            )}
            disabled={isSubmitting}
          >
            更新
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;
