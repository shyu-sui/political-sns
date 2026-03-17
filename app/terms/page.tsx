import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "利用規約",
  description: "PoliDebate の利用規約",
};

const sections = [
  {
    title: "第1条（サービス内容）",
    content: (
      <p>
        本サービスは、ユーザーが匿名で議題に対して意見を投稿し、賛成・反対の立場を示し、他のユーザーと議論を行うためのSNSです。
      </p>
    ),
  },
  {
    title: "第2条（禁止事項）",
    content: (
      <ul className="list-disc space-y-1.5 pl-5">
        {[
          "法令または公序良俗に反する行為",
          "誹謗中傷、差別、脅迫、プライバシー侵害など他者を傷つける行為",
          "虚偽の情報を投稿する行為",
          "スパム行為、同一内容の連続投稿",
          "サービスの運営を妨害する行為",
          "不正アクセスやシステムへの攻撃",
          "その他、運営者が不適切と判断する行為",
        ].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  },
  {
    title: "第3条（投稿内容の扱い）",
    content: (
      <p>
        ユーザーが投稿した内容は、運営者が必要に応じて削除・非表示にする場合があります。
        特に、通報機能により不適切と判断された投稿は、管理者により確認され、削除されることがあります。
      </p>
    ),
  },
  {
    title: "第4条（免責事項）",
    content: (
      <ul className="list-disc space-y-1.5 pl-5">
        {[
          "本サービスの利用により生じたトラブル・損害について、運営者は一切の責任を負いません。",
          "投稿内容の正確性・信頼性について、運営者は保証しません。",
          "サービスの仕様変更、停止、中断が発生する場合があります。",
        ].map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    ),
  },
  {
    title: "第5条（情報の取り扱い）",
    content: (
      <>
        <p className="mb-3">
          本サービスは匿名利用を前提としており、氏名・メールアドレス等の個人を直接特定する情報は収集しません。
          ただし、サービス改善・不正防止のため、以下の技術情報を取得します：
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>IPアドレス（Vercel のサーバーログによる自動取得）</li>
          <li>アクセス解析データ（Vercel Analytics）</li>
          <li>
            ブラウザの localStorage に保存される匿名識別子（いいね機能の重複防止用）
          </li>
        </ul>
        <p className="mt-3">
          これらの情報は第三者への提供、または個人の特定を目的として使用しません。
        </p>
      </>
    ),
  },
  {
    title: "第6条（規約の変更）",
    content: (
      <p>
        運営者は必要に応じて本規約を変更することができます。
        変更後の規約は、本サービス上に掲載した時点で効力を持つものとします。
      </p>
    ),
  },
  {
    title: "第7条（準拠法）",
    content: <p>本規約は日本法に準拠します。</p>,
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-2xl px-4 py-5">
          <Link
            href="/"
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            ← トピック一覧に戻る
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">利用規約</h1>
        <p className="text-sm text-gray-500 mb-10">
          本利用規約（以下「本規約」）は、PoliDebate（以下「本サービス」）の利用条件を定めるものです。
          本サービスを利用することで、本規約に同意したものとみなします。
        </p>

        <div className="space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 text-base font-semibold text-gray-900 border-l-4 border-blue-500 pl-3">
                {section.title}
              </h2>
              <div className="text-sm leading-7 text-gray-700">
                {section.content}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-right text-xs text-gray-400">以上</p>
      </main>
    </div>
  );
}
