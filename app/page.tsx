// app/page.tsx
"use client";

import { useEffect, useState } from "react";

type Block = { number: number; hash: string };

export default function Home() {
  const [height, setHeight] = useState<number | null>(null);
  const [latest, setLatest] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        // ここはダミーAPI。実環境の Explorer API に差し替えてください
        const res = await fetch(
          process.env.NEXT_PUBLIC_EXPLORER_API + "/summary"
        );
        const data = await res.json();
        setHeight(data.latestHeight);
        setLatest(data.latestBlocks as Block[]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    run();
  }, []);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold mb-4">PGirlsChain Explorer</h1>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl shadow p-4">
              <div className="text-sm opacity-70">Latest Height</div>
              <div className="text-2xl font-semibold">{height ?? "-"}</div>
            </div>
            <div className="rounded-2xl shadow p-4">
              <div className="text-sm opacity-70">Tx/s (mock)</div>
              <div className="text-2xl font-semibold">—</div>
            </div>
            <div className="rounded-2xl shadow p-4">
              <div className="text-sm opacity-70">Peers (mock)</div>
              <div className="text-2xl font-semibold">—</div>
            </div>
          </div>

          <h2 className="text-xl font-semibold mb-2">Latest Blocks</h2>
          <div className="grid gap-3">
            {latest.map((b) => (
              <div key={b.hash} className="rounded-xl border p-4">
                <div className="text-sm opacity-70">#{b.number}</div>
                <div className="truncate font-mono">{b.hash}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
