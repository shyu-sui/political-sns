"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Topic } from "@/lib/supabase";

type TopicWithStats = Topic & {
  latestCommentAt: string | null;
  commentCount: number;
};

type Tab = "new" | "popular";

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("new");
  const router = useRouter();

  useEffect(() => {
    const fetchTopics = async () => {
      const [{ data: topicsData }, { data: commentsData }] = await Promise.all([
        supabase.from("topics").select("*").eq("del_flg", 0),
        supabase
          .from("comments")
          .select("topic_id, created_at")
          .eq("del_flg", 0),
      ]);

      if (!topicsData) {
        setLoading(false);
        return;
      }

      const latestMap = new Map<number, string>();
      const countMap = new Map<number, number>();

      for (const c of commentsData ?? []) {
        const current = latestMap.get(c.topic_id);
        if (!current || c.created_at > current) {
          latestMap.set(c.topic_id, c.created_at);
        }
        countMap.set(c.topic_id, (countMap.get(c.topic_id) ?? 0) + 1);
      }

      const merged: TopicWithStats[] = (topicsData as Topic[]).map((t) => ({
        ...t,
        latestCommentAt: latestMap.get(t.id) ?? null,
        commentCount: countMap.get(t.id) ?? 0,
      }));

      setTopics(merged);
      setLoading(false);
    };

    fetchTopics();
  }, []);

  const sorted = [...topics].sort((a, b) => {
    if (tab === "popular") {
      return b.commentCount - a.commentCount;
    }
    const dateA = a.latestCommentAt ?? a.created_at;
    const dateB = b.latestCommentAt ?? b.created_at;
    return dateB > dateA ? 1 : -1;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            PoliDebate
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            社会問題・政治テーマについて討論しよう
          </p>
          <button
            onClick={() => router.push("/topics/new")}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <span>＋</span> 議題を作成する
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* タブ */}
        <div className="mb-5 flex gap-1 rounded-lg bg-gray-200 p-1">
          {(["new", "popular"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t === "new" ? "新着順" : "人気順"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="py-20 text-center text-sm text-gray-400">読み込み中...</p>
        ) : sorted.length === 0 ? (
          <p className="py-20 text-center text-sm text-gray-400">
            トピックがありません
          </p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((topic) => (
              <li key={topic.id}>
                <button
                  onClick={() => router.push(`/debate/${topic.id}`)}
                  className="group w-full rounded-xl border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {topic.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {topic.commentCount}件
                    </span>
                  </div>
                  {topic.description && (
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">
                      {topic.description}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-gray-400">
                    {topic.latestCommentAt
                      ? `最終コメント：${new Date(topic.latestCommentAt).toLocaleString("ja-JP")}`
                      : "コメントなし"}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
