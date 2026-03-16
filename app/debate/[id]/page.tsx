import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import DebateClient from "./DebateClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data } = await supabase
    .from("topics")
    .select("title, description")
    .eq("id", id)
    .single();

  const title = data?.title ?? "討論トピック";
  const description = data?.description ?? "賛成・反対に分かれて討論しよう";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ["/og-image.svg"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.svg"],
    },
  };
}

export default async function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DebateClient topicId={Number(id)} />;
}
