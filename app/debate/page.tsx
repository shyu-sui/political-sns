import { supabase, type Comment } from "@/lib/supabase";
import DebateClient from "./DebateClient";

export default async function DebatePage() {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("likes", { ascending: false });

  const comments: Comment[] = error || !data ? [] : (data as Comment[]);

  const initialPro = comments.filter((c) => c.side === "pro");
  const initialCon = comments.filter((c) => c.side === "con");

  return <DebateClient initialPro={initialPro} initialCon={initialCon} />;
}
