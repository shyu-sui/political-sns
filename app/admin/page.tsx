"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, type Comment, type Topic } from "@/lib/supabase";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "admin1234";

type AdminTab = "comments" | "topics";

// ---------- コメント管理 ----------

function CommentsPanel({ topicMap }: { topicMap: Map<number, string> }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

  useEffect(() => {
    supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setComments(data as Comment[]);
        setLoading(false);
      });
  }, []);

  const toggleDelFlg = async (id: string, currentFlg: number) => {
    const newFlg = currentFlg === 0 ? 1 : 0;
    await supabase.from("comments").update({ del_flg: newFlg }).eq("id", id);
    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, del_flg: newFlg } : c))
    );
  };

  const filtered = comments.filter((c) => {
    if (filter === "visible") return c.del_flg === 0;
    if (filter === "hidden") return c.del_flg === 1;
    return true;
  });

  return (
    <>
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
        <span className="ml-auto self-center text-xs text-gray-400">
          {filtered.length}件
        </span>
      </div>

      {loading ? (
        <p className="py-20 text-center text-sm text-gray-400">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">コメントがありません</p>
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
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        c.side === "pro"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.side === "pro" ? "賛成" : "反対"}
                    </span>
                    <span className="truncate text-xs text-gray-500">
                      {topicMap.get(c.topic_id) ?? `topic #${c.topic_id}`}
                    </span>
                    {c.del_flg === 1 && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                        非表示
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-3 text-sm leading-relaxed text-gray-800">
                    {c.content}
                  </p>
                  <p className="mt-1.5 text-xs text-gray-400">
                    {c.author} · {new Date(c.created_at).toLocaleString("ja-JP")}
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
    </>
  );
}

// ---------- トピック管理 ----------

function TopicsPanel() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "visible" | "hidden">("all");

  useEffect(() => {
    supabase
      .from("topics")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setTopics(data as Topic[]);
        setLoading(false);
      });
  }, []);

  const toggleDelFlg = async (id: number, currentFlg: number) => {
    const newFlg = currentFlg === 0 ? 1 : 0;
    await supabase.from("topics").update({ del_flg: newFlg }).eq("id", id);
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, del_flg: newFlg } : t))
    );
  };

  const filtered = topics.filter((t) => {
    if (filter === "visible") return t.del_flg === 0;
    if (filter === "hidden") return t.del_flg === 1;
    return true;
  });

  return (
    <>
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
        <span className="ml-auto self-center text-xs text-gray-400">
          {filtered.length}件
        </span>
      </div>

      {loading ? (
        <p className="py-20 text-center text-sm text-gray-400">読み込み中...</p>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-sm text-gray-400">トピックがありません</p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((t) => (
            <li
              key={t.id}
              className={`rounded-xl border bg-white p-4 shadow-sm ${
                t.del_flg === 1 ? "opacity-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {t.del_flg === 1 && (
                      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-500">
                        非表示
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-gray-900">{t.title}</p>
                  {t.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {t.description}
                    </p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">
                    作成日時：{new Date(t.created_at).toLocaleString("ja-JP")}
                  </p>
                </div>
                <button
                  onClick={() => toggleDelFlg(t.id, t.del_flg)}
                  className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    t.del_flg === 0
                      ? "border-red-200 text-red-600 hover:bg-red-50"
                      : "border-green-200 text-green-600 hover:bg-green-50"
                  }`}
                >
                  {t.del_flg === 0 ? "非表示にする" : "表示に戻す"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

// ---------- AdminContent ----------

function AdminContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<AdminTab>("comments");
  const [topicMap, setTopicMap] = useState<Map<number, string>>(new Map());

  const isAuthorized = searchParams.get("key") === ADMIN_KEY;

  const fetchTopicMap = useCallback(async () => {
    const { data } = await supabase.from("topics").select("id, title");
    if (data) {
      const map = new Map<number, string>();
      for (const t of data as Pick<Topic, "id" | "title">[]) {
        map.set(t.id, t.title);
      }
      setTopicMap(map);
    }
  }, []);

  useEffect(() => {
    if (isAuthorized) fetchTopicMap();
  }, [isAuthorized, fetchTopicMap]);

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">
          アクセス権限がありません。<code>?key=</code> を付けてアクセスしてください。
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-5">
        <h1 className="text-xl font-bold text-gray-900">管理者ページ</h1>
        <p className="mt-0.5 text-xs text-gray-400">
          コメント・トピックの表示・非表示を管理できます
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        {/* タブ */}
        <div className="mb-6 flex gap-1 rounded-lg bg-gray-200 p-1">
          {(["comments", "topics"] as AdminTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "comments" ? "コメント管理" : "トピック管理"}
            </button>
          ))}
        </div>

        {tab === "comments" ? (
          <CommentsPanel topicMap={topicMap} />
        ) : (
          <TopicsPanel />
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
