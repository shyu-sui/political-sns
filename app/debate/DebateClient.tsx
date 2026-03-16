"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Comment } from "@/lib/supabase";

const TOPIC = "日本は原子力発電を再稼働すべきか？";

function sortByLikes(comments: Comment[]): Comment[] {
  return [...comments].sort((a, b) => b.likes - a.likes);
}

function CommentCard({
  comment,
  onLike,
}: {
  comment: Comment;
  onLike: (id: string, currentLikes: number) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-800 leading-relaxed">{comment.content}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{comment.author}</span>
        <button
          onClick={() => onLike(comment.id, comment.likes)}
          className="flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs text-gray-600 transition hover:border-pink-400 hover:text-pink-500"
        >
          <span>👍</span>
          <span>{comment.likes}</span>
        </button>
      </div>
    </div>
  );
}

function CommentForm({
  onSubmit,
  side,
}: {
  onSubmit: (content: string, author: string) => Promise<void>;
  side: "pro" | "con";
}) {
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !author.trim()) return;
    setSubmitting(true);
    await onSubmit(content.trim(), author.trim());
    setContent("");
    setAuthor("");
    setSubmitting(false);
  };

  const accentClass =
    side === "pro"
      ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
      : "bg-red-600 hover:bg-red-700 disabled:bg-red-300";

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <input
        type="text"
        placeholder="投稿者名"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
      />
      <textarea
        placeholder="コメントを入力..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none"
      />
      <button
        type="submit"
        disabled={submitting}
        className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition ${accentClass}`}
      >
        {submitting ? "投稿中..." : "投稿する"}
      </button>
    </form>
  );
}

function CommentColumn({
  title,
  comments,
  side,
  onLike,
  onSubmit,
}: {
  title: string;
  comments: Comment[];
  side: "pro" | "con";
  onLike: (id: string, currentLikes: number) => void;
  onSubmit: (content: string, author: string) => Promise<void>;
}) {
  const headerClass =
    side === "pro"
      ? "border-blue-500 text-blue-700"
      : "border-red-500 text-red-700";

  return (
    <div className="flex flex-col">
      <h2 className={`border-l-4 pl-3 text-lg font-semibold mb-4 ${headerClass}`}>
        {title}
        <span className="ml-2 text-sm font-normal text-gray-500">
          ({comments.length}件)
        </span>
      </h2>
      <div className="space-y-3 flex-1">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            まだコメントがありません
          </p>
        ) : (
          comments.map((c) => (
            <CommentCard key={c.id} comment={c} onLike={onLike} />
          ))
        )}
      </div>
      <CommentForm onSubmit={onSubmit} side={side} />
    </div>
  );
}

export default function DebateClient() {
  const [proComments, setProComments] = useState<Comment[]>([]);
  const [conComments, setConComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .order("likes", { ascending: false });

    if (error || !data) return;

    const comments = data as Comment[];
    setProComments(sortByLikes(comments.filter((c) => c.side === "pro")));
    setConComments(sortByLikes(comments.filter((c) => c.side === "con")));
  }, []);

  useEffect(() => {
    fetchComments().finally(() => setLoading(false));
  }, [fetchComments]);

  const handleSubmit = async (side: "pro" | "con", content: string, author: string) => {
    const { error } = await supabase
      .from("comments")
      .insert({ side, content, author });

    if (error) return;
    await fetchComments();
  };

  const handleLike = async (
    id: string,
    currentLikes: number
  ) => {
    const { error } = await supabase
      .from("comments")
      .update({ likes: currentLikes + 1 })
      .eq("id", id);

    if (error) return;
    await fetchComments();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
          今日のお題
        </p>
        <h1 className="text-2xl font-bold text-gray-900">{TOPIC}</h1>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {loading ? (
          <p className="text-center text-sm text-gray-400 py-20">読み込み中...</p>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <CommentColumn
              title="賛成"
              comments={proComments}
              side="pro"
              onLike={handleLike}
              onSubmit={(content, author) => handleSubmit("pro", content, author)}
            />
            <CommentColumn
              title="反対"
              comments={conComments}
              side="con"
              onLike={handleLike}
              onSubmit={(content, author) => handleSubmit("con", content, author)}
            />
          </div>
        )}
      </main>
    </div>
  );
}
