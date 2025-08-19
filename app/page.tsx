"use client";

import { useEffect, useState } from "react";

interface Block {
  hash: string;
  number: number;
}

export default function Home() {
  const [height, setHeight] = useState<number | null>(null);
  const [latest, setLatest] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        const res = await fetch(
          (process.env.NEXT_PUBLIC_EXPLORER_API || "") + "/summary"
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
      <h1 className="text-3xl font-bold mb-6">PGirlsChain Explorer</h1>

      {loading ? (
        <p>Loading…</p>
      ) : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl p-4 shadow">
              <div className="text-sm opacity-70">Latest Height</div>
              <div className="text-2xl font-semibold">{height ?? "-"}</div>
            </div>
            <div className="rounded-2xl p-4 shadow">
              <div className="text-sm opacity-70">Tx/s</div>
              <div className="text-2xl font-semibold">—</div>
            </div>
            <div className="rounded-2xl p-4 shadow">
              <div className="text-sm opacity-70">Peers</div>
              <div className="text-2xl font-semibold">—</div>
            </div>
          </div>

          <h2 className="mb-2 text-xl font-semibold">Latest Blocks</h2>
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

