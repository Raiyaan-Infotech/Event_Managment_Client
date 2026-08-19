import Link from "next/link";
// app/dashboard/[...slug]/page.tsx
// Next.js 15: params is a Promise — must be awaited

type Props = {
  params: Promise<{ slug: string[] }>;
};

export default async function CatchAllPage({ params }: Props) {
  const { slug } = await params;

  const pageName = (slug ?? [])
    .join(" / ")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6"
    >
      <div
        className="size-[72px] rounded-[22px] bg-primary/10 flex items-center justify-center text-[32px] shadow-sm"
      >
        🚧
      </div>

      <div className="space-y-2">
        <h2 className="text-[22px] font-black tracking-tight text-slate-900 dark:text-white">
          {pageName}
        </h2>
        <p className="text-[14.5px] font-bold text-slate-400">
          This module is currently being optimized for excellence.
        </p>
        
      </div>

      <Link
        href="/dashboard"
        className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-white text-[13.5px] font-extrabold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px] hover:shadow-xl hover:shadow-primary/30 active:scale-95"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
