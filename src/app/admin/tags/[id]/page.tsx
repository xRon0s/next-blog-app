"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/app/_hooks/useAuth";

const PRESET_COLORS = [
  "#6366f1",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#64748b",
];

const Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    const fetchTag = async () => {
      try {
        // タグ一覧から該当タグを取得
        const res = await fetch("/api/tags", {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) throw new Error("タグの取得に失敗しました");
        const tags = await res.json();
        const tag = tags.find((t: { id: string }) => t.id === id);
        if (tag) {
          setName(tag.name);
          setColor(tag.color);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTag();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      window.alert("トークンが取得できません。");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ name, color }),
      });
      if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
      setIsSubmitting(false);
      router.push("/admin/tags");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `タグの更新に失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      window.alert(errorMsg);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("このタグを削除しますか？")) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/admin/tags/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("削除に失敗しました");
      router.push("/admin/tags");
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

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">タグの編集</div>

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
            タグ名
          </label>
          <input
            type="text"
            id="name"
            className="w-full rounded-md border-2 px-2 py-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="タグ名を入力"
            required
          />
        </div>

        <div className="space-y-1">
          <div className="font-bold">色</div>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={twMerge(
                  "h-8 w-8 rounded-full border-2 transition-transform",
                  color === c
                    ? "scale-110 border-slate-800"
                    : "border-transparent hover:scale-105"
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-8 w-8 cursor-pointer"
            />
            <span className="text-sm text-slate-500">{color}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="font-bold">プレビュー</div>
          <span
            className="inline-block rounded-full px-3 py-1 text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {name || "タグ名"}
          </span>
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
