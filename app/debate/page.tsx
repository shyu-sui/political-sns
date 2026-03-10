"use client";

import { useState } from "react";

type Comment = {
  id: string;
  body: string;
  author: string;
  likes: number;
};

const TOPIC = "日本は原子力発電を再稼働すべきか？";

const initialAgree: Comment[] = [
  { id: "a1", body: "CO2排出削減のために必要不可欠だと思います。", author: "田中一郎", likes: 12 },
  { id: "a2", body: "エネルギー安全保障の観点から再稼働は合理的な選択です。", author: "山田花子", likes: 7 },
];

const initialDisagree: Comment[] = [
  { id: "d1", body: "事故リスクを考えると、再生可能エネルギーへの移行を優先すべきです。", author: "佐藤次郎", likes: 15 },
  { id: "d2", body: "廃棄物処理問題が解決していない段階での再稼働には反対です。", author: "鈴木美咲", likes: 9 },
];

function sortByLikes(comments: Comment[]): Comment[] {
  return [...comments].sort((a, b) => b.likes - a.likes);
}

function CommentCard({
  comment,
  onLike,
}: {
  comment: Comment;
  onLike: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-gray-800 leading-relaxed">{comment.body}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-gray-500">{comment.author}</span>
        <button
          onClick={() => onLike(comment.id)}
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
  onSubmit: (body: string, author: string) => void;
  side: "agree" | "disagree";
}) {
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !author.trim()) return;
    onSubmit(body.trim(), author.trim());
    setBody("");
    setAuthor("");
  };

  const accentClass =
    side === "agree"
      ? "bg-blue-600 hover:bg-blue-700"
      : "bg-red-600 hover:bg-red-700";

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
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400 resize-none"
      />
      <button
        type="submit"
        className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition ${accentClass}`}
      >
        投稿する
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
  side: "agree" | "disagree";
  onLike: (id: string) => void;
  onSubmit: (body: string, author: string) => void;
}) {
  const headerClass =
    side === "agree"
      ? "border-blue-500 text-blue-700"
      : "border-red-500 text-red-700";

  return (
    <div className="flex flex-col">
      <h2
        className={`border-l-4 pl-3 text-lg font-semibold mb-4 ${headerClass}`}
      >
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

export default function DebatePage() {
  const [agreeComments, setAgreeComments] = useState<Comment[]>(
    sortByLikes(initialAgree)
  );
  const [disagreeComments, setDisagreeComments] = useState<Comment[]>(
    sortByLikes(initialDisagree)
  );

  const handleAgreeSubmit = (body: string, author: string) => {
    const newComment: Comment = {
      id: `a-${Date.now()}`,
      body,
      author,
      likes: 0,
    };
    setAgreeComments((prev) => sortByLikes([...prev, newComment]));
  };

  const handleDisagreeSubmit = (body: string, author: string) => {
    const newComment: Comment = {
      id: `d-${Date.now()}`,
      body,
      author,
      likes: 0,
    };
    setDisagreeComments((prev) => sortByLikes([...prev, newComment]));
  };

  const handleAgreeLike = (id: string) => {
    setAgreeComments((prev) =>
      sortByLikes(prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c)))
    );
  };

  const handleDisagreeLike = (id: string) => {
    setDisagreeComments((prev) =>
      sortByLikes(prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c)))
    );
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
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <CommentColumn
            title="賛成"
            comments={agreeComments}
            side="agree"
            onLike={handleAgreeLike}
            onSubmit={handleAgreeSubmit}
          />
          <CommentColumn
            title="反対"
            comments={disagreeComments}
            side="disagree"
            onLike={handleDisagreeLike}
            onSubmit={handleDisagreeSubmit}
          />
        </div>
      </main>
    </div>
  );
}
