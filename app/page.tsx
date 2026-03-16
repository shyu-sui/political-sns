"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Topic } from "@/lib/supabase";

type TopicWithLatest = Topic & { latestCommentAt: string | null };

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicWithLatest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTopics = async () => {
      const [{ data: topicsData }, { data: commentsData }] = await Promise.all([
        supabase.from("topics").select("*").eq("del_flg", 0),
        supabase.from("comments").select("topic_id, created_at"),
      ]);

      if (!topicsData) {
        setLoading(false);
        return;
      }

      // topic_id ごとの最新 created_at を集計
      const latestMap = new Map<number, string>();
      for (const c of commentsData ?? []) {
        const current = latestMap.get(c.topic_id);
        if (!current || c.created_at > current) {
          latestMap.set(c.topic_id, c.created_at);
        }
      }

      // latestCommentAt を付与して降順ソート
      const merged: TopicWithLatest[] = (topicsData as Topic[]).map((t) => ({
        ...t,
        latestCommentAt: latestMap.get(t.id) ?? null,
      }));

      merged.sort((a, b) => {
        const dateA = a.latestCommentAt ?? a.created_at;
        const dateB = b.latestCommentAt ?? b.created_at;
        return dateB > dateA ? 1 : -1;
      });

      setTopics(merged);
      setLoading(false);
    };

    fetchTopics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900">討論トピック一覧</h1>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-20">読み込み中...</p>
        ) : topics.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-20">
            トピックがありません
          </p>
        ) : (
          <ul className="space-y-3">
            {topics.map((topic) => (
              <li key={topic.id}>
                <button
                  onClick={() => router.push(`/debate/${topic.id}`)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-5 py-4 text-left shadow-sm transition hover:border-gray-300 hover:shadow-md"
                >
                  <p className="font-semibold text-gray-900">{topic.title}</p>
                  {topic.description && (
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                      {topic.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
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
