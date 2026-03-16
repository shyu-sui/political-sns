"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, type Comment, type Topic } from "@/lib/supabase";

// パスワードは NEXT_PUBLIC_ADMIN_KEY 環境変数で管理してください
const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "admin1234";

function AdminContent() {
  const searchParams = useSearchParams();
  const [comments, setComments] = useState<Comment[]>([]);
  const [topicMap, setTopicMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

  const isAuthorized = searchParams.get("key") === ADMIN_KEY;

  const fetchAll = useCallback(async () => {
    const [{ data: commentsData }, { data: topicsData }] = await Promise.all([
      supabase
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("topics").select("id, title"),
    ]);

    if (commentsData) setComments(commentsData as Comment[]);

    if (topicsData) {
      const map = new Map<number, string>();
      for (const t of topicsData as Pick<Topic, "id" | "title">[]) {
        map.set(t.id, t.title);
      }
      setTopicMap(map);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthorized) fetchAll();
  }, [isAuthorized, fetchAll]);

  const toggleDelFlg = async (id: string, currentFlg: number) => {
    const newFlg = currentFlg === 0 ? 1 : 0;
    await supabase.from("comments").update({ del_flg: newFlg }).eq("id", id);
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, del_flg: newFlg } : c))
    );
  };

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          アクセス権限がありません。<code>?key=</code> を付けてアクセスしてください。
        </p>
      </div>
    );
  }

  const filtered = comments.filter((c) => {
    if (filter === "visible") return c.del_flg === 0;
    if (filter === "hidden") return c.del_flg === 1;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">管理者ページ</h1>
        <p className="mt-0.5 text-xs text-gray-400">コメントの表示・非表示を管理できます</p>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* フィルタ */}
        <div className="mb-5 flex gap-2">
          {(["all", "visible", "hidden"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-white border border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              {f === "all" ? "すべて" : f === "visible" ? "表示中" : "非表示"}
            </button>
          ))}
          <span className="ml-auto text-xs text-gray-400 self-center">
            {filtered.length}件
          </span>
        </div>

        {loading ? (
          <p className="py-20 text-center text-sm text-gray-400">読み込み中...</p>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">
            コメントがありません
          </p>
        ) : (
          <ul className="space-y-3">
            {filtered.map((c) => (
              <li
                key={c.id}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  c.del_flg === 1 ? "opacity-50" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          c.side === "pro"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {c.side === "pro" ? "賛成" : "反対"}
                      </span>
                      <span className="text-xs text-gray-500 truncate">
                        {topicMap.get(c.topic_id) ?? `topic #${c.topic_id}`}
                      </span>
                      {c.del_flg === 1 && (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                          非表示
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">
                      {c.content}
                    </p>
                    <p className="mt-1.5 text-xs text-gray-400">
                      {c.author} ·{" "}
                      {new Date(c.created_at).toLocaleString("ja-JP")}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleDelFlg(c.id, c.del_flg)}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      c.del_flg === 0
                        ? "border-red-200 text-red-600 hover:bg-red-50"
                        : "border-green-200 text-green-600 hover:bg-green-50"
                    }`}
                  >
                    {c.del_flg === 0 ? "非表示にする" : "表示に戻す"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-gray-400">Loading...</p>}>
      <AdminContent />
    </Suspense>
  );
}
