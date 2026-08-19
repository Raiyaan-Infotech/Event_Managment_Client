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
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "16px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "20px",
          background: "#dbeafe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
        }}
      >
        🚧
      </div>

      <h2
        style={{
          fontSize: "22px",
          fontWeight: 800,
          color: "var(--text-primary)",
          margin: 0,
        }}
      >
        {pageName}
      </h2>

      <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
        This page is under construction.
      </p>

      <Link
        href="/dashboard"
        className="mt-8 px-5 py-2.5 rounded-xl bg-primary text-white text-[13.5px] font-extrabold shadow-lg shadow-primary/20 transition-all hover:translate-y-[-2px]"
      >
        ← Back to Dashboard
      </Link>
    </div>
  );
}
