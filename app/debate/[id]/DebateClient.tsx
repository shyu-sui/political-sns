"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, type Comment, type Topic } from "@/lib/supabase";
import { containsNgWord } from "@/lib/ngwords";
import { getUserHash } from "@/lib/userHash";

type CommentWithStats = Comment & { likeCount: number; isLiked: boolean };

function sortByLikes(comments: CommentWithStats[]): CommentWithStats[] {
  return [...comments].sort((a, b) => b.likeCount - a.likeCount);
}

// いいね順でソート済みの賛成・反対を交互にマージ
function mergeAlternating(
  pros: CommentWithStats[],
  cons: CommentWithStats[]
): (CommentWithStats & { side: "pro" | "con" })[] {
  const result: (CommentWithStats & { side: "pro" | "con" })[] = [];
  const max = Math.max(pros.length, cons.length);
  for (let i = 0; i < max; i++) {
    if (pros[i]) result.push({ ...pros[i], side: "pro" });
    if (cons[i]) result.push({ ...cons[i], side: "con" });
  }
  return result;
}

// ---------- ShareBar ----------

function ShareBar({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);

  const url = typeof window !== "undefined" ? window.location.href : "";
  const text = encodeURIComponent(`【討論】${title}`);
  const encodedUrl = encodeURIComponent(url);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 border-t border-gray-100 pt-4 pb-1">
      <a
        href={`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-400"
      >
        𝕏 でシェア
      </a>
      <a
        href={`https://social-plugins.line.me/lineit/share?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-400"
      >
        LINE でシェア
      </a>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-400"
      >
        {copied ? "✓ コピー済み" : "URLをコピー"}
      </button>
    </div>
  );
}

// ---------- CommentCard ----------

function CommentCard({
  comment,
  onLike,
  onReport,
  sideBadge,
}: {
  comment: CommentWithStats;
  onLike: (id: string) => void;
  onReport: (id: string) => void;
  sideBadge?: "pro" | "con";
}) {
  const handleReport = () => {
    if (window.confirm("このコメントを通報しますか？")) {
      onReport(comment.id);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {sideBadge && (
        <span
          className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            sideBadge === "pro"
              ? "bg-blue-100 text-blue-600"
              : "bg-red-100 text-red-600"
          }`}
        >
          {sideBadge === "pro" ? "賛成" : "反対"}
        </span>
      )}
      <p className="text-sm leading-7 text-gray-800">{comment.content}</p>
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{comment.author}</span>
          <button
            onClick={handleReport}
            className="text-xs text-gray-300 hover:text-red-400 transition"
          >
            通報
          </button>
        </div>
        <button
          onClick={() => onLike(comment.id)}
          className={`flex items-center gap-1 rounded-full border px-3 py-2 text-xs transition ${
            comment.isLiked
              ? "border-pink-300 bg-pink-50 text-pink-400 hover:border-pink-400 hover:bg-pink-100"
              : "border-gray-200 text-gray-600 hover:border-pink-400 hover:text-pink-500"
          }`}
        >
          <span>👍</span>
          <span className="font-medium">{comment.likeCount}</span>
        </button>
      </div>
    </div>
  );
}

// ---------- CommentForm ----------

function CommentForm({
  onSubmit,
}: {
  onSubmit: (content: string, author: string, side: "pro" | "con") => Promise<void>;
}) {
  const [side, setSide] = useState<"pro" | "con">("pro");
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [ngError, setNgError] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !author.trim()) return;

    if (containsNgWord(content) || containsNgWord(author)) {
      setNgError(true);
      setTimeout(() => setNgError(false), 3000);
      return;
    }

    setSubmitting(true);
    await onSubmit(content.trim(), author.trim(), side);
    setContent("");
    setAuthor("");
    setSubmitting(false);
  };

  const isPro = side === "pro";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* 賛成 / 反対 切り替え */}
      <div className="flex rounded-lg border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setSide("pro")}
          className={`flex-1 py-2.5 text-sm font-semibold transition ${
            isPro
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-400 hover:text-blue-500"
          }`}
        >
          賛成
        </button>
        <button
          type="button"
          onClick={() => setSide("con")}
          className={`flex-1 py-2.5 text-sm font-semibold transition border-l border-gray-200 ${
            !isPro
              ? "bg-red-600 text-white"
              : "bg-white text-gray-400 hover:text-red-500"
          }`}
        >
          反対
        </button>
      </div>

      {ngError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-600">
          不適切な言葉が含まれています。修正してください。
        </p>
      )}
      <input
        type="text"
        placeholder="投稿者名"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
      />
      <textarea
        placeholder="コメントを入力..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400"
      />
      <button
        type="submit"
        disabled={submitting}
        className={`w-full rounded-lg px-4 py-2 text-sm font-medium text-white transition ${
          isPro
            ? "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            : "bg-red-600 hover:bg-red-700 disabled:bg-red-300"
        }`}
      >
        {submitting ? "投稿中..." : `${isPro ? "賛成" : "反対"}として投稿`}
      </button>

      <p className="text-center text-xs text-gray-400">
        投稿することで
        <Link href="/terms" className="underline hover:text-gray-600 transition">
          利用規約
        </Link>
        に同意したものとみなします
      </p>
    </form>
  );
}

// ---------- CommentColumn (PC用) ----------

function CommentColumn({
  title,
  comments,
  side,
  onLike,
  onReport,
}: {
  title: string;
  comments: CommentWithStats[];
  side: "pro" | "con";
  onLike: (id: string) => void;
  onReport: (id: string) => void;
}) {
  const headerClass =
    side === "pro"
      ? "border-blue-500 text-blue-700 bg-blue-50"
      : "border-red-500 text-red-700 bg-red-50";

  const badgeClass =
    side === "pro"
      ? "bg-blue-100 text-blue-600"
      : "bg-red-100 text-red-600";

  return (
    <div className="flex flex-col">
      <div className={`mb-4 flex items-center gap-2 rounded-lg border-l-4 px-4 py-2.5 ${headerClass}`}>
        <h2 className="text-base font-bold">{title}</h2>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
          {comments.length}件
        </span>
      </div>

      <div className="max-h-[520px] overflow-y-auto space-y-3 pr-1 flex-1">
        {comments.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">
            まだコメントがありません
          </p>
        ) : (
          comments.map((c) => (
            <CommentCard
              key={c.id}
              comment={c}
              onLike={onLike}
              onReport={onReport}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ---------- DebateClient ----------

export default function DebateClient({ topicId }: { topicId: number }) {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [proComments, setProComments] = useState<CommentWithStats[]>([]);
  const [conComments, setConComments] = useState<CommentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHash, setUserHash] = useState("");
  const router = useRouter();

  useEffect(() => {
    setUserHash(getUserHash());
  }, []);

  const fetchComments = useCallback(async (hash: string) => {
    const { data: commentsData, error } = await supabase
      .from("comments")
      .select("*")
      .eq("topic_id", topicId)
      .eq("del_flg", 0);

    if (error || !commentsData) return;

    const comments = commentsData as Comment[];
    const commentIds = comments.map((c) => c.id);

    // comment_likes を一括取得
    const { data: likesData } = await supabase
      .from("comment_likes")
      .select("comment_id, user_hash")
      .in("comment_id", commentIds.length > 0 ? commentIds : [""]);

    const likes = likesData ?? [];
    const likesCountMap = new Map<string, number>();
    const likedSet = new Set<string>();

    for (const l of likes) {
      likesCountMap.set(l.comment_id, (likesCountMap.get(l.comment_id) ?? 0) + 1);
      if (l.user_hash === hash) likedSet.add(l.comment_id);
    }

    const withStats: CommentWithStats[] = comments.map((c) => ({
      ...c,
      likeCount: likesCountMap.get(c.id) ?? 0,
      isLiked: likedSet.has(c.id),
    }));

    setProComments(sortByLikes(withStats.filter((c) => c.side === "pro")));
    setConComments(sortByLikes(withStats.filter((c) => c.side === "con")));
  }, [topicId]);

  useEffect(() => {
    if (!userHash) return;
    const fetchAll = async () => {
      const { data: topicData } = await supabase
        .from("topics")
        .select("*")
        .eq("id", topicId)
        .single();

      if (topicData) setTopic(topicData as Topic);
      await fetchComments(userHash);
      setLoading(false);
    };
    fetchAll();
  }, [topicId, userHash, fetchComments]);

  const handleSubmit = async (
    content: string,
    author: string,
    side: "pro" | "con"
  ) => {
    const { error } = await supabase
      .from("comments")
      .insert({ topic_id: topicId, side, content, author });

    if (error) return;
    await fetchComments(userHash);
  };

  const handleLike = async (id: string) => {
    const isLiked =
      proComments.find((c) => c.id === id)?.isLiked ??
      conComments.find((c) => c.id === id)?.isLiked ??
      false;

    if (isLiked) {
      await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", id)
        .eq("user_hash", userHash);
    } else {
      await supabase
        .from("comment_likes")
        .insert({ comment_id: id, user_hash: userHash });
    }

    await fetchComments(userHash);
  };

  const handleReport = async (id: string) => {
    const { error } = await supabase.rpc("report_comment", {
      target_comment_id: id,
    });
    if (error) {
      console.error("通報に失敗しました", error);
      return;
    }
    await fetchComments(userHash);
  };

  const mergedComments = mergeAlternating(proComments, conComments);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <button
            onClick={() => router.push("/")}
            className="mb-3 text-xs text-gray-400 hover:text-gray-600 transition"
          >
            ← トピック一覧に戻る
          </button>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400">
            今日のお題
          </p>
          <h1 className="mt-1 text-xl font-bold leading-snug text-gray-900 sm:text-2xl">
            {topic ? topic.title : "読み込み中..."}
          </h1>
          {topic?.description && (
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              {topic.description}
            </p>
          )}
          {topic && <ShareBar title={topic.title} />}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        {loading ? (
          <p className="py-20 text-center text-sm text-gray-400">読み込み中...</p>
        ) : (
          <>
            {/* PC: 2カラム（コメント一覧） */}
            <div className="hidden md:grid grid-cols-2 gap-6">
              <CommentColumn
                title="賛成"
                comments={proComments}
                side="pro"
                onLike={handleLike}
                onReport={handleReport}
              />
              <CommentColumn
                title="反対"
                comments={conComments}
                side="con"
                onLike={handleLike}
                onReport={handleReport}
              />
            </div>

            {/* スマホ: 交互フラットリスト */}
            <div className="md:hidden space-y-3">
              {mergedComments.length === 0 ? (
                <p className="py-12 text-center text-sm text-gray-400">
                  まだコメントがありません
                </p>
              ) : (
                mergedComments.map((c) => (
                  <CommentCard
                    key={c.id}
                    comment={c}
                    onLike={handleLike}
                    onReport={handleReport}
                    sideBadge={c.side}
                  />
                ))
              )}
            </div>

            {/* 統合投稿フォーム（PC・スマホ共通） */}
            <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="mb-4 text-sm font-semibold text-gray-700">コメントを投稿</p>
              <CommentForm onSubmit={handleSubmit} />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
