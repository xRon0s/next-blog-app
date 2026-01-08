"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// カテゴリの型定義
type Category = {
  id: string;
  name: string;
};

// 投稿の型定義
type Post = {
  title: string;
  content: string;
  coverImageURL: string;
  categories: Category[];
};

const AdminPostEditPage = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // 投稿とカテゴリを並行して取得
        const [postRes, categoriesRes] = await Promise.all([
          fetch(`/api/posts/${id}`, { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
        ]);

        if (!postRes.ok) throw new Error("投稿の取得に失敗しました");
        if (!categoriesRes.ok) throw new Error("カテゴリの取得に失敗しました");

        const postData = await postRes.json();
        const categoriesData = await categoriesRes.json();

        setPost(postData);
        setAllCategories(categoriesData);
        setSelectedCategoryIds(postData.categories.map((c: Category) => c.id));
      } catch (err) {
        setError(err instanceof Error ? err.message : "データの取得中にエラーが発生しました");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!post) return;

    const formData = new FormData(e.currentTarget);
    const updatedPost = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      coverImageURL: formData.get("coverImageURL") as string,
      categoryIds: selectedCategoryIds,
    };

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPost),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "更新に失敗しました");
      }

      alert("投稿を更新しました。");
      router.push("/admin/posts");
    } catch (err) {
      alert(err instanceof Error ? err.message : "予期せぬエラーが発生しました");
    }
  };

  if (isLoading) {
    return (
      <div className="text-center">
        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
        読み込み中...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">エラー: {error}</div>;
  }
  
  if (!post) {
    return <div className="text-center text-gray-500">投稿が見つかりません。</div>;
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-6">投稿の編集</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">タイトル</label>
          <input
            type="text"
            id="title"
            name="title"
            defaultValue={post.title}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">本文</label>
          <textarea
            id="content"
            name="content"
            defaultValue={post.content}
            rows={10}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="coverImageURL" className="block text-sm font-medium text-gray-700">カバー画像URL</label>
          <input
            type="url"
            id="coverImageURL"
            name="coverImageURL"
            defaultValue={post.coverImageURL}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">カテゴリ</label>
          <div className="mt-2 space-y-2">
            {allCategories.map((category) => (
              <div key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category.id}`}
                  value={category.id}
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => handleCategoryChange(category.id)}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`category-${category.id}`} className="ml-3 text-sm text-gray-700">
                  {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors">
            更新
          </button>
        </div>
      </form>
    </main>
  );
};

export default AdminPostEditPage;
