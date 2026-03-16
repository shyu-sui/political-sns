import DebateClient from "./DebateClient";

export default async function DebatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DebateClient topicId={Number(id)} />;
}
