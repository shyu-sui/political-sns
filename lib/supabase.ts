import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Topic = {
  id: number;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  del_flg: number;
};

export type Comment = {
  id: string;
  topic_id: number;
  side: "pro" | "con";
  content: string;
  author: string;
  likes: number;
  created_at: string;
};
