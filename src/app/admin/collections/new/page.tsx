"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/app/_hooks/useAuth";
import StarRating from "@/app/_components/StarRating";
import type { CollectionItemStatus } from "@/app/_types/CollectionItem";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageURL, setImageURL] = useState("");
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<CollectionItemStatus>("owned");

  const { token } = useAuth();
  const router = useRouter();

  const [checkableTags, setCheckableTags] = useState<SelectableTag[] | null>(
    null
  );

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("/api/tags", {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) {
          setCheckableTags(null);
          throw new Error(`${res.status}: ${res.statusText}`);
        }
        const apiResBody = (await res.json()) as TagApiResponse[];
        setCheckableTags(
          apiResBody.map((body) => ({
            id: body.id,
            name: body.name,
            color: body.color,
            isSelect: false,
          }))
        );
      } catch (error) {
        const errorMsg =
          error instanceof Error
            ? `タグの取得に失敗しました: ${error.message}`
            : `予期せぬエラーが発生しました ${error}`;
        console.error(errorMsg);
        setFetchErrorMsg(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTags();
  }, []);

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
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      const itemResponse = await res.json();
      setIsSubmitting(false);
      router.push(`/collections/${itemResponse.id}`);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `アイテムの作成に失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
      setIsSubmitting(false);
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

  if (!checkableTags) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  const statuses: { value: CollectionItemStatus; label: string }[] = [
    { value: "owned", label: statusLabels.owned },
    { value: "wishlist", label: statusLabels.wishlist },
    { value: "sold", label: statusLabels.sold },
  ];

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">アイテムの新規追加</div>

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

        <div className="space-y-1">
          <label htmlFor="imageURL" className="block font-bold">
            画像URL
          </label>
          <input
            type="url"
            id="imageURL"
            className="w-full rounded-md border-2 px-2 py-1"
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            placeholder="画像のURLを入力"
            required
          />
        </div>

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
            {checkableTags.length > 0 ? (
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
                タグがありません。先にタグを作成してください。
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed"
            )}
            disabled={isSubmitting}
          >
            アイテムを追加
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;
