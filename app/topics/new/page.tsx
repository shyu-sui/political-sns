"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewTopicPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError("");

    const { data, error: insertError } = await supabase
      .from("topics")
      .insert({ title: title.trim(), description: description.trim() || null })
      .select("id")
      .single();

    if (insertError || !data) {
      setError("作成に失敗しました。もう一度お試しください。");
      setSubmitting(false);
      return;
    }

    router.push(`/debate/${data.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <button
            onClick={() => router.push("/")}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            ← トピック一覧に戻る
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">議題を作成する</h1>
        <p className="text-sm text-gray-500 mb-8">
          テーマを設定すると、賛成・反対に分かれた討論が始まります。
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="例：日本は原子力発電を再稼働すべきか？"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {title.length} / 100
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              説明{" "}
              <span className="text-xs font-normal text-gray-400">（任意）</span>
            </label>
            <textarea
              placeholder="議題の背景や論点を補足説明してください。"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
              rows={4}
              className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {description.length} / 300
            </p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!title.trim() || submitting}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:bg-blue-300"
          >
            {submitting ? "作成中..." : "議題を作成して討論を始める"}
          </button>
        </form>
      </main>
    </div>
  );
}
