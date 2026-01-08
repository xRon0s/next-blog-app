"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// APIから取得する投稿の型定義
type Post = {
  id: string;
  title: string;
  createdAt: string;
};

const AdminPostsPage = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/posts", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("記事の取得に失敗しました");
      }
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "予期せぬエラーが発生しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("本当にこの記事を削除しますか？")) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "削除に失敗しました");
      }
      alert("削除しました。");
      // 記事一覧を再取得
      fetchPosts();
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
        <h1 className="text-2xl font-bold">投稿管理</h1>
        <Link href="/admin/posts/new" className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors">
          新規投稿
        </Link>
      </div>
      <div className="bg-white shadow-md rounded-lg">
        <ul className="divide-y divide-gray-200">
          {posts && posts.length > 0 ? (
            posts.map((post) => (
              <li key={post.id} className="p-4 flex justify-between items-center">
                <div>
                  <Link href={`/posts/${post.id}`} className="text-lg font-semibold text-blue-600 hover:underline">
                    {post.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    投稿日: {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="space-x-2">
                  <Link href={`/admin/posts/${post.id}`} className="text-green-600 hover:text-green-800">
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    削除
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="p-4 text-center text-gray-500">投稿はまだありません。</li>
          )}
        </ul>
      </div>
    </main>
  );
};

export default AdminPostsPage;
