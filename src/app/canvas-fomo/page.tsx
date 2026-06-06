import type { Metadata } from "next";
import dynamic from "next/dynamic";

const CanvasFomoGame = dynamic(() => import("@/components/CanvasFomoGame"), { ssr: false });

export const metadata: Metadata = {
  title: "Canvas FOMO",
  description: "十六格画布 · 一笔一世界。涂鸦累积奖池，最后一人独享全部。",
  openGraph: {
    title: "Canvas FOMO | Sylive Chu's Blog",
    description: "十六格画布 · 一笔一世界。每笔涂鸦累积奖池，最后一人独享全部。",
  },
};

export default function CanvasFomoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
            <span className="text-lg text-teal-400">✦</span>
            <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-teal-300 to-transparent" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-3">
            Canvas <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-500">FOMO</span>
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 max-w-lg mx-auto leading-relaxed">
            十六格画布 · 一笔一世界<br />
            每笔涂鸦累积奖池，最后一人独享全部
          </p>
        </div>

        {/* Game Component */}
        <CanvasFomoGame />
      </main>
    </div>
  );
}
