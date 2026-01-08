"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// カテゴリの型定義
type Category = {
  id: string;
  name: string;
};

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("カテゴリの取得に失敗しました");
      }
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("本当にこのカテゴリを削除しますか？\n関連する投稿からカテゴリの関連付けが解除されます。")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "削除に失敗しました");
      }
      alert("削除しました。");
      // カテゴリ一覧を再取得
      fetchCategories();
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

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">カテゴリ管理</h1>
        <Link href="/admin/categories/new" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
          新規作成
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {categories && categories.length > 0 ? (
            categories.map((category) => (
              <li key={category.id} className="p-4 flex justify-between items-center">
                <span className="text-lg font-semibold">{category.name}</span>
                <div className="space-x-2">
                  <Link href={`/admin/categories/${category.id}`} className="text-green-600 hover:text-green-800">
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">カテゴリはまだありません。</li>
          )}
        </ul>
      </div>
    </main>
  );
};

export default AdminCategoriesPage;
