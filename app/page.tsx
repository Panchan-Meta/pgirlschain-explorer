"use client";

import { useEffect, useState } from "react";
import { createPublicClient, http } from "viem";
import Search from "@/components/search";

interface Block {
  hash: `0x${string}`;
  number: number;
}

const client = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_RPC_URL || ""),
});

export default function Home() {
  const [height, setHeight] = useState<number | null>(null);
  const [latest, setLatest] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function run() {
      try {
        const latestNumber = await client.getBlockNumber();
        setHeight(Number(latestNumber));
        const blocks: Block[] = [];
        for (let i = 0n; i < 5n && latestNumber >= i; i++) {
          const b = await client.getBlock({ blockNumber: latestNumber - i });
          blocks.push({
            hash: b.hash as `0x${string}`,
            number: Number(b.number),
          });
        }
        setLatest(blocks);
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

      <Search />

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

